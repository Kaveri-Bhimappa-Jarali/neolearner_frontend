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
import Badge from '../ui/Badge';

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
      const detailMsg = err.response?.data?.detail || (err.message === 'Network Error' ? 'Cannot connect to backend server. Please try again.' : 'Could not generate Initial Assessment. Please try again.');
      setError(detailMsg);
    } finally {
      setLoading(false);
    }
  };

  const currentQ = session?.questions?.[currentIndex];
  const totalQ = session?.questions?.length || 15;
  const progressPct = ((currentIndex + 1) / totalQ) * 100;
  const langCode = session?.target_language_code || 'en';

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

  const handleLeftClick = (leftWord) => {
    if (isAnswered || matchedPairs[leftWord]) return;
    if (selectedLeft === leftWord) {
      setSelectedLeft(null);
      return;
    }
    setSelectedLeft(leftWord);
    if (selectedRight) {
      checkMatchPair(leftWord, selectedRight);
    }
  };

  const handleRightClick = (rightWord) => {
    if (isAnswered || Object.values(matchedPairs).includes(rightWord)) return;
    if (selectedRight === rightWord) {
      setSelectedRight(null);
      return;
    }
    setSelectedRight(rightWord);
    if (selectedLeft) {
      checkMatchPair(selectedLeft, rightWord);
    }
  };

  const checkMatchPair = (left, right) => {
    const isPairCorrect = matchPairData.rawPairs.some(p => p === `${left}:${right}`);
    if (isPairCorrect) {
      try { if (sounds.playChime) sounds.playChime(); else if (sounds.playCorrect) sounds.playCorrect(); } catch (e) {}
      setMatchedPairs(prev => ({ ...prev, [left]: right }));
    } else {
      try { if (sounds.playIncorrect) sounds.playIncorrect(); } catch (e) {}
    }
    setSelectedLeft(null);
    setSelectedRight(null);
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
      const totalPairsCount = matchPairData.leftWords.length;
      const matchedCount = Object.keys(matchedPairs).length;
      correct = totalPairsCount > 0 ? matchedCount === totalPairsCount : true;
      expText = correct ? 'All vocabulary pairs matched successfully!' : `Matched ${matchedCount} of ${totalPairsCount} pairs.`;
    } else {
      const chosenAns = currentQ.answers?.find(a => a.id === selectedAnswer);
      correct = !!chosenAns?.is_correct;
      const correctAns = currentQ.answers?.find(a => a.is_correct);
      expText = chosenAns?.explanation || correctAns?.explanation || (correct ? 'Correct!' : `Correct answer: ${correctAns?.text || ''}`);
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
      ...prev.filter(s => s.question_id !== currentQ.id),
      {
        question_id: currentQ.id,
        is_correct: correct,
        difficulty_level: currentQ.difficulty_level || 1,
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
      setSubmitting(true);
      setError('');
      try {
        let finalSubmissions = [...submissions];
        const currentSub = {
          question_id: currentQ.id,
          is_correct: isCorrect,
          difficulty_level: currentQ.difficulty_level || 1,
          user_answer: textInput || selectedAnswer || 'matched'
        };
        if (!finalSubmissions.some(s => s.question_id === currentQ.id)) {
          finalSubmissions.push(currentSub);
        }

        const payload = {
          session_id: session.session_id,
          submissions: finalSubmissions
        };
        const res = await api.post('/diagnostic/submit', payload);
        setResult(res.data);
        sounds.playVictory();

        try {
          const userRes = await api.get('/learners/me');
          if (setUser && userRes.data) {
            setUser(userRes.data);
          }
        } catch (e) {}
      } catch (err) {
        console.error('Failed to submit Initial Exam:', err);
        setError(err.response?.data?.detail || 'Failed to submit test. Please try again.');
      } finally {
        setSubmitting(false);
      }
    }
  };

  // Render Result Screen
  if (result) {
    return (
      <div className="page-container" style={{ maxWidth: '800px', margin: '2rem auto', animation: 'fadeIn 0.3s ease' }}>
        <div 
          className="card" 
          style={{
            padding: '3rem 2rem',
            textAlign: 'center',
            background: 'var(--surface-card)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-lg)'
          }}
        >
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🎉</div>
          <Badge variant="gold" icon={Trophy} size="large">Diagnostic Assessment Complete!</Badge>

          <h1 style={{ fontSize: '2.4rem', fontWeight: '900', color: 'var(--text-main)', margin: '1rem 0 0.5rem' }}>
            Calculated CEFR: {result.cefr_level || 'A1'}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', marginBottom: '2rem' }}>
            Diagnostic Score: <strong style={{ color: 'var(--primary-color)' }}>{result.overall_score}% Accuracy</strong> ({result.total_correct} of {result.total_questions} correct)
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem', textAlign: 'left' }}>
            <div style={{ background: 'var(--surface)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--success)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>
                ✨ Strengths Identified
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {(result.strengths || ['Basic Vocabulary']).map((s, idx) => (
                  <Badge key={idx} variant="green">{s}</Badge>
                ))}
              </div>
            </div>

            <div style={{ background: 'var(--surface)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>
                🎯 Recommended Focus Areas
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {(result.weak_areas || ['Pronunciation']).map((w, idx) => (
                  <Badge key={idx} variant="gold">{w}</Badge>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate('/dashboard')}
            className="btn btn-primary"
            style={{ padding: '0.95rem 2.5rem', fontWeight: '800', fontSize: '1.1rem', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-teal)' }}
          >
            Enter Learner Dashboard 🚀
          </button>
        </div>
      </div>
    );
  }

  // Pre-test Intro Screen
  if (!hasStarted) {
    return (
      <div className="page-container" style={{ maxWidth: '800px', margin: '2rem auto' }}>
        <div 
          className="card" 
          style={{
            padding: '3rem 2.25rem',
            textAlign: 'center',
            background: 'var(--surface-card)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-lg)'
          }}
        >
          <div style={{ padding: '1.25rem', background: 'rgba(20, 184, 166, 0.12)', color: 'var(--primary-color)', borderRadius: '50%', width: 'fit-content', margin: '0 auto 1.5rem' }}>
            <Compass size={48} />
          </div>

          <h1 style={{ fontSize: '2.2rem', fontWeight: '900', color: 'var(--text-main)', marginBottom: '0.75rem' }}>
            Diagnostic Literacy Placement
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: '1.6', maxWidth: '640px', margin: '0 auto 2rem' }}>
            This 15-question diagnostic evaluates vocabulary, grammar, reading comprehension, listening, and speaking in your target language to calibrate your CEFR level.
          </p>

          {error && (
            <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--error-bg)', color: 'var(--error)', borderRadius: 'var(--radius-md)', fontSize: '0.95rem' }}>
              ⚠️ {error}
            </div>
          )}

          <button
            onClick={handleStartTest}
            disabled={loading}
            className="btn btn-primary"
            style={{ padding: '1rem 2.5rem', fontWeight: '800', fontSize: '1.1rem', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-teal)' }}
          >
            {loading ? 'Generating Diagnostic Assessment...' : 'Start Diagnostic Assessment 🚀'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ maxWidth: '880px', margin: '1rem auto' }}>
      
      {/* Top Progress Tracker Bar */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
          <Badge variant="cyan">Question {currentIndex + 1} of {totalQ}</Badge>
          <span style={{ fontSize: '0.88rem', fontWeight: '800', color: 'var(--text-muted)' }}>
            {currentQ?.competency_tag || 'Multi-Skill Evaluation'}
          </span>
        </div>
        <div style={{ width: '100%', height: '10px', background: 'var(--surface-hover)', borderRadius: '9999px', overflow: 'hidden' }}>
          <div style={{ width: `${progressPct}%`, height: '100%', background: 'linear-gradient(90deg, var(--primary-color), var(--secondary-color))', borderRadius: '9999px', transition: 'width 0.3s ease' }} />
        </div>
      </div>

      {/* Question Card */}
      <div 
        className="card" 
        style={{ 
          padding: '2.25rem', 
          background: 'var(--surface-card)', 
          borderRadius: 'var(--radius-xl)', 
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-md)',
          marginBottom: '1.5rem'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--primary-color)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {currentQ?.type?.replace('_', ' ')} • Difficulty Level {currentQ?.difficulty_level || 1}
          </span>
          {currentQ?.target_word && (
            <button 
              onClick={() => handlePlayAudio(currentQ.target_word)} 
              className="btn btn-secondary"
              style={{ padding: '0.4rem 0.85rem', fontSize: '0.82rem', gap: '4px' }}
            >
              <Volume2 size={16} color="var(--primary-color)" /> Audio
            </button>
          )}
        </div>

        <h2 style={{ fontSize: '1.65rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '1.5rem', lineHeight: '1.35' }}>
          {currentQ?.text}
        </h2>

        {/* Question Options for multiple_choice, listening, translation, mcq, or any question with options */}
        {(currentQ?.type === 'multiple_choice' || currentQ?.type === 'listening' || currentQ?.type === 'translation' || currentQ?.type === 'mcq' || (currentQ?.answers?.length > 1 && currentQ?.type !== 'match_pairs')) && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {currentQ.answers?.map(ans => {
              const isSelected = selectedAnswer === ans.id;
              let bg = 'var(--surface)';
              let border = 'var(--border-color)';
              if (isSelected) {
                bg = 'rgba(20, 184, 166, 0.12)';
                border = 'var(--primary-color)';
              }
              if (isAnswered) {
                if (ans.is_correct) {
                  bg = 'rgba(16, 185, 129, 0.18)';
                  border = 'var(--success)';
                } else if (isSelected && !isCorrect) {
                  bg = 'var(--error-bg)';
                  border = 'var(--error)';
                }
              }
              return (
                <div
                  key={ans.id}
                  onClick={() => !isAnswered && setSelectedAnswer(ans.id)}
                  style={{
                    padding: '1.15rem 1.35rem',
                    borderRadius: 'var(--radius-lg)',
                    border: `2px solid ${border}`,
                    background: bg,
                    cursor: isAnswered ? 'default' : 'pointer',
                    fontWeight: '700',
                    fontSize: '1.02rem',
                    color: 'var(--text-main)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <span>{ans.text}</span>
                  {isAnswered && ans.is_correct && <CheckCircle2 color="var(--success)" size={22} />}
                  {isAnswered && isSelected && !isCorrect && <XCircle color="var(--error)" size={22} />}
                </div>
              );
            })}
          </div>
        )}

        {/* Fill in Blank / Speaking Text Inputs */}
        {(currentQ?.type === 'fill_in_blank' || currentQ?.type === 'speaking') && (
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
              <input
                type="text"
                className="form-input"
                placeholder={currentQ.type === 'speaking' ? "Click Mic to Speak or type answer..." : "Type your answer here..."}
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                disabled={isAnswered}
                style={{ flex: 1, padding: '0.9rem 1.15rem', borderRadius: 'var(--radius-md)', fontSize: '1.05rem', background: 'var(--surface)', color: 'var(--text-main)', border: '1px solid var(--border-color)' }}
              />
              {currentQ.type === 'speaking' && (
                <button
                  onClick={handleVoiceInput}
                  className={`btn ${isListening ? 'btn-danger' : 'btn-secondary'}`}
                  style={{ padding: '0.9rem 1.25rem', borderRadius: 'var(--radius-md)', fontWeight: '800' }}
                >
                  <Mic size={20} color={isListening ? '#ffffff' : 'var(--primary-color)'} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Match Pairs UI */}
        {currentQ?.type === 'match_pairs' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', margin: '1rem 0' }}>
            {/* Left Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Target Language Word
              </div>
              {matchPairData.leftWords.map((lw, idx) => {
                const isMatched = matchedPairs[lw];
                const isSelected = selectedLeft === lw;
                let bg = 'var(--surface)';
                let border = 'var(--border-color)';
                if (isMatched) {
                  bg = 'rgba(16, 185, 129, 0.15)';
                  border = 'var(--success)';
                } else if (isSelected) {
                  bg = 'rgba(20, 184, 166, 0.15)';
                  border = 'var(--primary-color)';
                }
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleLeftClick(lw)}
                    disabled={isAnswered || Boolean(isMatched)}
                    style={{
                      padding: '0.95rem 1.15rem',
                      borderRadius: 'var(--radius-md)',
                      border: `2px solid ${border}`,
                      background: bg,
                      fontWeight: '700',
                      fontSize: '1rem',
                      color: 'var(--text-main)',
                      textAlign: 'left',
                      cursor: (isAnswered || isMatched) ? 'default' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      boxShadow: isSelected ? 'var(--shadow-teal)' : 'none'
                    }}
                  >
                    <span>{lw}</span>
                    {isMatched && <CheckCircle2 size={18} color="var(--success)" />}
                  </button>
                );
              })}
            </div>

            {/* Right Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Meaning / Translation
              </div>
              {matchPairData.rightWords.map((rw, idx) => {
                const isMatched = Object.values(matchedPairs).includes(rw);
                const isSelected = selectedRight === rw;
                let bg = 'var(--surface)';
                let border = 'var(--border-color)';
                if (isMatched) {
                  bg = 'rgba(16, 185, 129, 0.15)';
                  border = 'var(--success)';
                } else if (isSelected) {
                  bg = 'rgba(20, 184, 166, 0.15)';
                  border = 'var(--primary-color)';
                }
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleRightClick(rw)}
                    disabled={isAnswered || isMatched}
                    style={{
                      padding: '0.95rem 1.15rem',
                      borderRadius: 'var(--radius-md)',
                      border: `2px solid ${border}`,
                      background: bg,
                      fontWeight: '700',
                      fontSize: '1rem',
                      color: 'var(--text-main)',
                      textAlign: 'left',
                      cursor: (isAnswered || isMatched) ? 'default' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justify: 'space-between',
                      boxShadow: isSelected ? 'var(--shadow-teal)' : 'none'
                    }}
                  >
                    <span>{rw}</span>
                    {isMatched && <CheckCircle2 size={18} color="var(--success)" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Feedback Banner */}
        {isAnswered && (
          <div 
            style={{
              marginTop: '1.5rem',
              padding: '1.25rem',
              borderRadius: 'var(--radius-lg)',
              background: isCorrect ? 'var(--success-bg)' : 'var(--error-bg)',
              border: `1px solid ${isCorrect ? 'var(--success)' : 'var(--error)'}`,
              animation: 'fadeIn 0.2s ease'
            }}
          >
            <div style={{ fontWeight: '800', fontSize: '1.05rem', color: isCorrect ? 'var(--success)' : 'var(--error)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              {isCorrect ? '✅ Excellent! Correct Answer' : '❌ Incorrect'}
            </div>
            <p style={{ margin: 0, color: 'var(--text-main)', fontSize: '0.95rem', lineHeight: '1.5' }}>
              {explanation}
            </p>
          </div>
        )}
      </div>

      {/* Control Buttons */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
        {!isAnswered ? (
          <button
            onClick={handleCheckAnswer}
            disabled={!selectedAnswer && !textInput.trim() && currentQ?.type !== 'match_pairs'}
            className="btn btn-primary"
            style={{ padding: '0.9rem 2.25rem', fontWeight: '800', fontSize: '1rem', borderRadius: 'var(--radius-md)' }}
          >
            Check Answer
          </button>
        ) : (
          <button
            onClick={handleNext}
            disabled={submitting}
            className="btn btn-primary"
            style={{ padding: '0.9rem 2.25rem', fontWeight: '800', fontSize: '1rem', borderRadius: 'var(--radius-md)' }}
          >
            {submitting ? 'Submitting Assessment...' : (currentIndex + 1 === totalQ ? 'Finish & See Results 🚀' : 'Next Question →')}
          </button>
        )}
      </div>
    </div>
  );
};

export default PlacementTestRunner;
