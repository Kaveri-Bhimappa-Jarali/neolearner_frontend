import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Award, Trophy, Users, CheckCircle2 } from 'lucide-react';

const AchievementManagement = () => {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/achievements');
      setAchievements(res.data);
    } catch (err) {
      console.error('Failed to load admin achievements:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ padding: '1.5rem', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
      <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '1.25rem', color: 'var(--text-main)' }}>
        Gamification Badge Definitions & Unlock Statistics
      </h3>

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading achievement definitions...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
          {achievements.map((ach) => (
            <div key={ach.id} style={{ padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--border-color)', background: 'var(--surface)' }}>
              <div style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>{ach.icon}</div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: '800', margin: '0 0 0.35rem' }}>{ach.name}</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0 0 0.85rem' }}>{ach.description}</p>
              <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                Unlocked by {ach.unlocked_by_learners_count} Learners
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AchievementManagement;
