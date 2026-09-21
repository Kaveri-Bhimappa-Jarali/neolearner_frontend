import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { useTranslation } from '../../utils/i18n';

const ProfileDashboard = () => {
  const { user, setUser } = useAuth();
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [languages, setLanguages] = useState([]);
  const [achievements, setAchievements] = useState([]);

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name,
        age: user.age || '',
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
    const fetchAchievements = async () => {
      try {
        const res = await api.get('/learners/achievements');
        setAchievements(res.data);
      } catch (err) {
        console.error('Failed to fetch achievements');
      }
    };
    fetchLanguages();
    if (user) {
      fetchAchievements();
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const payload = {
        ...formData,
        age: formData.age ? parseInt(formData.age, 10) : null,
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

  if (!user) return <div style={{ padding: '3rem', textAlign: 'center' }}>{t('analyzingProfile')}</div>;

  return (
    <div className="profile-dashboard page-container">
      <div className="profile-card" style={{ maxWidth: '100%' }}>
        <div className="profile-header" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
          <div className="avatar-placeholder" style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--primary-color)', color: '#fff', fontSize: '1.75rem', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {user.full_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 style={{ fontSize: '2rem', margin: 0, lineHeight: '1.3' }}>{user.full_name}</h1>
            <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{user.email}</p>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            {!isEditing ? (
              <button className="btn btn-secondary" onClick={() => setIsEditing(true)}>{t('editProfile')}</button>
            ) : (
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button className="btn btn-secondary" onClick={() => setIsEditing(false)}>{t('cancel')}</button>
                <button className="btn btn-primary" onClick={handleSave}>{t('save')}</button>
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', marginTop: '2rem' }}>
          <div>
            <h3 style={{ marginBottom: '1rem', color: 'var(--primary-color)', fontWeight: '800' }}>{t('settingsTitle')}</h3>
            
            <div className="form-group">
              <label className="form-label">Age</label>
              {isEditing ? (
                <input 
                  name="age" 
                  type="number" 
                  min="4" 
                  max="120" 
                  className="form-input" 
                  value={formData.age} 
                  onChange={handleChange} 
                  placeholder="e.g. 21"
                />
              ) : (
                <div style={{ padding: '0.875rem 0', fontWeight: 600 }}>
                  {user.age ? `${user.age} years old` : 'Not specified'}
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">{t('targetLang')}</label>
              {isEditing ? (
                <select name="target_language_id" className="form-select" value={formData.target_language_id} onChange={handleChange}>
                  <option value="">Select Language</option>
                  {languages.map(l => <option key={l.id} value={l.id}>{t(l.name)} ({l.native_name || l.code})</option>)}
                </select>
              ) : (
                <div style={{ padding: '0.875rem 0', fontWeight: 600 }}>
                  {t(user.target_language?.name) || 'Not selected'}
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">{t('profLevel')}</label>
              {isEditing ? (
                <select name="proficiency_level" className="form-select" value={formData.proficiency_level} onChange={handleChange}>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              ) : (
                <div style={{ padding: '0.875rem 0', fontWeight: 600 }}>
                  {t(user.proficiency_level) || user.proficiency_level}
                </div>
              )}
            </div>
            
            <div className="form-group">
              <label className="form-label">{t('prefLang')}</label>
              {isEditing ? (
                <select name="preferred_language_id" className="form-select" value={formData.preferred_language_id} onChange={handleChange}>
                  <option value="">Select Language</option>
                  {languages.map(l => <option key={l.id} value={l.id}>{t(l.name)} ({l.native_name || l.code})</option>)}
                </select>
              ) : (
                <div style={{ padding: '0.875rem 0', fontWeight: 600 }}>
                  {t(user.preferred_language?.name) || 'Not selected'}
                </div>
              )}
            </div>
          </div>
          
          <div>
            <h3 style={{ marginBottom: '1rem', color: 'var(--secondary-color)', fontWeight: '800' }}>{t('myStats')}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ background: 'var(--surface-hover)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <span style={{ display: 'block', fontSize: '1.5rem', fontWeight: 'bold', color: '#ff9600' }}>{user.streak} 🔥</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t('dayStreak')}</span>
              </div>
              <div style={{ background: 'var(--surface-hover)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <span style={{ display: 'block', fontSize: '1.5rem', fontWeight: 'bold', color: '#58cc02' }}>{user.xp} XP</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t('xpEarned')}</span>
              </div>
              <div style={{ background: 'var(--surface-hover)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <span style={{ display: 'block', fontSize: '1.5rem', fontWeight: 'bold', color: '#1cb0f6' }}>{user.gems} 💎</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Gems</span>
              </div>
              <div style={{ background: 'var(--surface-hover)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <span style={{ display: 'block', fontSize: '1.5rem', fontWeight: 'bold', color: '#ff4b4b' }}>{user.hearts} / 5 ❤️</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Hearts</span>
              </div>
            </div>

            <h3 style={{ marginBottom: '1rem', color: 'var(--accent-purple)', fontWeight: '800' }}>{t('achievements')}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {achievements.length === 0 ? (
                <div style={{ background: 'var(--surface-hover)', padding: '1rem', borderRadius: 'var(--radius-md)', textAlign: 'center', border: '1px dashed var(--border-color)' }}>
                  <p style={{ color: 'var(--text-muted)' }}>No achievements computed yet.</p>
                </div>
              ) : (
                achievements.map(ach => (
                  <div key={ach.id} style={{ 
                    background: 'var(--surface-hover)', padding: '1.25rem', borderRadius: 'var(--radius-md)', 
                    border: '1px solid var(--border-color)'
                  }}>
                    <h4 style={{ color: 'var(--text-main)', fontSize: '1rem', marginBottom: '0.25rem', lineHeight: '1.3' }}>{t(ach.name)}</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.75rem', lineHeight: '1.4' }}>{t(ach.description)}</p>
                    
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                      {ach.tiers.map((tItem, idx) => (
                        <span 
                          key={idx} 
                          className={`badge ${tItem.unlocked ? 'badge-purple' : 'badge-secondary'}`}
                          style={{ 
                            fontSize: '0.7rem', 
                            opacity: tItem.unlocked ? 1 : 0.45,
                            border: tItem.unlocked ? 'none' : '1px dashed var(--border-color)'
                          }}
                        >
                          🏅 {tItem.label} (Needs {tItem.target})
                        </span>
                      ))}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                      <span>Progress</span>
                      <span>{ach.progress}</span>
                    </div>
                    
                    <div style={{ height: '6px', background: 'var(--background)', borderRadius: '9999px', overflow: 'hidden' }}>
                      <div style={{ 
                        height: '100%', 
                        background: 'var(--accent-purple)', 
                        width: `${Math.min(100, (ach.progress / ach.tiers[ach.tiers.length - 1].target) * 100)}%`,
                        transition: 'width 0.4s ease'
                      }} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileDashboard;
