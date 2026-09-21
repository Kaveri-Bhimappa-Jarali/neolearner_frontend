import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../utils/i18n';
import { 
  Volume2, Mic, CheckCircle2, XCircle, ArrowRight, 
  Sparkles, Award, Zap, Trophy, Heart, Compass, 
  CheckCircle, ArrowUpRight, BookOpen, AlertCircle, HelpCircle, Star
} from 'lucide-react';
import { speakText, listenForSpeech } from '../../utils/audio';
import { sounds } from '../../utils/sounds';
import WhySeeingThisModal from '../Shared/WhySeeingThisModal';

const PlacementTestRunner = () => {
  const { user, setUser } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [hasStarted, setHasStarted] = useState(false);
  const [session, setSession] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [textInput, setTextInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [explanation, setExplanation] = useState('');
  const [submissions, setSubmissions] = useState([]);

  // Match pairs state
  const [matchedPairs, setMatchedPairs] = useState({});
  const [selectedLeft, setSelectedLeft] = useState(null);
  const [selectedRight, setSelectedRight] = useState(null);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [selectedModalRec, setSelectedModalRec] = useState(null);

  // Start placement test / initial exam
  const handleStartTest = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/diagnostic/session');
      setSession(res.data);
      setHasStarted(true);
      setCurrentIndex(0);
      setSubmissions([]);
    } catch (err) {
      console.error('Failed to start Initial Exam:', err);
      setError('Could not generate Initial Exam session. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const currentQ = session?.questions?.[currentIndex];
  const totalQ = session?.questions?.length || 15;
  const progressPct = ((currentIndex + 1) / totalQ) * 100;
  const langCode = session?.target_language_code || 'en';

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


  const handlePlayAudio = (text, slow = false) => {
    speakText(text, langCode, slow);
  };

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

  const handleCheckAnswer = () => {
    if (isAnswered) return;

    let correct = false;
    let expText = '';

    if (currentQ.type === 'speaking') {
      const targetAns = currentQ.answers[0]?.text || currentQ.text;
      const cleanUser = textInput.trim().toLowerCase();
      const cleanTarget = targetAns.trim().toLowerCase();
      correct = cleanUser.includes(cleanTarget) || cleanTarget.includes(cleanUser) || cleanUser.length > 0;
      expText = correct ? `Great pronunciation! Matched "${targetAns}".` : `Expected: "${targetAns}".`;
    } else if (currentQ.type === 'fill_in_blank') {
      const correctAns = currentQ.answers.find(a => a.is_correct);
      const cleanUser = textInput.trim().toLowerCase();
      const cleanExpected = (correctAns?.text || '').trim().toLowerCase();
      const cleanTarget = (currentQ.target_word || '').trim().toLowerCase();
      const cleanTrans = (currentQ.interface_translation || '').trim().toLowerCase();
      correct = cleanUser === cleanExpected || 
                (cleanTarget && cleanUser === cleanTarget) || 
                (cleanTrans && cleanUser === cleanTrans);
      expText = correctAns?.explanation || (correct ? 'Correct spelling!' : `Expected: ${correctAns?.text}`);
    } else if (currentQ.type === 'match_pairs') {
      correct = true;
      expText = 'All vocabulary pairs matched successfully!';
    } else {
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

    setSubmissions(prev => [
      ...prev,
      {
        question_id: currentQ.id,
        is_correct: correct,
        difficulty_level: currentQ.difficulty_level,
        user_answer: textInput || selectedAnswer || 'matched'
      }
    ]);
  };

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
    } else {
      // Submit Initial Exam
      setSubmitting(true);
      try {
        const payload = {
          session_id: session.session_id,
          submissions: submissions
        };
        const res = await api.post('/diagnostic/submit', payload);
        setResult(res.data);
        sounds.playVictory();

        if (setUser) {
          setUser(prev => prev ? {
            ...prev,
            has_completed_placement_test: true,
            placement_score: res.data.placement_score,
            proficiency_level: res.data.calibrated_level,
            benchmark_level: res.data.benchmark_level
          } : null);
        }
      } catch (err) {
        console.error('Failed to submit Initial Exam:', err);
        setError('Failed to evaluate Initial Exam.');
      } finally {
        setSubmitting(false);
      }
    }
  };

  // ----------------------------------------------------
  // 1. WELCOME / INTRO SCREEN
  // ----------------------------------------------------
  if (!hasStarted) {
    return (
      <div className="page-container" style={{ maxWidth: '680px', margin: '3rem auto', padding: '0 1rem' }}>
        <div className="card" style={{ padding: '3rem 2.5rem', textAlign: 'center', borderRadius: '24px', boxShadow: '0 12px 36px rgba(0,0,0,0.08)' }}>
          
          <div style={{
            width: '90px', height: '90px', borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(88, 204, 2, 0.2), rgba(28, 176, 246, 0.2))',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem'
          }}>
            <Compass size={48} color="var(--primary-color)" />
          </div>

          <span className="badge badge-blue" style={{ marginBottom: '1rem', display: 'inline-block' }}>
            {t('initialExamBanner')}
          </span>

          <h1 style={{ fontSize: '2.4rem', fontWeight: '800', color: 'var(--text-main)', margin: '0 0 1rem', lineHeight: '1.2' }}>
            {t('initialExamWelcomeTitle')}
          </h1>

          <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '2rem' }}>
            {t('initialExamWelcomeSubtitle')}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2.5rem', textAlign: 'left' }}>
            <div style={{ padding: '1.25rem', background: 'var(--background)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
              <strong style={{ display: 'block', color: 'var(--primary-color)', fontSize: '1rem', marginBottom: '4px' }}>🎯 15 Target Questions</strong>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Progresses from phonics & vocabulary to listening, spelling, and speaking.</span>
            </div>
            <div style={{ padding: '1.25rem', background: 'var(--background)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
              <strong style={{ display: 'block', color: 'var(--secondary-color)', fontSize: '1rem', marginBottom: '4px' }}>🔓 Score-Based Paths</strong>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Score &gt; 50% to test into Intermediate; score &gt;= 80% to enter Advanced Fluency.</span>
            </div>
          </div>

          {error && (
            <div style={{ padding: '0.85rem', background: 'rgba(255, 75, 75, 0.12)', color: '#c62828', borderRadius: '12px', marginBottom: '1.5rem' }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <button 
              className="btn btn-primary" 
              onClick={handleStartTest}
              disabled={loading}
              style={{ padding: '1.1rem', fontSize: '1.15rem', fontWeight: '700' }}
            >
              {loading ? 'Initializing...' : t('startInitialExamBtn')}
            </button>
            <button 
              className="btn btn-secondary" 
              onClick={() => navigate('/learning-path')}
              style={{ padding: '0.9rem' }}
            >
              {t('startFromFoundations')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // 2. CELEBRATION / RESULTS SCREEN
  // ----------------------------------------------------
  if (result) {
    const cefr = result.cefr_level || 'A1';
    const breakdown = result.skill_breakdown || {
      reading: result.placement_score,
      vocabulary: result.placement_score,
      grammar: result.placement_score,
      listening: result.placement_score,
      writing: result.placement_score,
      speaking: result.placement_score
    };
    const strengths = result.strengths || [];
    const weakAreas = result.weak_areas || [];

    const skillIcons = {
      reading: '📖',
      vocabulary: '💬',
      grammar: '📝',
      listening: '🎧',
      writing: '✍️',
      speaking: '🎤'
    };

    return (
      <div className="page-container" style={{ maxWidth: '740px', margin: '2rem auto', padding: '0 1rem' }}>
        <div className="card" style={{ padding: '3rem 2.5rem', textAlign: 'center', borderRadius: '24px', boxShadow: '0 16px 40px rgba(0,0,0,0.08)' }}>
          
          <div style={{
            width: '95px', height: '95px', borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(59, 130, 246, 0.2))',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem'
          }}>
            <Trophy size={50} color="var(--primary-color)" />
          </div>

          <div style={{ 
            display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '0.4rem 1.25rem', 
            borderRadius: '9999px', background: 'rgba(16, 185, 129, 0.12)', color: '#10b981', 
            fontSize: '0.85rem', fontWeight: '800', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '1px' 
          }}>
            <Sparkles size={16} /> {t('Placement Evaluation Complete')}
          </div>

          <h1 style={{ fontSize: '2.4rem', fontWeight: '900', color: 'var(--text-main)', margin: '0 0 0.5rem', letterSpacing: '-0.5px' }}>
            Your Level: <span style={{ color: 'var(--primary-color)' }}>{cefr}</span>
          </h1>

          <div style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            {t(result.benchmark_level)} • {result.placement_score}% Overall Mastery
          </div>

          {/* CEFR Level Banner */}
          <div style={{
            padding: '1.5rem', marginBottom: '2rem', textAlign: 'left',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(59, 130, 246, 0.08))',
            border: '2px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.8rem', background: 'var(--primary-color)', color: '#ffffff', padding: '4px 14px', borderRadius: '12px', fontWeight: '900' }}>
                  {cefr}
                </span>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-main)', lineHeight: '1.3' }}>
                    {t(result.recommended_path_title) || `${t(result.benchmark_level)} Track`}
                  </h3>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Calibrated level: {cefr} ({t(result.benchmark_level)})
                  </span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '1.4rem', fontWeight: '900', color: 'var(--primary-color)' }}>
                  +{result.xp_earned} XP
                </span>
                <div style={{ fontSize: '0.8rem', color: '#ff9600', fontWeight: '700' }}>
                  +{result.gems_earned} Gems 💎
                </div>
              </div>
            </div>
            <p style={{ margin: '8px 0 0 0', color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: '1.5' }}>
              {t(result.recommended_path_description) || result.message}
            </p>
          </div>

          {/* 6-Skill Breakdown Grid */}
          <div style={{ marginBottom: '2rem', textAlign: 'left' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Award size={20} color="var(--primary-color)" /> {t('Multi-Skill Competency Analysis')}
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
              {Object.entries(breakdown).map(([skill, val]) => (
                <div key={skill} style={{ padding: '1rem', background: 'var(--background)', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: '700', textTransform: 'capitalize', color: 'var(--text-main)' }}>
                      {skillIcons[skill] || '⚡'} {t(skill)}
                    </span>
                    <strong style={{ fontSize: '0.95rem', color: val >= 60 ? 'var(--primary-color)' : '#f59e0b' }}>
                      {val}%
                    </strong>
                  </div>
                  <div style={{ width: '100%', height: '7px', background: 'var(--border-color)', borderRadius: '9999px', overflow: 'hidden' }}>
                    <div 
                      style={{ 
                        width: `${Math.min(100, Math.max(5, val))}%`, 
                        height: '100%', 
                        background: val >= 75 ? 'var(--primary-color)' : (val >= 50 ? '#3b82f6' : '#f59e0b'),
                        borderRadius: '9999px' 
                      }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Strengths & Weak Areas */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '2rem', textAlign: 'left' }}>
            <div style={{ padding: '1.25rem', background: 'rgba(16, 185, 129, 0.08)', borderRadius: '16px', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
              <strong style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontSize: '0.95rem', marginBottom: '8px' }}>
                <CheckCircle size={18} /> {t('keyStrengths')}
              </strong>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {strengths.map(s => (
                  <span key={s} style={{ background: 'rgba(16, 185, 129, 0.18)', color: '#065f46', padding: '4px 10px', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: '700' }}>
                    ✓ {t(s)}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ padding: '1.25rem', background: 'rgba(245, 158, 11, 0.08)', borderRadius: '16px', border: '1px solid rgba(245, 158, 11, 0.25)' }}>
              <strong style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f59e0b', fontSize: '0.95rem', marginBottom: '8px' }}>
                <AlertCircle size={18} /> {t('needsFocus')}
              </strong>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {weakAreas.map(w => (
                  <span key={w} style={{ background: 'rgba(245, 158, 11, 0.18)', color: '#92400e', padding: '4px 10px', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: '700' }}>
                    ⚠ {t(w)}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Adaptive Course Recommendations Section */}
          {result.course_recommendations && result.course_recommendations.primary_recommendation && (
            <div style={{ marginBottom: '2rem', textAlign: 'left' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Compass size={22} color="var(--primary-color)" /> {t('Personalized Course Recommendations')}
              </h3>

              {/* Primary Match Card */}
              {(() => {
                const prim = result.course_recommendations.primary_recommendation;
                return (
                  <div style={{
                    padding: '1.5rem', marginBottom: '1rem', borderRadius: '20px',
                    background: 'linear-gradient(135deg, rgba(28, 176, 246, 0.1), rgba(16, 185, 129, 0.1))',
                    border: '2px solid rgba(28, 176, 246, 0.35)', position: 'relative'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                      <span className="badge badge-gold" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem', fontWeight: '800' }}>
                        <Star size={14} fill="currentColor" /> {t('bestMatch')} ({prim.match_score}% Match)
                      </span>
                      <button
                        onClick={() => setSelectedModalRec(prim)}
                        style={{
                          background: '#ffffff', border: '1px solid rgba(0,0,0,0.15)',
                          borderRadius: '9999px', padding: '0.3rem 0.8rem', fontSize: '0.8rem',
                          fontWeight: '700', color: 'var(--primary-color)', display: 'inline-flex',
                          alignItems: 'center', gap: '4px', cursor: 'pointer'
                        }}
                      >
                        <HelpCircle size={14} /> {t('whyAmISeeingThis')}
                      </button>
                    </div>

                    <h4 style={{ margin: '0 0 4px 0', fontSize: '1.3rem', fontWeight: '900', color: 'var(--text-main)', lineHeight: '1.3' }}>
                      {t(prim.title)}
                    </h4>
                    <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', margin: '0 0 1rem 0', lineHeight: '1.5' }}>
                      {t(prim.description) || 'Personalized curriculum matched to your diagnostic level.'}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                      <div style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--primary-color)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <Compass size={16} />
                        <span>📍 {t('startingPointUnit', { index: prim.starting_topic_index })} {prim.skipped_topics_count > 0 ? `(${prim.skipped_topics_count} skipped)` : ''}</span>
                      </div>
                      <Link
                        to={`/courses/${prim.course_id}`}
                        className="btn btn-primary"
                        style={{ padding: '0.75rem 1.4rem', fontSize: '0.95rem', fontWeight: '800', borderRadius: '12px' }}
                      >
                        {t('startRecommendedCourseBtn')}
                      </Link>
                    </div>
                  </div>
                );
              })()}

              {/* Boosters */}
              {result.course_recommendations.skill_boosters && result.course_recommendations.skill_boosters.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.85rem' }}>
                  {result.course_recommendations.skill_boosters.slice(0, 2).map(b => (
                    <div key={b.course_id} style={{
                      padding: '1rem 1.15rem', borderRadius: '16px',
                      background: 'var(--background)', border: '1px solid var(--border-color)',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                    }}>
                      <div>
                        <span className="badge badge-purple" style={{ fontSize: '0.7rem', fontWeight: '800', marginBottom: '2px', display: 'inline-block' }}>
                          🎯 {t('skillBooster')} ({b.match_score}%)
                        </span>
                        <h5 style={{ margin: 0, fontSize: '0.98rem', fontWeight: '800', color: 'var(--text-main)', lineHeight: '1.3' }}>
                          {t(b.title)}
                        </h5>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          📍 Unit {b.starting_topic_index}
                        </span>
                      </div>
                      <Link
                        to={`/courses/${b.course_id}`}
                        className="btn btn-secondary"
                        style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem', fontWeight: '700', borderRadius: '10px' }}
                      >
                        {t('viewActionBtn')}
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <Link to="/learning-path" className="btn btn-primary" style={{ padding: '1.1rem', fontSize: '1.1rem', fontWeight: '800' }}>
              {t('ENTER VISUAL LEARNING PATH →')}
            </Link>
            <Link to="/dashboard" className="btn btn-secondary" style={{ padding: '0.9rem', fontWeight: '600' }}>
              {t('viewDashboard')}
            </Link>
          </div>

        </div>

        {/* Modal Launcher */}
        <WhySeeingThisModal
          isOpen={!!selectedModalRec}
          onClose={() => setSelectedModalRec(null)}
          recommendation={selectedModalRec}
        />
      </div>
    );
  }

  // ----------------------------------------------------
  // 3. RUNNING QUESTION SCREEN
  // ----------------------------------------------------
  return (
    <div className="page-container" style={{ maxWidth: '760px', margin: '2rem auto', padding: '0 1rem' }}>
      
      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem' }}>
        <button 
          onClick={() => navigate('/dashboard')}
          style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: 'var(--text-muted)' }}
          title="Exit"
        >
          ✕
        </button>

        <div style={{ flex: 1, height: '14px', background: 'var(--border-color)', borderRadius: '9999px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${progressPct}%`, background: 'var(--primary-color)', transition: 'width 0.4s ease' }} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary-color)', fontWeight: 'bold', fontSize: '0.95rem' }}>
          <Sparkles size={16} />
          <span>{currentIndex + 1} / {totalQ}</span>
        </div>
      </div>

      {/* Main Question Card */}
      <div className="card" style={{ padding: '2.5rem', borderRadius: '24px', boxShadow: '0 8px 24px rgba(0,0,0,0.06)' }}>
        
        {/* Badges: Difficulty level & Competency */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge badge-green" style={{ textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.75rem' }}>
              Level {currentQ.difficulty_level} • {currentQ.competency_tag}
            </span>
            <span className="badge badge-blue" style={{ fontSize: '0.75rem' }}>
              {t('targetLanguage')}: {session?.target_language_name || langCode}
            </span>
          </div>
          {session?.preferred_language_name && (
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {t('interfaceLanguage')}: <strong style={{ color: 'var(--text-main)' }}>{session.preferred_language_name}</strong>
            </span>
          )}
        </div>

        {/* Prompt Header */}
        <div style={{ marginBottom: '1.75rem' }}>
          <h2 style={{ fontSize: '1.45rem', fontWeight: '800', color: 'var(--text-main)', margin: '0 0 0.75rem', lineHeight: '1.4' }}>
            {currentQ.text}
          </h2>

          {/* Bilingual Context Hint - only shown for speaking tasks or after answer verification */}
          {(currentQ.type === 'speaking' || isAnswered) && currentQ.prompt_translation && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '0.35rem 0.85rem', background: 'rgba(28, 176, 246, 0.08)',
              borderRadius: '8px', color: 'var(--secondary-color)', fontSize: '0.85rem',
              marginBottom: '1rem', fontWeight: '600'
            }}>
              <span>{t('meaningInInterface', { lang: session?.preferred_language_name || 'Interface' })}</span>
              <strong>"{currentQ.prompt_translation}"</strong>
            </div>
          )}

          {/* Interactive Word Banner with Dual-Speed Audio */}
          {currentQ.prompt_audio_text && currentQ.type !== 'match_pairs' && (
            <div style={{ 
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '1.25rem 1.5rem', background: 'rgba(28, 176, 246, 0.08)', 
              borderRadius: '18px', border: '1px solid rgba(28, 176, 246, 0.25)',
              marginBottom: '1.5rem'
            }}>
              <span style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-main)' }}>
                {currentQ.type === 'listening' && !isAnswered ? t('spokenAudioNotice') : currentQ.prompt_audio_text}
              </span>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  className="btn btn-secondary" 
                  onClick={() => handlePlayAudio(currentQ.prompt_audio_text, false)}
                  style={{ width: '44px', height: '44px', borderRadius: '50%', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  title="Normal audio speed (0.88x)"
                >
                  <Volume2 size={22} color="var(--secondary-color)" />
                </button>
                <button 
                  className="btn btn-secondary" 
                  onClick={() => handlePlayAudio(currentQ.prompt_audio_text, true)}
                  style={{ width: '44px', height: '44px', borderRadius: '50%', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}
                  title="Slow phonetics speed (0.62x)"
                >
                  🐢
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Dynamic Exercise Rendering */}
        <div style={{ marginBottom: '2rem' }}>

          {/* 1. Multiple Choice / Listening */}
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

          {/* 2. Speaking Microphone Input */}
          {currentQ.type === 'speaking' && (
            <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
              <button
                onClick={handleVoiceInput}
                disabled={isAnswered || isListening}
                style={{
                  width: '88px', height: '88px', borderRadius: '50%',
                  background: isListening ? '#ff4b4b' : 'var(--secondary-color)',
                  border: 'none', color: '#fff', cursor: isAnswered ? 'default' : 'pointer',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: isListening ? '0 0 0 12px rgba(255, 75, 75, 0.25)' : '0 8px 18px rgba(28, 176, 246, 0.3)',
                  transition: 'all 0.2s ease',
                  animation: isListening ? 'pulse 1.2s infinite' : 'none'
                }}
              >
                <Mic size={42} />
              </button>

              <p style={{ marginTop: '1.25rem', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                {isListening ? t('listeningPrompt') : t('clickMicAndSpeak')}
              </p>

              {textInput && (
                <div style={{ 
                  marginTop: '1rem', padding: '1rem', 
                  background: 'var(--background)', borderRadius: '14px', 
                  border: '1px solid var(--border-color)',
                  display: 'inline-block', maxWidth: '90%'
                }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>{t('recordedVoice')}</span>
                  <strong style={{ fontSize: '1.2rem', color: 'var(--primary-color)' }}>"{textInput}"</strong>
                </div>
              )}
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

          {/* 4. Match Pairs Interactive Drill */}
          {currentQ.type === 'match_pairs' && (() => {
            const { rawPairs, leftWords, rightWords } = matchPairData;

            const handlePairClick = (side, word) => {
              if (isAnswered) return;
              if (side === 'left') {
                setSelectedLeft(word);
                if (selectedRight) {
                  const expected = rawPairs.find(p => p.startsWith(`${word}:`))?.split(':')[1];
                  if (expected === selectedRight) {
                    setMatchedPairs(prev => ({ ...prev, [word]: selectedRight }));
                  }
                  setSelectedLeft(null);
                  setSelectedRight(null);
                }
              } else {
                setSelectedRight(word);
                if (selectedLeft) {
                  const expected = rawPairs.find(p => p.startsWith(`${selectedLeft}:`))?.split(':')[1];
                  if (expected === word) {
                    setMatchedPairs(prev => ({ ...prev, [selectedLeft]: word }));
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
                  <div className="match-pairs-column">
                    <div className="match-pairs-column-title">
                      <span className="match-pairs-column-number">1</span>
                      {t('word')}
                    </div>
                    {leftWords.map(w => {
                      const isMatched = !!matchedPairs[w];
                      const isSel = selectedLeft === w;
                      return (
                        <button
                          key={w}
                          onClick={() => !isMatched && handlePairClick('left', w)}
                          type="button"
                          className={`match-pair-option ${isMatched ? 'is-matched' : isSel ? 'is-selected' : ''}`}
                          aria-pressed={isSel}
                        >
                          <span>{w}</span>
                          {isMatched && <CheckCircle2 size={19} />}
                        </button>
                      );
                    })}
                  </div>

                  <div className="match-pairs-column">
                    <div className="match-pairs-column-title">
                      <span className="match-pairs-column-number">2</span>
                      {t('meaning')}
                    </div>
                    {rightWords.map(w => {
                      const isMatched = Object.values(matchedPairs).includes(w);
                      const isSel = selectedRight === w;
                      return (
                        <button
                          key={w}
                          onClick={() => !isMatched && handlePairClick('right', w)}
                          type="button"
                          className={`match-pair-option ${isMatched ? 'is-matched' : isSel ? 'is-selected' : ''}`}
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

        {/* Action Footer */}
        {isAnswered ? (
          <div style={{
            padding: '1.5rem', borderRadius: '18px',
            background: isCorrect ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
            border: `2px solid ${isCorrect ? 'var(--primary-color)' : 'var(--error)'}`,
            display: 'flex', flexDirection: 'column', gap: '0.75rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800', fontSize: '1.1rem', color: isCorrect ? 'var(--primary-color)' : 'var(--error)' }}>
              {isCorrect ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
              <span>{isCorrect ? t('correct') : t('incorrect')}</span>
            </div>
            {explanation && (
              <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--text-main)', lineHeight: '1.5' }}>
                {explanation}
              </p>
            )}
            <button 
              className="btn btn-primary" 
              onClick={handleNext}
              style={{ marginTop: '0.5rem', padding: '0.9rem', width: '100%', fontWeight: '800' }}
            >
              {currentIndex + 1 < totalQ ? t('nextExercise') : t('finishExam')}
            </button>
          </div>
        ) : (
          currentQ.type !== 'match_pairs' && (
            <button
              className="btn btn-primary"
              onClick={handleCheckAnswer}
              disabled={!selectedAnswer && !textInput.trim()}
              style={{ width: '100%', padding: '0.95rem', fontSize: '1.05rem', fontWeight: '800' }}
            >
              {t('checkAnswer')}
            </button>
          )
        )}

      </div>

    </div>
  );
};

export default PlacementTestRunner;
