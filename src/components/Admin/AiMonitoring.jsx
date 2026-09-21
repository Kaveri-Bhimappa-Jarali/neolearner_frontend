import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Sparkles, Brain, CheckCircle2, Clock } from 'lucide-react';

const AiMonitoring = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/ai-monitoring');
      setLogs(res.data.recommendation_logs || []);
    } catch (err) {
      console.error('Failed to load AI monitoring logs:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ padding: '1.5rem', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
      <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '1.25rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Sparkles size={20} color="var(--accent-purple)" /> AI Recommendation & Proficiency Prediction Logs
      </h3>

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading AI monitoring logs...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {logs.map((log) => (
            <div key={log.id} style={{ padding: '1rem', borderRadius: '14px', border: '1px solid var(--border-color)', background: 'var(--surface)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                <strong style={{ color: 'var(--primary-color)' }}>Learner: {log.learner_name}</strong>
                <span style={{ color: 'var(--text-muted)' }}>{new Date(log.created_at).toLocaleString()}</span>
              </div>
              <div style={{ fontWeight: '700', fontSize: '0.95rem', marginBottom: '4px' }}>
                Recommended Course: {log.recommended_course} (Priority {log.priority})
              </div>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                💡 Reason: {log.reason}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AiMonitoring;
