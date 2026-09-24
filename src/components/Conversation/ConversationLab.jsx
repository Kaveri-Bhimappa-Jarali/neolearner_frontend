import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { 
  Volume2, Mic, Send, Sparkles, MessageSquare, Award, 
  ArrowRight, RotateCcw, AlertCircle, CheckCircle2, ChevronLeft, 
  Headphones, Flame, Zap, ShieldCheck, Lock, Play
} from 'lucide-react';
import { speakText, listenForSpeech } from '../../utils/audio';
import { sounds } from '../../utils/sounds';
import { useTranslation } from '../../utils/i18n';

const SCENARIO_CARDS = [
  { id: 'restaurant', nameKey: 'scenarioRestaurantName', name: 'At the Restaurant', icon: '🍽️', desc: 'Order traditional meals and drinks', cefr: 'A1' },
  { id: 'airport', nameKey: 'scenarioAirportName', name: 'Bengaluru Airport', icon: '✈️', desc: 'Find gates, baggage and boarding pass', cefr: 'A2' },
  { id: 'doctor', nameKey: 'scenarioDoctorName', name: 'Health & Clinic', icon: '🏥', desc: 'Describe symptoms & medical care', cefr: 'A2' },
  { id: 'interview', nameKey: 'scenarioInterviewName', name: 'Career Interview', icon: '💼', desc: 'Introduce your background & skills', cefr: 'B1' },
  { id: 'shopping', nameKey: 'scenarioShoppingName', name: 'Local Market', icon: '🛒', desc: 'Bargain and purchase fresh produce', cefr: 'A1' },
  { id: 'introduction', nameKey: 'scenarioIntroductionName', name: 'Meeting a Neighbor', icon: '👋', desc: 'Exchange names, hometowns & hobbies', cefr: 'A1' }
];

const ConversationLab = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [selectedScenario, setSelectedScenario] = useState('restaurant');
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState([]);
  const [latestFeedback, setLatestFeedback] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [finalSummary, setFinalSummary] = useState(null);
  const [error, setError] = useState('');
  const [unlockedMode, setUnlockedMode] = useState(false);

  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const handleStartSession = async (scenarioId) => {
    setLoading(true);
    setError('');
    setIsCompleted(false);
    setFinalSummary(null);
    setSelectedScenario(scenarioId);

    try {
      const res = await api.post('/conversation/start', {
        scenario: scenarioId,
        target_language_id: user?.target_language_id
      });
      setSession(res.data);
      setMessages([
        {
          sender: 'ai',
          text: res.data.ai_message,
          phonetic: res.data.phonetic,
          translation: res.data.translation
        }
      ]);
      setLatestFeedback(null);
      // Auto-voice greeting
      if (res.data.target_language_code) {
        speakText(res.data.ai_message, res.data.target_language_code);
      }
    } catch (err) {
      console.error('Failed to start conversation:', err);
      setError(err.response?.data?.detail || 'Could not start AI conversation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && (user.has_completed_placement_test || unlockedMode)) {
      handleStartSession(selectedScenario);
    }
  }, [user, unlockedMode]);

  const handleSendResponse = async (textToSend) => {
    const text = (textToSend || inputText).trim();
    if (!text || sending || !session) return;

    setInputText('');
    setSending(true);
    setError('');

    // Add user message optimistically
    setMessages(prev => [...prev, { sender: 'user', text: text }]);

    try {
      const res = await api.post('/conversation/respond', {
        session_id: session.session_id,
        user_transcript: text
      });

      // Play success chime
      sounds.playChime();

      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: res.data.ai_reply,
          phonetic: res.data.phonetic,
          translation: res.data.translation
        }
      ]);

      setLatestFeedback({
        correction: res.data.grammar_correction,
        tips: res.data.pronunciation_tips || [],
        vocab: res.data.vocabulary_suggestions || [],
        turnScore: res.data.turn_score
      });

      // Speak AI reply
      if (session.target_language_code) {
        speakText(res.data.ai_reply, session.target_language_code);
      }
    } catch (err) {
      console.error('Failed to send response:', err);
      setError(err.response?.data?.detail || 'Failed to receive AI tutor reply.');
    } finally {
      setSending(false);
    }
  };

  const handleMicClick = () => {
    if (!session) return;
    setIsListening(true);
    listenForSpeech(
      session.target_language_code || 'en',
      (transcript) => {
        setIsListening(false);
        setInputText(transcript);
        handleSendResponse(transcript);
      },
      (err) => {
        setIsListening(false);
        console.warn('Voice input error:', err);
        setError('Voice recognition notice: You can also type your reply below.');
      }
    );
  };

  const handleEndSession = async () => {
    if (!session) return;
    try {
      const res = await api.post('/conversation/end', { session_id: session.session_id });
      setFinalSummary(res.data);
      setIsCompleted(true);
      // Refresh user state
      try {
        const uRes = await api.get('/learners/me');
        setUser(uRes.data);
      } catch (e) {}
      sounds.playCelebration();
    } catch (err) {
      console.error('Failed to end conversation:', err);
    }
  };

  const isAccessLocked = user && !user.has_completed_placement_test && !unlockedMode;

  if (isAccessLocked) {
    return (
      <div className="page-container" style={{ maxWidth: '800px', margin: '3rem auto', padding: '0 1rem' }}>
        <div className="card" style={{
          padding: '3rem 2rem', borderRadius: '24px', textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(255, 150, 0, 0.08), rgba(28, 176, 246, 0.08))',
          border: '2px dashed #ff9600', boxShadow: '0 10px 30px rgba(0,0,0,0.06)'
        }}>
          <div style={{
            width: '74px', height: '74px', borderRadius: '50%', background: 'rgba(255, 150, 0, 0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem'
          }}>
            <Lock size={38} color="#ff9600" />
          </div>

          <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-main)', margin: '0 0 0.5rem' }}>
            {t('lockedPreAssessmentTitle')}
          </h1>

          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '600px', margin: '0 auto 1.75rem', lineHeight: '1.6' }}>
            {t('lockedPreAssessmentDesc')}
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              className="btn btn-primary"
              style={{ padding: '0.9rem 2rem', fontSize: '1.05rem', fontWeight: '800', borderRadius: '14px' }}
              onClick={() => navigate('/initial-exam')}
            >
              {t('startAssessmentToUnlock')}
            </button>
            <button
              className="btn btn-secondary"
              style={{ padding: '0.9rem 2rem', fontSize: '1.05rem', fontWeight: '700', borderRadius: '14px' }}
              onClick={() => { setUnlockedMode(true); handleStartSession('restaurant'); }}
            >
              🚀 Try Interactive Demo Scenario
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ maxWidth: '1100px', margin: '0 auto', padding: '1rem' }}>
      
      {/* Top Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => navigate('/dashboard')} className="btn btn-secondary" style={{ padding: '0.5rem 0.75rem', borderRadius: '10px' }}>
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 style={{ fontSize: '1.65rem', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
              <MessageSquare style={{ color: 'var(--primary-color)' }} /> AI Conversation Lab
            </h1>
            <p style={{ color: 'var(--text-muted)', margin: '2px 0 0', fontSize: '0.88rem' }}>
              Real-time interactive voice & text roleplay tutor
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ 
            background: 'rgba(88, 204, 2, 0.15)', color: 'var(--primary-color)', 
            padding: '4px 12px', borderRadius: '20px', fontWeight: '700', fontSize: '0.85rem' 
          }}>
            Level: {user?.cefr_level || 'A1'}
          </span>
          <span style={{ 
            background: 'rgba(28, 176, 246, 0.15)', color: '#1cb0f6', 
            padding: '4px 12px', borderRadius: '20px', fontWeight: '700', fontSize: '0.85rem' 
          }}>
            Target: {user?.target_language?.name || 'Kannada'}
          </span>
        </div>
      </div>

      {/* Responsive Horizontal Scenario Selector Cards Bar */}
      <div style={{ 
        display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem', 
        marginBottom: '1.25rem', scrollbarWidth: 'thin' 
      }}>
        {SCENARIO_CARDS.map(sc => {
          const isSelected = selectedScenario === sc.id;
          return (
            <button
              key={sc.id}
              onClick={() => handleStartSession(sc.id)}
              style={{
                minWidth: '150px',
                flex: '0 0 auto',
                padding: '0.75rem 1rem',
                borderRadius: '14px',
                border: isSelected ? '2.5px solid var(--primary-color)' : '1px solid var(--border-color)',
                background: isSelected ? 'rgba(88, 204, 2, 0.12)' : 'var(--card-bg)',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: isSelected ? '0 4px 12px rgba(88, 204, 2, 0.2)' : 'none'
              }}
            >
              <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>{sc.icon}</div>
              <div style={{ fontWeight: '800', fontSize: '0.88rem', color: isSelected ? 'var(--primary-color)' : 'var(--text-main)', whiteSpace: 'nowrap' }}>
                {t(sc.nameKey) || sc.name}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>CEFR {sc.cefr}</div>
            </button>
          );
        })}
      </div>

      {error && (
        <div style={{ padding: '0.85rem 1rem', background: '#ffebee', color: '#c62828', borderRadius: '12px', marginBottom: '1rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* Main Chat Interface (Responsive Grid layout) */}
      <div style={{ display: 'grid', gridTemplateColumns: latestFeedback ? 'minmax(0, 2fr) minmax(0, 1fr)' : '1fr', gap: '1.25rem', alignItems: 'start' }}>
        
        {/* Chat Window Container */}
        <div className="card" style={{ 
          padding: '1.25rem', display: 'flex', flexDirection: 'column', 
          height: 'min(540px, 68vh)', minHeight: '380px', borderRadius: '20px',
          boxShadow: '0 6px 20px rgba(0,0,0,0.05)'
        }}>
          
          {/* Chat Messages Log */}
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.85rem', paddingRight: '0.5rem' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                Connecting to AI native tutor...
              </div>
            ) : (
              messages.map((msg, i) => (
                <div 
                  key={i} 
                  style={{ 
                    alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '88%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start'
                  }}
                >
                  <div style={{
                    padding: '0.85rem 1.15rem',
                    borderRadius: msg.sender === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    background: msg.sender === 'user' ? 'var(--primary-color)' : 'var(--bg-subtle)',
                    color: msg.sender === 'user' ? '#ffffff' : 'var(--text-main)',
                    fontSize: '1rem',
                    lineHeight: '1.45',
                    fontWeight: '500',
                    border: msg.sender === 'user' ? 'none' : '1px solid var(--border-color)',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
                  }}>
                    {msg.text}
                  </div>

                  {msg.sender === 'ai' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', fontSize: '0.8rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                      <button 
                        type="button"
                        onClick={() => speakText(msg.text, session?.target_language_code)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary-color)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '3px' }}
                      >
                        <Volume2 size={15} /> Listen
                      </button>
                      <span>•</span>
                      <button 
                        type="button"
                        onClick={() => speakText(msg.text, session?.target_language_code, true)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontWeight: '600' }}
                      >
                        Slow 🐢
                      </button>
                      {msg.translation && <span style={{ fontStyle: 'italic' }}>• "{msg.translation}"</span>}
                    </div>
                  )}
                </div>
              ))
            )}

            {sending && (
              <div style={{ alignSelf: 'flex-start', padding: '0.6rem 1rem', background: 'var(--bg-subtle)', borderRadius: '12px', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                AI Tutor is formulating native reply...
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Context Hints Bar */}
          {session?.context_hints && session.context_hints.length > 0 && (
            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', padding: '0.6rem 0', borderTop: '1px solid var(--border-color)', scrollbarWidth: 'none' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-muted)', alignSelf: 'center', whiteSpace: 'nowrap' }}>HINTS:</span>
              {session.context_hints.map((h, idx) => {
                const cleanText = h.split('(')[0].trim();
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setInputText(cleanText);
                      handleSendResponse(cleanText);
                    }}
                    style={{
                      padding: '4px 10px', borderRadius: '12px', fontSize: '0.78rem',
                      background: 'rgba(28, 176, 246, 0.12)', color: '#1cb0f6', border: '1px solid rgba(28, 176, 246, 0.25)',
                      whiteSpace: 'nowrap', cursor: 'pointer', fontWeight: '700'
                    }}
                  >
                    💡 {h}
                  </button>
                );
              })}
            </div>
          )}

          {/* Message Action Bar */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '0.75rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handleMicClick}
              className={`btn ${isListening ? 'btn-danger' : 'btn-secondary'}`}
              style={{ padding: '0.75rem 1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700' }}
              title="Speak in target language"
            >
              <Mic size={18} color={isListening ? '#ffffff' : 'var(--primary-color)'} />
              {isListening ? 'Listening...' : 'Speak'}
            </button>

            <input
              type="text"
              className="form-control"
              placeholder={`Type or speak in target language...`}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendResponse()}
              disabled={sending || isCompleted}
              style={{ flex: '1 1 200px', borderRadius: '12px', padding: '0.75rem 1rem', border: '1px solid var(--border-color)', fontSize: '0.95rem' }}
            />

            <button
              type="button"
              onClick={() => handleSendResponse()}
              className="btn btn-primary"
              disabled={!inputText.trim() || sending || isCompleted}
              style={{ padding: '0.75rem 1.25rem', borderRadius: '12px', fontWeight: '700' }}
            >
              <Send size={18} />
            </button>

            <button
              type="button"
              onClick={handleEndSession}
              className="btn btn-secondary"
              style={{ borderRadius: '12px', fontSize: '0.85rem', fontWeight: '700' }}
              title="Finish conversation and collect XP"
            >
              Finish
            </button>
          </div>
        </div>

        {/* Live Pedagogical Feedback Sidebar */}
        {latestFeedback && (
          <div className="card" style={{ padding: '1.25rem', borderRadius: '20px', border: '1.5px solid rgba(88, 204, 2, 0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem', color: 'var(--primary-color)', fontWeight: '800', fontSize: '1.05rem' }}>
              <Sparkles size={18} /> {t('liveAiFeedback')}
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>{t('turnAccuracy')}</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--primary-color)' }}>
                {Math.round(latestFeedback.turnScore)}%
              </div>
            </div>

            {latestFeedback.correction && (
              <div style={{ marginBottom: '1rem', padding: '0.75rem', background: 'rgba(255, 150, 0, 0.12)', borderRadius: '12px', borderLeft: '4px solid #ff9600' }}>
                <div style={{ fontWeight: '800', fontSize: '0.85rem', color: '#ff9600', marginBottom: '2px' }}>{t('grammarCoaching')}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: '1.4' }}>{latestFeedback.correction}</div>
              </div>
            )}

            {latestFeedback.tips && latestFeedback.tips.length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '4px' }}>{t('pronunciationTips')}</div>
                {latestFeedback.tips.map((tItem, idx) => (
                  <div key={idx} style={{ fontSize: '0.85rem', color: 'var(--text-main)', marginBottom: '4px' }}>
                    🎙️ {tItem}
                  </div>
                ))}
              </div>
            )}

            {latestFeedback.vocab && latestFeedback.vocab.length > 0 && (
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '6px' }}>{t('recommendedVocabulary')}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {latestFeedback.vocab.map((v, idx) => (
                    <span key={idx} style={{ background: 'var(--bg-subtle)', padding: '4px 10px', borderRadius: '10px', fontSize: '0.8rem', border: '1px solid var(--border-color)', fontWeight: '600' }}>
                      {v}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Completion Modal */}
      {isCompleted && finalSummary && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '1rem', zIndex: 1000
        }}>
          <div className="card" style={{ maxWidth: '500px', width: '100%', padding: '2.5rem 2rem', textAlign: 'center', borderRadius: '24px' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '0.75rem' }}>🎉</div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '0.5rem', color: 'var(--text-main)' }}>
              {t('conversationCompleted')}
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
              {t('turnsCompleted', { turns: finalSummary.total_turns })}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{ padding: '0.85rem', background: 'var(--bg-subtle)', borderRadius: '14px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>{t('grammarCoaching')}</div>
                <div style={{ fontSize: '1.3rem', fontWeight: '900', color: 'var(--primary-color)' }}>{finalSummary.grammar_score}%</div>
              </div>
              <div style={{ padding: '0.85rem', background: 'var(--bg-subtle)', borderRadius: '14px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>Speaking</div>
                <div style={{ fontSize: '1.3rem', fontWeight: '900', color: '#1cb0f6' }}>{finalSummary.pronunciation_score}%</div>
              </div>
              <div style={{ padding: '0.85rem', background: 'var(--bg-subtle)', borderRadius: '14px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>Vocab</div>
                <div style={{ fontSize: '1.3rem', fontWeight: '900', color: '#ff9600' }}>{finalSummary.vocabulary_score}%</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                <Zap size={20} /> +{finalSummary.xp_earned} XP
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold', color: '#1cb0f6' }}>
                <Award size={20} /> +{finalSummary.gems_earned} Gems
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button 
                onClick={() => handleStartSession(selectedScenario)}
                className="btn btn-secondary"
                style={{ flex: 1, padding: '0.85rem', fontWeight: '700', borderRadius: '12px' }}
              >
                {t('practiceAgain')}
              </button>
              <button 
                onClick={() => navigate('/dashboard')}
                className="btn btn-primary"
                style={{ flex: 1, padding: '0.85rem', fontWeight: '700', borderRadius: '12px' }}
              >
                {t('dashboard')}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ConversationLab;
