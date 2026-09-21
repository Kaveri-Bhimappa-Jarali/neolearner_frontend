import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Search, UserCheck, ShieldAlert, Award, BookOpen, Clock } from 'lucide-react';

const LearnerManagement = () => {
  const [learners, setLearners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLearner, setSelectedLearner] = useState(null);

  useEffect(() => {
    fetchLearners();
  }, []);

  const fetchLearners = async (query = '') => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/learners?q=${query}`);
      setLearners(res.data);
    } catch (err) {
      console.error('Failed to fetch learners list:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchLearners(searchTerm);
  };

  return (
    <div>
      {/* Search Bar */}
      <div className="card" style={{ padding: '1.25rem', borderRadius: '18px', marginBottom: '1.5rem', border: '1px solid var(--border-color)' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Search learners by name or email address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '40px' }}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ padding: '0.6rem 1.5rem', fontWeight: 'bold' }}>
            Search Learners
          </button>
        </form>
      </div>

      {/* Learners Table */}
      <div className="card" style={{ padding: '1.5rem', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '1.25rem', color: 'var(--text-main)' }}>
          Registered Learners Directory ({learners.length})
        </h3>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading learners database...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '0.75rem' }}>Learner Name</th>
                  <th style={{ padding: '0.75rem' }}>Email</th>
                  <th style={{ padding: '0.75rem' }}>Target Track</th>
                  <th style={{ padding: '0.75rem' }}>CEFR Level</th>
                  <th style={{ padding: '0.75rem' }}>Predicted Score</th>
                  <th style={{ padding: '0.75rem' }}>XP / Streak</th>
                  <th style={{ padding: '0.75rem' }}>Role</th>
                  <th style={{ padding: '0.75rem' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {learners.map((l) => (
                  <tr key={l.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.85rem', fontWeight: 'bold', color: 'var(--text-main)' }}>{l.full_name}</td>
                    <td style={{ padding: '0.85rem', color: 'var(--text-muted)' }}>{l.email}</td>
                    <td style={{ padding: '0.85rem' }}>
                      <span className="badge badge-blue">{l.target_language}</span>
                    </td>
                    <td style={{ padding: '0.85rem', fontWeight: 'bold' }}>{l.cefr_level} ({l.proficiency_level})</td>
                    <td style={{ padding: '0.85rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>{l.predicted_score}%</td>
                    <td style={{ padding: '0.85rem' }}>{l.xp} XP | {l.streak}d 🔥</td>
                    <td style={{ padding: '0.85rem' }}>
                      <span className={`badge ${l.is_admin ? 'badge-purple' : 'badge-secondary'}`}>
                        {l.is_admin ? 'Admin' : 'Learner'}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem' }}>
                      <button
                        className="btn btn-secondary"
                        onClick={() => setSelectedLearner(l)}
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Profile Inspector Modal */}
      {selectedLearner && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, padding: '1rem' }}>
          <div className="card" style={{ maxWidth: '600px', width: '100%', padding: '2rem', borderRadius: '20px' }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '1rem' }}>Learner Profile: {selectedLearner.full_name}</h3>
            <p><strong>Email:</strong> {selectedLearner.email}</p>
            <p><strong>Target Language:</strong> {selectedLearner.target_language}</p>
            <p><strong>CEFR & Benchmark:</strong> {selectedLearner.cefr_level} — {selectedLearner.benchmark_level}</p>
            <p><strong>Predicted Proficiency Index:</strong> {selectedLearner.predicted_score}%</p>
            <p><strong>Lessons Completed:</strong> {selectedLearner.completed_lessons_count}</p>
            <p><strong>Strengths:</strong> {selectedLearner.strengths.join(', ') || 'Reading'}</p>
            <p><strong>Weak Areas:</strong> {selectedLearner.weak_areas.join(', ') || 'None'}</p>
            <button className="btn btn-primary" onClick={() => setSelectedLearner(null)} style={{ marginTop: '1.5rem', width: '100%' }}>
              Close Profile
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default LearnerManagement;
