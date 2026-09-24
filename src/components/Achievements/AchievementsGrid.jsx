import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useTranslation } from '../../utils/i18n';
import { Award, Lock, CheckCircle2, Sparkles, Trophy, Gem, Zap } from 'lucide-react';
import Badge from '../ui/Badge';

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
    return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', fontWeight: '700' }}>Loading achievements...</div>;
  }

  const unlockedCount = achievements.filter(a => a.is_unlocked).length;

  return (
    <div className="card" style={{ padding: '2.25rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color)', background: 'var(--surface-card)', marginBottom: '2rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <Badge variant="purple" icon={Trophy}>Gamification & Milestones</Badge>
          <h2 style={{ fontSize: '1.85rem', fontWeight: '900', color: 'var(--text-main)', margin: '0.5rem 0 0' }}>
            Achievements & Badges
          </h2>
        </div>

        <Badge variant="gold" icon={Award}>
          {unlockedCount} / {achievements.length} Unlocked
        </Badge>
      </div>

      {claimMessage && (
        <div style={{ background: 'var(--success-bg)', border: '1px solid var(--success)', color: 'var(--success)', padding: '0.9rem 1.15rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontWeight: '800' }}>
          🎉 {claimMessage}
        </div>
      )}

      {/* Grid of Badges */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
        {achievements.map((ach) => {
          const progressPct = Math.min(100, Math.round((ach.progress / ach.threshold) * 100));

          return (
            <div
              key={ach.id}
              style={{
                padding: '1.5rem',
                borderRadius: 'var(--radius-lg)',
                background: ach.is_unlocked ? 'var(--surface)' : 'var(--background)',
                border: ach.is_unlocked ? '2px solid var(--accent-purple)' : '1px solid var(--border-color)',
                opacity: ach.is_unlocked ? 1 : 0.75,
                display: 'flex',
                flexDirection: 'column',
                justify: 'space-between',
                boxShadow: ach.is_unlocked ? '0 4px 16px rgba(139, 92, 246, 0.15)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div style={{ fontSize: '2.8rem', filter: ach.is_unlocked ? 'none' : 'grayscale(100%)' }}>
                    {ach.icon}
                  </div>
                  {ach.is_unlocked ? (
                    <Badge variant="green" size="small" icon={CheckCircle2}>UNLOCKED</Badge>
                  ) : (
                    <Badge variant="red" size="small" icon={Lock}>LOCKED</Badge>
                  )}
                </div>

                <h4 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-main)', margin: '0 0 0.4rem', lineHeight: '1.3' }}>
                  {ach.name}
                </h4>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: '0 0 1.25rem', lineHeight: '1.45' }}>
                  {ach.description}
                </p>
              </div>

              <div>
                {/* Progress Bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '800', marginBottom: '6px' }}>
                  <span>Progress</span>
                  <span>{ach.progress} / {ach.threshold}</span>
                </div>
                <div style={{ height: '8px', background: 'var(--border-color)', borderRadius: '9999px', overflow: 'hidden', marginBottom: '1rem' }}>
                  <div style={{
                    height: '100%', background: 'linear-gradient(90deg, var(--accent-purple), var(--secondary-color))',
                    width: `${progressPct}%`, transition: 'width 0.4s ease'
                  }} />
                </div>

                {/* Rewards Ribbon */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', gap: '8px', fontSize: '0.82rem', fontWeight: '800' }}>
                    <span style={{ color: 'var(--primary-color)' }}>+{ach.xp_reward} XP</span>
                    <span style={{ color: 'var(--accent-cyan)' }}>+{ach.gem_reward} 💎</span>
                  </div>

                  {ach.is_unlocked && (
                    <button
                      className="btn btn-primary"
                      onClick={() => handleClaim(ach.code)}
                      disabled={claimingCode === ach.code}
                      style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem', fontWeight: '800', borderRadius: 'var(--radius-sm)' }}
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
