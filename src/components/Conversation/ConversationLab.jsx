import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { 
  Volume2, Mic, Send, Sparkles, MessageSquare, Award, 
  ArrowRight, RotateCcw, AlertCircle, CheckCircle2, ChevronLeft, 
  Headphones, Flame, Zap, ShieldCheck
} from 'lucide-react';
import { speakText, listenForSpeech } from '../../utils/audio';
import { sounds } from '../../utils/sounds';

import { useTranslation } from '../../utils/i18n';
import { Lock } from 'lucide-react';

const SCENARIO_CARDS = [
  { id: 'restaurant', nameKey: 'scenarioRestaurantName', name: 'At the Restaurant', icon: '🍽️', descKey: 'scenarioRestaurantDesc', desc: 'Order traditional meals and drinks', cefr: 'A1' },
  { id: 'airport', nameKey: 'scenarioAirportName', name: 'Bengaluru Airport', icon: '✈️', descKey: 'scenarioAirportDesc', desc: 'Find gates, baggage and boarding pass', cefr: 'A2' },
  { id: 'doctor', nameKey: 'scenarioDoctorName', name: 'Health & Clinic', icon: '🏥', descKey: 'scenarioDoctorDesc', desc: 'Describe symptoms & medical care', cefr: 'A2' },
  { id: 'interview', nameKey: 'scenarioInterviewName', name: 'Career Interview', icon: '💼', descKey: 'scenarioInterviewDesc', desc: 'Introduce your background & skills', cefr: 'B1' },
  { id: 'shopping', nameKey: 'scenarioShoppingName', name: 'Local Market', icon: '🛒', descKey: 'scenarioShoppingDesc', desc: 'Bargain and purchase fresh produce', cefr: 'A1' },
  { id: 'introduction', nameKey: 'scenarioIntroductionName', name: 'Meeting a Neighbor', icon: '👋', descKey: 'scenarioIntroductionDesc', desc: 'Exchange names, hometowns & hobbies', cefr: 'A1' }
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
      setError('Could not start conversation session. Please verify connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      handleStartSession(selectedScenario);
    }
  }, [user]);

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
      setError('Failed to receive AI tutor reply.');
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
      }
    );
  };

  const handleEndSession = async () => {
    if (!session) return;
    try {
      const res = await api.post('/conversation/end', { session_id: session.session_id });
      setFinalSummary(res.data);
      setIsCompleted(true);
      // Refresh user XP
      const uRes = await api.get('/learners/me');
      setUser(uRes.data);
      sounds.playCelebration();
    } catch (err) {
      console.error('Failed to end conversation:', err);
    }
  };

  const hasCompletedTest = user?.has_completed_placement_test;

  if (!hasCompletedTest) {
    return (
      <div className="page-container" style={{ maxWidth: '800px', margin: '3rem auto', padding: '0 1rem' }}>
        <div className="card" style={{
          padding: '3rem 2rem', borderRadius: '24px', textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(255, 150, 0, 0.08), rgba(28, 176, 246, 0.08))',
          border: '2px dashed #ff9600'
        }}>
          <div style={{
            width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(255, 150, 0, 0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem'
          }}>
            <Lock size={36} color="#ff9600" />
          </div>

          <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-main)', margin: '0 0 0.5rem' }}>
            {t('lockedPreAssessmentTitle')}
          </h1>

          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '600px', margin: '0 auto 1.75rem', lineHeight: '1.6' }}>
            {t('lockedPreAssessmentDesc')}
          </p>

          <button
            className="btn btn-primary"
            style={{ padding: '1rem 2.25rem', fontSize: '1.1rem', fontWeight: '800', borderRadius: '14px' }}
            onClick={() => navigate('/initial-exam')}
          >
            {t('startAssessmentToUnlock')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '1.5rem 1rem' }}>
      
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button onClick={() => navigate('/dashboard')} className="btn btn-secondary" style={{ padding: '0.5rem 0.75rem' }}>
            <ChevronLeft size={18} />
          </button>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MessageSquare style={{ color: 'var(--primary-color)' }} /> AI Conversation Lab
            </h1>
            <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>
              Real-time voice & text interactive roleplay with your personalized AI native tutor.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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

      {/* Scenario Selector Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {SCENARIO_CARDS.map(sc => (
          <button
            key={sc.id}
            onClick={() => handleStartSession(sc.id)}
            style={{
              padding: '0.75rem',
              borderRadius: '12px',
              border: selectedScenario === sc.id ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
              background: selectedScenario === sc.id ? 'rgba(88, 204, 2, 0.08)' : 'var(--card-bg)',
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>{sc.icon}</div>
            <div style={{ fontWeight: '700', fontSize: '0.85rem', color: 'var(--text-main)' }}>{t(sc.nameKey) || sc.name}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>CEFR {sc.cefr}</div>
          </button>
        ))}
      </div>

      {/* Main Chat Interface */}
      <div style={{ display: 'grid', gridTemplateColumns: latestFeedback ? '2fr 1.2fr' : '1fr', gap: '1.5rem', alignItems: 'start' }}>
        
        <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '520px', borderRadius: '16px' }}>
          
          {/* Chat Messages Area */}
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', paddingRight: '0.5rem' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                Connecting to AI tutor in {user?.target_language?.name || 'target language'}...
              </div>
            ) : (
              messages.map((msg, i) => (
                <div 
                  key={i} 
                  style={{ 
                    alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '85%',
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
                    fontSize: '1.05rem',
                    lineHeight: '1.4',
                    fontWeight: '500',
                    border: msg.sender === 'user' ? 'none' : '1px solid var(--border-color)',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                  }}>
                    {msg.text}
                  </div>

                  {msg.sender === 'ai' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <button 
                        onClick={() => speakText(msg.text, session?.target_language_code)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '3px' }}
                      >
                        <Volume2 size={14} /> Listen
                      </button>
                      <span>•</span>
                      <button 
                        onClick={() => speakText(msg.text, session?.target_language_code, true)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                      >
                        Slow 🐢
                      </button>
                      {msg.translation && <span>• "{msg.translation}"</span>}
                    </div>
                  )}
                </div>
              ))
            )}
            {sending && (
              <div style={{ alignSelf: 'flex-start', padding: '0.5rem 1rem', background: 'var(--bg-subtle)', borderRadius: '12px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                AI Tutor is formulating native reply...
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Context Hints Pill Bar */}
          {session?.context_hints && session.context_hints.length > 0 && (
            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', padding: '0.5rem 0', borderTop: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-muted)', alignSelf: 'center' }}>HINTS:</span>
              {session.context_hints.map((h, idx) => (
                <button
                  key={idx}
                  onClick={() => setInputText(h.split('(')[0].trim())}
                  style={{
                    padding: '3px 8px', borderRadius: '12px', fontSize: '0.75rem',
                    background: 'rgba(28, 176, 246, 0.1)', color: '#1cb0f6', border: '1px solid rgba(28, 176, 246, 0.2)',
                    whiteSpace: 'nowrap', cursor: 'pointer'
                  }}
                >
                  {h}
                </button>
              ))}
            </div>
          )}

          {/* Message Input Box */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '0.75rem' }}>
            <button
              onClick={handleMicClick}
              className={`btn ${isListening ? 'btn-danger' : 'btn-secondary'}`}
              style={{ padding: '0.75rem 1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
              title="Speak in target language"
            >
              <Mic size={18} color={isListening ? '#ffffff' : 'var(--primary-color)'} />
              {isListening ? 'Listening...' : 'Speak'}
            </button>

            <input
              type="text"
              className="form-control"
              placeholder={`Type or speak in ${user?.target_language?.name || 'target language'}...`}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendResponse()}
              disabled={sending || isCompleted}
              style={{ flex: 1, borderRadius: '12px', padding: '0.75rem 1rem' }}
            />

            <button
              onClick={() => handleSendResponse()}
              className="btn btn-primary"
              disabled={!inputText.trim() || sending || isCompleted}
              style={{ padding: '0.75rem 1.25rem', borderRadius: '12px' }}
            >
              <Send size={18} />
            </button>

            <button
              onClick={handleEndSession}
              className="btn btn-secondary"
              style={{ borderRadius: '12px', fontSize: '0.85rem' }}
              title="Finish conversation and collect XP"
            >
              Finish
            </button>
          </div>
        </div>

        {/* Live Pedagogical Feedback Sidebar */}
        {latestFeedback && (
          <div className="card" style={{ padding: '1.25rem', borderRadius: '16px', border: '1px solid rgba(88, 204, 2, 0.25)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem', color: 'var(--primary-color)', fontWeight: '800' }}>
              <Sparkles size={18} /> {t('liveAiFeedback')}
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>{t('turnAccuracy')}</div>
              <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--primary-color)' }}>
                {Math.round(latestFeedback.turnScore)}%
              </div>
            </div>

            {latestFeedback.correction && (
              <div style={{ marginBottom: '1rem', padding: '0.75rem', background: 'rgba(255, 150, 0, 0.1)', borderRadius: '10px', borderLeft: '3px solid #ff9600' }}>
                <div style={{ fontWeight: 'bold', fontSize: '0.85rem', color: '#ff9600', marginBottom: '2px' }}>{t('grammarCoaching')}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>{latestFeedback.correction}</div>
              </div>
            )}

            {latestFeedback.tips && latestFeedback.tips.length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '4px' }}>{t('pronunciationTips')}</div>
                {latestFeedback.tips.map((tItem, idx) => (
                  <div key={idx} style={{ fontSize: '0.85rem', color: 'var(--text-main)', marginBottom: '3px' }}>
                    🎙️ {tItem}
                  </div>
                ))}
              </div>
            )}

            {latestFeedback.vocab && latestFeedback.vocab.length > 0 && (
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '4px' }}>{t('recommendedVocabulary')}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {latestFeedback.vocab.map((v, idx) => (
                    <span key={idx} style={{ background: 'var(--bg-subtle)', padding: '2px 8px', borderRadius: '8px', fontSize: '0.8rem', border: '1px solid var(--border-color)' }}>
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
          <div className="card" style={{ maxWidth: '500px', width: '100%', padding: '2.5rem', textAlign: 'center', borderRadius: '20px' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🎉</div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '0.5rem', color: 'var(--text-main)' }}>
              {t('conversationCompleted')}
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
              {t('turnsCompleted', { turns: finalSummary.total_turns })}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{ padding: '0.75rem', background: 'var(--bg-subtle)', borderRadius: '12px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>{t('grammarCoaching')}</div>
                <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--primary-color)' }}>{finalSummary.grammar_score}%</div>
              </div>
              <div style={{ padding: '0.75rem', background: 'var(--bg-subtle)', borderRadius: '12px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>{t('speakingLabTitle')}</div>
                <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#1cb0f6' }}>{finalSummary.pronunciation_score}%</div>
              </div>
              <div style={{ padding: '0.75rem', background: 'var(--bg-subtle)', borderRadius: '12px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>{t('recommendedVocabulary')}</div>
                <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#ff9600' }}>{finalSummary.vocabulary_score}%</div>
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

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button 
                onClick={() => handleStartSession(selectedScenario)}
                className="btn btn-secondary"
                style={{ flex: 1, padding: '0.75rem' }}
              >
                {t('practiceAgain')}
              </button>
              <button 
                onClick={() => navigate('/dashboard')}
                className="btn btn-primary"
                style={{ flex: 1, padding: '0.75rem' }}
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
