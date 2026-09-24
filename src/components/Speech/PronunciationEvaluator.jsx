import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useTranslation } from '../../utils/i18n';
import { 
  Mic, MicOff, Volume2, Award, CheckCircle2, 
  AlertCircle, Sparkles, RefreshCw, VolumeX 
} from 'lucide-react';
import Badge from '../ui/Badge';

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
    <div 
      className="card" 
      style={{ 
        padding: '2.25rem', 
        borderRadius: 'var(--radius-xl)', 
        border: '1px solid var(--border-color)', 
        background: 'var(--surface-card)',
        maxWidth: '680px', 
        margin: '0 auto',
        boxShadow: 'var(--shadow-md)'
      }}
    >
      
      {/* Target Word / Phrase Box */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <Badge variant="teal" icon={Sparkles}>Target Phonetic Phrase</Badge>

        <h2 style={{ fontSize: '2.4rem', fontWeight: '900', color: 'var(--text-main)', margin: '1rem 0', lineHeight: '1.3' }}>
          "{targetText}"
        </h2>

        <button 
          onClick={handlePlayAudio}
          className="btn btn-secondary"
          style={{ padding: '0.65rem 1.5rem', fontSize: '0.92rem', gap: '8px', borderRadius: '9999px', fontWeight: '700' }}
        >
          <Volume2 size={18} color="var(--primary-color)" /> Listen Target Audio
        </button>
      </div>

      {/* Voice Recorder Control Box */}
      <div style={{
        background: 'var(--surface)', padding: '2rem 1.5rem', borderRadius: 'var(--radius-lg)', textAlign: 'center',
        border: isListening ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
        boxShadow: isListening ? 'var(--shadow-teal)' : 'none',
        marginBottom: '1.5rem', transition: 'all 0.3s ease'
      }}>
        
        {/* Pulsing Mic Circle Button */}
        <button
          type="button"
          onClick={isListening ? handleStopListening : handleStartListening}
          style={{
            width: '88px', height: '88px', borderRadius: '50%', border: 'none',
            background: isListening ? 'var(--error)' : 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))',
            color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.25rem', cursor: 'pointer', transition: 'transform 0.2s ease',
            boxShadow: isListening ? '0 0 25px rgba(239, 68, 68, 0.5)' : 'var(--shadow-teal)'
          }}
        >
          {isListening ? <MicOff size={40} /> : <Mic size={40} />}
        </button>

        <div style={{ fontWeight: '800', fontSize: '1.05rem', color: isListening ? 'var(--error)' : 'var(--text-main)', marginBottom: '0.5rem' }}>
          {isListening ? 'Listening... Speak Now' : 'Click Microphone & Pronounce Phrase'}
        </div>

        {/* Recognized Transcript Display */}
        <div style={{ minHeight: '52px', padding: '0.85rem', background: 'var(--background)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginTop: '1rem' }}>
          {transcript ? (
            <span style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--primary-color)' }}>
              "{transcript}"
            </span>
          ) : (
            <span style={{ fontSize: '0.92rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
              Recorded speech transcript will appear here...
            </span>
          )}
        </div>

        {/* Fallback Text Input */}
        <div style={{ marginTop: '1.25rem', textAlign: 'left' }}>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '700', display: 'block', marginBottom: '6px' }}>
            Speech Transcript Override:
          </label>
          <input
            type="text"
            className="form-input"
            placeholder="Or type what you said here..."
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            style={{ fontSize: '0.95rem', background: 'var(--background)', color: 'var(--text-main)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
          />
        </div>
      </div>

      {error && (
        <div style={{ marginBottom: '1.25rem', padding: '0.85rem 1rem', background: 'var(--error-bg)', color: 'var(--error)', borderRadius: 'var(--radius-md)', fontSize: '0.9rem' }}>
          ⚠️ {error}
        </div>
      )}

      {/* Assessment Action Button */}
      {!evalResult && (
        <button
          className="btn btn-primary"
          onClick={handleSubmitSpeech}
          disabled={loading || !transcript.trim()}
          style={{ width: '100%', padding: '0.95rem', fontSize: '1.05rem', fontWeight: '800', borderRadius: 'var(--radius-md)' }}
        >
          {loading ? 'Evaluating Pronunciation Accuracy...' : 'Evaluate My Pronunciation 🚀'}
        </button>
      )}

      {/* Assessment Result Breakdown */}
      {evalResult && (
        <div style={{
          background: 'var(--surface)', borderRadius: 'var(--radius-lg)', padding: '1.75rem',
          border: `2px solid ${evalResult.overall_score >= 75 ? 'var(--primary-color)' : 'var(--accent-gold)'}`,
          marginTop: '1.5rem', animation: 'fadeIn 0.3s ease'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '900', fontSize: '1.3rem', color: evalResult.overall_score >= 75 ? 'var(--primary-color)' : 'var(--accent-gold)' }}>
              <Award size={26} /> Overall Score: {evalResult.overall_score}%
            </div>
            <Badge variant="teal">+{evalResult.xp_earned} XP</Badge>
          </div>

          {/* Sub-Scores Ribbon */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ background: 'var(--surface-card)', padding: '1rem', borderRadius: 'var(--radius-md)', textAlign: 'center', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '800' }}>WORD ACCURACY</div>
              <div style={{ fontSize: '1.4rem', fontWeight: '900', color: 'var(--text-main)' }}>{evalResult.accuracy_score}%</div>
            </div>
            <div style={{ background: 'var(--surface-card)', padding: '1rem', borderRadius: 'var(--radius-md)', textAlign: 'center', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '800' }}>SPEECH FLUENCY</div>
              <div style={{ fontSize: '1.4rem', fontWeight: '900', color: 'var(--text-main)' }}>{evalResult.fluency_score}%</div>
            </div>
          </div>

          {/* Problematic Words Breakdown */}
          {evalResult.problematic_words && evalResult.problematic_words.length > 0 && (
            <div style={{ marginBottom: '1.25rem', padding: '1rem', background: 'var(--error-bg)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: '800', color: 'var(--error)', display: 'block', marginBottom: '6px' }}>
                ⚠️ Focus Needed On:
              </span>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {evalResult.problematic_words.map((w, idx) => (
                  <Badge key={idx} variant="red">{w}</Badge>
                ))}
              </div>
            </div>
          )}

          <p style={{ fontSize: '0.98rem', color: 'var(--text-main)', margin: '0 0 1.5rem', lineHeight: '1.5' }}>
            💡 <strong>AI Feedback:</strong> {evalResult.feedback}
          </p>

          <button
            className="btn btn-secondary"
            onClick={handleStartListening}
            style={{ width: '100%', padding: '0.85rem', fontSize: '0.95rem', fontWeight: '800', gap: '6px' }}
          >
            <RefreshCw size={18} /> Record Again
          </button>
        </div>
      )}

    </div>
  );
};

export default PronunciationEvaluator;
