import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { Gem, Flame, Heart, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

const Shop = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [buying, setBuying] = useState(null);
  const [message, setMessage] = useState(null);

  const buyItem = async (itemName, cost) => {
    if (!user) return;
    if (user.gems < cost) {
      setMessage({ type: 'error', text: 'You do not have enough gems!' });
      return;
    }
    
    setBuying(itemName);
    setMessage(null);
    
    try {
      const res = await api.post('/learners/shop/buy', { item_name: itemName });
      setUser(res.data);
      setMessage({ type: 'success', text: `Successfully purchased ${itemName.replace(/_/g, ' ')}!` });
    } catch (err) {
      const errMsg = err.response?.data?.detail || 'An error occurred during purchase.';
      setMessage({ type: 'error', text: errMsg });
    } finally {
      setBuying(null);
    }
  };

  if (!user) {
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: '4rem' }}>
        <h2>Please log in to visit the Shop.</h2>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ maxWidth: '800px' }}>
      <div className="page-header" style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '0.5rem 1.5rem', background: 'rgba(28, 176, 246, 0.15)', borderRadius: '9999px', color: '#1cb0f6', fontWeight: 'bold', fontSize: '1.25rem', marginBottom: '1rem' }}>
          <Gem fill="#1cb0f6" size={24} />
          <span>{user.gems} Gems</span>
        </div>
        <h1 className="page-title" style={{ justifyContent: 'center' }}>Duolingo Gamified Store</h1>
        <p className="page-subtitle">Spend your hard-earned gems to power up your language learning!</p>
      </div>

      {message && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '1rem', marginBottom: '1.5rem', borderRadius: 'var(--radius-md)',
          border: `1px solid ${message.type === 'success' ? 'rgba(88, 204, 2, 0.4)' : 'rgba(255, 75, 75, 0.4)'}`,
          background: message.type === 'success' ? 'rgba(88, 204, 2, 0.1)' : 'rgba(255, 75, 75, 0.1)',
          color: message.type === 'success' ? 'var(--primary-color)' : 'var(--error)'
        }}>
          {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <span>{message.text}</span>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '3rem' }}>
        
        {/* Streak Freeze Card */}
        <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 2rem', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <div style={{ background: 'rgba(255, 150, 0, 0.15)', padding: '1rem', borderRadius: '16px', color: '#ff9600' }}>
              <Flame fill="#ff9600" size={36} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)', marginBottom: '0.25rem' }}>Streak Freeze</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Allows your daily streak to remain in place if you miss a day of activity.</p>
              <small style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>Owned: {user.streak_freeze_count}</small>
            </div>
          </div>
          <button 
            className="btn btn-primary"
            onClick={() => buyItem('streak_freeze', 200)}
            disabled={buying !== null || user.gems < 200}
            style={{ minWidth: '130px', background: '#ff9600', borderColor: '#ff9600' }}
          >
            {buying === 'streak_freeze' ? 'Buying...' : '200 Gems'}
          </button>
        </div>

        {/* Heart Refill Card */}
        <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 2rem', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <div style={{ background: 'rgba(255, 75, 75, 0.15)', padding: '1rem', borderRadius: '16px', color: '#ff4b4b' }}>
              <Heart fill="#ff4b4b" size={36} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)', marginBottom: '0.25rem' }}>Refill Hearts</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Instantly restores all your hearts to full capacity (5 hearts) so you can resume learning.</p>
              <small style={{ color: 'var(--text-muted)' }}>Current: {user.hearts} / 5</small>
            </div>
          </div>
          <button 
            className="btn btn-primary"
            onClick={() => buyItem('heart_refill', 150)}
            disabled={buying !== null || user.gems < 150 || user.hearts >= 5}
            style={{ minWidth: '130px', background: '#ff4b4b', borderColor: '#ff4b4b' }}
          >
            {user.hearts >= 5 ? 'Hearts Full' : buying === 'heart_refill' ? 'Refilling...' : '150 Gems'}
          </button>
        </div>

        {/* Double or Nothing Card */}
        <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 2rem', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <div style={{ background: 'rgba(88, 204, 2, 0.15)', padding: '1rem', borderRadius: '16px', color: 'var(--primary-color)' }}>
              <Sparkles size={36} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)', marginBottom: '0.25rem' }}>Double or Nothing</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Bet 50 gems to double them (get 100 gems back) if you maintain a 7-day learning streak.</p>
              {user.double_or_nothing_active && (
                <small style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>
                  Active! Current bet streak: {user.double_or_nothing_streak} / 7 days
                </small>
              )}
            </div>
          </div>
          <button 
            className="btn btn-primary"
            onClick={() => buyItem('double_or_nothing', 50)}
            disabled={buying !== null || user.gems < 50 || user.double_or_nothing_active}
            style={{ minWidth: '130px' }}
          >
            {user.double_or_nothing_active ? 'Already Active' : buying === 'double_or_nothing' ? 'Activating...' : '50 Gems'}
          </button>
        </div>

      </div>

      {/* Free Heart Practice Promo */}
      {user.hearts < 5 && (
        <div className="card" style={{ 
          background: 'linear-gradient(135deg, rgba(88, 204, 2, 0.1), rgba(28, 176, 246, 0.1))',
          border: '1px solid rgba(88, 204, 2, 0.2)', padding: '2rem', textAlign: 'center', borderRadius: '16px' 
        }}>
          <h3 style={{ fontSize: '1.35rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>Running out of Hearts?</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1.5rem', maxWidth: '600px', margin: '0 auto 1.5rem auto' }}>
            No need to spend gems! Complete a quick literacy practice session to restore 1 heart for free and earn 5 bonus XP.
          </p>
          <button onClick={() => navigate('/practice')} className="btn btn-secondary" style={{ padding: '0.75rem 2rem', border: '2px solid var(--primary-color)', color: 'var(--primary-color)', background: 'transparent' }}>
            Start Free Practice
          </button>
        </div>
      )}
    </div>
  );
};

export default Shop;
