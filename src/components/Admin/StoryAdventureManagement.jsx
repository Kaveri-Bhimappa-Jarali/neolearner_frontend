import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { BookOpen, Compass, Plus, Edit, Trash2, X } from 'lucide-react';

const StoryAdventureManagement = () => {
  const [activeTab, setActiveTab] = useState('stories'); // 'stories' | 'adventures'
  const [stories, setStories] = useState([]);
  const [adventures, setAdventures] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState(null);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'stories') {
        const res = await api.get('/admin/stories');
        setStories(res.data);
      } else {
        const res = await api.get('/admin/adventures');
        setAdventures(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch stories/adventures:', err);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingItem(null);
    if (activeTab === 'stories') {
      setFormData({
        title: '',
        language_code: 'kn',
        cefr_level: 'A1',
        difficulty: 'Beginner',
        xp_reward: 30,
        story_json: '{\n  "scenes": []\n}'
      });
    } else {
      setFormData({
        title: '',
        scenario_code: '',
        target_language: 'Kannada',
        difficulty: 'Beginner',
        system_prompt: '',
        starting_message: ''
      });
    }
    setModalError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({ ...item });
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (itemId, title) => {
    if (!window.confirm(`Are you sure you want to delete '${title}'?`)) return;
    try {
      if (activeTab === 'stories') {
        await api.delete(`/admin/stories/${itemId}`);
      } else {
        await api.delete(`/admin/adventures/${itemId}`);
      }
      fetchData();
    } catch (err) {
      alert(`Deletion failed: ${err.response?.data?.detail || err.message}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setModalError(null);
    try {
      if (activeTab === 'stories') {
        if (editingItem) {
          await api.put(`/admin/stories/${editingItem.id}`, formData);
        } else {
          await api.post('/admin/stories', formData);
        }
      } else {
        if (editingItem) {
          await api.put(`/admin/adventures/${editingItem.id}`, formData);
        } else {
          await api.post('/admin/adventures', formData);
        }
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      setModalError(err.response?.data?.detail || err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card" style={{ padding: '1.5rem', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
      {/* Sub Header & Switcher */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '800', margin: '0 0 0.25rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Compass size={20} color="var(--primary-color)" /> Interactive Stories & Roleplay Adventures
          </h3>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Manage interactive immersion narratives, dialogue choices, and AI adventure roleplay scenarios.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{ background: 'var(--background)', padding: '4px', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', gap: '4px' }}>
            <button
              className={`btn ${activeTab === 'stories' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('stories')}
              style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem', borderRadius: '8px' }}
            >
              📖 Interactive Stories ({stories.length})
            </button>
            <button
              className={`btn ${activeTab === 'adventures' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('adventures')}
              style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem', borderRadius: '8px' }}
            >
              🧭 Text Adventures ({adventures.length})
            </button>
          </div>

          <button className="btn btn-primary" onClick={openCreateModal} style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Plus size={16} /> Add {activeTab === 'stories' ? 'Story' : 'Adventure'}
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading records...</div>
      ) : activeTab === 'stories' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
          {stories.map((story) => (
            <div key={story.id} style={{ padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--border-color)', background: 'var(--surface)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <span className="badge badge-purple">{story.cefr_level} ({story.difficulty})</span>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button className="btn btn-secondary" onClick={() => openEditModal(story)} style={{ padding: '4px 8px', fontSize: '0.75rem' }}>
                      <Edit size={13} color="#3b82f6" />
                    </button>
                    <button className="btn btn-secondary" onClick={() => handleDelete(story.id, story.title)} style={{ padding: '4px 8px', fontSize: '0.75rem' }}>
                      <Trash2 size={13} color="#ef4444" />
                    </button>
                  </div>
                </div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: '800', margin: '0 0 0.5rem' }}>{story.title}</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                  Language Code: {story.language_code}
                </p>
              </div>

              <div style={{ paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                <span style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>Reward: +{story.xp_reward} XP</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {adventures.map((adv) => (
            <div key={adv.id} style={{ padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--border-color)', background: 'var(--surface)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <span className="badge badge-blue">{adv.target_language} ({adv.difficulty})</span>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button className="btn btn-secondary" onClick={() => openEditModal(adv)} style={{ padding: '4px 8px', fontSize: '0.75rem' }}>
                      <Edit size={13} color="#3b82f6" />
                    </button>
                    <button className="btn btn-secondary" onClick={() => handleDelete(adv.id, adv.title)} style={{ padding: '4px 8px', fontSize: '0.75rem' }}>
                      <Trash2 size={13} color="#ef4444" />
                    </button>
                  </div>
                </div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: '800', margin: '0 0 0.5rem' }}>{adv.title}</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0 0 0.5rem' }}>{adv.starting_message}</p>
              </div>

              <div style={{ paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Code: <code>{adv.scenario_code}</code>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, padding: '1rem' }}>
          <div className="card" style={{ maxWidth: '600px', width: '100%', padding: '2rem', borderRadius: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '800', margin: 0 }}>
                {editingItem ? `Edit ${activeTab === 'stories' ? 'Story' : 'Adventure'}` : `Create New ${activeTab === 'stories' ? 'Story' : 'Adventure'}`}
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
                <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Title *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              {activeTab === 'stories' ? (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Language Code</label>
                      <input
                        type="text"
                        className="form-input"
                        value={formData.language_code || 'kn'}
                        onChange={(e) => setFormData({ ...formData, language_code: e.target.value })}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>CEFR Level</label>
                      <input
                        type="text"
                        className="form-input"
                        value={formData.cefr_level || 'A1'}
                        onChange={(e) => setFormData({ ...formData, cefr_level: e.target.value })}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>XP Reward</label>
                      <input
                        type="number"
                        className="form-input"
                        value={formData.xp_reward || 30}
                        onChange={(e) => setFormData({ ...formData, xp_reward: parseInt(e.target.value) || 30 })}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Story JSON Definition</label>
                    <textarea
                      className="form-input"
                      rows={5}
                      style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}
                      value={formData.story_json || ''}
                      onChange={(e) => setFormData({ ...formData, story_json: e.target.value })}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Scenario Code *</label>
                      <input
                        type="text"
                        required
                        className="form-input"
                        value={formData.scenario_code || ''}
                        onChange={(e) => setFormData({ ...formData, scenario_code: e.target.value })}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Target Language</label>
                      <input
                        type="text"
                        className="form-input"
                        value={formData.target_language || 'Kannada'}
                        onChange={(e) => setFormData({ ...formData, target_language: e.target.value })}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Difficulty</label>
                      <input
                        type="text"
                        className="form-input"
                        value={formData.difficulty || 'Beginner'}
                        onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Starting Message</label>
                    <textarea
                      className="form-input"
                      rows={2}
                      value={formData.starting_message || ''}
                      onChange={(e) => setFormData({ ...formData, starting_message: e.target.value })}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>System Prompt</label>
                    <textarea
                      className="form-input"
                      rows={3}
                      value={formData.system_prompt || ''}
                      onChange={(e) => setFormData({ ...formData, system_prompt: e.target.value })}
                    />
                  </div>
                </>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving} style={{ minWidth: '130px', fontWeight: 'bold' }}>
                  {saving ? 'Saving...' : editingItem ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default StoryAdventureManagement;
