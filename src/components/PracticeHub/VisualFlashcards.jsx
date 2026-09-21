import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { 
  Volume2, RotateCw, CheckCircle2, ChevronLeft, 
  Award, Sparkles, Zap, Eye
} from 'lucide-react';
import { speakText } from '../../utils/audio';
import { sounds } from '../../utils/sounds';

const VisualFlashcards = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);

  useEffect(() => {
    const fetchDeck = async () => {
      setLoading(true);
      try {
        const res = await api.get('/reviews/srs');
        if (res.data && res.data.length > 0) {
          setCards(res.data);
        } else {
          // Fallback mock cards if SRS deck empty
          setCards([
            { id: '1', vocabulary: { word: 'ನಮಸ್ಕಾರ', translation: 'Hello / Greetings', explanation: 'Universal respectful greeting' } },
            { id: '2', vocabulary: { word: 'ಹಾಲು', translation: 'Milk', explanation: 'Essential nutritious beverage' } },
            { id: '3', vocabulary: { word: 'ಸ್ನೇಹಿತ', translation: 'Friend', explanation: 'Close companion' } },
            { id: '4', vocabulary: { word: 'ಧನ್ಯವಾದ', translation: 'Thank you', explanation: 'Expression of gratitude' } }
          ]);
        }
      } catch (err) {
        console.error('Failed to load flashcard deck:', err);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchDeck();
  }, [user]);

  const currentCard = cards[currentIdx];
  const vocab = currentCard?.vocabulary;

  const handleFlip = () => {
    setIsFlipped(prev => !prev);
  };

  const handleRate = async (quality) => {
    try {
      if (currentCard.id && currentCard.id.length > 5) {
        await api.post('/reviews/srs/submit', {
          vocabulary_srs_id: currentCard.id,
          quality: quality
        });
      }
      sounds.playCorrect();
      setXpEarned(prev => prev + (quality >= 3 ? 2 : 0));
      setCompletedCount(prev => prev + 1);

      if (currentIdx < cards.length - 1) {
        setCurrentIdx(prev => prev + 1);
        setIsFlipped(false);
      } else {
        setIsFinished(true);
        sounds.playCelebration();
        const uRes = await api.get('/learners/me');
        setUser(uRes.data);
      }
    } catch (err) {
      console.error('Failed to rate flashcard:', err);
      if (currentIdx < cards.length - 1) {
        setCurrentIdx(prev => prev + 1);
        setIsFlipped(false);
      } else {
        setIsFinished(true);
      }
    }
  };

  if (loading) {
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: '4rem' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading 3D Visual Flashcards...</p>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ maxWidth: '650px', margin: '0 auto', padding: '1.5rem 1rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <button onClick={() => navigate('/practice-hub')} className="btn btn-secondary" style={{ padding: '0.5rem 0.75rem' }}>
          <ChevronLeft size={18} />
        </button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
            CARD {currentIdx + 1} OF {cards.length}
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0 }}>Visual 3D Flashcards</h2>
        </div>
        <div style={{ width: '40px' }} />
      </div>

      {/* Progress Bar */}
      <div style={{ width: '100%', height: '6px', background: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden', marginBottom: '2.5rem' }}>
        <div style={{ width: `${((currentIdx + 1) / cards.length) * 100}%`, height: '100%', background: 'var(--primary-color)', transition: 'width 0.3s ease' }} />
      </div>

      {!isFinished ? (
        <div>
          {/* Flip Card Container */}
          <div 
            onClick={handleFlip}
            className="card"
            style={{
              height: '320px',
              borderRadius: '24px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2.5rem',
              cursor: 'pointer',
              textAlign: 'center',
              boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
              border: isFlipped ? '2px solid var(--primary-color)' : '2px solid var(--border-color)',
              background: isFlipped ? 'rgba(88, 204, 2, 0.05)' : 'var(--card-bg)',
              position: 'relative',
              transition: 'transform 0.3s ease, border-color 0.3s ease',
              marginBottom: '2rem'
            }}
          >
            <div style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              <RotateCw size={14} /> Tap card to flip
            </div>

            {!isFlipped ? (
              <div>
                <div style={{ fontSize: '3rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '1rem', lineHeight: '1.2' }}>
                  {vocab?.word}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    speakText(vocab?.word, user?.target_language?.code || 'kn');
                  }}
                  className="btn btn-secondary"
                  style={{ borderRadius: '20px', padding: '0.4rem 1rem', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}
                >
                  <Volume2 size={16} /> Listen Pronunciation
                </button>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: '2.2rem', fontWeight: '800', color: 'var(--primary-color)', marginBottom: '0.75rem' }}>
                  {vocab?.translation}
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '400px', margin: '0 auto' }}>
                  {vocab?.explanation}
                </p>
              </div>
            )}
          </div>

          {/* SM-2 Recall Feedback Rating Bar */}
          {isFlipped ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
              <button
                onClick={() => handleRate(1)}
                className="btn"
                style={{ background: 'rgba(255, 75, 75, 0.15)', border: '1px solid #ff4b4b', color: '#ff4b4b', padding: '0.75rem', borderRadius: '14px', fontWeight: 'bold' }}
              >
                Again
              </button>
              <button
                onClick={() => handleRate(3)}
                className="btn"
                style={{ background: 'rgba(255, 150, 0, 0.15)', border: '1px solid #ff9600', color: '#ff9600', padding: '0.75rem', borderRadius: '14px', fontWeight: 'bold' }}
              >
                Hard
              </button>
              <button
                onClick={() => handleRate(4)}
                className="btn"
                style={{ background: 'rgba(88, 204, 2, 0.15)', border: '1px solid var(--primary-color)', color: 'var(--primary-color)', padding: '0.75rem', borderRadius: '14px', fontWeight: 'bold' }}
              >
                Good
              </button>
              <button
                onClick={() => handleRate(5)}
                className="btn btn-primary"
                style={{ padding: '0.75rem', borderRadius: '14px', fontWeight: 'bold' }}
              >
                Easy
              </button>
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Tap the card to reveal the meaning and rate your memory.
            </div>
          )}
        </div>
      ) : (
        <div className="card" style={{ padding: '3rem', textAlign: 'center', borderRadius: '24px' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🎉</div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '0.5rem', color: 'var(--text-main)' }}>
            Deck Completed!
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.75rem' }}>
            You reviewed {completedCount} flashcards. The SM-2 memory engine has rescheduled them based on your recall ratings.
          </p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', color: 'var(--primary-color)', fontSize: '1.25rem', marginBottom: '2rem' }}>
            <Zap size={22} /> +{xpEarned} XP Earned
          </div>
          <div>
            <button onClick={() => navigate('/practice-hub')} className="btn btn-primary" style={{ padding: '0.85rem 2rem', borderRadius: '12px' }}>
              Back to Practice Hub
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default VisualFlashcards;
