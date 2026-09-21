import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { useTranslation } from '../../utils/i18n';
import { Award, BookOpen, ArrowRight, Eye, ShieldAlert, Sparkles } from 'lucide-react';

const SrsReview = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [srsItems, setSrsItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);
  const [reviewedWords, setReviewedWords] = useState([]);
  const [isFinished, setIsFinished] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSrsItems = async () => {
      try {
        const res = await api.get('/reviews/srs');
        setSrsItems(res.data);
      } catch (err) {
        console.error('Failed to fetch due SRS items:', err);
        setError('Failed to load spaced repetition deck.');
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchSrsItems();
  }, [user]);

  const handleRate = async (quality) => {
    const currentItem = srsItems[currentIdx];
    setSubmitting(true);
    try {
      await api.post('/reviews/srs/submit', {
        vocabulary_srs_id: currentItem.id,
        quality: quality
      });

      // Track reviewed words and XP
      const addedXp = quality >= 3 ? 2 : 0;
      setXpEarned(prev => prev + addedXp);
      setReviewedWords(prev => [
        ...prev,
        {
          word: currentItem.vocabulary.word,
          translation: currentItem.vocabulary.translation,
          quality: quality
        }
      ]);

      // Move to next card or finish
      if (currentIdx < srsItems.length - 1) {
        setCurrentIdx(prev => prev + 1);
        setShowTranslation(false);
      } else {
        // Refresh learner context data
        const userRes = await api.get('/learners/me');
        setUser(userRes.data);
        setIsFinished(true);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to record review on server.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '4rem', textAlign: 'center' }}>{t('analyzingProfile')}</div>;
  }

  if (srsItems.length === 0) {
    return (
      <div className="page-container" style={{ maxWidth: '600px', textAlign: 'center' }}>
        <div className="card" style={{ padding: '3rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🌱</div>
          <h2 style={{ fontSize: '1.75rem', color: 'var(--text-main)', marginBottom: '0.75rem' }}>Your Deck is All Caught Up!</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: '1.6' }}>
            No vocabulary reviews are currently due. Check back later, or complete lessons to add more vocabulary to your spaced repetition list!
          </p>
          <Link to="/dashboard" className="btn btn-primary" style={{ display: 'inline-block' }}>
            {t('viewDashboard')}
          </Link>
        </div>
      </div>
    );
  }

  const currentItem = srsItems[currentIdx];
  const vocab = currentItem.vocabulary;

  const ratings = [
    { label: 'Again', desc: 'Forgot it', quality: 1, color: '#ff4b4b' },
    { label: 'Hard', desc: 'Struggled', quality: 3, color: '#ff9600' },
    { label: 'Good', desc: 'Hesitated', quality: 4, color: '#1cb0f6' },
    { label: 'Easy', desc: 'Instantly', quality: 5, color: '#58cc02' }
  ];

  return (
    <div className="page-container" style={{ maxWidth: '650px' }}>
      <div className="card" style={{ padding: '2.5rem' }}>
        
        {/* Progress Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div style={{ flex: 1, height: '8px', background: 'var(--border-color)', borderRadius: '9999px', overflow: 'hidden', marginRight: '1rem' }}>
            <div style={{ 
              height: '100%', 
              background: 'var(--primary-color)', 
              width: `${(currentIdx / srsItems.length) * 100}%`,
              transition: 'width 0.3s ease'
            }} />
          </div>
          <span style={{ fontWeight: 'bold', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {currentIdx + 1} / {srsItems.length}
          </span>
        </div>

        {isFinished ? (
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <div style={{ display: 'inline-flex', padding: '1.5rem', borderRadius: '50%', background: 'rgba(88, 204, 2, 0.15)', marginBottom: '1.5rem' }}>
              <Award size={64} color="var(--primary-color)" />
            </div>
            <h2 style={{ fontSize: '2rem', color: 'var(--primary-color)', marginBottom: '0.5rem' }}>{t('workoutCompleted')}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginBottom: '2rem' }}>
              You reviewed <strong>{srsItems.length}</strong> words today and earned <strong>{xpEarned} XP</strong>.
            </p>

            {/* Reviewed Words List */}
            <div style={{ textAlign: 'left', background: 'var(--background)', padding: '1rem', borderRadius: '12px', marginBottom: '2rem', maxHeight: '200px', overflowY: 'auto', border: '1px solid var(--border-color)' }}>
              <h4 style={{ marginBottom: '0.75rem', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)' }}>Studied Words</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {reviewedWords.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '4px' }}>
                    <span>
                      <strong style={{ color: 'var(--primary-color)' }}>{item.word}</strong>: {item.translation}
                    </span>
                    <span style={{ 
                      fontSize: '0.75rem', 
                      background: item.quality >= 3 ? 'rgba(88,204,2,0.15)' : 'rgba(255,75,75,0.15)',
                      color: item.quality >= 3 ? '#58cc02' : '#ff4b4b',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontWeight: 'bold'
                    }}>
                      {item.quality >= 3 ? 'Remembered' : 'Again'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <Link to="/dashboard" className="btn btn-primary" style={{ padding: '0.75rem 2.5rem' }}>
              {t('viewDashboard')}
            </Link>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--secondary-color)', marginBottom: '1.5rem', fontWeight: '700', fontSize: '0.9rem' }}>
              <BookOpen size={18} />
              {t('srsTitle')}
            </div>

            {/* Vocabulary Card */}
            <div style={{ 
              height: '240px',
              background: 'var(--surface)',
              border: '2px solid var(--border-color)',
              borderRadius: '20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '2rem',
              marginBottom: '2.5rem',
              textAlign: 'center',
              position: 'relative',
              boxShadow: '0 4px 10px rgba(0,0,0,0.05)'
            }}>
              <div style={{ fontSize: '3rem', fontWeight: '800', color: 'var(--text-main)', lineHeight: '1.3' }}>
                {vocab.word}
              </div>
              
              {showTranslation ? (
                <div style={{ marginTop: '1.5rem', animation: 'fadeIn 0.3s ease' }}>
                  <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--primary-color)', lineHeight: '1.3' }}>
                    {vocab.translation}
                  </div>
                  {vocab.explanation && (
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '8px', maxWidth: '380px', lineHeight: '1.4' }}>
                      {vocab.explanation}
                    </div>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowTranslation(true)}
                  style={{
                    marginTop: '2rem',
                    padding: '0.6rem 1.5rem',
                    borderRadius: '50px',
                    background: 'var(--secondary-color)',
                    color: '#fff',
                    border: 'none',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.9rem'
                  }}
                >
                  <Eye size={16} /> SHOW TRANSLATION
                </button>
              )}
            </div>

            {error && <div className="form-error" style={{ marginBottom: '1rem' }}>{error}</div>}

            {/* Ratings / Responses buttons */}
            {showTranslation && (
              <div>
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                  How easily did you recall this vocabulary word?
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                  {ratings.map(rate => (
                    <button
                      key={rate.label}
                      type="button"
                      disabled={submitting}
                      onClick={() => handleRate(rate.quality)}
                      style={{
                        padding: '0.85rem 0.25rem',
                        borderRadius: '12px',
                        border: `2px solid ${rate.color}`,
                        background: 'transparent',
                        color: rate.color,
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s',
                        fontSize: '0.9rem'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = rate.color;
                        e.currentTarget.style.color = '#fff';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = rate.color;
                      }}
                    >
                      <span>{rate.label}</span>
                      <span style={{ fontSize: '0.7rem', fontWeight: 'normal', opacity: 0.8, marginTop: '2px' }}>
                        {rate.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SrsReview;
