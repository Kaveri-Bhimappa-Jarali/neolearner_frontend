import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useTranslation } from '../../utils/i18n';
import { 
  Mic, MicOff, Volume2, Award, CheckCircle2, 
  AlertCircle, Sparkles, RefreshCw, VolumeX 
} from 'lucide-react';

const PronunciationEvaluator = ({ 
  targetText = "Hello, how are you?", 
  languageCode = "en",
  onComplete = null 
}) => {
  const { t } = useTranslation();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [evalResult, setEvalResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [recognitionInstance, setRecognitionInstance] = useState(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = languageCode === 'kn' ? 'kn-IN' : (languageCode === 'te' ? 'te-IN' : (languageCode === 'hi' ? 'hi-IN' : (languageCode === 'mr' ? 'mr-IN' : 'en-US')));

      rec.onresult = (event) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
      };

      rec.onerror = (err) => {
        console.warn('Speech recognition error:', err.error);
        setIsListening(false);
        if (err.error === 'not-allowed') {
          setError('Microphone permission denied. Please allow microphone access in your browser settings.');
        } else if (err.error !== 'no-speech') {
          setError(`Speech input error: ${err.error}. You can also type your spoken response below.`);
        }
      };

      rec.onend = () => {
        setIsListening(false);
      };

      setRecognitionInstance(rec);
    } else {
      setSpeechSupported(false);
    }
  }, [languageCode]);

  const handleStartListening = () => {
    setError(null);
    setTranscript('');
    setEvalResult(null);

    if (recognitionInstance) {
      try {
        recognitionInstance.start();
        setIsListening(true);
      } catch (err) {
        console.warn('Start recognition error:', err);
      }
    } else {
      setError('Browser Speech Recognition not available. Please type your spoken text below.');
    }
  };

  const handleStopListening = () => {
    if (recognitionInstance && isListening) {
      recognitionInstance.stop();
      setIsListening(false);
    }
  };

  const handlePlayAudio = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(targetText);
      utterance.lang = languageCode === 'kn' ? 'kn-IN' : (languageCode === 'te' ? 'te-IN' : (languageCode === 'hi' ? 'hi-IN' : (languageCode === 'mr' ? 'mr-IN' : 'en-US')));
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSubmitSpeech = async () => {
    if (!transcript.trim()) {
      setError('Please record or type your speech before submitting.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/speech/assess', {
        target_text: targetText,
        spoken_text: transcript.trim(),
        language_code: languageCode
      });
      setEvalResult(res.data);
      if (onComplete) {
        onComplete(res.data);
      }
    } catch (err) {
      console.error('Failed to submit speech assessment:', err);
      setError('Failed to process speech assessment on server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ padding: '2rem', borderRadius: '20px', border: '1px solid var(--border-color)', maxWidth: '650px', margin: '0 auto' }}>
      
      {/* Target Word / Phrase Box */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '0.5rem' }}>
          <Sparkles size={16} color="var(--primary-color)" /> TARGET PHONETIC PHRASE
        </span>

        <h2 style={{ fontSize: '2.2rem', fontWeight: '800', color: 'var(--text-main)', margin: '0 0 1rem', lineHeight: '1.3' }}>
          "{targetText}"
        </h2>

        <button 
          onClick={handlePlayAudio}
          className="btn btn-secondary"
          style={{ padding: '0.5rem 1.25rem', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '8px', borderRadius: '50px' }}
        >
          <Volume2 size={18} color="var(--primary-color)" /> Listen Target Pronunciation
        </button>
      </div>

      {/* Voice Recorder Control Box */}
      <div style={{
        background: 'var(--bg-subtle)', padding: '2rem 1.5rem', borderRadius: '18px', textAlign: 'center',
        border: isListening ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
        boxShadow: isListening ? '0 0 20px rgba(88, 204, 2, 0.25)' : 'none',
        marginBottom: '1.5rem', transition: 'all 0.3s ease'
      }}>
        
        {/* Pulsing Mic Circle Button */}
        <button
          type="button"
          onClick={isListening ? handleStopListening : handleStartListening}
          style={{
            width: '84px', height: '84px', borderRadius: '50%', border: 'none',
            background: isListening ? 'var(--error)' : 'linear-gradient(135deg, var(--primary-color), #3b82f6)',
            color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.25rem', cursor: 'pointer', transition: 'transform 0.2s ease',
            boxShadow: isListening ? '0 0 25px rgba(255, 75, 75, 0.5)' : '0 6px 15px rgba(0,0,0,0.1)'
          }}
        >
          {isListening ? <MicOff size={38} /> : <Mic size={38} />}
        </button>

        <div style={{ fontWeight: 'bold', fontSize: '1rem', color: isListening ? 'var(--error)' : 'var(--text-main)', marginBottom: '0.5rem' }}>
          {isListening ? 'Listening... Speak Now' : 'Click Mic & Pronounce Phrase'}
        </div>

        {/* Recognized Transcript Display */}
        <div style={{ minHeight: '48px', padding: '0.75rem', background: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--border-color)', marginTop: '1rem' }}>
          {transcript ? (
            <span style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--primary-color)' }}>
              "{transcript}"
            </span>
          ) : (
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', italic: 'true' }}>
              Recorded speech transcript will appear here...
            </span>
          )}
        </div>

        {/* Fallback Text Input */}
        <div style={{ marginTop: '1rem', textAlign: 'left' }}>
          <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>
            Manual Speech Transcript Fallback:
          </label>
          <input
            type="text"
            className="form-input"
            placeholder="Or type what you said here..."
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            style={{ fontSize: '0.9rem' }}
          />
        </div>
      </div>

      {error && (
        <div className="form-error" style={{ marginBottom: '1.25rem', padding: '0.85rem', borderRadius: '12px' }}>
          ⚠️ {error}
        </div>
      )}

      {/* Assessment Action Button */}
      {!evalResult && (
        <button
          className="btn btn-primary"
          onClick={handleSubmitSpeech}
          disabled={loading || !transcript.trim()}
          style={{ width: '100%', padding: '0.95rem', fontSize: '1.05rem', fontWeight: '800', borderRadius: '14px' }}
        >
          {loading ? 'Evaluating Pronunciation Accuracy...' : 'Evaluate My Pronunciation →'}
        </button>
      )}

      {/* Assessment Result Breakdown */}
      {evalResult && (
        <div style={{
          background: 'var(--surface)', borderRadius: '18px', padding: '1.5rem',
          border: `2px solid ${evalResult.overall_score >= 75 ? 'var(--primary-color)' : 'var(--accent-orange)'}`,
          marginTop: '1.5rem', animation: 'fadeIn 0.4s ease'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800', fontSize: '1.2rem', color: evalResult.overall_score >= 75 ? 'var(--primary-color)' : 'var(--accent-orange)' }}>
              <Award size={24} /> Overall Score: {evalResult.overall_score}%
            </div>
            <span style={{ padding: '4px 12px', borderRadius: '12px', fontWeight: 'bold', fontSize: '0.8rem', background: 'rgba(88, 204, 2, 0.15)', color: 'var(--primary-color)' }}>
              +{evalResult.xp_earned} XP
            </span>
          </div>

          {/* Sub-Scores Ribbon */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ background: 'var(--bg-subtle)', padding: '0.85rem', borderRadius: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>WORD ACCURACY</div>
              <div style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--text-main)' }}>{evalResult.accuracy_score}%</div>
            </div>
            <div style={{ background: 'var(--bg-subtle)', padding: '0.85rem', borderRadius: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>SPEECH FLUENCY</div>
              <div style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--text-main)' }}>{evalResult.fluency_score}%</div>
            </div>
          </div>

          {/* Problematic Words Breakdown */}
          {evalResult.problematic_words && evalResult.problematic_words.length > 0 && (
            <div style={{ marginBottom: '1.25rem', padding: '0.85rem', background: 'rgba(255, 75, 75, 0.08)', borderRadius: '12px', border: '1px solid rgba(255, 75, 75, 0.2)' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--error)', display: 'block', marginBottom: '6px' }}>
                ⚠️ Mispronounced or Omitted Words:
              </span>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {evalResult.problematic_words.map((w, idx) => (
                  <span key={idx} style={{ padding: '2px 8px', borderRadius: '6px', background: 'rgba(255,75,75,0.2)', color: 'var(--error)', fontSize: '0.85rem', fontWeight: 'bold' }}>
                    {w}
                  </span>
                ))}
              </div>
            </div>
          )}

          <p style={{ fontSize: '0.95rem', color: 'var(--text-main)', margin: '0 0 1.25rem', lineHeight: '1.5' }}>
            💡 <strong>AI Feedback:</strong> {evalResult.feedback}
          </p>

          <button
            className="btn btn-secondary"
            onClick={handleStartListening}
            style={{ width: '100%', padding: '0.75rem', fontSize: '0.95rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
          >
            <RefreshCw size={16} /> Try Recording Again
          </button>
        </div>
      )}

    </div>
  );
};

export default PronunciationEvaluator;
