import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useTranslation } from '../../utils/i18n';
import { Award, Lock, CheckCircle2, Sparkles, Trophy, Gem, Zap } from 'lucide-react';

const AchievementsGrid = () => {
  const { t } = useTranslation();
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [claimingCode, setClaimingCode] = useState(null);
  const [claimMessage, setClaimMessage] = useState(null);

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    setLoading(true);
    try {
      const res = await api.get('/achievements/me');
      setAchievements(res.data);
    } catch (err) {
      console.error('Failed to load achievements:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async (code) => {
    setClaimingCode(code);
    setClaimMessage(null);
    try {
      const res = await api.post(`/achievements/claim/${code}`);
      setClaimMessage(res.data.message);
      fetchAchievements();
    } catch (err) {
      console.error('Failed to claim reward:', err);
    } finally {
      setClaimingCode(null);
    }
  };

  if (loading) {
    return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>{t('analyzingProfile')}</div>;
  }

  const unlockedCount = achievements.filter(a => a.is_unlocked).length;

  return (
    <div className="card" style={{ padding: '2rem', borderRadius: '24px', border: '1px solid var(--border-color)', marginBottom: '2rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--accent-purple)', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
            <Trophy size={16} /> GAMIFICATION & BADGES
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>
            {t('achievements')} & Badges
          </h2>
        </div>

        <div style={{ background: 'rgba(153, 102, 204, 0.15)', border: '1px solid var(--accent-purple)', padding: '0.6rem 1.25rem', borderRadius: '16px', fontWeight: '800', color: 'var(--accent-purple)', fontSize: '0.9rem' }}>
          🏆 {unlockedCount} / {achievements.length} Unlocked
        </div>
      </div>

      {claimMessage && (
        <div style={{ background: 'rgba(88, 204, 2, 0.15)', border: '1px solid var(--primary-color)', color: 'var(--primary-color)', padding: '0.85rem 1rem', borderRadius: '12px', marginBottom: '1.5rem', fontWeight: 'bold' }}>
          🎉 {claimMessage}
        </div>
      )}

      {/* Grid of Badges */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
        {achievements.map((ach) => {
          const progressPct = Math.min(100, Math.round((ach.progress / ach.threshold) * 100));

          return (
            <div
              key={ach.id}
              style={{
                padding: '1.25rem',
                borderRadius: '18px',
                background: ach.is_unlocked ? 'var(--surface)' : 'var(--bg-subtle)',
                border: ach.is_unlocked ? '2px solid var(--accent-purple)' : '1px solid var(--border-color)',
                opacity: ach.is_unlocked ? 1 : 0.75,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'transform 0.2s ease'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
                  <div style={{ fontSize: '2.5rem', filter: ach.is_unlocked ? 'none' : 'grayscale(100%)' }}>
                    {ach.icon}
                  </div>
                  {ach.is_unlocked ? (
                    <span style={{ padding: '3px 8px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 'bold', background: 'rgba(88, 204, 2, 0.15)', color: 'var(--primary-color)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle2 size={12} /> UNLOCKED
                    </span>
                  ) : (
                    <span style={{ padding: '3px 8px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 'bold', background: 'var(--border-color)', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Lock size={12} /> LOCKED
                    </span>
                  )}
                </div>

                <h4 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-main)', margin: '0 0 0.35rem', lineHeight: '1.3' }}>
                  {ach.name}
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0 0 1rem', lineHeight: '1.4' }}>
                  {ach.description}
                </p>
              </div>

              <div>
                {/* Progress Bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'bold', marginBottom: '4px' }}>
                  <span>Progress</span>
                  <span>{ach.progress} / {ach.threshold}</span>
                </div>
                <div style={{ height: '8px', background: 'var(--border-color)', borderRadius: '9999px', overflow: 'hidden', marginBottom: '0.85rem' }}>
                  <div style={{
                    height: '100%', background: 'linear-gradient(90deg, #9966cc, #3b82f6)',
                    width: `${progressPct}%`, transition: 'width 0.4s ease'
                  }} />
                </div>

                {/* Rewards Ribbon */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', gap: '8px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                    <span style={{ color: '#58cc02' }}>+{ach.xp_reward} XP</span>
                    <span style={{ color: '#1cb0f6' }}>+{ach.gem_reward} 💎</span>
                  </div>

                  {ach.is_unlocked && (
                    <button
                      className="btn btn-primary"
                      onClick={() => handleClaim(ach.code)}
                      disabled={claimingCode === ach.code}
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', fontWeight: 'bold', borderRadius: '8px' }}
                    >
                      {claimingCode === ach.code ? 'Claiming...' : 'Claim Reward'}
                    </button>
                  )}
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};

export default AchievementsGrid;
