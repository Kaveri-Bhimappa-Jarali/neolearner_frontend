import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BookOpen, Mail, Lock, Eye, EyeOff, Sparkles, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Google Multi-Account Modal States
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [savedAccounts, setSavedAccounts] = useState([]);
  const [isAddingNewAccount, setIsAddingNewAccount] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [customGoogleName, setCustomGoogleName] = useState('');

  const { user, login, googleLogin } = useAuth();
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }
    if (!password) {
      setError('Please enter your password');
      return;
    }

    setLoading(true);
    try {
      const loggedUser = await login(email.trim().toLowerCase(), password);
      if (loggedUser?.is_admin) {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      const msg = err.response?.data?.detail || (err.message === 'Network Error' ? 'Cannot connect to backend server. Please check your connection.' : 'Invalid email or password');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenGoogleModal = () => {
    setError('');
    const prefEmail = email.trim() ? email.trim().toLowerCase() : '';
    setCustomGoogleEmail(prefEmail);
    setCustomGoogleName('');
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
        full_name: account.name || account.email.split('@')[0],
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
      } else if (result.user?.is_admin) {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Google Single Sign-On failed. Please verify your email.');
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
      name: customGoogleName.trim() || customGoogleEmail.split('@')[0],
      avatar: 'https://lh3.googleusercontent.com/a/default-user'
    };

    await handleSelectGoogleAccount(newAcc);
  };

  return (
    <div style={{ width: '100%', maxWidth: '1050px', margin: '1.5rem auto', animation: 'fadeIn 0.3s ease' }}>
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
        {/* Left Branding / Feature Hero Column */}
        <div 
          style={{ 
            background: 'linear-gradient(135deg, #0d172a 0%, #111c33 50%, #08111f 100%)', 
            padding: '3rem 2.5rem', 
            display: 'flex', 
            flexDirection: 'column', 
            justify: 'space-between',
            borderRight: '1px solid var(--border-color)',
            position: 'relative'
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
              Master Regional Languages with AI Voice Tutoring 🚀
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '2rem' }}>
              Gamified bite-sized lessons, interactive voice roleplay, SM-2 spaced repetition, and diagnostic literacy placement.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-main)', fontWeight: '600' }}>
                <CheckCircle2 size={20} color="var(--primary-color)" />
                <span>100% Free AI Conversation Lab</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-main)', fontWeight: '600' }}>
                <CheckCircle2 size={20} color="var(--primary-color)" />
                <span>Supports Kannada, Telugu, Hindi, & Marathi</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-main)', fontWeight: '600' }}>
                <CheckCircle2 size={20} color="var(--primary-color)" />
                <span>Real-time Speech Recognition & Audio Evaluation</span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            <ShieldCheck size={18} color="var(--primary-color)" />
            <span>Secure 256-bit encrypted authentication</span>
          </div>
        </div>

        {/* Right Authentication Form Column */}
        <div style={{ padding: '3rem 2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '0.5rem' }}>Welcome Back 👋</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.98rem' }}>Sign in to continue your personalized learning journey</p>
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
            {googleLoading ? 'Connecting...' : 'Continue with Google'}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
            <span style={{ color: 'var(--text-subtle)', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.5px' }}>OR WITH EMAIL</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label className="form-label" style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.4rem', color: 'var(--text-main)', fontSize: '0.88rem' }}>
                <Mail size={16} color="var(--primary-color)" /> Email Address
              </label>
              <input 
                type="email" 
                className="form-input" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                placeholder="learner@example.com"
                style={{
                  width: '100%',
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  background: 'var(--background)',
                  fontSize: '0.95rem'
                }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <label className="form-label" style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-main)', fontSize: '0.88rem', margin: 0 }}>
                  <Lock size={16} color="var(--primary-color)" /> Password
                </label>
              </div>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  className="form-input" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                  placeholder="••••••••"
                  style={{
                    width: '100%',
                    padding: '0.85rem 2.8rem 0.85rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-main)',
                    background: 'var(--background)',
                    fontSize: '0.95rem'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px'
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            
            {error && (
              <div style={{ marginBottom: '1.25rem', padding: '0.85rem 1rem', background: 'var(--error-bg)', color: 'var(--error)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(239,68,68,0.3)', fontSize: '0.9rem' }}>
                ⚠️ {error}
                {error.includes('No account found') && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <Link to="/register" style={{ fontWeight: '700', color: 'var(--primary-color)', textDecoration: 'underline' }}>
                      Click here to Create a Free Account →
                    </Link>
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
              {loading ? 'LOGGING IN...' : 'LOG IN TO NEOLEARNER'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.75rem', fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-muted)' }}>
            Don't have an account yet? <Link to="/register" style={{ color: 'var(--primary-color)', fontWeight: 800 }}>Create One Now</Link>
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
                <h3 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)' }}>Sign In with Google</h3>
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
                    {googleLoading ? 'SIGNING IN...' : 'SIGN IN WITH GOOGLE'}
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

export default Login;
