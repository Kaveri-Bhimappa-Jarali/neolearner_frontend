import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';
import { Gem, Flame, Heart, Sparkles, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import Badge from '../ui/Badge';

const Shop = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [buying, setBuying] = useState(null);
  const [message, setMessage] = useState(null);

  const buyItem = async (itemName, cost) => {
    if (!user) return;
    if (user.gems < cost) {
      setMessage({ type: 'error', text: 'You do not have enough gems for this purchase.' });
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
      <div className="page-container" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '1rem' }}>
          Please Log In
        </h2>
        <Link to="/login" className="btn btn-primary">Log In to Access Rewards Shop</Link>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ maxWidth: '850px', animation: 'fadeIn 0.3s ease' }}>
      
      {/* Top Header */}
      <div 
        style={{ 
          textAlign: 'center', 
          marginBottom: '2.5rem',
          background: 'var(--surface-card)',
          padding: '2.5rem 2rem',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-md)'
        }}
      >
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '0.65rem 1.75rem', background: 'rgba(6, 182, 212, 0.15)', borderRadius: '9999px', color: 'var(--accent-cyan)', fontWeight: '800', fontSize: '1.3rem', marginBottom: '1rem', border: '1px solid rgba(6, 182, 212, 0.3)' }}>
          <Gem fill="var(--accent-cyan)" size={26} />
          <span>{user.gems} Gems Available</span>
        </div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: '900', color: 'var(--text-main)', margin: '0 0 0.5rem' }}>
          Rewards & Power-Ups Shop
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.02rem', margin: 0 }}>
          Exchange your earned gems for streak protection, heart refills, and bonus multipliers
        </p>
      </div>

      {message && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '1rem 1.25rem', marginBottom: '1.75rem', borderRadius: 'var(--radius-md)',
          border: `1px solid ${message.type === 'success' ? 'var(--success)' : 'var(--error)'}`,
          background: message.type === 'success' ? 'var(--success-bg)' : 'var(--error-bg)',
          color: message.type === 'success' ? 'var(--success)' : 'var(--error)',
          fontWeight: '700'
        }}>
          {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Shop Items List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2.5rem' }}>
        
        {/* Streak Freeze Card */}
        <div 
          className="card" 
          style={{ 
            display: 'flex', 
            justify: 'space-between', 
            alignItems: 'center', 
            padding: '1.75rem 2rem', 
            gap: '1.5rem', 
            flexWrap: 'wrap',
            background: 'var(--surface-card)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-color)'
          }}
        >
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <div style={{ background: 'rgba(245, 158, 11, 0.15)', padding: '1.15rem', borderRadius: 'var(--radius-lg)', color: 'var(--accent-gold)' }}>
              <Flame fill="var(--accent-gold)" size={36} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--text-main)', margin: '0 0 0.35rem' }}>Streak Freeze</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', margin: '0 0 0.5rem', lineHeight: '1.45' }}>
                Protects your daily learning streak if you miss a day of practice.
              </p>
              <Badge variant="gold">Owned: {user.streak_freeze_count}</Badge>
            </div>
          </div>
          <button 
            className="btn btn-primary"
            onClick={() => buyItem('streak_freeze', 200)}
            disabled={buying !== null || user.gems < 200}
            style={{ minWidth: '140px', background: 'var(--accent-gold)', borderColor: 'var(--accent-gold)', padding: '0.85rem 1.5rem', fontWeight: '800' }}
          >
            {buying === 'streak_freeze' ? 'Buying...' : '200 Gems'}
          </button>
        </div>

        {/* Heart Refill Card */}
        <div 
          className="card" 
          style={{ 
            display: 'flex', 
            justify: 'space-between', 
            alignItems: 'center', 
            padding: '1.75rem 2rem', 
            gap: '1.5rem', 
            flexWrap: 'wrap',
            background: 'var(--surface-card)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-color)'
          }}
        >
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <div style={{ background: 'rgba(239, 68, 68, 0.15)', padding: '1.15rem', borderRadius: 'var(--radius-lg)', color: 'var(--error)' }}>
              <Heart fill="var(--error)" size={36} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--text-main)', margin: '0 0 0.35rem' }}>Refill Hearts</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', margin: '0 0 0.5rem', lineHeight: '1.45' }}>
                Instantly restores all 5 hearts so you can resume study sessions.
              </p>
              <Badge variant="red">Current: {user.hearts} / 5 Hearts</Badge>
            </div>
          </div>
          <button 
            className="btn btn-primary"
            onClick={() => buyItem('heart_refill', 150)}
            disabled={buying !== null || user.gems < 150 || user.hearts >= 5}
            style={{ minWidth: '140px', background: 'var(--error)', borderColor: 'var(--error)', padding: '0.85rem 1.5rem', fontWeight: '800' }}
          >
            {user.hearts >= 5 ? 'Hearts Full' : buying === 'heart_refill' ? 'Refilling...' : '150 Gems'}
          </button>
        </div>

        {/* Double or Nothing Card */}
        <div 
          className="card" 
          style={{ 
            display: 'flex', 
            justify: 'space-between', 
            alignItems: 'center', 
            padding: '1.75rem 2rem', 
            gap: '1.5rem', 
            flexWrap: 'wrap',
            background: 'var(--surface-card)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-color)'
          }}
        >
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <div style={{ background: 'rgba(20, 184, 166, 0.15)', padding: '1.15rem', borderRadius: 'var(--radius-lg)', color: 'var(--primary-color)' }}>
              <Sparkles size={36} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--text-main)', margin: '0 0 0.35rem' }}>Double or Nothing</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', margin: '0 0 0.5rem', lineHeight: '1.45' }}>
                Wager 50 gems to receive 100 gems back if you maintain a 7-day streak.
              </p>
              {user.double_or_nothing_active && (
                <Badge variant="teal">Active Bet: {user.double_or_nothing_streak} / 7 Days</Badge>
              )}
            </div>
          </div>
          <button 
            className="btn btn-primary"
            onClick={() => buyItem('double_or_nothing', 50)}
            disabled={buying !== null || user.gems < 50 || user.double_or_nothing_active}
            style={{ minWidth: '140px', padding: '0.85rem 1.5rem', fontWeight: '800' }}
          >
            {user.double_or_nothing_active ? 'Already Active' : buying === 'double_or_nothing' ? 'Activating...' : '50 Gems'}
          </button>
        </div>

      </div>

      {/* Free Heart Practice Promo Card */}
      {user.hearts < 5 && (
        <div 
          className="card" 
          style={{ 
            background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.12) 0%, rgba(99, 102, 241, 0.12) 100%)',
            border: '1px solid var(--primary-color)', 
            padding: '2rem', 
            textAlign: 'center', 
            borderRadius: 'var(--radius-xl)',
            boxShadow: 'var(--shadow-teal)'
          }}
        >
          <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
            Low on Hearts?
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.98rem', marginBottom: '1.5rem', maxWidth: '600px', margin: '0 auto 1.5rem auto', lineHeight: '1.5' }}>
            Complete a free literacy practice drill to restore 1 heart and earn bonus XP!
          </p>
          <Link to="/practice-hub" className="btn btn-primary" style={{ padding: '0.85rem 2rem', fontWeight: '800', fontSize: '1rem', gap: '8px' }}>
            Practice for Free Hearts <ArrowRight size={18} />
          </Link>
        </div>
      )}
    </div>
  );
};

export default Shop;
