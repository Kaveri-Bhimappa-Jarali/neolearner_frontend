import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

const ProfileDashboard = () => {
  const { user, setUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [languages, setLanguages] = useState([]);

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name,
        preferred_language_id: user.preferred_language?.id || '',
        target_language_id: user.target_language?.id || '',
        proficiency_level: user.proficiency_level,
      });
    }
    const fetchLanguages = async () => {
      try {
        const res = await api.get('/languages/');
        setLanguages(res.data);
      } catch (err) {
        console.error('Failed to fetch languages');
      }
    };
    fetchLanguages();
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const payload = {
        ...formData,
        preferred_language_id: formData.preferred_language_id || null,
        target_language_id: formData.target_language_id || null,
      };
      const res = await api.put('/learners/me', payload);
      setUser(res.data);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update profile", error);
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="profile-dashboard">
      <div className="profile-card" style={{ maxWidth: '100%' }}>
        <div className="profile-header">
          <div className="avatar-placeholder">
            {user.full_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 style={{ fontSize: '2rem', margin: 0 }}>{user.full_name}</h1>
            <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{user.email}</p>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            {!isEditing ? (
              <button className="btn btn-secondary" onClick={() => setIsEditing(true)}>Edit Profile</button>
            ) : (
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button className="btn btn-secondary" onClick={() => setIsEditing(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleSave}>Save</button>
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2rem' }}>
          <div>
            <h3 style={{ marginBottom: '1rem', color: 'var(--primary-color)' }}>Learning Settings</h3>
            
            <div className="form-group">
              <label className="form-label">Target Language</label>
              {isEditing ? (
                <select name="target_language_id" className="form-select" value={formData.target_language_id} onChange={handleChange}>
                  <option value="">Select Language</option>
                  {languages.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              ) : (
                <div style={{ padding: '0.875rem 0', fontWeight: 600 }}>
                  {user.target_language?.name || 'Not selected'}
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Proficiency Level</label>
              {isEditing ? (
                <select name="proficiency_level" className="form-select" value={formData.proficiency_level} onChange={handleChange}>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              ) : (
                <div style={{ padding: '0.875rem 0', fontWeight: 600 }}>
                  {user.proficiency_level}
                </div>
              )}
            </div>
            
            <div className="form-group">
              <label className="form-label">Interface Language</label>
              {isEditing ? (
                <select name="preferred_language_id" className="form-select" value={formData.preferred_language_id} onChange={handleChange}>
                  <option value="">Select Language</option>
                  {languages.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              ) : (
                <div style={{ padding: '0.875rem 0', fontWeight: 600 }}>
                  {user.preferred_language?.name || 'Not selected'}
                </div>
              )}
            </div>
          </div>
          
          <div>
            <h3 style={{ marginBottom: '1rem', color: 'var(--secondary-color)' }}>Statistics (Coming Soon)</h3>
            <div style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: 'var(--radius-md)', textAlign: 'center', border: '2px dashed var(--border-color)' }}>
              <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Complete lessons to see your progress here!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileDashboard;
