import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { useTranslation } from '../../utils/i18n';
import { Heart, Award, ArrowRight, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';

const MistakesPractice = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [mistakes, setMistakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswerId, setSelectedAnswerId] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMistakes = async () => {
      try {
        const res = await api.get('/reviews/mistakes');
        setMistakes(res.data);
      } catch (err) {
        console.error('Failed to fetch mistakes:', err);
        setError('Failed to load mistakes queue.');
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchMistakes();
  }, [user]);

  const handleSelect = (ansId) => {
    if (isAnswered) return;
    setSelectedAnswerId(ansId);
  };

  const handleCheck = async () => {
    if (selectedAnswerId === null || isAnswered) return;
    
    const currentMistake = mistakes[currentIdx];
    const correctAns = currentMistake.question.answers.find(a => a.is_correct);
    const isCorrect = correctAns && selectedAnswerId === correctAns.id;
    
    setSubmitting(true);
    try {
      // Submit progress to the backend review mistake endpoint
      const res = await api.post('/reviews/mistakes/submit', {
        question_id: currentMistake.question_id,
        incorrect_answer: selectedAnswerId,
        is_correct: isCorrect
      });
      
      if (isCorrect) {
        setCorrectCount(prev => prev + 1);
      }
      
      // Update user state to reflect XP and Heart gains immediately
      const userRes = await api.get('/learners/me');
      setUser(userRes.data);
      setIsAnswered(true);
    } catch (err) {
      console.error(err);
      setError('Failed to submit practice result to server.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    if (currentIdx < mistakes.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setSelectedAnswerId(null);
      setIsAnswered(false);
    } else {
      setIsFinished(true);
    }
  };

  if (loading) {
    return <div style={{ padding: '4rem', textAlign: 'center' }}>{t('analyzingProfile')}</div>;
  }

  if (mistakes.length === 0) {
    return (
      <div className="page-container" style={{ maxWidth: '600px', textAlign: 'center' }}>
        <div className="card" style={{ padding: '3rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🎯</div>
          <h2 style={{ fontSize: '1.75rem', color: 'var(--text-main)', marginBottom: '0.75rem' }}>{t('No Mistakes to Practice!')}</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: '1.6' }}>
            Excellent job! You currently have no unresolved exercise mistakes. Keep up your streak!
          </p>
          <Link to="/dashboard" className="btn btn-primary" style={{ display: 'inline-block' }}>
            {t('viewDashboard')}
          </Link>
        </div>
      </div>
    );
  }

  const currentMistake = mistakes[currentIdx];
  const question = currentMistake.question;
  const isSelectedCorrect = question.answers.find(a => a.id === selectedAnswerId)?.is_correct;

  return (
    <div className="page-container" style={{ maxWidth: '700px' }}>
      <div className="card" style={{ padding: '2.5rem' }}>
        
        {/* Progress Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ flex: 1, height: '8px', background: 'var(--border-color)', borderRadius: '9999px', overflow: 'hidden', marginRight: '1rem' }}>
            <div style={{ 
              height: '100%', 
              background: 'var(--primary-color)', 
              width: `${((currentIdx) / mistakes.length) * 100}%`,
              transition: 'width 0.3s ease'
            }} />
          </div>
          <span style={{ fontWeight: 'bold', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {currentIdx + 1} / {mistakes.length}
          </span>
        </div>

        {isFinished ? (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div style={{ display: 'inline-flex', padding: '1.5rem', borderRadius: '50%', background: 'rgba(88, 204, 2, 0.15)', marginBottom: '1.5rem' }}>
              <Award size={64} color="var(--primary-color)" />
            </div>
            <h2 style={{ fontSize: '2rem', color: 'var(--primary-color)', marginBottom: '0.75rem' }}>{t('workoutCompleted')}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '2rem', lineHeight: '1.6' }}>
              You resolved <strong>{correctCount}</strong> out of <strong>{mistakes.length}</strong> mistakes today.
              <br />
              Resolved mistakes helped you regain lost hearts!
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', maxWidth: '360px', margin: '0 auto 2.5rem auto' }}>
              <div style={{ padding: '0.75rem', background: 'var(--background)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                <span style={{ display: 'block', fontSize: '1.25rem', fontWeight: 'bold', color: '#58cc02' }}>
                  +{correctCount * 2} XP
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('xpEarned')}</span>
              </div>
              <div style={{ padding: '0.75rem', background: 'var(--background)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                <span style={{ display: 'block', fontSize: '1.25rem', fontWeight: 'bold', color: '#ff4b4b' }}>
                  +{correctCount} ❤️
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Hearts Gained</span>
              </div>
            </div>

            <Link to="/dashboard" className="btn btn-primary" style={{ padding: '0.75rem 2.5rem' }}>
              {t('viewDashboard')}
            </Link>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-orange)', marginBottom: '1rem', fontWeight: '700', fontSize: '0.9rem' }}>
              <AlertCircle size={18} />
              {t('mistakesQueueTitle')} ({currentMistake.review_count} attempts)
            </div>

            <h3 style={{ fontSize: '1.35rem', color: 'var(--text-main)', marginBottom: '1.5rem', lineHeight: '1.4' }}>
              {question.text}
            </h3>

            {/* Answers List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
              {question.answers.map((ans) => {
                const isSelected = selectedAnswerId === ans.id;
                
                let borderStyle = '1px solid var(--border-color)';
                let bgStyle = 'var(--surface)';
                
                if (isSelected) {
                  borderStyle = '2px solid var(--primary-color)';
                  bgStyle = 'rgba(88, 204, 2, 0.08)';
                }
                
                if (isAnswered) {
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
                    onClick={() => !isAnswered && handleSelect(ans.id)}
                    style={{
                      padding: '1rem 1.25rem',
                      borderRadius: '12px',
                      border: borderStyle,
                      background: bgStyle,
                      cursor: isAnswered ? 'default' : 'pointer',
                      transition: 'all 0.2s',
                      color: 'var(--text-main)',
                      fontWeight: isSelected ? '600' : 'normal',
                      lineHeight: '1.5'
                    }}
                  >
                    {ans.text}
                  </div>
                );
              })}
            </div>

            {error && <div className="form-error" style={{ marginBottom: '1rem' }}>{error}</div>}

            {/* Action Bar */}
            {!isAnswered ? (
              <button
                className="btn btn-primary"
                onClick={handleCheck}
                disabled={selectedAnswerId === null || submitting}
                style={{ width: '100%', padding: '0.9rem', fontSize: '1rem', fontWeight: '800' }}
              >
                {submitting ? t('submittingWorkout') : t('checkAnswer')}
              </button>
            ) : (
              <div style={{ 
                background: isSelectedCorrect ? 'rgba(88, 204, 2, 0.12)' : 'rgba(255, 75, 75, 0.12)',
                padding: '1.25rem',
                borderRadius: '12px',
                border: `1px solid ${isSelectedCorrect ? 'var(--primary-color)' : 'var(--error)'}`,
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', color: isSelectedCorrect ? 'var(--primary-color)' : 'var(--error)' }}>
                  {isSelectedCorrect ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                  {isSelectedCorrect ? t('correct') : t('incorrect')}
                </div>
                {question.answers.find(a => a.is_correct)?.explanation && (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, lineHeight: '1.4' }}>
                    {question.answers.find(a => a.is_correct).explanation}
                  </p>
                )}
                <button
                  className="btn btn-primary"
                  onClick={handleNext}
                  style={{ width: '100%', marginTop: '0.5rem', padding: '0.85rem', background: isSelectedCorrect ? 'var(--primary-color)' : 'var(--error)', borderColor: isSelectedCorrect ? 'var(--primary-color)' : 'var(--error)', fontWeight: '800' }}
                >
                  {t('nextExercise')}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MistakesPractice;
