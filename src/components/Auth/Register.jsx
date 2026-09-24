import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { BookOpen, Mail, Lock, User, CheckCircle2, ShieldCheck, Sparkles, Key, Globe, ArrowRight } from 'lucide-react';

const DEFAULT_LANGUAGES = [
  { code: 'en', name: 'English', native_name: 'English', flag: '🇬🇧' },
  { code: 'kn', name: 'Kannada', native_name: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', native_name: 'తెలుగు', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', native_name: 'ಮರಾಠಿ', flag: '🇮🇳' },
  { code: 'hi', name: 'Hindi', native_name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'es', name: 'Spanish', native_name: 'Español', flag: '🇪🇸' }
];

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    age: 18,
    preferred_language_code: 'en',
    target_language_code: 'kn',
    proficiency_level: 'Beginner',
    learning_goal: 'conversation',
    prior_knowledge: 'complete_beginner',
    cefr_level: 'A0',
    daily_minutes_goal: 15
  });

  const [languages, setLanguages] = useState(DEFAULT_LANGUAGES);
  const [step, setStep] = useState(1); // Step 1: Form, Step 2: Verification Code
  const [verificationCode, setVerificationCode] = useState('');
  const [devCode, setDevCode] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Google Multi-Account Modal States
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [savedAccounts, setSavedAccounts] = useState([]);
  const [isAddingNewAccount, setIsAddingNewAccount] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [customGoogleName, setCustomGoogleName] = useState('');

  const { user, register, login, googleLogin, verifyEmail, resendCode } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      const needsOnboarding = !user.preferred_language_id || !user.target_language_id;
      navigate(user.is_admin ? '/admin' : (needsOnboarding ? '/onboarding' : '/dashboard'), { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('saved_google_accounts');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setSavedAccounts(parsed);
          if (parsed.length === 0) {
            setIsAddingNewAccount(true);
          }
          return;
        }
      }
    } catch (e) {
      console.warn('Failed to load saved Google accounts:', e);
    }
    setSavedAccounts([]);
    setIsAddingNewAccount(true);
  }, []);

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const res = await api.get('/languages');
        const langList = Array.isArray(res.data) ? res.data : (res.data?.languages || []);
        if (langList && langList.length > 0) {
          setLanguages(langList.map(l => ({
            ...l,
            flag: l.code === 'en' ? '🇬🇧' : (l.code === 'es' ? '🇪🇸' : '🇮🇳')
          })));
        }
      } catch (err) {
        console.warn('Using default language options:', err);
      }
    };
    fetchLanguages();
  }, []);

  const saveAccountToLocalStorage = (newAccount) => {
    setSavedAccounts(prev => {
      const filtered = prev.filter(acc => acc.email.toLowerCase() !== newAccount.email.toLowerCase());
      const updated = [newAccount, ...filtered];
      try {
        localStorage.setItem('saved_google_accounts', JSON.stringify(updated));
      } catch (e) {
        console.warn('Could not persist Google accounts to localStorage:', e);
      }
      return updated;
    });
  };

  const removeAccount = (e, emailToRemove) => {
    e.stopPropagation();
    setSavedAccounts(prev => {
      const updated = prev.filter(acc => acc.email.toLowerCase() !== emailToRemove.toLowerCase());
      try {
        localStorage.setItem('saved_google_accounts', JSON.stringify(updated));
      } catch (err) {}
      if (updated.length === 0) {
        setIsAddingNewAccount(true);
      }
      return updated;
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'age' || name === 'daily_minutes_goal' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!formData.email.trim()) {
      setError('Email address is required');
      return;
    }
    if (!formData.password || formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const regRes = await register(formData);
      const codeFromBackend = regRes.data?.verification_code;
      if (codeFromBackend) {
        setDevCode(codeFromBackend);
      }
      setStep(2);
      setSuccessMsg('Account created! Please enter your 6-digit verification code below.');
    } catch (err) {
      const msg = err.response?.data?.detail || 'Registration failed. Please verify your details.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!verificationCode.trim()) {
      setError('Please enter the 6-digit verification code');
      return;
    }

    setLoading(true);
    try {
      await verifyEmail(formData.email.trim(), verificationCode.trim(), formData.password);
      navigate('/onboarding');
    } catch (err) {
      const msg = err.response?.data?.detail || 'Invalid verification code. Please check and try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError('');
    setSuccessMsg('');
    try {
      const res = await resendCode(formData.email.trim());
      if (res.data?.verification_code) {
        setDevCode(res.data.verification_code);
      }
      setSuccessMsg('A new verification code has been generated!');
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to resend verification code.';
      setError(msg);
    }
  };

  const handleOpenGoogleModal = () => {
    setError('');
    const prefEmail = formData.email.trim() ? formData.email.trim().toLowerCase() : '';
    setCustomGoogleEmail(prefEmail);
    setCustomGoogleName(formData.full_name || '');
    setIsAddingNewAccount(savedAccounts.length === 0 || !!prefEmail);
    setShowGoogleModal(true);
  };

  const handleSelectGoogleAccount = async (account) => {
    if (!account.email || !account.email.trim()) {
      setError('Please enter a valid Google email address.');
      return;
    }

    setGoogleLoading(true);
    setError('');
    try {
      const googleUserPayload = {
        google_id: `g_${account.email.trim().toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
        email: account.email.trim().toLowerCase(),
        full_name: account.name || formData.full_name || account.email.split('@')[0],
        avatar_url: account.avatar || 'https://lh3.googleusercontent.com/a/default-user'
      };

      const result = await googleLogin(googleUserPayload);
      saveAccountToLocalStorage({
        email: account.email.trim().toLowerCase(),
        name: account.name || account.email.split('@')[0],
        avatar: account.avatar || 'https://lh3.googleusercontent.com/a/default-user'
      });

      setShowGoogleModal(false);
      if (result.needsOnboarding) {
        navigate('/onboarding');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Google Single Sign-On failed.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleConfirmNewGoogleAccount = async (e) => {
    e.preventDefault();
    if (!customGoogleEmail.trim() || !customGoogleEmail.includes('@')) {
      setError('Please enter a valid Google email address');
      return;
    }

    const newAcc = {
      email: customGoogleEmail.trim().toLowerCase(),
      name: customGoogleName.trim() || formData.full_name || customGoogleEmail.split('@')[0],
      avatar: 'https://lh3.googleusercontent.com/a/default-user'
    };

    await handleSelectGoogleAccount(newAcc);
  };

  if (step === 2) {
    return (
      <div 
        className="card"
        style={{
          maxWidth: '520px',
          margin: '2rem auto',
          padding: '2.5rem',
          textAlign: 'center',
          background: 'var(--surface-card)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-lg)'
        }}
      >
        <div style={{ padding: '1rem', background: 'rgba(20, 184, 166, 0.12)', color: 'var(--primary-color)', borderRadius: '50%', width: 'fit-content', margin: '0 auto 1.25rem' }}>
          <Mail size={38} />
        </div>
        <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '0.5rem' }}>Verify Your Email</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: '1.6' }}>
          We've sent a 6-digit activation code to <strong style={{ color: 'var(--text-main)' }}>{formData.email}</strong>.
        </p>

        {devCode && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.12), rgba(99, 102, 241, 0.12))',
            border: '2px dashed var(--primary-color)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem',
            marginBottom: '1.5rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--primary-color)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
              🔑 Verification Code (On-Device Helper)
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--text-main)', letterSpacing: '8px', fontFamily: 'monospace' }}>
              {devCode}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '6px' }}>
              Enter this 6-digit code below to instantly activate your account
            </div>
          </div>
        )}

        {error && (
          <div style={{ marginBottom: '1.25rem', padding: '0.85rem', background: 'var(--error-bg)', color: 'var(--error)', borderRadius: 'var(--radius-md)', fontSize: '0.9rem', textAlign: 'left' }}>
            ⚠️ {error}
          </div>
        )}

        {successMsg && (
          <div style={{ marginBottom: '1.25rem', padding: '0.85rem', background: 'var(--success-bg)', color: 'var(--success)', borderRadius: 'var(--radius-md)', fontSize: '0.9rem', textAlign: 'left' }}>
            ✅ {successMsg}
          </div>
        )}

        <form onSubmit={handleVerifySubmit}>
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontWeight: '700', fontSize: '0.88rem', color: 'var(--text-main)', marginBottom: '0.5rem', textAlign: 'left' }}>
              6-Digit Verification Code
            </label>
            <input 
              type="text" 
              maxLength="6"
              value={verificationCode} 
              onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, ''))} 
              required 
              placeholder="123456"
              style={{
                width: '100%',
                padding: '0.9rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                fontSize: '1.75rem',
                textAlign: 'center',
                letterSpacing: '8px',
                fontWeight: '900',
                color: 'var(--text-main)',
                background: 'var(--background)'
              }}
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '0.95rem', borderRadius: 'var(--radius-md)', fontWeight: '800', fontSize: '1rem' }} 
            disabled={loading}
          >
            {loading ? 'VERIFYING...' : 'VERIFY & START LEARNING 🚀'}
          </button>
        </form>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', fontSize: '0.88rem' }}>
          <button 
            type="button" 
            onClick={handleResendCode}
            style={{ background: 'none', border: 'none', color: 'var(--primary-color)', fontWeight: 800, cursor: 'pointer', padding: 0 }}
          >
            Resend Code
          </button>
          <button 
            type="button" 
            onClick={() => { setStep(1); setError(''); setSuccessMsg(''); }}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontWeight: 600, cursor: 'pointer', padding: 0 }}
          >
            Edit Details
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', maxWidth: '1100px', margin: '1.5rem auto', animation: 'fadeIn 0.3s ease' }}>
      <div 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
          background: 'var(--surface-card)', 
          borderRadius: 'var(--radius-xl)', 
          border: '1px solid var(--border-color)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-lg)'
        }}
      >
        {/* Left Hero Column */}
        <div 
          style={{ 
            background: 'linear-gradient(135deg, #0d172a 0%, #111c33 50%, #08111f 100%)', 
            padding: '3rem 2.5rem', 
            display: 'flex', 
            flexDirection: 'column', 
            justify: 'space-between',
            borderRight: '1px solid var(--border-color)'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '2.5rem' }}>
              <div style={{ background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))', padding: '10px', borderRadius: '14px', display: 'flex' }}>
                <BookOpen size={26} color="#ffffff" />
              </div>
              <span style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-main)' }}>NeoLearner</span>
            </div>

            <h1 style={{ fontSize: '2.2rem', fontWeight: '900', lineHeight: 1.25, color: 'var(--text-main)', marginBottom: '1.25rem' }}>
              Create Your Account & Start Learning Today ✨
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '2rem' }}>
              Join thousands of learners mastering Kannada, Telugu, Hindi, Marathi, Spanish, and English through AI voice practice.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-main)', fontWeight: '600' }}>
                <CheckCircle2 size={20} color="var(--primary-color)" />
                <span>Instant diagnostic literacy assessment</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-main)', fontWeight: '600' }}>
                <CheckCircle2 size={20} color="var(--primary-color)" />
                <span>Gamified XP, Streak, and League Rewards</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-main)', fontWeight: '600' }}>
                <CheckCircle2 size={20} color="var(--primary-color)" />
                <span>Spaced repetition (SM-2) memory drills</span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            <ShieldCheck size={18} color="var(--primary-color)" />
            <span>No credit card required — 100% Free Access</span>
          </div>
        </div>

        {/* Right Form Column */}
        <div style={{ padding: '3rem 2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ marginBottom: '1.75rem' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '0.4rem' }}>Create Free Account 🚀</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.98rem' }}>Set up your preferred language and learning goals</p>
          </div>

          {/* Google SSO Button */}
          <button 
            type="button" 
            onClick={handleOpenGoogleModal}
            disabled={googleLoading}
            style={{
              width: '100%',
              padding: '0.9rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              background: 'var(--surface)',
              color: 'var(--text-main)',
              fontWeight: '700',
              fontSize: '0.95rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              cursor: 'pointer',
              marginBottom: '1.5rem',
              transition: 'all 0.2s ease',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            {googleLoading ? 'Connecting...' : 'Sign Up with Google'}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
            <span style={{ color: 'var(--text-subtle)', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.5px' }}>OR REGISTER WITH EMAIL</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: '1.1rem' }}>
              <label className="form-label" style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.4rem', color: 'var(--text-main)', fontSize: '0.88rem' }}>
                <User size={16} color="var(--primary-color)" /> Full Name
              </label>
              <input 
                type="text" 
                name="full_name" 
                className="form-input" 
                value={formData.full_name} 
                onChange={handleChange} 
                required 
                placeholder="John Doe"
                style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', color: 'var(--text-main)', background: 'var(--background)' }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1.1rem' }}>
              <label className="form-label" style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.4rem', color: 'var(--text-main)', fontSize: '0.88rem' }}>
                <Mail size={16} color="var(--primary-color)" /> Email Address
              </label>
              <input 
                type="email" 
                name="email" 
                className="form-input" 
                value={formData.email} 
                onChange={handleChange} 
                required 
                placeholder="learner@example.com"
                style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', color: 'var(--text-main)', background: 'var(--background)' }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label className="form-label" style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.4rem', color: 'var(--text-main)', fontSize: '0.88rem' }}>
                <Lock size={16} color="var(--primary-color)" /> Password (min 6 characters)
              </label>
              <input 
                type="password" 
                name="password" 
                className="form-input" 
                value={formData.password} 
                onChange={handleChange} 
                required 
                placeholder="••••••••"
                style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', color: 'var(--text-main)', background: 'var(--background)' }}
              />
            </div>

            {/* Interactive Native Language Selector */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label className="form-label" style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.5rem', color: 'var(--text-main)', fontSize: '0.88rem' }}>
                <Globe size={16} color="var(--primary-color)" /> I Speak (Native Language)
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '0.5rem' }}>
                {languages.map(l => {
                  const isSelected = formData.preferred_language_code === l.code;
                  return (
                    <button
                      key={`pref_${l.code}`}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, preferred_language_code: l.code }))}
                      style={{
                        padding: '0.65rem 0.5rem',
                        borderRadius: 'var(--radius-md)',
                        border: isSelected ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
                        background: isSelected ? 'rgba(20, 184, 166, 0.15)' : 'var(--surface)',
                        color: isSelected ? 'var(--primary-color)' : 'var(--text-main)',
                        fontWeight: '700',
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <span style={{ fontSize: '1rem', marginRight: '4px' }}>{l.flag || '🌐'}</span>
                      {l.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Interactive Target Language Selector */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label className="form-label" style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.5rem', color: 'var(--text-main)', fontSize: '0.88rem' }}>
                <Sparkles size={16} color="var(--secondary-color)" /> I Want to Learn (Target Language)
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '0.5rem' }}>
                {languages.map(l => {
                  const isSelected = formData.target_language_code === l.code;
                  const isSameAsPref = formData.preferred_language_code === l.code;
                  return (
                    <button
                      key={`target_${l.code}`}
                      type="button"
                      disabled={isSameAsPref}
                      onClick={() => setFormData(prev => ({ ...prev, target_language_code: l.code }))}
                      style={{
                        padding: '0.65rem 0.5rem',
                        borderRadius: 'var(--radius-md)',
                        border: isSelected ? '2px solid var(--secondary-color)' : '1px solid var(--border-color)',
                        background: isSelected ? 'rgba(99, 102, 241, 0.18)' : (isSameAsPref ? 'var(--surface)' : 'var(--surface)'),
                        color: isSelected ? 'var(--secondary-color)' : (isSameAsPref ? 'var(--text-subtle)' : 'var(--text-main)'),
                        fontWeight: '700',
                        fontSize: '0.85rem',
                        cursor: isSameAsPref ? 'not-allowed' : 'pointer',
                        opacity: isSameAsPref ? 0.4 : 1,
                        textAlign: 'center',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <span style={{ fontSize: '1rem', marginRight: '4px' }}>{l.flag || '🌐'}</span>
                      {l.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {error && (
              <div style={{ marginBottom: '1.25rem', padding: '0.85rem 1rem', background: 'var(--error-bg)', color: 'var(--error)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(239,68,68,0.3)', fontSize: '0.9rem' }}>
                ⚠️ {error}
                {error.toLowerCase().includes('already registered') && (
                  <div style={{ marginTop: '0.65rem' }}>
                    <button
                      type="button"
                      onClick={() => navigate('/login', { state: { email: formData.email } })}
                      style={{
                        background: 'var(--primary-color)',
                        color: '#ffffff',
                        border: 'none',
                        padding: '0.55rem 1.1rem',
                        borderRadius: 'var(--radius-md)',
                        fontWeight: '800',
                        cursor: 'pointer',
                        fontSize: '0.88rem',
                        boxShadow: 'var(--shadow-sm)'
                      }}
                    >
                      Log In with {formData.email} →
                    </button>
                  </div>
                )}
              </div>
            )}

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '0.95rem', borderRadius: 'var(--radius-md)', fontWeight: '800', fontSize: '1rem' }} 
              disabled={loading}
            >
              {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT & START LEARNING'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.5rem', fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-muted)' }}>
            Already have an account? <Link to="/login" style={{ color: 'var(--primary-color)', fontWeight: 800 }}>Log In</Link>
          </div>
        </div>
      </div>

      {/* Google Multi-Account Selection Modal */}
      {showGoogleModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(8, 17, 31, 0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: '1rem'
        }}>
          <div style={{
            background: 'var(--surface-card)', borderRadius: 'var(--radius-xl)', padding: '2rem', maxWidth: '440px', width: '100%',
            boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border-color)'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <svg width="28" height="28" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <h3 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)' }}>Sign Up with Google</h3>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0 }}>
                to continue to <strong style={{ color: 'var(--text-main)' }}>NeoLearner</strong>
              </p>
            </div>

            {error && (
              <div style={{ padding: '0.75rem', background: 'var(--error-bg)', color: 'var(--error)', borderRadius: '10px', fontSize: '0.88rem', marginBottom: '1rem' }}>
                ⚠️ {error}
              </div>
            )}

            {!isAddingNewAccount && savedAccounts.length > 0 ? (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.25rem', maxHeight: '240px', overflowY: 'auto' }}>
                  {savedAccounts.map((acc, idx) => (
                    <div 
                      key={idx}
                      onClick={() => handleSelectGoogleAccount(acc)}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '0.85rem 1rem', borderRadius: '14px', border: '1px solid var(--border-color)',
                        background: 'var(--surface)', cursor: 'pointer', transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '38px', height: '38px', borderRadius: '50%', background: 'var(--primary-color)',
                          color: '#ffffff', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '1rem', textTransform: 'uppercase'
                        }}>
                          {acc.name ? acc.name[0] : acc.email[0]}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.95rem' }}>{acc.name}</div>
                          <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{acc.email}</div>
                        </div>
                      </div>
                      <button 
                        type="button"
                        onClick={(e) => removeAccount(e, acc.email)}
                        style={{ background: 'none', border: 'none', color: 'var(--text-subtle)', cursor: 'pointer', fontSize: '1.1rem', padding: '4px' }}
                        title="Remove account"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setIsAddingNewAccount(true)}
                  style={{
                    width: '100%', padding: '0.85rem', borderRadius: '14px', border: '1.5px dashed var(--border-color)',
                    background: 'var(--surface)', color: 'var(--primary-color)', fontWeight: 700, fontSize: '0.95rem',
                    cursor: 'pointer', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                  }}
                >
                  <span>➕</span> Use another Google Account
                </button>
              </>
            ) : (
              <form onSubmit={handleConfirmNewGoogleAccount} style={{ marginBottom: '1rem' }}>
                <div style={{ marginBottom: '0.85rem' }}>
                  <label style={{ fontWeight: 600, fontSize: '0.85rem', display: 'block', marginBottom: '0.25rem', color: 'var(--text-main)' }}>Google Email Address *</label>
                  <input 
                    type="email"
                    value={customGoogleEmail}
                    onChange={(e) => setCustomGoogleEmail(e.target.value)}
                    placeholder="yourname@gmail.com"
                    required
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-color)', fontSize: '0.95rem', color: 'var(--text-main)', background: 'var(--background)' }}
                  />
                </div>
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ fontWeight: 600, fontSize: '0.85rem', display: 'block', marginBottom: '0.25rem', color: 'var(--text-main)' }}>Full Name (Optional)</label>
                  <input 
                    type="text"
                    value={customGoogleName}
                    onChange={(e) => setCustomGoogleName(e.target.value)}
                    placeholder="Alex Smith"
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-color)', fontSize: '0.95rem', color: 'var(--text-main)', background: 'var(--background)' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                  {savedAccounts.length > 0 && (
                    <button 
                      type="button" 
                      onClick={() => setIsAddingNewAccount(false)}
                      className="btn btn-secondary"
                      style={{ padding: '0.65rem 1.25rem' }}
                    >
                      Back
                    </button>
                  )}
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={googleLoading}
                    style={{ padding: '0.65rem 1.25rem', fontWeight: 700 }}
                  >
                    {googleLoading ? 'REGISTERING...' : 'REGISTER WITH GOOGLE'}
                  </button>
                </div>
              </form>
            )}

            <div style={{ textAlign: 'right', marginTop: '0.5rem' }}>
              <button 
                type="button" 
                onClick={() => setShowGoogleModal(false)}
                className="btn btn-outline"
                style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;
