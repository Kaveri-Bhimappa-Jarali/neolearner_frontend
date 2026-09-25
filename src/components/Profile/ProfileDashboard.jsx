import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { useTranslation } from '../../utils/i18n';
import { User, Globe, Target, Award, Clock, Flame, Zap, Shield, CheckCircle2, AlertCircle, Edit3, Save, X } from 'lucide-react';
import Badge from '../ui/Badge';
import StatCard from '../ui/StatCard';

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

  if (!user) return <div style={{ padding: '4rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading Profile...</div>;

  return (
    <div className="profile-dashboard page-container" style={{ maxWidth: '1050px', margin: '0 auto', padding: '1rem', animation: 'fadeIn 0.3s ease' }}>
      
      {/* Profile Header Card */}
      <div className="card" style={{ padding: '2.25rem', borderRadius: 'var(--radius-xl)', background: 'var(--surface-card)', border: '1px solid var(--border-color)', marginBottom: '2rem', boxShadow: 'var(--shadow-md)' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.25rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{
              width: '76px', height: '76px', borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))',
              color: '#ffffff', fontSize: '2.2rem', fontWeight: '900',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: 'var(--shadow-teal)'
            }}>
              {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h1 style={{ fontSize: '2.1rem', fontWeight: '900', margin: 0, color: 'var(--text-main)', lineHeight: '1.2' }}>
                {user.full_name}
              </h1>
              <p style={{ color: 'var(--text-muted)', margin: '4px 0 0', fontWeight: '600', fontSize: '0.98rem' }}>
                {user.email}
              </p>
            </div>
          </div>

          <div>
            {!isEditing ? (
              <button 
                className="btn btn-primary" 
                onClick={() => { setIsEditing(true); setError(''); setSuccessMsg(''); }}
                style={{ padding: '0.75rem 1.5rem', fontWeight: '800', gap: '8px' }}
              >
                <Edit3 size={18} /> {t('editProfile')}
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button 
                  type="button"
                  className="btn btn-secondary" 
                  onClick={() => { setIsEditing(false); setError(''); }}
                  style={{ padding: '0.75rem 1.25rem', fontWeight: '700', gap: '6px' }}
                >
                  <X size={18} /> {t('cancel')}
                </button>
                <button 
                  type="button"
                  className="btn btn-primary" 
                  onClick={handleSave}
                  disabled={loading}
                  style={{ padding: '0.75rem 1.5rem', fontWeight: '800', gap: '6px' }}
                >
                  <Save size={18} /> {loading ? (t('saving') || 'Saving...') : (t('save') || 'Save')}
                </button>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div style={{ padding: '0.85rem 1rem', background: 'var(--error-bg)', color: 'var(--error)', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={18} /> {error}
          </div>
        )}

        {successMsg && (
          <div style={{ padding: '0.85rem 1rem', background: 'var(--success-bg)', color: 'var(--success)', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={18} /> {successMsg}
          </div>
        )}

        {/* Form Details Grid */}
        <form onSubmit={handleSave}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
            
            {/* Column 1: Personal Information */}
            <div style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--primary-color)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={20} /> {t('personalInformation') || 'Personal Information'}
              </h3>

              <div className="form-group" style={{ marginBottom: '1.1rem' }}>
                <label className="form-label" style={{ fontWeight: '700', fontSize: '0.88rem', color: 'var(--text-main)', display: 'block', marginBottom: '6px' }}>{t('fullName') || 'Full Name'} *</label>
                {isEditing ? (
                  <input 
                    name="full_name" 
                    type="text" 
                    className="form-input" 
                    value={formData.full_name || ''} 
                    onChange={handleChange} 
                    required
                    style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--background)', color: 'var(--text-main)' }}
                  />
                ) : (
                  <div style={{ fontWeight: '800', color: 'var(--text-main)', fontSize: '1.05rem' }}>
                    {user.full_name}
                  </div>
                )}
              </div>

              <div className="form-group" style={{ marginBottom: '1.1rem' }}>
                <label className="form-label" style={{ fontWeight: '700', fontSize: '0.88rem', color: 'var(--text-main)', display: 'block', marginBottom: '6px' }}>{t('age') || 'Age'}</label>
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
                    style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--background)', color: 'var(--text-main)' }}
                  />
                ) : (
                  <div style={{ fontWeight: '600', color: 'var(--text-muted)' }}>
                    {user.age ? `${user.age}` : '-'}
                  </div>
                )}
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label" style={{ fontWeight: '700', fontSize: '0.88rem', color: 'var(--text-main)', display: 'block', marginBottom: '6px' }}>{t('dailyLearningGoal') || 'Daily Learning Goal'}</label>
                {isEditing ? (
                  <select name="daily_minutes_goal" className="form-select" value={formData.daily_minutes_goal || '15'} onChange={handleChange} style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--background)', color: 'var(--text-main)' }}>
                    <option value="5">⚡ 5 {t('dailyGoalMinutes', { minutes: 5 })}</option>
                    <option value="15">🔥 15 {t('dailyGoalMinutes', { minutes: 15 })}</option>
                    <option value="30">🚀 30 {t('dailyGoalMinutes', { minutes: 30 })}</option>
                    <option value="60">🏆 60 {t('dailyGoalMinutes', { minutes: 60 })}</option>
                  </select>
                ) : (
                  <div style={{ fontWeight: '600', color: 'var(--text-muted)' }}>
                    {t('dailyGoalMinutes', { minutes: user.daily_minutes_goal || 15 })}
                  </div>
                )}
              </div>
            </div>

            {/* Column 2: Language & Proficiency */}
            <div style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--accent-cyan)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Globe size={20} /> {t('settingsTitle')}
              </h3>

              <div className="form-group" style={{ marginBottom: '1.1rem' }}>
                <label className="form-label" style={{ fontWeight: '700', fontSize: '0.88rem', color: 'var(--text-main)', display: 'block', marginBottom: '6px' }}>{t('targetLang')}</label>
                {isEditing ? (
                  <select name="target_language_id" className="form-select" value={formData.target_language_id || ''} onChange={handleChange} style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--background)', color: 'var(--text-main)' }}>
                    <option value="">Select Target Language</option>
                    {languages.map(l => (
                      <option key={l.id} value={l.id}>{l.name} ({l.native_name || l.code})</option>
                    ))}
                  </select>
                ) : (
                  <div style={{ fontWeight: '800', color: 'var(--accent-cyan)' }}>
                    🌐 {user.target_language?.name || '-'}
                  </div>
                )}
              </div>

              <div className="form-group" style={{ marginBottom: '1.1rem' }}>
                <label className="form-label" style={{ fontWeight: '700', fontSize: '0.88rem', color: 'var(--text-main)', display: 'block', marginBottom: '6px' }}>{t('prefLang')}</label>
                {isEditing ? (
                  <select name="preferred_language_id" className="form-select" value={formData.preferred_language_id || ''} onChange={handleChange} style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--background)', color: 'var(--text-main)' }}>
                    <option value="">Select Interface Language</option>
                    {languages.map(l => (
                      <option key={l.id} value={l.id}>{l.name} ({l.native_name || l.code})</option>
                    ))}
                  </select>
                ) : (
                  <div style={{ fontWeight: '600', color: 'var(--text-muted)' }}>
                    🗣️ {user.preferred_language?.name || 'English'}
                  </div>
                )}
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label" style={{ fontWeight: '700', fontSize: '0.88rem', color: 'var(--text-main)', display: 'block', marginBottom: '6px' }}>{t('profLevel')}</label>
                {isEditing ? (
                  <select name="proficiency_level" className="form-select" value={formData.proficiency_level || 'Beginner'} onChange={handleChange} style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--background)', color: 'var(--text-main)' }}>
                    <option value="Beginner">Beginner (A0 - A1)</option>
                    <option value="Intermediate">Intermediate (A2 - B1)</option>
                    <option value="Advanced">Advanced (B2 - C2)</option>
                  </select>
                ) : (
                  <div style={{ fontWeight: '700', color: 'var(--primary-color)' }}>
                    🏆 {user.proficiency_level || 'Beginner'} ({user.cefr_level || 'A1'})
                  </div>
                )}
              </div>
            </div>

          </div>
        </form>
      </div>

      {/* Stats KPI Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <StatCard title={t('dayStreak')} value={`${user.streak} 🔥`} subtitle={t('consecutiveActiveDays')} icon={Flame} color="gold" />
        <StatCard title={t('xpEarned')} value={`${user.xp} XP`} subtitle="XP" icon={Zap} color="teal" />
        <StatCard title={t('gemsAvailable', { gems: user.gems })} value={`${user.gems} 💎`} subtitle="Gems" icon={Globe} color="cyan" />
        <StatCard title={t('restoreHeartsTitle')} value={`${user.hearts} / 5 ❤️`} subtitle="Hearts" icon={Shield} color="red" />
      </div>

    </div>
  );
};

export default ProfileDashboard;
