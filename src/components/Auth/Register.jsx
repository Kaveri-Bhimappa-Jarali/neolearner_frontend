import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { User, Mail, Lock, Calendar, Globe, Sparkles, Award } from 'lucide-react';
import { getTranslationForLang } from '../../utils/i18n';

const Register = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    age: '',
    preferred_language_id: '',
    target_language_id: '',
    proficiency_level: 'Beginner'
  });
  const [languages, setLanguages] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [languagesLoading, setLanguagesLoading] = useState(true);
  const [showPlacementChoice, setShowPlacementChoice] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const DEFAULT_LANGS = [
      { id: 1, code: 'en', name: 'English', native_name: 'English' },
      { id: 2, code: 'kn', name: 'Kannada', native_name: 'ಕನ್ನಡ' },
      { id: 3, code: 'te', name: 'Telugu', native_name: 'తెలుగు' },
      { id: 4, code: 'mr', name: 'Marathi', native_name: 'ಮರಾಠಿ' },
      { id: 5, code: 'hi', name: 'Hindi', native_name: 'हिन्दी' },
      { id: 6, code: 'es', name: 'Spanish', native_name: 'Español' }
    ];

    const fetchLanguages = async () => {
      try {
        const res = await api.get('/languages/');
        const langData = (Array.isArray(res.data) && res.data.length > 0) ? res.data : DEFAULT_LANGS;
        setLanguages(langData);
        const knLang = langData.find(l => l.code === 'kn') || langData[0];
        const enLang = langData.find(l => l.code === 'en') || (langData.length > 1 ? langData[1] : langData[0]);
        setFormData(prev => ({
          ...prev,
          preferred_language_id: prev.preferred_language_id || (knLang ? knLang.id : 2),
          target_language_id: prev.target_language_id || (enLang ? enLang.id : 1)
        }));
      } catch (err) {
        console.warn('Failed to fetch languages from API, using default languages:', err);
        setLanguages(DEFAULT_LANGS);
        setFormData(prev => ({
          ...prev,
          preferred_language_id: prev.preferred_language_id || 2,
          target_language_id: prev.target_language_id || 1
        }));
      } finally {
        setLanguagesLoading(false);
      }
    };
    fetchLanguages();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.full_name.trim()) {
      setError('Please enter your full name');
      return;
    }
    if (!formData.email.trim()) {
      setError('Please enter your email address');
      return;
    }
    if (!formData.password || formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    if (!formData.age || parseInt(formData.age, 10) < 4 || parseInt(formData.age, 10) > 120) {
      setError('Please enter a valid age between 4 and 120');
      return;
    }
    if (!formData.preferred_language_id) {
      setError('Please select your primary / native language');
      return;
    }
    if (!formData.target_language_id) {
      setError('Please select your target language to learn');
      return;
    }

    setLoading(true);
    try {
      await register({
        full_name: formData.full_name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        age: parseInt(formData.age, 10),
        preferred_language_id: formData.preferred_language_id,
        target_language_id: formData.target_language_id,
        proficiency_level: formData.proficiency_level
      });
      // Show Placement Test Choice Modal
      setShowPlacementChoice(true);
    } catch (err) {
      let msg = 'Registration failed. Please try again.';
      if (err.response?.data?.detail) {
        if (typeof err.response.data.detail === 'string') {
          msg = err.response.data.detail;
        } else if (Array.isArray(err.response.data.detail)) {
          msg = err.response.data.detail.map(d => `${d.loc ? d.loc.join('.') + ': ' : ''}${d.msg}`).join(', ');
        } else {
          msg = JSON.stringify(err.response.data.detail);
        }
      } else if (typeof err.response?.data === 'string' && err.response.data.includes('<!DOCTYPE')) {
        msg = 'Cannot reach backend API server. API endpoint returned HTML instead of JSON. Please verify backend Vercel URL.';
      } else if (err.message === 'Network Error') {
        msg = `Cannot connect to backend server at ${api.defaults.baseURL || 'the configured API URL'}. Please verify backend status and VITE_API_BASE_URL setting.`;
      } else if (err.message) {
        msg = err.message;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }

  };

  if (showPlacementChoice) {
    const selectedLangObj = languages.find(l => l.id === formData.preferred_language_id);
    const prefLangCode = selectedLangObj ? selectedLangObj.code : 'en';

    return (
      <div className="auth-card" style={{ maxWidth: '600px', margin: '3rem auto', textAlign: 'center', padding: '3rem 2rem', borderRadius: '24px' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
        <h2 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
          {getTranslationForLang('welcomeTitle', prefLangCode)}
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', marginBottom: '2.5rem', lineHeight: '1.6' }}>
          {getTranslationForLang('welcomeSubtitle', prefLangCode)}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/initial-exam')}
            style={{ padding: '1.25rem', fontSize: '1.1rem', fontWeight: '700', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}
          >
            <span>{getTranslationForLang('fastTrackBtn', prefLangCode)}</span>
            <span style={{ fontSize: '0.85rem', opacity: 0.9, fontWeight: 'normal' }}>
              {getTranslationForLang('fastTrackDesc', prefLangCode)}
            </span>
          </button>

          <button
            className="btn btn-secondary"
            onClick={() => navigate('/dashboard')}
            style={{ padding: '1.1rem', fontSize: '1.05rem' }}
          >
            {getTranslationForLang('startBeginningBtn', prefLangCode)}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-card" style={{ maxWidth: '650px', margin: '2rem auto' }}>
      <div className="auth-header" style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
        <h2 style={{ fontSize: '1.85rem', marginBottom: '0.4rem', color: 'var(--text-main)' }}>
          Create Your Profile 🚀
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Personalize your literacy and language learning experience
        </p>
      </div>

      {error && (
        <div className="form-error" style={{ marginBottom: '1.25rem', padding: '0.85rem 1rem', background: '#ffebee', color: '#c62828', borderRadius: '8px', border: '1px solid #ef9a9a', fontSize: '0.9rem' }}>
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
        
        {/* Row 1: Name & Age */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <User size={15} color="var(--primary-color)" /> Full Name *
            </label>
            <input 
              name="full_name" 
              type="text" 
              className="form-input" 
              placeholder="e.g. Kaveri Jarali"
              value={formData.full_name}
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={15} color="var(--primary-color)" /> Age *
            </label>
            <input 
              name="age" 
              type="number" 
              min="4" 
              max="120"
              className="form-input" 
              placeholder="e.g. 20"
              value={formData.age}
              onChange={handleChange} 
              required 
            />
          </div>
        </div>

        {/* Row 2: Email */}
        <div className="form-group">
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Mail size={15} color="var(--primary-color)" /> Email Address *
          </label>
          <input 
            name="email" 
            type="email" 
            className="form-input" 
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange} 
            required 
          />
        </div>

        {/* Row 3: Password */}
        <div className="form-group">
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Lock size={15} color="var(--primary-color)" /> Password * (min 6 characters)
          </label>
          <input 
            name="password" 
            type="password" 
            className="form-input" 
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange} 
            required 
          />
        </div>

        {/* Row 4: Primary / Native Language & Target Language */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Globe size={15} color="var(--secondary-color)" /> Primary / Native Language *
            </label>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
              Interface & instructions language
            </span>
            <select 
              name="preferred_language_id" 
              className="form-select" 
              value={formData.preferred_language_id} 
              onChange={handleChange}
              disabled={languagesLoading || loading}
              required
            >
              <option value="">{languagesLoading ? 'Loading languages...' : 'Select Language'}</option>
              {languages.map(l => (
                <option key={l.id} value={l.id}>
                  {l.name} {l.native_name ? `(${l.native_name})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={15} color="var(--secondary-color)" /> Target Language *
            </label>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
              Language you are learning
            </span>
            <select 
              name="target_language_id" 
              className="form-select" 
              value={formData.target_language_id} 
              onChange={handleChange}
              disabled={languagesLoading || loading}
              required
            >
              <option value="">{languagesLoading ? 'Loading languages...' : 'Select Language'}</option>
              {languages.map(l => (
                <option key={l.id} value={l.id}>
                  {l.name} {l.native_name ? `(${l.native_name})` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 5: Proficiency Level */}
        <div className="form-group">
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Award size={15} color="var(--accent-color)" /> Proficiency Level *
          </label>
          <select 
            name="proficiency_level" 
            className="form-select" 
            value={formData.proficiency_level}
            onChange={handleChange}
            disabled={loading}
            required
          >
            <option value="Beginner">Beginner — Just starting out (ಮೂಲ ಹಂತ / शुरुआती)</option>
            <option value="Intermediate">Intermediate — Know basic sounds & words (ಮಧ್ಯಮ ಹಂತ / मध्यम)</option>
            <option value="Advanced">Advanced — Fluent & seeking full mastery (ಪ್ರವೀಣ ಹಂತ / उन्नत)</option>
          </select>
        </div>

        <button 
          type="submit" 
          className="btn btn-primary" 
          disabled={loading}
          style={{ width: '100%', marginTop: '0.75rem', padding: '0.85rem', fontSize: '1.05rem', fontWeight: 700 }}
        >
          {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT & START LEARNING'}
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: '1.5rem', fontWeight: 600, fontSize: '0.95rem' }}>
        Already have an account? <Link to="/login" style={{ color: 'var(--primary-color)', marginLeft: '4px' }}>Log in</Link>
      </div>
    </div>
  );
};

export default Register;
