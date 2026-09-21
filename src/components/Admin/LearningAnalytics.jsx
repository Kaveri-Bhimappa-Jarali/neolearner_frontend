import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { BarChart3, TrendingUp, CheckCircle2, Award, Flame } from 'lucide-react';

const LearningAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/analytics');
      setAnalytics(res.data);
    } catch (err) {
      console.error('Failed to load learning analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading analytics graphics...</div>;

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
        <div className="card" style={{ padding: '1.5rem', borderRadius: '18px', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>ASSESSMENT PASS RATE</div>
          <div style={{ fontSize: '2.2rem', fontWeight: '800', color: 'var(--primary-color)' }}>
            {analytics?.pass_rate_percentage}%
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Over {analytics?.total_assessments_taken} total quiz submissions</div>
        </div>

        <div className="card" style={{ padding: '1.5rem', borderRadius: '18px', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>ACTIVE STREAK ENGAGEMENT</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold', marginTop: '0.5rem' }}>
            🔥 7+ Days: {analytics?.streak_distribution['7_plus_days']} learners
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>1-3 Days: {analytics?.streak_distribution['1_to_3_days']} learners</div>
        </div>
      </div>

      <div className="card" style={{ padding: '1.5rem', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '1.25rem', color: 'var(--text-main)' }}>
          System-Wide 6-Skill Average Scores
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {Object.entries(analytics?.skill_averages || {}).map(([skill, val]) => (
            <div key={skill}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '4px' }}>
                <span style={{ textTransform: 'capitalize' }}>{skill}</span>
                <span style={{ color: 'var(--primary-color)' }}>{val}%</span>
              </div>
              <div style={{ height: '8px', background: 'var(--bg-subtle)', borderRadius: '9999px', overflow: 'hidden' }}>
                <div style={{ height: '100%', background: 'linear-gradient(90deg, #10b981, #3b82f6)', width: `${val}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LearningAnalytics;
