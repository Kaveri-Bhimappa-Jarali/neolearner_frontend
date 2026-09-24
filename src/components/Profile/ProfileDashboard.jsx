import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { useTranslation } from '../../utils/i18n';
import { User, Globe, Target, Award, Clock, Flame, Zap, Shield, CheckCircle2, AlertCircle, Edit3, Save, X } from 'lucide-react';

const ProfileDashboard = () => {
  const { user, setUser } = useAuth();
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [languages, setLanguages] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (user) {
      const prefId = user.preferred_language?.id || user.preferred_language_id || '';
      const targetId = user.target_language?.id || user.target_language_id || '';
      setFormData({
        full_name: user.full_name || '',
        age: user.age ? String(user.age) : '',
        preferred_language_id: String(prefId),
        target_language_id: String(targetId),
        proficiency_level: user.proficiency_level || 'Beginner',
        learning_goal: user.learning_goal || 'conversation',
        daily_minutes_goal: user.daily_minutes_goal ? String(user.daily_minutes_goal) : '15'
      });
    }

    const fetchLanguages = async () => {
      try {
        const res = await api.get('/languages/');
        const list = Array.isArray(res.data) ? res.data : (res.data?.languages || []);
        setLanguages(list);
      } catch (err) {
        console.error('Failed to fetch languages', err);
      }
    };

    const fetchAchievements = async () => {
      try {
        const res = await api.get('/learners/achievements');
        setAchievements(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error('Failed to fetch achievements', err);
      }
    };

    fetchLanguages();
    if (user) {
      fetchAchievements();
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!formData.full_name || !formData.full_name.trim()) {
      setError('Full Name cannot be empty');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        full_name: formData.full_name.trim(),
        age: formData.age ? parseInt(formData.age, 10) : null,
        preferred_language_id: formData.preferred_language_id || null,
        target_language_id: formData.target_language_id || null,
        proficiency_level: formData.proficiency_level || 'Beginner',
        learning_goal: formData.learning_goal || 'conversation',
        daily_minutes_goal: formData.daily_minutes_goal ? parseInt(formData.daily_minutes_goal, 10) : 15
      };

      const res = await api.put('/learners/me', payload);
      setUser(res.data);
      setIsEditing(false);
      setSuccessMsg('Profile updated successfully! ✨');
    } catch (err) {
      console.error("Failed to update profile", err);
      const detailMsg = err.response?.data?.detail || 'Failed to update profile. Please try again.';
      setError(detailMsg);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div style={{ padding: '4rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>{t('analyzingProfile')}</div>;

  return (
    <div className="profile-dashboard page-container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '1.5rem 1rem' }}>
      
      {/* Profile Card Header */}
      <div className="card" style={{ padding: '2rem', borderRadius: '24px', marginBottom: '2rem', boxShadow: '0 8px 30px rgba(0,0,0,0.06)' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.25rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{
              width: '72px', height: '72px', borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--primary-color), #3b82f6)',
              color: '#ffffff', fontSize: '2rem', fontWeight: '900',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)'
            }}>
              {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h1 style={{ fontSize: '2rem', fontWeight: '800', margin: 0, color: 'var(--text-main)', lineHeight: '1.2' }}>
                {user.full_name}
              </h1>
              <p style={{ color: 'var(--text-muted)', margin: '4px 0 0', fontWeight: '600', fontSize: '0.95rem' }}>
                {user.email}
              </p>
            </div>
          </div>

          <div>
            {!isEditing ? (
              <button 
                className="btn btn-primary" 
                onClick={() => { setIsEditing(true); setError(''); setSuccessMsg(''); }}
                style={{ padding: '0.65rem 1.4rem', fontWeight: '700', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Edit3 size={16} /> {t('editProfile')}
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button 
                  type="button"
                  className="btn btn-secondary" 
                  onClick={() => { setIsEditing(false); setError(''); }}
                  style={{ padding: '0.65rem 1.25rem', fontWeight: '600', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <X size={16} /> {t('cancel')}
                </button>
                <button 
                  type="button"
                  className="btn btn-primary" 
                  onClick={handleSave}
                  disabled={loading}
                  style={{ padding: '0.65rem 1.4rem', fontWeight: '700', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Save size={16} /> {loading ? 'Saving...' : t('save')}
                </button>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div style={{ padding: '0.85rem 1rem', background: '#ffebee', color: '#c62828', borderRadius: '12px', marginBottom: '1.25rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={18} /> {error}
          </div>
        )}

        {successMsg && (
          <div style={{ padding: '0.85rem 1rem', background: '#e8f5e9', color: '#2e7d32', borderRadius: '12px', marginBottom: '1.25rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={18} /> {successMsg}
          </div>
        )}

        {/* Main Form & Information View */}
        <form onSubmit={handleSave}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
            
            {/* Column 1: Personal Details */}
            <div style={{ background: 'var(--bg-subtle)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--primary-color)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={20} /> Personal Info
              </h3>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label" style={{ fontWeight: '700', fontSize: '0.85rem', color: 'var(--text-main)', display: 'block', marginBottom: '4px' }}>Full Name *</label>
                {isEditing ? (
                  <input 
                    name="full_name" 
                    type="text" 
                    className="form-input" 
                    value={formData.full_name || ''} 
                    onChange={handleChange} 
                    required
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}
                  />
                ) : (
                  <div style={{ padding: '0.5rem 0', fontWeight: '700', color: 'var(--text-main)', fontSize: '1.05rem' }}>
                    {user.full_name}
                  </div>
                )}
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label" style={{ fontWeight: '700', fontSize: '0.85rem', color: 'var(--text-main)', display: 'block', marginBottom: '4px' }}>Age</label>
                {isEditing ? (
                  <input 
                    name="age" 
                    type="number" 
                    min="4" 
                    max="120" 
                    className="form-input" 
                    value={formData.age || ''} 
                    onChange={handleChange} 
                    placeholder="e.g. 21"
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}
                  />
                ) : (
                  <div style={{ padding: '0.5rem 0', fontWeight: '600', color: 'var(--text-muted)' }}>
                    {user.age ? `${user.age} years old` : 'Not specified'}
                  </div>
                )}
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label" style={{ fontWeight: '700', fontSize: '0.85rem', color: 'var(--text-main)', display: 'block', marginBottom: '4px' }}>Daily Goal (Minutes)</label>
                {isEditing ? (
                  <select name="daily_minutes_goal" className="form-select" value={formData.daily_minutes_goal || '15'} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                    <option value="5">⚡ 5 mins/day (Casual)</option>
                    <option value="15">🔥 15 mins/day (Regular)</option>
                    <option value="30">🚀 30 mins/day (Serious)</option>
                    <option value="60">🏆 60 mins/day (Intensive)</option>
                  </select>
                ) : (
                  <div style={{ padding: '0.5rem 0', fontWeight: '600', color: 'var(--text-muted)' }}>
                    {user.daily_minutes_goal || 15} minutes / day
                  </div>
                )}
              </div>
            </div>

            {/* Column 2: Language & Learning Goals */}
            <div style={{ background: 'var(--bg-subtle)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#1cb0f6', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Globe size={20} /> Language Preferences
              </h3>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label" style={{ fontWeight: '700', fontSize: '0.85rem', color: 'var(--text-main)', display: 'block', marginBottom: '4px' }}>{t('targetLang')}</label>
                {isEditing ? (
                  <select name="target_language_id" className="form-select" value={formData.target_language_id || ''} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                    <option value="">Select Target Language</option>
                    {languages.map(l => (
                      <option key={l.id} value={l.id}>{l.name} ({l.native_name || l.code})</option>
                    ))}
                  </select>
                ) : (
                  <div style={{ padding: '0.5rem 0', fontWeight: '700', color: '#1cb0f6' }}>
                    🌐 {user.target_language?.name || 'Not selected'}
                  </div>
                )}
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label" style={{ fontWeight: '700', fontSize: '0.85rem', color: 'var(--text-main)', display: 'block', marginBottom: '4px' }}>{t('prefLang')}</label>
                {isEditing ? (
                  <select name="preferred_language_id" className="form-select" value={formData.preferred_language_id || ''} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                    <option value="">Select Native Language</option>
                    {languages.map(l => (
                      <option key={l.id} value={l.id}>{l.name} ({l.native_name || l.code})</option>
                    ))}
                  </select>
                ) : (
                  <div style={{ padding: '0.5rem 0', fontWeight: '600', color: 'var(--text-muted)' }}>
                    🗣️ {user.preferred_language?.name || 'English'}
                  </div>
                )}
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label" style={{ fontWeight: '700', fontSize: '0.85rem', color: 'var(--text-main)', display: 'block', marginBottom: '4px' }}>{t('profLevel')}</label>
                {isEditing ? (
                  <select name="proficiency_level" className="form-select" value={formData.proficiency_level || 'Beginner'} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                    <option value="Beginner">Beginner (A0 - A1)</option>
                    <option value="Intermediate">Intermediate (A2 - B1)</option>
                    <option value="Advanced">Advanced (B2 - C2)</option>
                  </select>
                ) : (
                  <div style={{ padding: '0.5rem 0', fontWeight: '600', color: 'var(--primary-color)' }}>
                    🏆 {user.proficiency_level || 'Beginner'} ({user.cefr_level || 'A1'})
                  </div>
                )}
              </div>
            </div>

          </div>
        </form>
      </div>

      {/* Stats & Gamification Overview */}
      <div className="card" style={{ padding: '2rem', borderRadius: '24px', marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1.25rem', color: 'var(--secondary-color)', fontWeight: '800', fontSize: '1.3rem' }}>
          {t('myStats')}
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
          <div style={{ background: 'var(--surface-hover)', padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
            <span style={{ display: 'block', fontSize: '1.75rem', fontWeight: '900', color: '#ff9600' }}>{user.streak} 🔥</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>{t('dayStreak')}</span>
          </div>
          <div style={{ background: 'var(--surface-hover)', padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
            <span style={{ display: 'block', fontSize: '1.75rem', fontWeight: '900', color: '#58cc02' }}>{user.xp} XP</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>{t('xpEarned')}</span>
          </div>
          <div style={{ background: 'var(--surface-hover)', padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
            <span style={{ display: 'block', fontSize: '1.75rem', fontWeight: '900', color: '#1cb0f6' }}>{user.gems} 💎</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>Gems</span>
          </div>
          <div style={{ background: 'var(--surface-hover)', padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
            <span style={{ display: 'block', fontSize: '1.75rem', fontWeight: '900', color: '#ff4b4b' }}>{user.hearts} / 5 ❤️</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>Hearts</span>
          </div>
        </div>
      </div>

      {/* Achievements Section */}
      <div className="card" style={{ padding: '2rem', borderRadius: '24px' }}>
        <h3 style={{ marginBottom: '1.25rem', color: 'var(--accent-purple)', fontWeight: '800', fontSize: '1.3rem' }}>
          {t('achievements')}
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {achievements.length === 0 ? (
            <div style={{ background: 'var(--surface-hover)', padding: '1.5rem', borderRadius: '16px', textAlign: 'center', border: '1px dashed var(--border-color)' }}>
              <p style={{ color: 'var(--text-muted)', margin: 0 }}>No achievements computed yet. Complete lessons and quizzes to earn badges!</p>
            </div>
          ) : (
            achievements.map(ach => (
              <div key={ach.id} style={{ 
                background: 'var(--surface-hover)', padding: '1.25rem 1.5rem', borderRadius: '16px', 
                border: '1px solid var(--border-color)'
              }}>
                <h4 style={{ color: 'var(--text-main)', fontSize: '1.05rem', marginBottom: '0.25rem', fontWeight: '700' }}>{t(ach.name) || ach.name}</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.75rem', lineHeight: '1.4' }}>{t(ach.description) || ach.description}</p>
                
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                  {ach.tiers.map((tItem, idx) => (
                    <span 
                      key={idx} 
                      className={`badge ${tItem.unlocked ? 'badge-purple' : 'badge-secondary'}`}
                      style={{ 
                        fontSize: '0.75rem', 
                        opacity: tItem.unlocked ? 1 : 0.5,
                        border: tItem.unlocked ? 'none' : '1px dashed var(--border-color)',
                        padding: '4px 10px', borderRadius: '8px'
                      }}
                    >
                      🏅 {tItem.label} ({tItem.target})
                    </span>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.35rem', fontWeight: '600' }}>
                  <span>Progress</span>
                  <span>{ach.progress}</span>
                </div>
                
                <div style={{ height: '8px', background: 'var(--background)', borderRadius: '9999px', overflow: 'hidden' }}>
                  <div style={{ 
                    height: '100%', 
                    background: 'linear-gradient(90deg, var(--accent-purple), #a855f7)', 
                    width: `${Math.min(100, (ach.progress / (ach.tiers[ach.tiers.length - 1]?.target || 1)) * 100)}%`,
                    transition: 'width 0.4s ease'
                  }} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};

export default ProfileDashboard;
