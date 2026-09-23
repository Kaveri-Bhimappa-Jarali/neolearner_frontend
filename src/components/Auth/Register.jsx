import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

const DEFAULT_LANGUAGES = [
  { code: 'en', name: 'English', native_name: 'English', flag: '🇬🇧' },
  { code: 'kn', name: 'Kannada', native_name: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', native_name: 'తెలుగు', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', native_name: 'ಮರಾಠಿ', flag: '🇮🇳' },
  { code: 'hi', name: 'Hindi', native_name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'es', name: 'Spanish', native_name: 'Español', flag: '🇪🇸' }
];

const DEFAULT_SAVED_ACCOUNTS = [
  { email: 'kaveri.learner@gmail.com', name: 'Kaveri (Primary)', avatar: 'https://lh3.googleusercontent.com/a/default-user' },
  { email: 'student.neo@gmail.com', name: 'Neo Student', avatar: 'https://lh3.googleusercontent.com/a/default-user' }
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

  const { user, register, googleLogin, verifyEmail, resendCode } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate(user.is_admin ? '/admin' : '/dashboard', { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('saved_google_accounts');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSavedAccounts(parsed);
          return;
        }
      }
    } catch (e) {
      console.warn('Failed to load saved Google accounts:', e);
    }
    setSavedAccounts(DEFAULT_SAVED_ACCOUNTS);
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
      await register(formData);
      setStep(2); // Advance to email verification step
    } catch (err) {
      const msg = err.response?.data?.detail || 'Registration failed. Please verify your details.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setError('');
    if (!verificationCode.trim()) {
      setError('Please enter the 6-digit verification code');
      return;
    }
    setLoading(true);
    try {
      await verifyEmail(formData.email.trim(), verificationCode.trim(), formData.password);
      navigate('/onboarding');
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid verification code. Please check your email or resend.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError('');
    setSuccessMsg('');
    try {
      await resendCode(formData.email.trim());
      setSuccessMsg('A new 6-digit code has been sent to your email address!');
    } catch (err) {
      setError('Failed to resend code. Please try again.');
    }
  };

  const handleOpenGoogleModal = () => {
    setError('');
    setCustomGoogleEmail(formData.email.trim() ? formData.email.trim() : '');
    setCustomGoogleName(formData.full_name || '');
    setIsAddingNewAccount(false);
    setShowGoogleModal(true);
  };

  const handleSelectGoogleAccount = async (account) => {
    setGoogleLoading(true);
    setError('');
    try {
      const googleUserPayload = {
        google_id: `g_${account.email.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
        email: account.email.toLowerCase(),
        full_name: account.name || formData.full_name || account.email.split('@')[0],
        avatar_url: account.avatar || 'https://lh3.googleusercontent.com/a/default-user'
      };

      const result = await googleLogin(googleUserPayload);
      saveAccountToLocalStorage({
        email: account.email.toLowerCase(),
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
    if (!customGoogleEmail.trim()) {
      setError('Please enter your Google Email address');
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
      <div className="auth-card" style={{ maxWidth: '480px', margin: '2rem auto', padding: '2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✉️</div>
        <h2>Verify Your Email</h2>
        <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 1.5rem', fontSize: '0.95rem' }}>
          We sent a 6-digit verification code to <strong style={{ color: '#1e293b' }}>{formData.email}</strong>.<br />
          Please check your email inbox and spam folder.
        </p>

        <form onSubmit={handleVerifyCode}>
          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label" style={{ fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
              Enter 6-Digit Verification Code
            </label>
            <input 
              type="text" 
              maxLength="6"
              className="form-input" 
              value={verificationCode} 
              onChange={(e) => setVerificationCode(e.target.value)} 
              placeholder="123456"
              style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', textAlign: 'center', fontSize: '1.4rem', letterSpacing: '6px', fontWeight: '700', color: '#0f172a', background: '#ffffff' }}
            />
          </div>

          {error && <div style={{ color: '#c62828', background: '#ffebee', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem' }}>⚠️ {error}</div>}
          {successMsg && <div style={{ color: '#2e7d32', background: '#e8f5e9', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem' }}>✅ {successMsg}</div>}

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.9rem', borderRadius: '12px', fontWeight: '700' }} disabled={loading}>
            {loading ? 'VERIFYING...' : 'VERIFY & CONTINUE'}
          </button>
        </form>

        <div style={{ marginTop: '1.25rem', fontSize: '0.9rem' }}>
          Didn't receive the code?{' '}
          <button type="button" onClick={handleResendCode} style={{ background: 'none', border: 'none', color: 'var(--primary-color)', fontWeight: '700', cursor: 'pointer', textDecoration: 'underline' }}>
            Resend Code to Email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-card" style={{ maxWidth: '560px', margin: '2rem auto', padding: '2rem' }}>
      <div className="auth-header" style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>Create Account 🚀</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Start learning languages with personalized AI drills</p>
      </div>

      <button 
        type="button" 
        onClick={handleOpenGoogleModal}
        disabled={googleLoading}
        style={{
          width: '100%',
          padding: '0.85rem',
          borderRadius: '12px',
          border: '2px solid #cbd5e1',
          background: '#ffffff',
          color: '#0f172a',
          fontWeight: '700',
          fontSize: '0.95rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.75rem',
          cursor: 'pointer',
          marginBottom: '1.5rem',
          boxShadow: '0 2px 4px rgba(0,0,0,0.04)'
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
        </svg>
        {googleLoading ? 'Connecting to Google...' : 'Continue with Google'}
      </button>

      {/* Google Multi-Account Selection Modal */}
      {showGoogleModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: '1rem'
        }}>
          <div style={{
            background: '#ffffff', borderRadius: '24px', padding: '2rem', maxWidth: '440px', width: '100%',
            boxShadow: '0 20px 30px -5px rgba(0,0,0,0.15)', border: '1px solid #e2e8f0'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <svg width="28" height="28" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <h3 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>Choose an Account</h3>
              </div>
              <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0 }}>
                to continue to <strong style={{ color: '#1e293b' }}>NeoLearner</strong>
              </p>
            </div>

            {error && (
              <div style={{ padding: '0.75rem', background: '#ffebee', color: '#c62828', borderRadius: '10px', fontSize: '0.88rem', marginBottom: '1rem' }}>
                ⚠️ {error}
              </div>
            )}

            {!isAddingNewAccount ? (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.25rem', maxHeight: '240px', overflowY: 'auto' }}>
                  {savedAccounts.map((acc, idx) => (
                    <div 
                      key={idx}
                      onClick={() => handleSelectGoogleAccount(acc)}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '0.85rem 1rem', borderRadius: '14px', border: '1.5px solid #e2e8f0',
                        background: '#ffffff', cursor: 'pointer', transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
                      onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '38px', height: '38px', borderRadius: '50%', background: '#3b82f6',
                          color: '#ffffff', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '1rem', textTransform: 'uppercase'
                        }}>
                          {acc.name ? acc.name[0] : acc.email[0]}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>{acc.name}</div>
                          <div style={{ color: '#64748b', fontSize: '0.82rem' }}>{acc.email}</div>
                        </div>
                      </div>
                      <button 
                        type="button"
                        onClick={(e) => removeAccount(e, acc.email)}
                        style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1.1rem', padding: '4px' }}
                        title="Remove from account list"
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
                    width: '100%', padding: '0.85rem', borderRadius: '14px', border: '1.5px dashed #cbd5e1',
                    background: '#f8fafc', color: '#3b82f6', fontWeight: 700, fontSize: '0.95rem',
                    cursor: 'pointer', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                  }}
                >
                  <span>➕</span> Use another Google Account
                </button>
              </>
            ) : (
              <form onSubmit={handleConfirmNewGoogleAccount} style={{ marginBottom: '1rem' }}>
                <div style={{ marginBottom: '0.85rem' }}>
                  <label style={{ fontWeight: 600, fontSize: '0.85rem', display: 'block', marginBottom: '0.25rem', color: '#334155' }}>Google Email Address</label>
                  <input 
                    type="email"
                    value={customGoogleEmail}
                    onChange={(e) => setCustomGoogleEmail(e.target.value)}
                    placeholder="e.g. user@gmail.com"
                    required
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
                  />
                </div>
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ fontWeight: 600, fontSize: '0.85rem', display: 'block', marginBottom: '0.25rem', color: '#334155' }}>Full Name (Optional)</label>
                  <input 
                    type="text"
                    value={customGoogleName}
                    onChange={(e) => setCustomGoogleName(e.target.value)}
                    placeholder="e.g. Alex Smith"
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                  <button 
                    type="button" 
                    onClick={() => setIsAddingNewAccount(false)}
                    className="btn btn-secondary"
                    style={{ padding: '0.65rem 1.25rem' }}
                  >
                    Back to Accounts
                  </button>
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

            {!isAddingNewAccount && (
              <div style={{ textAlign: 'right' }}>
                <button 
                  type="button" 
                  onClick={() => setShowGoogleModal(false)}
                  className="btn btn-secondary"
                  style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }}></div>
        <span style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600 }}>OR REGISTER MANUAL</span>
        <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }}></div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <label className="form-label" style={{ fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Full Name</label>
          <input 
            type="text" 
            name="full_name" 
            className="form-input" 
            value={formData.full_name} 
            onChange={handleChange} 
            required 
            placeholder="John Doe"
            style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #cbd5e1', color: '#0f172a', background: '#ffffff' }}
          />
        </div>

        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <label className="form-label" style={{ fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Email Address</label>
          <input 
            type="email" 
            name="email" 
            className="form-input" 
            value={formData.email} 
            onChange={handleChange} 
            required 
            placeholder="learner@example.com"
            style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #cbd5e1', color: '#0f172a', background: '#ffffff' }}
          />
        </div>

        <div className="form-group" style={{ marginBottom: '1.25rem' }}>
          <label className="form-label" style={{ fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Password (min 6 chars)</label>
          <input 
            type="password" 
            name="password" 
            className="form-input" 
            value={formData.password} 
            onChange={handleChange} 
            required 
            placeholder="••••••••"
            style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #cbd5e1', color: '#0f172a', background: '#ffffff' }}
          />
        </div>

        {/* Interactive Native Language Buttons */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label className="form-label" style={{ fontWeight: 700, display: 'block', marginBottom: '0.5rem', color: 'var(--text-main)' }}>
            I Speak (Native Language)
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.5rem' }}>
            {languages.map(l => {
              const isSelected = formData.preferred_language_code === l.code;
              return (
                <button
                  key={`pref_${l.code}`}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, preferred_language_code: l.code }))}
                  style={{
                    padding: '0.65rem 0.5rem',
                    borderRadius: '10px',
                    border: isSelected ? '2.5px solid var(--primary-color)' : '1px solid #cbd5e1',
                    background: isSelected ? 'rgba(16, 185, 129, 0.15)' : '#ffffff',
                    color: isSelected ? '#10b981' : '#0f172a',
                    fontWeight: '700',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span style={{ fontSize: '1rem', marginRight: '4px' }}>{l.flag || '🌐'}</span>
                  {l.name}
                  <div style={{ fontSize: '0.75rem', fontWeight: '500', opacity: 0.8 }}>{l.native_name}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Interactive Target Language Buttons */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label className="form-label" style={{ fontWeight: 700, display: 'block', marginBottom: '0.5rem', color: 'var(--text-main)' }}>
            I Want to Learn (Target Language)
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.5rem' }}>
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
                    borderRadius: '10px',
                    border: isSelected ? '2.5px solid #3b82f6' : '1px solid #cbd5e1',
                    background: isSelected ? 'rgba(59, 130, 246, 0.15)' : (isSameAsPref ? '#f1f5f9' : '#ffffff'),
                    color: isSelected ? '#3b82f6' : (isSameAsPref ? '#94a3b8' : '#0f172a'),
                    fontWeight: '700',
                    fontSize: '0.9rem',
                    cursor: isSameAsPref ? 'not-allowed' : 'pointer',
                    opacity: isSameAsPref ? 0.5 : 1,
                    textAlign: 'center',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span style={{ fontSize: '1rem', marginRight: '4px' }}>{l.flag || '🌐'}</span>
                  {l.name}
                  <div style={{ fontSize: '0.75rem', fontWeight: '500', opacity: 0.8 }}>{l.native_name}</div>
                </button>
              );
            })}
          </div>
        </div>

        {error && (
          <div style={{ marginBottom: '1.25rem', padding: '0.85rem', background: '#ffebee', color: '#c62828', borderRadius: '10px', fontSize: '0.9rem' }}>
            ⚠️ {error}
          </div>
        )}

        <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.9rem', borderRadius: '12px', fontWeight: '700' }} disabled={loading}>
          {loading ? 'CREATING ACCOUNT...' : 'REGISTER & VERIFY EMAIL'}
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: '1.5rem', fontWeight: 600, fontSize: '0.95rem' }}>
        Already have an account? <Link to="/login" style={{ color: 'var(--primary-color)', fontWeight: 700 }}>Log In</Link>
      </div>
    </div>
  );
};

export default Register;
