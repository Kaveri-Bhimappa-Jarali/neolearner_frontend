import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { HelpCircle, CheckCircle, XCircle, Award, ArrowRight, RotateCcw, Heart, Trophy, Sparkles } from 'lucide-react';
import { sounds } from '../../utils/sounds';
import ExplainMistakeModal from '../Shared/ExplainMistakeModal';

const AssessmentRunner = () => {
  const { assessmentId } = useParams();
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answersMap, setAnswersMap] = useState({});
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Gamification interactive states
  const [wordBanks, setWordBanks] = useState({});
  const [wordSelections, setWordSelections] = useState({});
  const [matchPairsData, setMatchPairsData] = useState({});

  // Speech (STT/TTS) interactive states
  const [recordingState, setRecordingState] = useState({}); // { [qId]: 'idle' | 'listening' | 'success' | 'error' }
  const [speechTranscripts, setSpeechTranscripts] = useState({}); // { [qId]: string }

  // One-at-a-time Duolingo style states
  const [currentIdx, setCurrentIdx] = useState(0);
  const [checked, setChecked] = useState(false);
  const [isCurrentCorrect, setIsCurrentCorrect] = useState(false);
  const [explainModalData, setExplainModalData] = useState(null);

  // Warm up voices cache on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.getVoices();
      const handleVoicesChanged = () => {
        window.speechSynthesis.getVoices();
      };
      window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);
      return () => {
        window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
      };
    }
  }, []);

  const playCorrectSound = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      gain1.gain.setValueAtTime(0.1, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start();
      osc1.stop(ctx.currentTime + 0.12);

      setTimeout(() => {
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.frequency.setValueAtTime(659.25, ctx.currentTime); // E5
        gain2.gain.setValueAtTime(0.1, ctx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start();
        osc2.stop(ctx.currentTime + 0.25);
      }, 80);
    } catch (e) {
      console.warn("Sound play error", e);
    }
  };

  const playIncorrectSound = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150.0, ctx.currentTime); // Low buzz
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch (e) {
      console.warn("Sound play error", e);
    }
  };

  const getTargetLangCode = () => {
    if (assessment && assessment.language_code) {
      const code = assessment.language_code.toLowerCase();
      if (code === 'kn') return 'kn-IN';
      if (code === 'te') return 'te-IN';
      if (code === 'mr') return 'mr-IN';
      if (code === 'hi') return 'hi-IN';
      if (code === 'en') return 'en-IN';
      if (code === 'es') return 'es-ES';
      if (code === 'fr') return 'fr-FR';
      if (code === 'de') return 'de-DE';
      if (code === 'ja') return 'ja-JP';
    }
    if (user && user.target_language && user.target_language.code) {
      const code = user.target_language.code.toLowerCase();
      if (code === 'kn') return 'kn-IN';
      if (code === 'te') return 'te-IN';
      if (code === 'mr') return 'mr-IN';
      if (code === 'hi') return 'hi-IN';
      if (code === 'en') return 'en-IN';
      if (code === 'es') return 'es-ES';
      if (code === 'fr') return 'fr-FR';
      if (code === 'de') return 'de-DE';
      if (code === 'ja') return 'ja-JP';
    }
    return 'en-IN';
  };

  const getVoiceForLanguage = (langCode) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return null;
    const voices = window.speechSynthesis.getVoices();
    const prefix = langCode.split('-')[0].toLowerCase();
    let matchingVoice = voices.find(v => v.lang.toLowerCase() === langCode.toLowerCase());
    if (!matchingVoice) {
      matchingVoice = voices.find(v => v.lang.toLowerCase().startsWith(prefix));
    }
    return matchingVoice || null;
  };

  const playAudio = (text, langCode = 'en-IN') => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      window.speechSynthesis.resume();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = langCode;
      const voice = getVoiceForLanguage(langCode);
      if (voice) {
        utterance.voice = voice;
      }
      window.speechSynthesis.speak(utterance);
    } else {
      console.warn('Speech synthesis not supported in this browser.');
    }
  };

  const startSpeechRecognition = (questionId, targetText) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please use Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = getTargetLangCode();
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    setRecordingState(prev => ({ ...prev, [questionId]: 'listening' }));

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setSpeechTranscripts(prev => ({ ...prev, [questionId]: transcript }));
      
      const cleanText = (str) => str.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g,"").replace(/\s{2,}/g," ").trim();
      const isMatch = cleanText(transcript) === cleanText(targetText);
      
      const q = assessment.questions.find(quest => quest.id === questionId);
      const correctAns = q.answers?.find(a => a.is_correct);
      const incorrectAns = q.answers?.find(a => !a.is_correct);

      if (isMatch && correctAns) {
        setRecordingState(prev => ({ ...prev, [questionId]: 'success' }));
        selectAnswer(questionId, correctAns.id);
      } else {
        setRecordingState(prev => ({ ...prev, [questionId]: 'error' }));
        selectAnswer(questionId, incorrectAns?.id || 'wrong');
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      setRecordingState(prev => ({ ...prev, [questionId]: 'error' }));
    };

    recognition.onend = () => {
      setRecordingState(prev => {
        if (prev[questionId] === 'listening') {
          return { ...prev, [questionId]: 'idle' };
        }
        return prev;
      });
    };

    recognition.start();
  };

  useEffect(() => {
    const fetchAssessment = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/assessments/${assessmentId}`);
        if (res.data) {
          setAssessment(res.data);
        }
      } catch (err) {
        console.error('Failed to load assessment from API:', err);
      } finally {
        setLoading(false);
      }
    };
    if (assessmentId) {
      fetchAssessment();
    }
  }, [assessmentId]);

  // Initialize interactive question widgets once assessment is loaded
  useEffect(() => {
    if (!assessment || !assessment.questions) return;
    
    const banks = {};
    const pairs = {};
    
    assessment.questions.forEach(q => {
      if (q.type === 'word_order') {
        const correctAns = q.answers?.find(a => a.is_correct);
        const correctWords = correctAns ? correctAns.text.split(' ') : [];
        let distractorWords = [];
        q.answers?.forEach(a => {
          if (!a.is_correct) {
            distractorWords = [...distractorWords, ...a.text.split(' ')];
          }
        });
        const allWords = [...new Set([...correctWords, ...distractorWords])];
        const shuffled = [...allWords].sort(() => Math.random() - 0.5);
        banks[q.id] = shuffled;
      }
      
      if (q.type === 'match_pairs') {
        const correctAns = q.answers?.find(a => a.is_correct);
        if (correctAns) {
          const rawPairs = correctAns.text.split(',').map(p => {
            const parts = p.split(':');
            return { es: parts[0], en: parts[1] };
          });
          const esCards = rawPairs.map(p => ({ id: `es-${p.es}`, word: p.es, lang: 'es', pair: p.en }));
          const enCards = rawPairs.map(p => ({ id: `en-${p.en}`, word: p.en, lang: 'en', pair: p.es }));
          const shuffled = [...esCards, ...enCards].sort(() => Math.random() - 0.5);
          pairs[q.id] = {
            cards: shuffled,
            selected: [],
            matched: new Set()
          };
        }
      }
    });
    
    setWordBanks(banks);
    setMatchPairsData(pairs);
    setWordSelections({});
    setAnswersMap({});
  }, [assessment]);

  const selectAnswer = (questionId, answerId) => {
    setAnswersMap(prev => ({
      ...prev,
      [questionId]: answerId
    }));
  };

  // Word Order helpers
  const addWord = (qId, word) => {
    setWordSelections(prev => {
      const current = prev[qId] || [];
      const updated = [...current, word];
      
      const q = assessment.questions.find(quest => quest.id === qId);
      const correctAns = q.answers?.find(a => a.is_correct);
      const incorrectAns = q.answers?.find(a => !a.is_correct);
      
      const isMatch = updated.join(' ') === correctAns.text;
      
      setAnswersMap(prevAns => ({
        ...prevAns,
        [qId]: isMatch ? correctAns.id : (incorrectAns?.id || 'wrong')
      }));
      
      return { ...prev, [qId]: updated };
    });
  };

  const removeWord = (qId, idx) => {
    setWordSelections(prev => {
      const current = prev[qId] || [];
      const updated = current.filter((_, i) => i !== idx);
      
      const q = assessment.questions.find(quest => quest.id === qId);
      const correctAns = q.answers?.find(a => a.is_correct);
      const incorrectAns = q.answers?.find(a => !a.is_correct);
      
      const isMatch = updated.join(' ') === correctAns.text;
      
      setAnswersMap(prevAns => ({
        ...prevAns,
        [qId]: isMatch ? correctAns.id : (incorrectAns?.id || 'wrong')
      }));
      
      return { ...prev, [qId]: updated };
    });
  };

  // Match Pairs helper
  const selectCard = (qId, card) => {
    setMatchPairsData(prev => {
      const current = prev[qId];
      if (!current) return prev;
      
      const selected = [...current.selected];
      const matched = new Set(current.matched);
      
      if (selected.some(c => c.id === card.id)) return prev;
      
      selected.push(card);
      
      if (selected.length === 2) {
        const [first, second] = selected;
        if (first.lang !== second.lang && (first.pair === second.word || second.pair === first.word)) {
          matched.add(first.word);
          matched.add(second.word);
          
          const q = assessment.questions.find(quest => quest.id === qId);
          const correctAns = q.answers?.find(a => a.is_correct);
          const incorrectAns = q.answers?.find(a => !a.is_correct);
          
          const totalWords = current.cards.length;
          const allMatched = matched.size === totalWords;
          
          setAnswersMap(prevAns => ({
            ...prevAns,
            [qId]: allMatched ? correctAns.id : (incorrectAns?.id || 'wrong')
          }));
        }
        
        setTimeout(() => {
          setMatchPairsData(p => {
            const data = p[qId];
            return {
              ...p,
              [qId]: { ...data, selected: [] }
            };
          });
        }, 500);
      }
      
      return {
        ...prev,
        [qId]: { ...current, selected, matched }
      };
    });
  };

  const handleSubmit = async () => {
    if (user) {
      setSubmitting(true);
      try {
        const payload = {
          assessment_id: assessmentId,
          answers: Object.entries(answersMap).map(([qId, aId]) => ({
            question_id: qId,
            selected_answer_id: aId
          }))
        };
        const res = await api.post(`/assessments/${assessmentId}/submit`, payload);
        setResult(res.data);
        if (res.data.passed) {
          sounds.playVictory();
        }
        
        // Refresh learner stats (streak, xp, gems, hearts)
        const userRes = await api.get('/learners/me');
        setUser(userRes.data);
        
        setSubmitting(false);
        return;
      } catch (err) {
        console.warn('Backend API offline, scoring locally:', err);
      }
    }

    // Local calculation fallback
    let correctCount = 0;
    assessment.questions?.forEach(q => {
      const selectedId = answersMap[q.id];
      const correctAns = q.answers?.find(a => a.is_correct);
      if (correctAns && selectedId === correctAns.id) {
        correctCount++;
      }
    });

    const scorePct = (correctCount / (assessment.questions?.length || 1)) * 100;
    setResult({
      score: scorePct,
      passed: scorePct >= assessment.pass_percentage,
      xp_earned: scorePct >= assessment.pass_percentage ? 20 : 0,
      gems_earned: scorePct >= assessment.pass_percentage ? 10 : 0,
      hearts_lost: assessment.questions?.length - correctCount,
      current_hearts: user ? Math.max(0, user.hearts - (assessment.questions?.length - correctCount)) : 5
    });
    setSubmitting(false);
  };

  const handleCheckAnswer = () => {
    const question = assessment.questions[currentIdx];
    const correctAns = question.answers?.find(a => a.is_correct);
    const selectedAnsId = answersMap[question.id];
    
    const isCorrect = correctAns && selectedAnsId === correctAns.id;
    setIsCurrentCorrect(isCorrect);
    
    if (isCorrect) {
      sounds.playCorrect();
    } else {
      sounds.playIncorrect();
      if (user) {
        setUser(prevUser => ({
          ...prevUser,
          hearts: Math.max(0, prevUser.hearts - 1)
        }));
      }
    }
    setChecked(true);
  };

  const handleContinue = () => {
    setChecked(false);
    
    // Check if user is out of hearts
    if (user && user.hearts <= 0) {
      handleSubmit();
      return;
    }

    if (currentIdx < (assessment.questions?.length || 0) - 1) {
      setCurrentIdx(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  // Block screen if 0 hearts remaining
  if (user && user.hearts <= 0 && !result) {
    return (
      <div className="page-container" style={{ maxWidth: '600px', textAlign: 'center' }}>
        <div className="card" style={{ padding: '3rem' }}>
          <div style={{ display: 'inline-flex', padding: '1.5rem', borderRadius: '50%', background: 'rgba(255, 75, 75, 0.15)', marginBottom: '1.5rem' }}>
            <Heart size={64} color="#ff4b4b" fill="#ff4b4b" />
          </div>
          <h1 style={{ fontSize: '2rem', color: 'var(--text-main)', marginBottom: '0.75rem' }}>No Hearts Remaining!</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: '1.6', marginBottom: '2rem' }}>
            You need hearts to start a quiz. You can refill your hearts in the Shop or practice to replenish them for free!
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/shop" className="btn btn-primary" style={{ background: '#ff4b4b', borderColor: '#ff4b4b', padding: '0.75rem 2rem' }}>
              Refill Hearts
            </Link>
            <Link to="/practice" className="btn btn-secondary" style={{ padding: '0.75rem 2rem' }}>
              Practice Free
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="page-container" style={{ textAlign: 'center', padding: '4rem' }}>Loading Quiz Assessment...</div>;
  }

  if (!assessment) {
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: '4rem' }}>
        <h2>Quiz not found</h2>
        <Link to="/courses" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>Back to Courses</Link>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ maxWidth: '800px' }}>
      <div className="card" style={{ padding: '2.5rem' }}>
        
        {result ? (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div style={{ 
              display: 'inline-flex', padding: '1.5rem', borderRadius: '50%', 
              background: result.passed ? 'rgba(88, 204, 2, 0.15)' : 'rgba(255, 75, 75, 0.15)',
              marginBottom: '1rem'
            }}>
              {result.passed ? (
                <CheckCircle size={64} color="var(--primary-color)" />
              ) : (
                <XCircle size={64} color="var(--error)" />
              )}
            </div>
            <h2 style={{ fontSize: '2.25rem', marginBottom: '0.5rem', color: result.passed ? 'var(--primary-color)' : 'var(--error)' }}>
              {result.passed ? 'Assessment Passed!' : 'Needs Revision'}
            </h2>
            <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>
              Your Score: <strong>{result.score.toFixed(0)}%</strong> (Passing Threshold: {assessment.pass_percentage}%)
            </p>

            {/* Gamified Rewards Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem', maxWidth: '500px', margin: '0 auto 2.5rem auto' }}>
              <div style={{ padding: '0.85rem', background: 'var(--background)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                <span style={{ display: 'block', fontSize: '1.35rem', fontWeight: 'bold', color: '#58cc02' }}>
                  +{result.xp_earned || 0} 📈
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>XP Earned</span>
              </div>
              <div style={{ padding: '0.85rem', background: 'var(--background)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                <span style={{ display: 'block', fontSize: '1.35rem', fontWeight: 'bold', color: '#1cb0f6' }}>
                  +{result.gems_earned || 0} 💎
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Gems Gained</span>
              </div>
              <div style={{ padding: '0.85rem', background: 'var(--background)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                <span style={{ display: 'block', fontSize: '1.35rem', fontWeight: 'bold', color: '#ff4b4b' }}>
                  -{result.hearts_lost || 0} ❤️
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Hearts Lost</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.5rem', flexWrap: 'wrap' }}>
              <button 
                onClick={() => { 
                  setResult(null); 
                  setAnswersMap({}); 
                  setCurrentIdx(0); 
                  setChecked(false); 
                }} 
                className="btn btn-secondary" 
                style={{ gap: '6px' }} 
                disabled={user && user.hearts <= 0}
              >
                <RotateCcw size={16} /> Retake Quiz
              </button>
              {result.passed ? (
                <Link to="/learning-path" className="btn btn-primary" style={{ gap: '6px', padding: '0.85rem 1.8rem', fontWeight: '800' }}>
                  <Award size={18} /> Continue Learning Path <ArrowRight size={18} />
                </Link>
              ) : (
                <Link to="/dashboard" className="btn btn-secondary" style={{ gap: '6px' }}>
                  View Dashboard
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div>
            {/* Duolingo Header Component */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '2.5rem' }}>
              <button 
                onClick={() => navigate('/dashboard')} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', color: 'var(--text-muted)', padding: '0 5px' }}
                title="Exit Lesson"
              >
                ✕
              </button>
              <div style={{ flex: 1, height: '14px', background: 'var(--border-color)', borderRadius: '9999px', overflow: 'hidden' }}>
                <div style={{ 
                  height: '100%', 
                  background: 'var(--primary-color)', 
                  width: `${(currentIdx / (assessment.questions?.length || 1)) * 100}%`,
                  transition: 'width 0.3s ease'
                }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ff4b4b', fontWeight: 'bold', fontSize: '1.1rem' }}>
                <Heart size={20} fill="#ff4b4b" /> {user ? user.hearts : 5}
              </div>
            </div>

            {/* Active Question Element */}
            {(() => {
              const question = assessment.questions?.[currentIdx];
              if (!question) return <div>No questions loaded.</div>;
              const qType = question.type || 'multiple_choice';
              
              return (
                <div key={question.id}>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <span className="badge badge-purple" style={{ textTransform: 'uppercase', fontSize: '0.75rem', padding: '4px 12px', borderRadius: '20px' }}>
                      {qType.replace(/_/g, ' ')}
                    </span>
                    
                    {/* Fill in the blank dynamic prompt */}
                    {qType === 'fill_in_blank' ? (
                      <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-main)', marginTop: '1rem' }}>
                        Fill in the blank
                      </h2>
                    ) : (
                      <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-main)', marginTop: '1rem' }}>
                        {qType === 'listening' ? 'Listen and select target translation' : (qType === 'speaking' ? 'Speak the phrase aloud' : question.text)}
                      </h2>
                    )}
                  </div>

                  {/* Render based on Question Type */}
                  <div style={{ padding: '0.5rem 0' }}>
                    {qType === 'word_order' ? (
                      <div>
                        {/* Built answer tiles */}
                        <div style={{ 
                          display: 'flex', gap: '8px', flexWrap: 'wrap', minHeight: '60px', 
                          background: 'var(--surface)', padding: '10px', borderRadius: '8px',
                          border: '2px dashed var(--border-color)', marginBottom: '15px', alignItems: 'center'
                        }}>
                          {(wordSelections[question.id] || []).length === 0 && (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Tap words below to translate...</span>
                          )}
                          {(wordSelections[question.id] || []).map((word, idx) => (
                            <button
                              key={idx}
                              type="button"
                              disabled={checked}
                              onClick={() => removeWord(question.id, idx)}
                              style={{ 
                                padding: '6px 12px', background: 'var(--secondary-color)', 
                                border: 'none', borderRadius: '8px', color: '#fff', 
                                fontWeight: 'bold', cursor: checked ? 'default' : 'pointer' 
                              }}
                            >
                              {word}
                            </button>
                          ))}
                        </div>
                        
                        {/* Word bank tiles */}
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          {(wordBanks[question.id] || []).map((word, idx) => {
                            const selected = (wordSelections[question.id] || []);
                            const countInSelections = selected.filter(w => w === word).length;
                            const countInBank = (wordBanks[question.id] || []).filter(w => w === word).length;
                            const isUsed = countInSelections >= countInBank;
                            
                            return (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => !isUsed && !checked && addWord(question.id, word)}
                                disabled={isUsed || checked}
                                style={{
                                  padding: '8px 12px',
                                  background: isUsed ? 'var(--border-color)' : 'var(--surface-hover)',
                                  color: isUsed ? 'var(--text-muted)' : 'var(--text-main)',
                                  border: '1px solid var(--border-color)',
                                  borderRadius: '8px',
                                  fontWeight: 'bold',
                                  cursor: (isUsed || checked) ? 'default' : 'pointer'
                                }}
                              >
                                {word}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ) : qType === 'match_pairs' ? (
                      <div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '10px' }}>Match vocabulary equivalents:</p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                          {(matchPairsData[question.id]?.cards || []).map((card) => {
                            const data = matchPairsData[question.id];
                            const isSelected = data?.selected.some(c => c.id === card.id);
                            const isMatched = data?.matched.has(card.word);
                            
                            let border = 'var(--border-color)';
                            let bg = 'var(--surface)';
                            
                            if (isSelected) {
                              border = 'var(--secondary-color)';
                              bg = 'rgba(59, 130, 246, 0.15)';
                            }
                            if (isMatched) {
                              border = 'var(--primary-color)';
                              bg = 'rgba(16, 185, 129, 0.1)';
                            }
                            
                            return (
                              <div
                                key={card.id}
                                onClick={() => !isMatched && !checked && selectCard(question.id, card)}
                                style={{
                                  padding: '1rem 0.25rem', borderRadius: '12px', border: `2px solid ${border}`,
                                  background: bg, textAlign: 'center', fontWeight: 'bold', 
                                  cursor: (isMatched || checked) ? 'default' : 'pointer',
                                  opacity: isMatched ? 0.4 : 1, transition: 'all 0.2s ease', 
                                  color: 'var(--text-main)', fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis'
                                }}
                              >
                                {card.word}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : qType === 'listening' ? (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', margin: '1rem 0' }}>
                        <button
                          type="button"
                          onClick={() => playAudio(question.text, getTargetLangCode())}
                          style={{
                            padding: '1.25rem', borderRadius: '50%', background: 'var(--secondary-color)',
                            color: '#fff', border: 'none', cursor: 'pointer', width: '80px', height: '80px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.15)'
                          }}
                        >
                          <span style={{ fontSize: '2.25rem' }}>🔊</span>
                        </button>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Listen to the phrase and select the correct translation below.</p>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
                          {question.answers?.map((ans) => {
                            const isSelected = answersMap[question.id] === ans.id;
                            
                            let borderStyle = '2px solid var(--border-color)';
                            let bgStyle = 'var(--surface)';
                            
                            if (isSelected) {
                              borderStyle = '2px solid var(--primary-color)';
                              bgStyle = 'rgba(88, 204, 2, 0.1)';
                            }
                            if (checked) {
                              if (ans.is_correct) {
                                borderStyle = '2px solid var(--primary-color)';
                                bgStyle = 'rgba(88, 204, 2, 0.15)';
                              } else if (isSelected) {
                                borderStyle = '2px solid var(--error)';
                                bgStyle = 'rgba(255, 75, 75, 0.15)';
                              }
                            }

                            return (
                              <div 
                                key={ans.id}
                                onClick={() => !checked && selectAnswer(question.id, ans.id)}
                                style={{ 
                                  padding: '0.875rem 1.25rem', borderRadius: 'var(--radius-sm)',
                                  border: borderStyle,
                                  background: bgStyle,
                                  cursor: checked ? 'default' : 'pointer', transition: 'all 0.2s ease', color: 'var(--text-main)'
                                }}
                              >
                                {ans.text}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : qType === 'speaking' ? (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', margin: '1rem 0' }}>
                        <div style={{ fontSize: '1.35rem', fontWeight: 'bold', color: 'var(--primary-color)', padding: '0.5rem 1.5rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px' }}>
                          "{question.text}"
                        </div>
                        
                        <button
                          type="button"
                          onClick={() => startSpeechRecognition(question.id, question.text)}
                          disabled={recordingState[question.id] === 'listening' || checked}
                          style={{
                            padding: '1.5rem', borderRadius: '50%', 
                            background: recordingState[question.id] === 'listening' ? '#ff4b4b' : (recordingState[question.id] === 'success' ? 'var(--primary-color)' : 'var(--border-color)'),
                            color: '#fff', border: 'none', cursor: checked ? 'default' : 'pointer', width: '90px', height: '90px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', 
                            boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                            animation: recordingState[question.id] === 'listening' ? 'pulse 1.5s infinite' : 'none'
                          }}
                        >
                          <span style={{ fontSize: '2.5rem' }}>
                            {recordingState[question.id] === 'listening' ? '🎙️' : (recordingState[question.id] === 'success' ? '✅' : '🎤')}
                          </span>
                        </button>
                        
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                          {recordingState[question.id] === 'listening' ? 'Speaking now... Say the words clearly.' : 'Click the microphone and pronounce the phrase.'}
                        </p>
                        
                        {speechTranscripts[question.id] && (
                          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                            You said: <strong style={{ color: recordingState[question.id] === 'success' ? 'var(--primary-color)' : 'var(--error)' }}>"{speechTranscripts[question.id]}"</strong>
                          </div>
                        )}

                        {(!window.SpeechRecognition && !window.webkitSpeechRecognition) && (
                          <div style={{ width: '100%', marginTop: '1rem' }}>
                            <p style={{ color: 'var(--accent-orange)', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 600 }}>
                              ⚠️ Speech Recognition not supported in this browser. Please type the exact phrase below to pass:
                            </p>
                            <input
                              type="text"
                              disabled={checked}
                              className="form-input"
                              placeholder="Type the exact phrase..."
                              onChange={(e) => {
                                const val = e.target.value;
                                const cleanText = (str) => str.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g,"").replace(/\s{2,}/g," ").trim();
                                const isMatch = cleanText(val) === cleanText(question.text);
                                const correctAns = question.answers?.find(a => a.is_correct);
                                const incorrectAns = question.answers?.find(a => !a.is_correct);
                                if (isMatch && correctAns) {
                                  selectAnswer(question.id, correctAns.id);
                                  setRecordingState(prev => ({ ...prev, [question.id]: 'success' }));
                                } else {
                                  selectAnswer(question.id, incorrectAns?.id || 'wrong');
                                }
                              }}
                            />
                          </div>
                        )}
                      </div>
                    ) : qType === 'fill_in_blank' ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div style={{ fontSize: '1.35rem', textAlign: 'center', padding: '1.5rem', background: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}>
                          {(() => {
                            const selectedAnsId = answersMap[question.id];
                            const selectedAns = question.answers?.find(a => a.id === selectedAnsId);
                            return question.text.split('____').map((part, i, arr) => (
                              <React.Fragment key={i}>
                                {part}
                                {i < arr.length - 1 && (
                                  <span style={{ 
                                    borderBottom: '2px solid var(--primary-color)', 
                                    padding: '0 12px', 
                                    color: 'var(--primary-color)',
                                    fontWeight: 'bold' 
                                  }}>
                                    {selectedAns ? selectedAns.text.toUpperCase() : '______'}
                                  </span>
                                )}
                              </React.Fragment>
                            ));
                          })()}
                        </div>
                        
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Select the word that correctly fills the blank:</p>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.75rem' }}>
                          {question.answers?.map((ans) => {
                            const isSelected = answersMap[question.id] === ans.id;
                            
                            let borderStyle = '2px solid var(--border-color)';
                            let bgStyle = 'var(--bg-card)';
                            
                            if (isSelected) {
                              borderStyle = '2px solid var(--primary-color)';
                              bgStyle = 'rgba(16, 185, 129, 0.08)';
                            }
                            if (checked) {
                              if (ans.is_correct) {
                                borderStyle = '2px solid var(--primary-color)';
                                bgStyle = 'rgba(16, 185, 129, 0.15)';
                              } else if (isSelected) {
                                borderStyle = '2px solid var(--error)';
                                bgStyle = 'rgba(255, 75, 75, 0.15)';
                              }
                            }

                            return (
                              <button
                                key={ans.id}
                                type="button"
                                disabled={checked}
                                onClick={() => !checked && selectAnswer(question.id, ans.id)}
                                style={{
                                  padding: '1rem', borderRadius: '12px',
                                  border: borderStyle,
                                  background: bgStyle,
                                  color: 'var(--text-main)',
                                  cursor: checked ? 'default' : 'pointer',
                                  fontWeight: 'bold',
                                  transition: 'all 0.2s'
                                }}
                              >
                                {ans.text}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      // Default Multiple Choice / True-False Card Grid
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {question.answers?.map((ans) => {
                          const isSelected = answersMap[question.id] === ans.id;
                          
                          let borderStyle = '2px solid var(--border-color)';
                          let bgStyle = 'var(--surface)';
                          
                          if (isSelected) {
                            borderStyle = '2px solid var(--primary-color)';
                            bgStyle = 'rgba(88, 204, 2, 0.1)';
                          }
                          if (checked) {
                            if (ans.is_correct) {
                              borderStyle = '2px solid var(--primary-color)';
                              bgStyle = 'rgba(88, 204, 2, 0.15)';
                            } else if (isSelected) {
                              borderStyle = '2px solid var(--error)';
                              bgStyle = 'rgba(255, 75, 75, 0.15)';
                            }
                          }

                          return (
                            <div 
                              key={ans.id}
                              onClick={() => !checked && selectAnswer(question.id, ans.id)}
                              style={{ 
                                padding: '0.875rem 1.25rem', borderRadius: 'var(--radius-sm)',
                                border: borderStyle,
                                background: bgStyle,
                                cursor: checked ? 'default' : 'pointer', transition: 'all 0.2s ease', color: 'var(--text-main)'
                              }}
                            >
                              {ans.text}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Duolingo Slide-up Footer Panel */}
                  <div style={{ 
                    marginTop: '3rem',
                    padding: '1.5rem 0',
                    borderTop: '2px solid var(--border-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem'
                  }}>
                    {!checked ? (
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          onClick={handleCheckAnswer}
                          disabled={answersMap[question.id] === undefined}
                          className="btn btn-primary"
                          style={{
                            padding: '0.85rem 3rem',
                            fontSize: '1.1rem',
                            fontWeight: 'bold',
                            borderRadius: '12px',
                            background: answersMap[question.id] === undefined ? 'var(--border-color)' : 'var(--primary-color)',
                            borderColor: answersMap[question.id] === undefined ? 'var(--border-color)' : 'var(--primary-color)',
                            color: answersMap[question.id] === undefined ? 'var(--text-muted)' : '#fff',
                            cursor: answersMap[question.id] === undefined ? 'default' : 'pointer'
                          }}
                        >
                          CHECK ANSWER
                        </button>
                      </div>
                    ) : (
                      <div style={{ 
                        background: isCurrentCorrect ? 'rgba(88, 204, 2, 0.08)' : 'rgba(255, 75, 75, 0.08)',
                        padding: '1.5rem',
                        borderRadius: '16px',
                        border: `2px solid ${isCurrentCorrect ? 'var(--primary-color)' : 'var(--error)'}`,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '1rem'
                      }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800', fontSize: '1.2rem', color: isCurrentCorrect ? 'var(--primary-color)' : 'var(--error)' }}>
                            {isCurrentCorrect ? '🎉 Correct! Well done.' : '😢 Incorrect.'}
                          </div>
                          {!isCurrentCorrect && (
                            <>
                              <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                Correct answer: <strong>{question.answers?.find(a => a.is_correct)?.text}</strong>
                              </div>
                              <button
                                type="button"
                                onClick={() => setExplainModalData({
                                  questionId: question.id,
                                  questionText: question.text,
                                  selectedAnswerId: answersMap[question.id],
                                  userAnswerText: question.answers?.find(a => a.id === answersMap[question.id])?.text,
                                  correctAnswerText: question.answers?.find(a => a.is_correct)?.text
                                })}
                                style={{
                                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                                  background: 'rgba(28, 176, 246, 0.15)', color: '#1cb0f6',
                                  border: '1px solid rgba(28, 176, 246, 0.3)',
                                  borderRadius: '10px', padding: '0.4rem 0.85rem',
                                  fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer', marginTop: '8px'
                                }}
                              >
                                <Sparkles size={16} /> Explain with AI
                              </button>
                            </>
                          )}
                          {question.answers?.find(a => a.is_correct)?.explanation && (
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                              {question.answers.find(a => a.is_correct).explanation}
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={handleContinue}
                          className="btn btn-primary"
                          style={{
                            padding: '0.85rem 3rem',
                            fontSize: '1.1rem',
                            fontWeight: 'bold',
                            borderRadius: '12px',
                            background: isCurrentCorrect ? 'var(--primary-color)' : 'var(--error)',
                            borderColor: isCurrentCorrect ? 'var(--primary-color)' : 'var(--error)',
                            color: '#fff'
                          }}
                        >
                          CONTINUE
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {explainModalData && (
          <ExplainMistakeModal 
            {...explainModalData} 
            onClose={() => setExplainModalData(null)} 
          />
        )}
      </div>
    </div>
  );
};

export default AssessmentRunner;
