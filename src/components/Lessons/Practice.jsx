import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { Heart, Award, ArrowRight, CheckCircle2, AlertCircle, RotateCcw } from 'lucide-react';

const PRACTICE_QUESTIONS = [
  {
    id: 1,
    text: "Which of the following represents the foundational vowel sound /a/ (like 'ಅ' / 'अ')?",
    options: [
      { text: "The primary short vowel sound /a/ (like 'u' in 'sun')", isCorrect: true },
      { text: "The consonant sound /k/", isCorrect: false },
      { text: "The nasal sound /m/", isCorrect: false }
    ]
  },
  {
    id: 2,
    text: "What is the respectful universal greeting in Indian languages (e.g. 'ನಮಸ್ಕಾರ' / 'नमस्ते')?",
    options: [
      { text: "Namaskara / Namaste (Hello & Welcome)", isCorrect: true },
      { text: "Good night", isCorrect: false },
      { text: "Goodbye only", isCorrect: false }
    ]
  },
  {
    id: 3,
    text: "What essential word translates to 'ಹಾಲು' (Kannada) / 'दूध' (Hindi) / 'పాలు' (Telugu)?",
    options: [
      { text: "Milk", isCorrect: true },
      { text: "Water", isCorrect: false },
      { text: "Book", isCorrect: false }
    ]
  }
];

const Practice = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSelect = (idx) => {
    if (isAnswered) return;
    setSelectedIdx(idx);
  };

  const handleCheck = () => {
    if (selectedIdx === null || isAnswered) return;
    const isCorrect = PRACTICE_QUESTIONS[currentIdx].options[selectedIdx].isCorrect;
    if (isCorrect) {
      setCorrectCount(prev => prev + 1);
    }
    setIsAnswered(true);
  };

  const handleNext = async () => {
    if (currentIdx < PRACTICE_QUESTIONS.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setSelectedIdx(null);
      setIsAnswered(false);
    } else {
      // Completed practice session! Call the practice endpoint to restore a heart
      setSubmitting(true);
      try {
        const res = await api.post('/learners/practice');
        setUser(res.data);
        setIsFinished(true);
      } catch (err) {
        console.error(err);
        setError('Failed to update heart status on the server. Continuing locally...');
        setIsFinished(true);
      } finally {
        setSubmitting(false);
      }
    }
  };

  if (!user) {
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: '4rem' }}>
        <h2>Please log in to start a practice session.</h2>
      </div>
    );
  }

  const q = PRACTICE_QUESTIONS[currentIdx];

  return (
    <div className="page-container" style={{ maxWidth: '700px' }}>
      <div className="card" style={{ padding: '2.5rem' }}>
        
        {isFinished ? (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div style={{ 
              display: 'inline-flex', padding: '1.5rem', borderRadius: '50%', 
              background: 'rgba(88, 204, 2, 0.15)', marginBottom: '1.5rem'
            }}>
              <Heart size={64} color="#ff4b4b" fill="#ff4b4b" />
            </div>
            
            <h1 style={{ fontSize: '2.25rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>Practice Complete!</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.15rem', marginBottom: '2rem' }}>
              Great job! You answered <strong>{correctCount} / {PRACTICE_QUESTIONS.length}</strong> questions correctly.
            </p>

            {error && (
              <div style={{ color: 'var(--error)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                {error}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', maxWidth: '400px', margin: '0 auto 2.5rem auto' }}>
              <div style={{ padding: '1rem', background: 'var(--background)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                <span style={{ display: 'block', fontSize: '1.75rem', fontWeight: 'bold', color: '#ff4b4b' }}>+1 ❤️</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Heart Restored</span>
              </div>
              <div style={{ padding: '1rem', background: 'var(--background)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                <span style={{ display: 'block', fontSize: '1.75rem', fontWeight: 'bold', color: '#58cc02' }}>+5 📈</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>XP Gained</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button onClick={() => navigate('/dashboard')} className="btn btn-primary" style={{ padding: '0.75rem 2rem' }}>
                Go to Dashboard
              </button>
              <button 
                onClick={() => {
                  setCurrentIdx(0);
                  setSelectedIdx(null);
                  setIsAnswered(false);
                  setCorrectCount(0);
                  setIsFinished(false);
                  setError(null);
                }} 
                className="btn btn-secondary" 
                style={{ padding: '0.75rem 2rem', gap: '6px' }}
                disabled={user.hearts >= 5}
              >
                <RotateCcw size={16} /> Practice Again
              </button>
            </div>
          </div>
        ) : (
          <div>
            {/* Progress Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ff4b4b', fontWeight: 'bold' }}>
                <Heart size={20} fill="#ff4b4b" />
                <span>{user.hearts} Hearts</span>
              </div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 'bold' }}>
                Question {currentIdx + 1} of {PRACTICE_QUESTIONS.length}
              </span>
            </div>

            {/* Progress Bar */}
            <div style={{ height: '12px', background: 'var(--border-color)', borderRadius: '9999px', marginBottom: '2.5rem', overflow: 'hidden' }}>
              <div style={{ 
                height: '100%', 
                background: 'linear-gradient(90deg, var(--primary-color), #58cc02)',
                width: `${((currentIdx) / PRACTICE_QUESTIONS.length) * 100}%`,
                transition: 'width 0.3s ease'
              }} />
            </div>

            {/* Question Card */}
            <div style={{ marginBottom: '2.5rem' }}>
              <h2 style={{ fontSize: '1.35rem', color: 'var(--text-main)', marginBottom: '1.5rem' }}>
                {q.text}
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {q.options.map((opt, idx) => {
                  const isSelected = selectedIdx === idx;
                  let cardBorder = 'var(--border-color)';
                  let cardBg = 'var(--surface)';
                  
                  if (isSelected) {
                    cardBorder = 'var(--primary-color)';
                    cardBg = 'rgba(88, 204, 2, 0.1)';
                  }
                  
                  if (isAnswered) {
                    if (opt.isCorrect) {
                      cardBorder = 'var(--primary-color)';
                      cardBg = 'rgba(88, 204, 2, 0.15)';
                    } else if (isSelected) {
                      cardBorder = 'var(--error)';
                      cardBg = 'rgba(255, 75, 75, 0.15)';
                    }
                  }

                  return (
                    <div 
                      key={idx}
                      onClick={() => handleSelect(idx)}
                      style={{ 
                        padding: '1rem 1.5rem', borderRadius: 'var(--radius-md)',
                        border: `2px solid ${cardBorder}`,
                        background: cardBg,
                        cursor: isAnswered ? 'default' : 'pointer',
                        transition: 'all 0.2s ease', color: 'var(--text-main)',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                      }}
                    >
                      <span>{opt.text}</span>
                      {isAnswered && opt.isCorrect && (
                        <CheckCircle2 size={20} color="var(--primary-color)" />
                      )}
                      {isAnswered && isSelected && !opt.isCorrect && (
                        <AlertCircle size={20} color="var(--error)" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action Bar */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              {!isAnswered ? (
                <button 
                  className="btn btn-primary"
                  onClick={handleCheck}
                  disabled={selectedIdx === null}
                  style={{ width: '100%', padding: '0.85rem' }}
                >
                  Check Answer
                </button>
              ) : (
                <button 
                  className="btn btn-primary"
                  onClick={handleNext}
                  disabled={submitting}
                  style={{ width: '100%', padding: '0.85rem', gap: '8px' }}
                >
                  {submitting ? 'Updating...' : currentIdx < PRACTICE_QUESTIONS.length - 1 ? 'Next Question' : 'Finish Practice'}
                  <ArrowRight size={18} />
                </button>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default Practice;
