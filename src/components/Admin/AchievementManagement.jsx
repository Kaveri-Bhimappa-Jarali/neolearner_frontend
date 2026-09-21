import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Award, Trophy, Plus, Edit, Trash2, X } from 'lucide-react';

const AchievementManagement = () => {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAch, setEditingAch] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    icon: '🏆',
    category: 'general',
    threshold: 1,
    xp_reward: 50,
    gem_reward: 20
  });
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState(null);

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

  const openCreateModal = () => {
    setEditingAch(null);
    setFormData({
      code: '',
      name: '',
      description: '',
      icon: '🏆',
      category: 'general',
      threshold: 1,
      xp_reward: 50,
      gem_reward: 20
    });
    setModalError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (ach) => {
    setEditingAch(ach);
    setFormData({
      code: ach.code,
      name: ach.name,
      description: ach.description,
      icon: ach.icon || '🏆',
      category: ach.category || 'general',
      threshold: ach.threshold || 1,
      xp_reward: ach.xp_reward || 50,
      gem_reward: ach.gem_reward || 20
    });
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleDeleteAchievement = async (achId, name) => {
    if (!window.confirm(`Are you sure you want to delete achievement definition '${name}'?`)) return;
    try {
      await api.delete(`/admin/achievements/${achId}`);
      fetchAchievements();
    } catch (err) {
      alert(`Failed to delete achievement: ${err.response?.data?.detail || err.message}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setModalError(null);
    try {
      if (editingAch) {
        await api.put(`/admin/achievements/${editingAch.id}`, formData);
      } else {
        await api.post('/admin/achievements', formData);
      }
      setIsModalOpen(false);
      fetchAchievements();
    } catch (err) {
      setModalError(err.response?.data?.detail || err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card" style={{ padding: '1.5rem', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', margin: '0 0 0.25rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award size={20} color="var(--primary-color)" /> Gamification Badge Definitions & Reward Rules
          </h3>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Configure achievement criteria, threshold targets, XP rewards, and gem prizes.
          </p>
        </div>

        <button className="btn btn-primary" onClick={openCreateModal} style={{ padding: '0.6rem 1.25rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Plus size={18} /> Add New Badge
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading achievement definitions...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {achievements.map((ach) => (
            <div key={ach.id} style={{ padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--border-color)', background: 'var(--surface)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <div style={{ fontSize: '2.4rem' }}>{ach.icon}</div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button className="btn btn-secondary" onClick={() => openEditModal(ach)} style={{ padding: '4px 8px', fontSize: '0.75rem' }} title="Edit Badge">
                      <Edit size={13} color="#3b82f6" />
                    </button>
                    <button className="btn btn-secondary" onClick={() => handleDeleteAchievement(ach.id, ach.name)} style={{ padding: '4px 8px', fontSize: '0.75rem' }} title="Delete Badge">
                      <Trash2 size={13} color="#ef4444" />
                    </button>
                  </div>
                </div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: '800', margin: '0 0 0.35rem' }}>{ach.name}</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0 0 0.85rem' }}>{ach.description}</p>
              </div>

              <div style={{ paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                <span style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>
                  Unlocked by {ach.unlocked_by_learners_count} Learners
                </span>
                <span className="badge badge-purple">
                  +{ach.xp_reward} XP | +{ach.gem_reward} 💎
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE / EDIT ACHIEVEMENT MODAL */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, padding: '1rem' }}>
          <div className="card" style={{ maxWidth: '550px', width: '100%', padding: '2rem', borderRadius: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '800', margin: 0 }}>
                {editingAch ? 'Edit Achievement Badge' : 'Create Achievement Badge'}
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
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Achievement Name *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Badge Icon</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Unique Code *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Category</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Description *</label>
                <textarea
                  className="form-input"
                  rows={2}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>Target Threshold</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.threshold}
                    onChange={(e) => setFormData({ ...formData, threshold: parseInt(e.target.value) || 1 })}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>XP Reward</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.xp_reward}
                    onChange={(e) => setFormData({ ...formData, xp_reward: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>Gem Reward</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.gem_reward}
                    onChange={(e) => setFormData({ ...formData, gem_reward: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving} style={{ minWidth: '130px', fontWeight: 'bold' }}>
                  {saving ? 'Saving...' : editingAch ? 'Update Badge' : 'Create Badge'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AchievementManagement;

