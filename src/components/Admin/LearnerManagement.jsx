import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Search, Plus, Edit, Trash2, ShieldAlert, Award, UserCheck, Eye, X } from 'lucide-react';

const LearnerManagement = () => {
  const [learners, setLearners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLearner, setSelectedLearner] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLearner, setEditingLearner] = useState(null);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    age: 20,
    is_admin: false,
    proficiency_level: 'Beginner',
    cefr_level: 'A1',
    xp: 0,
    gems: 500,
    hearts: 5,
    streak: 0
  });
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState(null);

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

  const openCreateModal = () => {
    setEditingLearner(null);
    setFormData({
      full_name: '',
      email: '',
      password: '',
      age: 20,
      is_admin: false,
      proficiency_level: 'Beginner',
      cefr_level: 'A1',
      xp: 0,
      gems: 500,
      hearts: 5,
      streak: 0
    });
    setModalError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (learner) => {
    setEditingLearner(learner);
    setFormData({
      full_name: learner.full_name,
      email: learner.email,
      password: '',
      age: learner.age || 20,
      is_admin: learner.is_admin || false,
      proficiency_level: learner.proficiency_level || 'Beginner',
      cefr_level: learner.cefr_level || 'A1',
      xp: learner.xp || 0,
      gems: learner.gems || 500,
      hearts: learner.hearts || 5,
      streak: learner.streak || 0
    });
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleDeleteLearner = async (learnerId, name) => {
    if (!window.confirm(`Are you sure you want to delete learner '${name}'? All learning progress will be removed.`)) return;
    try {
      await api.delete(`/admin/learners/${learnerId}`);
      fetchLearners(searchTerm);
    } catch (err) {
      alert(`Failed to delete learner: ${err.response?.data?.detail || err.message}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setModalError(null);
    try {
      if (editingLearner) {
        const payload = { ...formData };
        if (!payload.password) delete payload.password;
        await api.put(`/admin/learners/${editingLearner.id}`, payload);
      } else {
        await api.post('/admin/learners', formData);
      }
      setIsModalOpen(false);
      fetchLearners(searchTerm);
    } catch (err) {
      setModalError(err.response?.data?.detail || err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {/* Search & Actions Bar */}
      <div className="card" style={{ padding: '1.25rem', borderRadius: '18px', marginBottom: '1.5rem', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem', flex: 1, minWidth: '280px' }}>
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
          <button type="submit" className="btn btn-secondary" style={{ padding: '0.6rem 1.25rem', fontWeight: 'bold' }}>
            Search
          </button>
        </form>

        <button className="btn btn-primary" onClick={openCreateModal} style={{ padding: '0.6rem 1.25rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Plus size={18} /> Add New Learner / Admin
        </button>
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
                  <th style={{ padding: '0.75rem' }}>Track</th>
                  <th style={{ padding: '0.75rem' }}>CEFR Level</th>
                  <th style={{ padding: '0.75rem' }}>Proficiency</th>
                  <th style={{ padding: '0.75rem' }}>XP / Streak</th>
                  <th style={{ padding: '0.75rem' }}>Role</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center' }}>Actions</th>
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
                    <td style={{ padding: '0.85rem', fontWeight: 'bold' }}>{l.cefr_level}</td>
                    <td style={{ padding: '0.85rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>{l.predicted_score}% ({l.proficiency_level})</td>
                    <td style={{ padding: '0.85rem' }}>{l.xp} XP | {l.streak}d 🔥</td>
                    <td style={{ padding: '0.85rem' }}>
                      <span className={`badge ${l.is_admin ? 'badge-purple' : 'badge-secondary'}`}>
                        {l.is_admin ? 'Admin' : 'Learner'}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                        <button className="btn btn-secondary" onClick={() => setSelectedLearner(l)} title="Inspect Profile" style={{ padding: '4px 8px' }}>
                          <Eye size={15} color="var(--primary-color)" />
                        </button>
                        <button className="btn btn-secondary" onClick={() => openEditModal(l)} title="Edit Learner" style={{ padding: '4px 8px' }}>
                          <Edit size={15} color="#3b82f6" />
                        </button>
                        <button className="btn btn-secondary" onClick={() => handleDeleteLearner(l.id, l.full_name)} title="Delete Learner" style={{ padding: '4px 8px' }}>
                          <Trash2 size={15} color="#ef4444" />
                        </button>
                      </div>
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

      {/* Create / Edit Learner Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, padding: '1rem' }}>
          <div className="card" style={{ maxWidth: '550px', width: '100%', padding: '2rem', borderRadius: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '800', margin: 0 }}>
                {editingLearner ? 'Edit Learner Account' : 'Create Learner / Admin Account'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {modalError && (
              <div style={{ background: 'rgba(239, 68, 68, 0.12)', border: '1px solid var(--error)', color: 'var(--error)', padding: '0.75rem 1rem', borderRadius: '12px', marginBottom: '1rem', fontSize: '0.85rem' }}>
                {modalError}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Full Name *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Email Address *</label>
                <input
                  type="email"
                  required
                  className="form-input"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>
                  {editingLearner ? 'Password (leave empty to keep unchanged)' : 'Password *'}
                </label>
                <input
                  type="password"
                  required={!editingLearner}
                  className="form-input"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Proficiency Level</label>
                  <select
                    className="form-input"
                    value={formData.proficiency_level}
                    onChange={(e) => setFormData({ ...formData, proficiency_level: e.target.value })}
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>CEFR Level</label>
                  <select
                    className="form-input"
                    value={formData.cefr_level}
                    onChange={(e) => setFormData({ ...formData, cefr_level: e.target.value })}
                  >
                    <option value="A0">A0</option>
                    <option value="A1">A1</option>
                    <option value="A2">A2</option>
                    <option value="B1">B1</option>
                    <option value="B2">B2</option>
                    <option value="C1">C1</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.5rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>XP</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.xp}
                    onChange={(e) => setFormData({ ...formData, xp: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>Gems</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.gems}
                    onChange={(e) => setFormData({ ...formData, gems: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>Hearts</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.hearts}
                    onChange={(e) => setFormData({ ...formData, hearts: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>Streak</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.streak}
                    onChange={(e) => setFormData({ ...formData, streak: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '0.5rem' }}>
                <input
                  type="checkbox"
                  id="is_admin"
                  checked={formData.is_admin}
                  onChange={(e) => setFormData({ ...formData, is_admin: e.target.checked })}
                />
                <label htmlFor="is_admin" style={{ fontSize: '0.9rem', fontWeight: 'bold', cursor: 'pointer' }}>
                  Grant Administrator Access (`is_admin`)
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving} style={{ minWidth: '130px', fontWeight: 'bold' }}>
                  {saving ? 'Saving...' : editingLearner ? 'Update Learner' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default LearnerManagement;

