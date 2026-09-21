import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../utils/i18n';
import { 
  Volume2, Mic, CheckCircle2, XCircle, ArrowRight, 
  RotateCcw, Sparkles, Award, Zap, Trophy, Heart, 
  Layers, Headphones, PenTool, AlertTriangle, RefreshCw, Eye, EyeOff, Timer, Flame, ShieldAlert
} from 'lucide-react';
import { speakText, listenForSpeech } from '../../utils/audio';
import { sounds } from '../../utils/sounds';
import PronunciationEvaluator from '../Speech/PronunciationEvaluator';

const AdaptiveLessonRunner = () => {
  const { user, setUser } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentFocus = searchParams.get('focus') || '';

  const PRACTICE_MODES = useMemo(() => [
    { id: '', label: t('smartAdaptive'), desc: 'AI targeted based on weaknesses & decay' },
    { id: 'speaking', label: t('speakingLab'), desc: 'Voice pronunciation & mic exercises' },
    { id: 'listening', label: t('listeningStudio'), desc: 'Audio listening & phonetics recognition' },
    { id: 'writing', label: t('writingSpellingMode'), desc: 'Spelling, missing letters & vocabulary' },
    { id: 'match_pairs', label: t('speedMatching'), desc: 'Fast association of words and meanings' },
    { id: 'mistakes', label: t('mistakesReviewMode'), desc: 'Target previous incorrect quiz questions' },
  ], [t]);

  const [lessonSession, setLessonSession] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [textInput, setTextInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [explanation, setExplanation] = useState('');
  const [userSubmissions, setUserSubmissions] = useState([]);
  const [showTextHint, setShowTextHint] = useState(false);

  // Match Madness Timed Game State
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameScore, setGameScore] = useState(0);
  const [comboStreak, setComboStreak] = useState(1);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Interactive Match Pairs state
  const [matchedPairs, setMatchedPairs] = useState({});
  const [selectedLeft, setSelectedLeft] = useState(null);
  const [selectedRight, setSelectedRight] = useState(null);
  const [wrongMatchPair, setWrongMatchPair] = useState(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [completedResult, setCompletedResult] = useState(null);
  const [error, setError] = useState('');

  // Fetch dynamic adaptive session
  useEffect(() => {
    const fetchAdaptiveSession = async () => {
      setLoading(true);
      setError('');
      setCurrentIndex(0);
      setSelectedAnswer('');
      setTextInput('');
      setIsAnswered(false);
      setIsCorrect(false);
      setExplanation('');
      setUserSubmissions([]);
      setCompletedResult(null);
      setMatchedPairs({});
      setSelectedLeft(null);
      setSelectedRight(null);
      setShowTextHint(false);
      setTimeLeft(60);
      setGameScore(0);
      setComboStreak(1);
      setIsTimerRunning(false);

      try {
        const res = await api.post(`/learning-paths/adaptive-lesson${currentFocus ? `?focus=${currentFocus}` : ''}`);
        setLessonSession(res.data);
        if (currentFocus === 'match_pairs') {
          setIsTimerRunning(true);
        }
      } catch (err) {
        console.error('Failed to generate adaptive lesson:', err);
        setError('Failed to generate personalized AI workout. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchAdaptiveSession();
  }, [currentFocus]);

  // Timed Match Madness Countdown Timer
  useEffect(() => {
    let timer = null;
    if (isTimerRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isTimerRunning, timeLeft]);

  // Auto-submit Match Madness when timer reaches 0
  useEffect(() => {
    if (currentFocus === 'match_pairs' && timeLeft === 0 && !completedResult && !submitting && lessonSession) {
      handleFinalSubmission();
    }
  }, [timeLeft, currentFocus, completedResult, submitting, lessonSession]);

  const currentQ = lessonSession?.questions?.[currentIndex];

  // Shuffled right words for match pairs to ensure random non-matching column order
  const matchPairData = useMemo(() => {
    if (currentQ?.type !== 'match_pairs') return { rawPairs: [], leftWords: [], rightWords: [] };
    const raw = (currentQ.answers?.[0]?.text || '').split(',').filter(Boolean);
    const left = raw.map(p => p.split(':')[0]).filter(Boolean);
    const right = raw.map(p => p.split(':')[1]).filter(Boolean);

    const shuffled = [...right].sort(() => (currentQ.id ? (currentQ.id.charCodeAt(0) % 3) - 1 : 0.5));
    if (shuffled.length > 1 && shuffled.every((val, idx) => val === right[idx])) {
      [shuffled[0], shuffled[1]] = [shuffled[1], shuffled[0]];
    }
    return { rawPairs: raw, leftWords: left, rightWords: shuffled };
  }, [currentQ]);

  const changeMode = (modeId) => {
    if (modeId) {
      setSearchParams({ focus: modeId });
    } else {
      setSearchParams({});
    }
  };

  if (loading) {
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: '5rem 1rem' }}>
        <RefreshCw size={40} className="animate-spin" style={{ color: 'var(--primary-color)', marginBottom: '1rem' }} />
        <h2>{t('assemblingSession') || 'Assembling AI Adaptive Session...'}</h2>
        <p style={{ color: 'var(--text-muted)' }}>
          {t('analyzingSkillVectors') || 'Analyzing skill vectors, mistake history, and vocabulary retention.'}
        </p>
      </div>
    );
  }

  if (error || !lessonSession || !lessonSession.questions || lessonSession.questions.length === 0) {
    return (
      <div className="page-container" style={{ padding: '3rem 1rem', textAlign: 'center' }}>
        <div className="card" style={{ maxWidth: '540px', margin: '0 auto', padding: '2.5rem' }}>
          <AlertTriangle size={48} color="#ff9600" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ margin: '0 0 0.5rem' }}>{t('noQuestionsFound') || 'No Questions Found'}</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            {error || t('noSpecificExercises') || 'No specific exercises available for this mode right now.'}
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button className="btn btn-primary" onClick={() => changeMode('')}>
              {t('trySmartAdaptive') || 'Try Smart Adaptive Mode'}
            </button>
            <Link to="/dashboard" className="btn btn-secondary">
              {t('backToDashboard') || 'Back to Dashboard'}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const totalQ = lessonSession.questions.length;
  const progressPct = ((currentIndex + 1) / totalQ) * 100;
  const langCode = lessonSession.language_code || 'en';


  // Handle TTS Audio playback (normal or slow)
  const handlePlayAudio = (text, slow = false) => {
    speakText(text, langCode, slow);
  };

  // Handle Speech Recognition for Speaking exercises
  const handleVoiceInput = () => {
    setIsListening(true);
    listenForSpeech(
      langCode,
      (transcript) => {
        setIsListening(false);
        setTextInput(transcript);
      },
      (err) => {
        setIsListening(false);
        console.warn('Voice input error:', err);
      }
    );
  };

  // Check Answer Handler
  const handleCheckAnswer = () => {
    if (isAnswered) return;

    let correct = false;
    let expText = '';

    if (currentQ.type === 'speaking') {
      const targetAns = currentQ.answers[0]?.text || currentQ.target_word || currentQ.text;
      const cleanUser = textInput.trim().toLowerCase();
      const cleanTarget = targetAns.trim().toLowerCase();
      correct = cleanUser.includes(cleanTarget) || cleanTarget.includes(cleanUser) || cleanUser.length > 0;
      expText = correct 
        ? `Great pronunciation! Matched "${targetAns}".` 
        : `Expected pronunciation: "${targetAns}". Click mic to retry!`;
    } else if (currentQ.type === 'fill_in_blank') {
      const correctAns = currentQ.answers.find(a => a.is_correct);
      const cleanUser = textInput.trim().toLowerCase();
      const cleanExpected = (correctAns?.text || currentQ.target_word || '').trim().toLowerCase();
      correct = cleanUser === cleanExpected;
      expText = correctAns?.explanation || (correct ? 'Well done!' : `Correct answer: ${correctAns?.text || cleanExpected}`);
    } else if (currentQ.type === 'match_pairs') {
      correct = true;
      expText = 'All pairs matched perfectly!';
    } else {
      // Multiple Choice / Listening
      const chosenAns = currentQ.answers.find(a => a.id === selectedAnswer);
      correct = !!chosenAns?.is_correct;
      const correctAns = currentQ.answers.find(a => a.is_correct);
      expText = chosenAns?.explanation || correctAns?.explanation || (correct ? 'Correct!' : `Correct answer: ${correctAns?.text}`);
    }

    setIsCorrect(correct);
    setExplanation(expText);
    setIsAnswered(true);

    if (correct) {
      sounds.playCorrect();
    } else {
      sounds.playIncorrect();
    }

    // Record submission
    const newSubmissions = [
      ...userSubmissions,
      {
        question_id: currentQ.id,
        is_correct: correct,
        user_answer: textInput || selectedAnswer || 'matched'
      }
    ];
    setUserSubmissions(newSubmissions);
  };

  const handleFinalSubmission = async () => {
    setSubmitting(true);
    try {
      const payload = {
        session_id: lessonSession.session_id,
        submissions: userSubmissions.length > 0 ? userSubmissions : lessonSession.questions.map(q => ({
          question_id: q.id,
          is_correct: true,
          user_answer: 'matched'
        }))
      };
      const res = await api.post('/learning-paths/adaptive-lesson/submit', payload);
      setCompletedResult(res.data);
      sounds.playVictory();
      if (setUser && res.data.current_hearts !== undefined) {
        setUser(prev => prev ? { ...prev, hearts: res.data.current_hearts } : null);
      }
    } catch (err) {
      console.error('Failed to submit workout:', err);
      const correctCount = userSubmissions.filter(s => s.is_correct).length;
      setCompletedResult({
        score: userSubmissions.length > 0 ? (correctCount / userSubmissions.length) * 100 : 100,
        passed: true,
        xp_earned: 35 + (gameScore / 10),
        gems_earned: 15
      });
      sounds.playVictory();
    } finally {
      setSubmitting(false);
    }
  };

  // Next Question or Submit Session
  const handleNext = async () => {
    if (currentIndex + 1 < totalQ) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer('');
      setTextInput('');
      setIsAnswered(false);
      setIsCorrect(false);
      setExplanation('');
      setMatchedPairs({});
      setSelectedLeft(null);
      setSelectedRight(null);
      setShowTextHint(false);
    } else {
      await handleFinalSubmission();
    }
  };

  // ----------------------------------------------------
  // COMPLETED SUMMARY VIEW
  // ----------------------------------------------------
  if (completedResult) {
    const isPass = completedResult.passed;
    const restoredHeart = completedResult.score >= 80;

    // Detect weak vocabulary items from incorrect submissions
    const incorrectQIds = userSubmissions.filter(s => !s.is_correct).map(s => s.question_id);
    const weakItems = lessonSession.questions.filter(q => incorrectQIds.includes(q.id));

    return (
      <div className="page-container" style={{ maxWidth: '640px', margin: '2.5rem auto', padding: '0 1rem' }}>
        <div className="card" style={{ 
          padding: '3rem 2rem', textAlign: 'center',
          borderRadius: '24px', boxShadow: '0 12px 32px rgba(0,0,0,0.08)'
        }}>
          <div style={{
            width: '95px', height: '95px', borderRadius: '50%',
            background: isPass ? 'rgba(88, 204, 2, 0.15)' : 'rgba(255, 150, 0, 0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem'
          }}>
            {isPass ? <Trophy size={50} color="var(--primary-color)" /> : <Sparkles size={50} color="#ff9600" />}
          </div>

          <h1 style={{ fontSize: '2.2rem', fontWeight: '800', margin: '0 0 0.5rem', color: 'var(--text-main)' }}>
            {isPass ? t('workoutCompleted') : t('greatEffort')}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', margin: '0 0 2rem' }}>
            {isPass 
              ? 'Your proficiency predictions and skill competencies have been updated!' 
              : 'Consistent practice reinforces vocabulary retention and phonics decoding.'}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ padding: '1.25rem', background: 'var(--background)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>{t('accuracy')}</span>
              <strong style={{ fontSize: '1.75rem', color: isPass ? 'var(--primary-color)' : '#ff9600' }}>
                {completedResult.score.toFixed(0)}%
              </strong>
            </div>

            <div style={{ padding: '1.25rem', background: 'var(--background)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>{t('xpEarned')}</span>
              <strong style={{ fontSize: '1.75rem', color: 'var(--secondary-color)' }}>
                +{completedResult.xp_earned || 30} XP
              </strong>
            </div>

            {currentFocus === 'match_pairs' && (
              <div style={{ padding: '1.25rem', background: 'rgba(255, 150, 0, 0.08)', borderRadius: '16px', border: '1px solid rgba(255, 150, 0, 0.25)' }}>
                <span style={{ fontSize: '0.85rem', color: '#ff9600', display: 'block', marginBottom: '4px' }}>Match Score</span>
                <strong style={{ fontSize: '1.75rem', color: '#ff9600' }}>
                  {gameScore}
                </strong>
              </div>
            )}

            {restoredHeart && (
              <div style={{ padding: '1.25rem', background: 'rgba(255, 75, 75, 0.08)', borderRadius: '16px', border: '1px solid rgba(255, 75, 75, 0.25)' }}>
                <span style={{ fontSize: '0.85rem', color: '#ff4b4b', display: 'block', marginBottom: '4px' }}>{t('practiceBonus')}</span>
                <strong style={{ fontSize: '1.5rem', color: '#ff4b4b', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                  +1 <Heart size={22} fill="#ff4b4b" />
                </strong>
              </div>
            )}
          </div>

          {/* Weak Vocabulary Detected Section */}
          {weakItems.length > 0 && (
            <div style={{ textAlign: 'left', background: 'rgba(255, 75, 75, 0.06)', padding: '1.25rem', borderRadius: '16px', border: '1px solid rgba(255, 75, 75, 0.2)', marginBottom: '2rem' }}>
              <h4 style={{ margin: '0 0 0.75rem', color: '#c62828', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.95rem' }}>
                <ShieldAlert size={18} /> Weak Vocabulary Detected for Revision
              </h4>
              <ul style={{ margin: 0, paddingLeft: '1.25rem', color: 'var(--text-main)', fontSize: '0.9rem' }}>
                {weakItems.map((q, idx) => (
                  <li key={idx} style={{ marginBottom: '4px' }}>
                    <strong>{q.target_word || q.text}</strong> ({q.prompt_translation || 'Practice target'})
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Link to="/learning-path" className="btn btn-primary" style={{ padding: '0.9rem', fontSize: '1.05rem' }}>
              {t('continueLearningPath')}
            </Link>
            <button 
              className="btn btn-secondary" 
              style={{ padding: '0.85rem' }}
              onClick={() => changeMode(currentFocus)}
            >
              <RotateCcw size={16} /> {t('startAnotherDrill')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ maxWidth: '760px', margin: '1.5rem auto', padding: '0 1rem' }}>
      
      {/* Mode Selector Header Bar */}
      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Zap size={18} color="var(--primary-color)" /> {t('aiPracticeSuite')}
          </h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {t('targetLanguage')}: <strong style={{ color: 'var(--text-main)', textTransform: 'uppercase' }}>{langCode}</strong>
          </span>
        </div>

        <div style={{ 
          display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '6px',
          scrollbarWidth: 'thin'
        }}>
          {PRACTICE_MODES.map(mode => {
            const isActive = currentFocus === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => changeMode(mode.id)}
                style={{
                  padding: '0.45rem 0.85rem',
                  borderRadius: '20px',
                  border: isActive ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
                  background: isActive ? 'rgba(88, 204, 2, 0.12)' : 'var(--background)',
                  color: isActive ? 'var(--primary-color)' : 'var(--text-main)',
                  fontWeight: isActive ? '700' : '600',
                  fontSize: '0.82rem',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                title={mode.desc}
              >
                {mode.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Session Progress Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem' }}>
        <button 
          onClick={() => navigate('/learning-path')}
          style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: 'var(--text-muted)' }}
          title="Exit Practice"
        >
          ✕
        </button>

        <div style={{ flex: 1, height: '12px', background: 'var(--border-color)', borderRadius: '9999px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${progressPct}%`, background: 'var(--primary-color)', transition: 'width 0.4s ease' }} />
        </div>

        {currentFocus === 'match_pairs' ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ff9600', fontWeight: 'bold' }}>
              <Timer size={18} />
              <span>{timeLeft}s</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ff4b4b', fontWeight: 'bold' }}>
              <Flame size={18} />
              <span>{comboStreak}x</span>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary-color)', fontWeight: 'bold', fontSize: '0.9rem' }}>
            <Sparkles size={16} />
            <span>{currentIndex + 1} / {totalQ}</span>
          </div>
        )}
      </div>

      {/* Main Interactive Exercise Card */}
      <div className="card" style={{ padding: '2.25rem', borderRadius: '24px', boxShadow: '0 8px 24px rgba(0,0,0,0.06)' }}>
        
        {/* Competency Tag */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <span className="badge badge-blue" style={{ textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.75rem' }}>
            {currentQ.competency_tag} Drill
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Session: <strong>{lessonSession.title}</strong>
          </span>
        </div>

        {/* Prompt Header */}
        <div style={{ marginBottom: '1.75rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-main)', margin: '0 0 1rem' }}>
            {currentQ.type === 'speaking' && t('promptSpeaking')}
            {currentQ.type === 'listening' && t('promptListening')}
            {currentQ.type === 'fill_in_blank' && `✍️ ${currentQ.text}`}
            {currentQ.type === 'match_pairs' && t('promptMatchPairs')}
            {currentQ.type === 'multiple_choice' && (currentQ.text.includes('?') ? currentQ.text : t('promptTranslation'))}
          </h2>

          {/* Interactive Word Banner with Audio Scaffolding Controls */}
          {currentQ.type !== 'match_pairs' && currentQ.type !== 'fill_in_blank' && (
            <div style={{ 
              padding: '1.25rem 1.5rem', background: 'rgba(28, 176, 246, 0.08)', 
              borderRadius: '18px', border: '1px solid rgba(28, 176, 246, 0.25)' 
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-main)' }}>
                    {currentQ.type === 'listening' && (currentQ.scaffold_level === 'advanced' || currentQ.scaffold_level === 'intermediate') && !showTextHint && !isAnswered
                      ? "🎧 Listen carefully to the audio prompt..." 
                      : (currentQ.target_word || currentQ.text)}
                  </span>
                </div>

                {/* Audio Normal + Slow + Scaffolding Text Hint Toggle */}
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <button 
                    className="btn btn-primary" 
                    onClick={() => handlePlayAudio(currentQ.target_word || currentQ.text, false)}
                    style={{ padding: '0.5rem 0.9rem', fontSize: '0.85rem', gap: '6px' }}
                    title="Play audio (normal speed)"
                  >
                    <Volume2 size={18} /> Audio 🔊
                  </button>
                  <button 
                    className="btn btn-secondary" 
                    onClick={() => handlePlayAudio(currentQ.target_word || currentQ.text, true)}
                    style={{ padding: '0.5rem 0.8rem', fontSize: '0.85rem' }}
                    title="Play audio (slow phonetics speed)"
                  >
                    🐢 Slow
                  </button>
                  {currentQ.type === 'listening' && (
                    <button
                      className="btn btn-secondary"
                      onClick={() => setShowTextHint(!showTextHint)}
                      style={{ padding: '0.5rem 0.8rem', fontSize: '0.82rem', gap: '4px' }}
                      title="Toggle text hint"
                    >
                      {showTextHint ? <EyeOff size={16} /> : <Eye size={16} />}
                      {showTextHint ? "Hide Text" : "Show Text"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Dynamic Exercise Renderers */}
        <div style={{ marginBottom: '2rem' }}>

          {/* 1. Multiple Choice / Listening Options */}
          {(currentQ.type === 'multiple_choice' || currentQ.type === 'listening') && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {currentQ.answers.map((ans, answerIndex) => {
                const isSelected = selectedAnswer === ans.id;
                const optionState = isAnswered
                  ? ans.is_correct ? 'is-correct' : isSelected ? 'is-incorrect' : ''
                  : isSelected ? 'is-selected' : '';

                return (
                  <button
                    key={ans.id}
                    onClick={() => !isAnswered && setSelectedAnswer(ans.id)}
                    className={`ai-answer-option ${optionState}`}
                    aria-pressed={isSelected}
                  >
                    <span className="ai-answer-content">
                      <span className="ai-answer-key">{String.fromCharCode(65 + answerIndex)}</span>
                      <span>{ans.text}</span>
                    </span>
                    {isAnswered && ans.is_correct && <CheckCircle2 size={22} color="var(--primary-color)" />}
                    {isAnswered && isSelected && !ans.is_correct && <XCircle size={22} color="#ff4b4b" />}
                  </button>
                );
              })}
            </div>
          )}

          {/* 2. Speaking Microphone & Levenshtein Evaluation */}
          {currentQ.type === 'speaking' && (
            <div style={{ margin: '1rem 0' }}>
              <PronunciationEvaluator
                targetText={currentQ.target_word || currentQ.text}
                languageCode={langCode}
                onComplete={(res) => {
                  if (res && res.overall_score !== undefined) {
                    const pass = res.overall_score >= 60;
                    setIsCorrect(pass);
                    setExplanation(`Score: ${res.overall_score.toFixed(0)}% (${res.accuracy_rating || 'Good'}). ${res.ai_feedback || ''}`);
                    setIsAnswered(true);
                    setTextInput(res.spoken_text || res.transcript || currentQ.target_word);
                    setUserSubmissions(prev => [
                      ...prev,
                      {
                        question_id: currentQ.id,
                        is_correct: pass,
                        user_answer: res.spoken_text || res.transcript || 'spoken'
                      }
                    ]);
                  }
                }}
              />
            </div>
          )}

          {/* 3. Fill in the Blank Typing Input */}
          {currentQ.type === 'fill_in_blank' && (
            <div>
              <input
                type="text"
                className="form-input"
                placeholder={t('typeSpellingPlaceholder')}
                value={textInput}
                onChange={(e) => !isAnswered && setTextInput(e.target.value)}
                disabled={isAnswered}
                style={{ fontSize: '1.3rem', padding: '1.15rem', textAlign: 'center', fontWeight: '700' }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isAnswered && textInput.trim()) {
                    handleCheckAnswer();
                  }
                }}
              />
            </div>
          )}

          {/* 4. Speed Matching / Match Madness Interactive Drill */}
          {currentQ.type === 'match_pairs' && (() => {
            const { rawPairs, leftWords, rightWords } = matchPairData;

            const handlePairClick = (side, word) => {
              if (isAnswered) return;
              if (side === 'left') {
                setSelectedLeft(word);
                if (selectedRight) {
                  // Check pair
                  const expected = rawPairs.find(p => p.startsWith(`${word}:`))?.split(':')[1];
                  if (expected === selectedRight) {
                    sounds.playCorrect();
                    setMatchedPairs(prev => ({ ...prev, [word]: selectedRight }));
                    setComboStreak(prev => prev + 1);
                    setGameScore(prev => prev + (100 * comboStreak));
                  } else {
                    sounds.playIncorrect();
                    setComboStreak(1);
                    setWrongMatchPair({ left: word, right: selectedRight });
                    setTimeout(() => setWrongMatchPair(null), 600);
                  }
                  setSelectedLeft(null);
                  setSelectedRight(null);
                }
              } else {
                setSelectedRight(word);
                if (selectedLeft) {
                  const expected = rawPairs.find(p => p.startsWith(`${selectedLeft}:`))?.split(':')[1];
                  if (expected === word) {
                    sounds.playCorrect();
                    setMatchedPairs(prev => ({ ...prev, [selectedLeft]: word }));
                    setComboStreak(prev => prev + 1);
                    setGameScore(prev => prev + (100 * comboStreak));
                  } else {
                    sounds.playIncorrect();
                    setComboStreak(1);
                    setWrongMatchPair({ left: selectedLeft, right: word });
                    setTimeout(() => setWrongMatchPair(null), 600);
                  }
                  setSelectedLeft(null);
                  setSelectedRight(null);
                }
              }
            };

            const allMatched = Object.keys(matchedPairs).length >= Math.min(leftWords.length, 3);

            return (
              <div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem', textAlign: 'center' }}>
                  {t('matchPairsInstruction')}
                </p>

                <div className="match-pairs-grid">
                  {/* Left Column */}
                  <div className="match-pairs-column">
                    <div className="match-pairs-column-title">
                      <span className="match-pairs-column-number">1</span>
                      {t('word')}
                    </div>
                    {leftWords.map(w => {
                      const isMatched = !!matchedPairs[w];
                      const isSel = selectedLeft === w;
                      const isWrong = wrongMatchPair?.left === w;

                      return (
                        <button
                          key={w}
                          onClick={() => !isMatched && handlePairClick('left', w)}
                          type="button"
                          className={`match-pair-option ${isMatched ? 'is-matched' : isSel ? 'is-selected' : ''}`}
                          style={{
                            borderColor: isWrong ? '#ff4b4b' : undefined,
                            background: isWrong ? 'rgba(255, 75, 75, 0.15)' : undefined
                          }}
                          aria-pressed={isSel}
                        >
                          <span>{w}</span>
                          {isMatched && <CheckCircle2 size={19} />}
                        </button>
                      );
                    })}
                  </div>

                  {/* Right Column */}
                  <div className="match-pairs-column">
                    <div className="match-pairs-column-title">
                      <span className="match-pairs-column-number">2</span>
                      {t('meaning')}
                    </div>
                    {rightWords.map(w => {
                      const isMatched = Object.values(matchedPairs).includes(w);
                      const isSel = selectedRight === w;
                      const isWrong = wrongMatchPair?.right === w;

                      return (
                        <button
                          key={w}
                          onClick={() => !isMatched && handlePairClick('right', w)}
                          type="button"
                          className={`match-pair-option ${isMatched ? 'is-matched' : isSel ? 'is-selected' : ''}`}
                          style={{
                            borderColor: isWrong ? '#ff4b4b' : undefined,
                            background: isWrong ? 'rgba(255, 75, 75, 0.15)' : undefined
                          }}
                          aria-pressed={isSel}
                        >
                          <span>{w}</span>
                          {isMatched && <CheckCircle2 size={19} />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {allMatched && !isAnswered && (
                  <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                    <button className="btn btn-primary" onClick={handleCheckAnswer} style={{ width: '100%', padding: '0.9rem' }}>
                      {t('verifyMatchedPairs')}
                    </button>
                  </div>
                )}
              </div>
            );
          })()}

        </div>

        {/* Action / Check / Continue Button */}
        {!isAnswered ? (
          currentQ.type !== 'match_pairs' && (
            <button
              className="btn btn-primary"
              style={{ width: '100%', padding: '1.1rem', fontSize: '1.1rem' }}
              disabled={!selectedAnswer && !textInput.trim()}
              onClick={handleCheckAnswer}
            >
              {t('checkAnswer')}
            </button>
          )
        ) : (
          <div>
            {/* Feedback Banner */}
            <div style={{
              padding: '1.25rem 1.5rem', borderRadius: '18px', marginBottom: '1.25rem',
              background: isCorrect ? 'rgba(88, 204, 2, 0.15)' : 'rgba(255, 75, 75, 0.15)',
              border: `1px solid ${isCorrect ? 'rgba(88, 204, 2, 0.35)' : 'rgba(255, 75, 75, 0.35)'}`,
              color: isCorrect ? '#2e7d32' : '#c62828',
              display: 'flex', alignItems: 'flex-start', gap: '12px'
            }}>
              {isCorrect ? <CheckCircle2 size={26} /> : <XCircle size={26} />}
              <div>
                <strong style={{ fontSize: '1.15rem', display: 'block', marginBottom: '4px' }}>
                  {isCorrect ? t('correct') : t('incorrect')}
                </strong>
                <span style={{ fontSize: '0.95rem' }}>{explanation}</span>
              </div>
            </div>

            <button
              className="btn btn-primary"
              style={{ width: '100%', padding: '1.1rem', fontSize: '1.1rem' }}
              disabled={submitting}
              onClick={handleNext}
            >
              {submitting ? t('submittingWorkout') : (currentIndex + 1 < totalQ ? t('nextExercise') : t('completeWorkout'))}
            </button>
          </div>
        )}

      </div>

    </div>
  );
};

export default AdaptiveLessonRunner;
