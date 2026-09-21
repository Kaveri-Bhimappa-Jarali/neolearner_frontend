import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

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
      const msg = err.response?.data?.detail || (err.message === 'Network Error' ? `Cannot connect to backend server at ${api.defaults.baseURL || 'the configured API URL'}. Please verify backend status and VITE_API_BASE_URL setting.` : 'Invalid email or password');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card" style={{ maxWidth: '480px', margin: '3rem auto' }}>
      <div className="auth-header">
        <h2>Welcome Back 👋</h2>
        <p style={{ color: 'var(--text-muted)' }}>Log in to continue your learning journey</p>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Email Address</label>
          <input 
            type="email" 
            className="form-input" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            placeholder="e.g. learner@example.com"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <input 
            type="password" 
            className="form-input" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            placeholder="••••••••"
          />
        </div>
        
        {error && (
          <div className="form-error" style={{ marginBottom: '1.25rem', padding: '0.85rem 1rem', background: '#ffebee', color: '#c62828', borderRadius: '10px', border: '1px solid #ef9a9a', fontSize: '0.9rem' }}>
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

        <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.9rem' }} disabled={loading}>
          {loading ? 'LOGGING IN...' : 'LOG IN'}
        </button>
      </form>
      <div style={{ textAlign: 'center', marginTop: '1.5rem', fontWeight: 600 }}>
        Don't have an account? <Link to="/register">Create one now</Link>
      </div>
    </div>
  );
};

export default Login;
