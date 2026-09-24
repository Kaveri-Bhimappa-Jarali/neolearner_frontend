import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../utils/i18n';
import { 
  Trophy, ArrowUp, ArrowDown, Sparkles, Award, 
  ChevronLeft, Flame, ShieldCheck, Clock
} from 'lucide-react';
import Badge from '../ui/Badge';

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
        <p style={{ color: 'var(--text-muted)', fontWeight: '700' }}>Loading League Ladder...</p>
      </div>
    );
  }

  const currentTier = TIERS_LIST[leagueData?.tier_index || 0];
  const members = leagueData?.members || [];

  const nextTierName = TIERS_LIST[Math.min(9, (leagueData?.tier_index || 0) + 1)].name;
  const prevTierName = TIERS_LIST[Math.max(0, (leagueData?.tier_index || 0) - 1)].name;

  return (
    <div className="page-container" style={{ maxWidth: '900px', margin: '0 auto', padding: '1rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => navigate('/dashboard')} className="btn btn-secondary" style={{ padding: '0.55rem 0.85rem' }}>
            <ChevronLeft size={20} />
          </button>
          <div>
            <Badge variant="gold" icon={Trophy}>10-Tier Weekly League Competition</Badge>
            <h1 style={{ fontSize: '2.2rem', fontWeight: '900', margin: '0.4rem 0 0', color: 'var(--text-main)', lineHeight: '1.2' }}>
              {leagueData?.tier_name || `${currentTier.name} League`}
            </h1>
          </div>
        </div>

        <Badge variant="teal" icon={Clock}>
          {leagueData?.days_remaining || 3} Days Left
        </Badge>
      </div>

      {/* Tier Progression Pills Ribbon */}
      <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '1rem', marginBottom: '1.5rem', scrollbarWidth: 'thin' }}>
        {TIERS_LIST.map((tItem, idx) => {
          const isCurrent = idx === (leagueData?.tier_index || 0);
          return (
            <div 
              key={tItem.name}
              style={{
                padding: '0.65rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: isCurrent ? 'rgba(20, 184, 166, 0.15)' : 'var(--surface-card)',
                border: isCurrent ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                whiteSpace: 'nowrap',
                fontWeight: isCurrent ? '800' : '600',
                color: isCurrent ? 'var(--primary-color)' : 'var(--text-muted)'
              }}
            >
              <span style={{ fontSize: '1.1rem' }}>{tItem.icon}</span>
              <span style={{ fontSize: '0.88rem' }}>{tItem.name}</span>
            </div>
          );
        })}
      </div>

      {/* Promotion / Demotion Rules Banner */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ padding: '0.9rem 1.25rem', background: 'var(--success-bg)', border: '1px solid var(--success)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--success)', fontSize: '0.9rem', fontWeight: '800' }}>
          <ArrowUp size={18} /> Top 5 Promote to {nextTierName} League
        </div>
        <div style={{ padding: '0.9rem 1.25rem', background: 'var(--error-bg)', border: '1px solid var(--error)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--error)', fontSize: '0.9rem', fontWeight: '800' }}>
          <ArrowDown size={18} /> Bottom 5 Demote to {prevTierName} League
        </div>
      </div>

      {/* Standings List */}
      <div className="card" style={{ padding: '0.75rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color)', background: 'var(--surface-card)', boxShadow: 'var(--shadow-md)' }}>
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
                justify: 'space-between',
                padding: '0.95rem 1.35rem',
                borderRadius: 'var(--radius-lg)',
                background: isUser ? 'rgba(20, 184, 166, 0.18)' : 'var(--surface)',
                border: isUser ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
                marginBottom: '6px',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.15rem' }}>
                <span style={{ 
                  fontWeight: '900', width: '32px', textAlign: 'center', fontSize: '1.1rem',
                  color: idx === 0 ? '#ffd700' : idx === 1 ? '#c0c0c0' : idx === 2 ? '#cd7f32' : 'var(--text-muted)' 
                }}>
                  {m.rank}
                </span>

                <div style={{ fontSize: '1.6rem' }}>{m.avatar}</div>

                <div>
                  <div style={{ fontWeight: isUser ? '900' : '700', color: isUser ? 'var(--primary-color)' : 'var(--text-main)', fontSize: '1rem', lineHeight: '1.3' }}>
                    {m.name} {isUser && '(You)'}
                  </div>
                  {isPromoted && (
                    <span style={{ fontSize: '0.78rem', color: 'var(--success)', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <ArrowUp size={12} /> Promotion Zone
                    </span>
                  )}
                  {isDemoted && (
                    <span style={{ fontSize: '0.78rem', color: 'var(--error)', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <ArrowDown size={12} /> Demotion Zone
                    </span>
                  )}
                </div>
              </div>

              <div style={{ fontWeight: '900', fontSize: '1.1rem', color: 'var(--text-main)' }}>
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
