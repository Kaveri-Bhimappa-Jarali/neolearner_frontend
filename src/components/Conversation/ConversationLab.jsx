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
import Badge from '../ui/Badge';

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
    if (user && !session && !loading) {
      handleStartSession(selectedScenario);
    }
  }, [user]);

  const handleSendResponse = async (textToSend) => {
    const text = (textToSend || inputText).trim();
    if (!text || sending) return;

    let currentSession = session;

    setInputText('');
    setSending(true);
    setError('');

    if (!currentSession) {
      try {
        const startRes = await api.post('/conversation/start', {
          scenario: selectedScenario,
          target_language_id: user?.target_language_id || null
        });
        currentSession = startRes.data;
        setSession(currentSession);
      } catch (err) {
        console.error('Auto session start error:', err);
        setError('Could not connect to AI Tutor. Please click a scenario above to retry.');
        setSending(false);
        return;
      }
    }

    setMessages(prev => [...prev, { sender: 'user', text: text }]);

    try {
      const res = await api.post('/conversation/respond', {
        session_id: currentSession.session_id,
        user_transcript: text
      });

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

      if (currentSession.target_language_code) {
        speakText(res.data.ai_reply, currentSession.target_language_code);
      }
    } catch (err) {
      console.error('Failed to send response:', err);
      setError(err.response?.data?.detail || 'Failed to receive AI tutor reply.');
    } finally {
      setSending(false);
    }
  };

  const handleMicClick = () => {
    const langCode = session?.target_language_code || user?.target_language?.code || 'en';
    setIsListening(true);
    listenForSpeech(
      langCode,
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
      try {
        const uRes = await api.get('/learners/me');
        setUser(uRes.data);
      } catch (e) {}
      sounds.playCelebration();
    } catch (err) {
      console.error('Failed to end conversation:', err);
    }
  };

  return (
    <div className="conversation-lab-wrapper">
      
      {/* Top Header Bar */}
      <div className="conversation-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => navigate('/dashboard')} className="btn btn-secondary" style={{ padding: '0.55rem 0.85rem' }}>
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 style={{ fontSize: 'clamp(1.25rem, 3vw, 1.75rem)', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-main)' }}>
              <MessageSquare style={{ color: 'var(--primary-color)' }} /> AI Voice Conversation Lab
            </h1>
            <p style={{ color: 'var(--text-muted)', margin: '2px 0 0', fontSize: '0.88rem' }}>
              Real-time interactive voice & text roleplay tutor
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <Badge variant="teal">CEFR {user?.cefr_level || 'A1'}</Badge>
          <Badge variant="cyan">Target: {user?.target_language?.name || 'Kannada'}</Badge>
        </div>
      </div>

      {/* Horizontal Scenario Selector Cards Bar */}
      <div className="scenario-cards-carousel">
        {SCENARIO_CARDS.map(sc => {
          const isSelected = selectedScenario === sc.id;
          return (
            <button
              key={sc.id}
              onClick={() => handleStartSession(sc.id)}
              className="scenario-card-btn"
              style={{
                border: isSelected ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
                background: isSelected ? 'rgba(20, 184, 166, 0.12)' : 'var(--surface-card)',
                boxShadow: isSelected ? 'var(--shadow-teal)' : 'none'
              }}
            >
              <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>{sc.icon}</div>
              <div style={{ fontWeight: '800', fontSize: '0.9rem', color: isSelected ? 'var(--primary-color)' : 'var(--text-main)', whiteSpace: 'nowrap' }}>
                {sc.name}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>CEFR {sc.cefr}</div>
            </button>
          );
        })}
      </div>

      {error && (
        <div style={{ padding: '0.85rem 1rem', background: 'var(--error-bg)', color: 'var(--error)', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* Main Chat Interface */}
      <div className={`conversation-main-grid ${latestFeedback ? 'has-feedback' : ''}`}>
        
        {/* Chat Window Container */}
        <div className="card conversation-chat-card">
          
          {/* Chat Messages Log */}
          <div className="conversation-messages-list">
            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                Connecting to AI native tutor...
              </div>
            ) : (
              messages.map((msg, i) => (
                <div 
                  key={i} 
                  style={{ 
                    alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '92%',
                    width: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                    boxSizing: 'border-box'
                  }}
                >
                  <div style={{
                    padding: '0.85rem 1.15rem',
                    borderRadius: msg.sender === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                    background: msg.sender === 'user' ? 'var(--primary-color)' : 'var(--surface)',
                    color: msg.sender === 'user' ? '#ffffff' : 'var(--text-main)',
                    fontSize: '0.95rem',
                    lineHeight: '1.5',
                    fontWeight: '600',
                    border: msg.sender === 'user' ? 'none' : '1px solid var(--border-color)',
                    boxShadow: 'var(--shadow-sm)',
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                    whiteSpace: 'pre-wrap',
                    maxWidth: '100%',
                    boxSizing: 'border-box'
                  }}>
                    {msg.text}
                  </div>

                  {msg.sender === 'ai' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px', fontSize: '0.82rem', color: 'var(--text-muted)', flexWrap: 'wrap', maxWidth: '100%', wordBreak: 'break-word' }}>
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
                      {msg.translation && <span style={{ fontStyle: 'italic', wordBreak: 'break-word' }}>• "{msg.translation}"</span>}
                    </div>
                  )}
                </div>
              ))
            )}

            {sending && (
              <div style={{ alignSelf: 'flex-start', padding: '0.75rem 1.15rem', background: 'var(--surface)', borderRadius: '14px', color: 'var(--text-muted)', fontSize: '0.9rem', border: '1px solid var(--border-color)' }}>
                AI Tutor is formulating response...
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Context Hints Bar */}
          {session?.context_hints && session.context_hints.length > 0 && (
            <div className="conversation-suggestions-bar">
              <span className="conversation-suggestion-label">SUGGESTIONS:</span>
              <div className="conversation-suggestions-list">
                {session.context_hints.map((h, idx) => {
                  const cleanText = h.split('(')[0].trim();
                  return (
                    <button
                      key={idx}
                      type="button"
                      className="conversation-suggestion-chip"
                      onClick={() => {
                        setInputText(cleanText);
                        handleSendResponse(cleanText);
                      }}
                    >
                      💡 {h}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Message Input Action Bar */}
          <div className="chat-input-action-bar">
            <div className="chat-input-row">
              <input
                type="text"
                className="form-input chat-text-input"
                placeholder="Type response in target language..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendResponse()}
                disabled={sending || isCompleted}
              />
              <button
                type="button"
                onClick={() => handleSendResponse()}
                className="btn btn-primary chat-send-btn"
                disabled={!inputText.trim() || sending || isCompleted}
                title="Send Message"
              >
                <Send size={18} />
              </button>
            </div>

            <div className="chat-controls-row">
              <button
                type="button"
                onClick={handleMicClick}
                className={`btn ${isListening ? 'btn-danger' : 'btn-secondary'} chat-speak-btn`}
                title="Speak in target language"
              >
                <Mic size={20} color={isListening ? '#ffffff' : 'var(--primary-color)'} />
                <span>{isListening ? 'Listening...' : 'Speak'}</span>
              </button>

              <button
                type="button"
                onClick={handleEndSession}
                className="btn btn-outline chat-finish-btn"
                title="Finish conversation and collect XP"
              >
                Finish
              </button>
            </div>
          </div>
        </div>

        {/* Live Pedagogical Feedback Sidebar */}
        {latestFeedback && (
          <div className="card" style={{ padding: '1.25rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color)', background: 'var(--surface-card)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem', color: 'var(--primary-color)', fontWeight: '800', fontSize: '1.05rem' }}>
              <Sparkles size={20} /> Live AI Feedback
            </div>

            <div style={{ marginBottom: '1.15rem' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800', letterSpacing: '0.5px' }}>Turn Accuracy</div>
              <div style={{ fontSize: '1.6rem', fontWeight: '900', color: 'var(--primary-color)' }}>
                {Math.round(latestFeedback.turnScore)}%
              </div>
            </div>

            {latestFeedback.correction && (
              <div style={{ marginBottom: '1.15rem', padding: '0.85rem 1rem', background: 'rgba(245, 158, 11, 0.12)', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--accent-gold)' }}>
                <div style={{ fontWeight: '800', fontSize: '0.82rem', color: 'var(--accent-gold)', marginBottom: '4px' }}>Grammar Coaching</div>
                <div style={{ fontSize: '0.88rem', color: 'var(--text-main)', lineHeight: '1.45' }}>{latestFeedback.correction}</div>
              </div>
            )}

            {latestFeedback.tips && latestFeedback.tips.length > 0 && (
              <div style={{ marginBottom: '1.15rem' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800', marginBottom: '6px' }}>Pronunciation Tips</div>
                {latestFeedback.tips.map((tItem, idx) => (
                  <div key={idx} style={{ fontSize: '0.88rem', color: 'var(--text-main)', marginBottom: '4px' }}>
                    🎙️ {tItem}
                  </div>
                ))}
              </div>
            )}

            {latestFeedback.vocab && latestFeedback.vocab.length > 0 && (
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800', marginBottom: '8px' }}>Recommended Vocabulary</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {latestFeedback.vocab.map((v, idx) => (
                    <Badge key={idx} variant="cyan" size="small">{v}</Badge>
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
          background: 'rgba(8, 17, 31, 0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '1rem', zIndex: 1000
        }}>
          <div className="card" style={{ maxWidth: '520px', width: '100%', padding: '2.5rem 2rem', textAlign: 'center', borderRadius: 'var(--radius-xl)', background: 'var(--surface-card)' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '0.75rem' }}>🎉</div>
            <h2 style={{ fontSize: '1.85rem', fontWeight: '900', marginBottom: '0.5rem', color: 'var(--text-main)' }}>
              Roleplay Session Complete!
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.98rem' }}>
              Successfully completed {finalSummary.total_turns} conversation exchanges.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.85rem', marginBottom: '1.75rem' }}>
              <div style={{ padding: '1rem', background: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '800' }}>Grammar</div>
                <div style={{ fontSize: '1.4rem', fontWeight: '900', color: 'var(--primary-color)' }}>{finalSummary.grammar_score}%</div>
              </div>
              <div style={{ padding: '1rem', background: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '800' }}>Speaking</div>
                <div style={{ fontSize: '1.4rem', fontWeight: '900', color: 'var(--accent-cyan)' }}>{finalSummary.pronunciation_score}%</div>
              </div>
              <div style={{ padding: '1rem', background: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '800' }}>Vocab</div>
                <div style={{ fontSize: '1.4rem', fontWeight: '900', color: 'var(--accent-gold)' }}>{finalSummary.vocabulary_score}%</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginBottom: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '800', color: 'var(--primary-color)' }}>
                <Zap size={22} /> +{finalSummary.xp_earned} XP
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '800', color: 'var(--accent-cyan)' }}>
                <Award size={22} /> +{finalSummary.gems_earned} Gems
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.85rem', justifyContent: 'center' }}>
              <button 
                onClick={() => handleStartSession(selectedScenario)}
                className="btn btn-secondary"
                style={{ flex: 1, padding: '0.85rem', fontWeight: '800' }}
              >
                Practice Again
              </button>
              <button 
                onClick={() => navigate('/dashboard')}
                className="btn btn-primary"
                style={{ flex: 1, padding: '0.85rem', fontWeight: '800' }}
              >
                Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ConversationLab;
