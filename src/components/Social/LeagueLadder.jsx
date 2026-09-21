import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../utils/i18n';
import { 
  Trophy, ArrowUp, ArrowDown, Sparkles, Award, 
  ChevronLeft, Flame, ShieldCheck, Clock
} from 'lucide-react';

const TIERS_LIST = [
  { name: 'Bronze', icon: '🥉', color: '#cd7f32' },
  { name: 'Silver', icon: '🥈', color: '#c0c0c0' },
  { name: 'Gold', icon: '🥇', color: '#ffd700' },
  { name: 'Sapphire', icon: '🔷', color: '#0f52ba' },
  { name: 'Ruby', icon: '♦️', color: '#e0115f' },
  { name: 'Emerald', icon: '❇️', color: '#50c878' },
  { name: 'Amethyst', icon: '🔮', color: '#9966cc' },
  { name: 'Pearl', icon: '⚪', color: '#eae0c8' },
  { name: 'Obsidian', icon: '🖤', color: '#2c2c2c' },
  { name: 'Diamond', icon: '💎', color: '#b9f2ff' }
];

const LeagueLadder = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [leagueData, setLeagueData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeague = async () => {
      setLoading(true);
      try {
        const res = await api.get('/leagues/current');
        setLeagueData(res.data);
      } catch (err) {
        console.error('Failed to load league data:', err);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchLeague();
  }, [user]);

  if (loading) {
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: '4rem' }}>
        <p style={{ color: 'var(--text-muted)' }}>{t('analyzingProfile')}</p>
      </div>
    );
  }

  const currentTier = TIERS_LIST[leagueData?.tier_index || 0];
  const members = leagueData?.members || [];

  const nextTierName = TIERS_LIST[Math.min(9, (leagueData?.tier_index || 0) + 1)].name;
  const prevTierName = TIERS_LIST[Math.max(0, (leagueData?.tier_index || 0) - 1)].name;

  return (
    <div className="page-container" style={{ maxWidth: '850px', margin: '0 auto', padding: '1.5rem 1rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button onClick={() => navigate('/dashboard')} className="btn btn-secondary" style={{ padding: '0.5rem 0.75rem' }}>
            <ChevronLeft size={18} />
          </button>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: currentTier.color, fontSize: '0.85rem', fontWeight: 'bold' }}>
              <Trophy size={16} /> {t('10-Tier Weekly Competitions')}
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: '800', margin: '0.25rem 0 0', color: 'var(--text-main)', lineHeight: '1.3' }}>
              {t(leagueData?.tier_name) || `${t(currentTier.name)} League`}
            </h1>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-subtle)', padding: '0.5rem 1rem', borderRadius: '14px', border: '1px solid var(--border-color)', fontWeight: 'bold', fontSize: '0.85rem' }}>
          <Clock size={16} /> {t('Days Left in Week', { days: leagueData?.days_remaining || 3 })}
        </div>
      </div>

      {/* Tier Progression Pills Ribbon */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
        {TIERS_LIST.map((tItem, idx) => {
          const isCurrent = idx === (leagueData?.tier_index || 0);
          return (
            <div 
              key={tItem.name}
              style={{
                padding: '0.5rem 0.85rem',
                borderRadius: '12px',
                background: isCurrent ? 'rgba(88, 204, 2, 0.15)' : 'var(--bg-subtle)',
                border: isCurrent ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                whiteSpace: 'nowrap',
                fontWeight: isCurrent ? '800' : '500',
                color: isCurrent ? 'var(--primary-color)' : 'var(--text-muted)'
              }}
            >
              <span>{tItem.icon}</span>
              <span style={{ fontSize: '0.85rem' }}>{t(tItem.name)}</span>
            </div>
          );
        })}
      </div>

      {/* Promotion / Demotion Rules Banner */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ padding: '0.75rem 1.25rem', background: 'rgba(88, 204, 2, 0.1)', border: '1px solid rgba(88, 204, 2, 0.3)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-color)', fontSize: '0.85rem', fontWeight: 'bold' }}>
          <ArrowUp size={16} /> {t('Top 5 Promote to {tier}', { tier: t(nextTierName) })}
        </div>
        <div style={{ padding: '0.75rem 1.25rem', background: 'rgba(255, 75, 75, 0.1)', border: '1px solid rgba(255, 75, 75, 0.3)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--error)', fontSize: '0.85rem', fontWeight: 'bold' }}>
          <ArrowDown size={16} /> {t('Bottom 5 Demote to {tier}', { tier: t(prevTierName) })}
        </div>
      </div>

      {/* Standings List */}
      <div className="card" style={{ padding: '0.5rem', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
        {members.map((m, idx) => {
          const isUser = m.is_user;
          const isPromoted = idx < 5;
          const isDemoted = idx >= members.length - 5;

          return (
            <div 
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.85rem 1.25rem',
                borderRadius: '14px',
                background: isUser ? 'rgba(88, 204, 2, 0.15)' : 'transparent',
                border: isUser ? '2px solid var(--primary-color)' : 'none',
                marginBottom: '4px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ 
                  fontWeight: '800', width: '28px', textAlign: 'center',
                  color: idx === 0 ? '#ffd700' : idx === 1 ? '#c0c0c0' : idx === 2 ? '#cd7f32' : 'var(--text-muted)' 
                }}>
                  {m.rank}
                </span>

                <div style={{ fontSize: '1.4rem' }}>{m.avatar}</div>

                <div>
                  <div style={{ fontWeight: isUser ? '800' : '600', color: isUser ? 'var(--primary-color)' : 'var(--text-main)', fontSize: '0.95rem', lineHeight: '1.4' }}>
                    {m.name}
                  </div>
                  {isPromoted && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--primary-color)', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                      <ArrowUp size={12} /> {t('Promotion Zone')}
                    </span>
                  )}
                  {isDemoted && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--error)', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                      <ArrowDown size={12} /> {t('Demotion Zone')}
                    </span>
                  )}
                </div>
              </div>

              <div style={{ fontWeight: '800', fontSize: '1.05rem', color: 'var(--text-main)' }}>
                {m.xp.toLocaleString()} XP
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};

export default LeagueLadder;
