import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

const Register = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    preferred_language_id: '',
    target_language_id: '',
    proficiency_level: 'Beginner'
  });
  const [languages, setLanguages] = useState([]);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const res = await api.get('/languages/');
        setLanguages(res.data);
      } catch (err) {
        console.error('Failed to fetch languages');
      }
    };
    fetchLanguages();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register({
        ...formData,
        preferred_language_id: formData.preferred_language_id || null,
        target_language_id: formData.target_language_id || null,
      });
      navigate('/profile');
    } catch (err) {
      setError('Registration failed. Email might already exist.');
    }
  };

  return (
    <div className="auth-card" style={{ maxWidth: '600px' }}>
      <div className="auth-header">
        <h2>Create your profile</h2>
        <p style={{ color: 'var(--text-muted)' }}>Start your learning journey today</p>
      </div>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input name="full_name" type="text" className="form-input" onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input name="email" type="email" className="form-input" onChange={handleChange} required />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Password</label>
          <input name="password" type="password" className="form-input" onChange={handleChange} required />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Native Language (Interface)</label>
            <select name="preferred_language_id" className="form-select" onChange={handleChange}>
              <option value="">Select Language</option>
              {languages.map(l => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">I want to learn</label>
            <select name="target_language_id" className="form-select" onChange={handleChange}>
              <option value="">Select Language</option>
              {languages.map(l => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Proficiency Level</label>
          <select name="proficiency_level" className="form-select" onChange={handleChange}>
            <option value="Beginner">Beginner - Just starting out</option>
            <option value="Intermediate">Intermediate - Know some basics</option>
            <option value="Advanced">Advanced - Looking to master</option>
          </select>
        </div>

        {error && <div className="form-error" style={{ marginBottom: '1rem' }}>{error}</div>}
        <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>CREATE ACCOUNT</button>
      </form>
      <div style={{ textAlign: 'center', marginTop: '1.5rem', fontWeight: 600 }}>
        Already have an account? <Link to="/login">Log in</Link>
      </div>
    </div>
  );
};

export default Register;
