import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import ProfileDashboard from './components/Profile/ProfileDashboard';
import CourseCatalog from './components/Courses/CourseCatalog';
import CourseDetail from './components/Courses/CourseDetail';
import LessonViewer from './components/Lessons/LessonViewer';
import AssessmentRunner from './components/Assessments/AssessmentRunner';
import LearnerDashboard from './components/Dashboard/LearnerDashboard';
import { BookOpen, Sparkles, ArrowRight, Globe, CheckCircle, Award } from 'lucide-react';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ padding: '2rem' }}>Loading Auth...</div>;
  return user ? children : <Navigate to="/login" />;
};

const Home = () => {
  return (
    <div style={{ textAlign: 'center', marginTop: '5vh', maxWidth: '850px', padding: '0 1rem' }}>
      
      <div style={{ 
        display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '0.4rem 1rem', 
        borderRadius: '9999px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)',
        color: '#10b981', fontSize: '0.85rem', fontWeight: '700', marginBottom: '1.5rem' 
      }}>
        <Sparkles size={16} /> Literacy & Language Assistance Platform
      </div>

      <h1 style={{ fontSize: '3.25rem', color: 'var(--text-main)', marginBottom: '1.25rem', fontWeight: '800', lineHeight: '1.15', letterSpacing: '-1px' }}>
        Empowering Reading & Language Literacy <span style={{ color: 'var(--primary-color)' }}>for Everyone.</span>
      </h1>

      <p style={{ 
        fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: '2.5rem', 
        lineHeight: '1.6', maxWidth: '720px', margin: '0 auto 2.5rem auto' 
      }}>
        Foundational phonics, structured reading modules, interactive assessments, and personalized learning progress.
      </p>

      <div style={{ display: 'flex', gap: '1.25rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '4rem' }}>
        <Link to="/courses" className="btn btn-primary" style={{ padding: '1rem 2.25rem', fontSize: '1.05rem', gap: '10px' }}>
          <BookOpen size={20} /> Explore Courses <ArrowRight size={18} />
        </Link>
        <Link to="/register" className="btn btn-secondary" style={{ padding: '1rem 2.25rem', fontSize: '1.05rem' }}>
          Create Free Account
        </Link>
      </div>

      {/* Target Language Selection Bar */}
      <div style={{ textAlign: 'left', margin: '4rem 0' }}>
        <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1.5rem', fontWeight: '700' }}>
          Available Target Languages
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
          {[
            { name: 'Spanish', flag: '🇪🇸' },
            { name: 'English', flag: '🇬🇧' },
            { name: 'French', flag: '🇫🇷' },
            { name: 'German', flag: '🇩🇪' },
            { name: 'Japanese', flag: '🇯🇵' }
          ].map(lang => (
            <Link key={lang.name} to="/courses" className="flag-card">
              <span style={{ fontSize: '1.75rem' }}>{lang.flag}</span>
              <span>{lang.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div style={{ 
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
        gap: '1.5rem', textAlign: 'left', margin: '3rem 0' 
      }}>
        <div className="card">
          <div style={{ color: 'var(--primary-color)', marginBottom: '0.75rem' }}>
            <Globe size={32} />
          </div>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>Multi-Language Support</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.4' }}>
            Learn reading, vocabulary, and grammar in English, Spanish, French, German, and Japanese.
          </p>
        </div>

        <div className="card">
          <div style={{ color: 'var(--secondary-color)', marginBottom: '0.75rem' }}>
            <CheckCircle size={32} />
          </div>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>Structured Phonics & Lessons</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.4' }}>
            Structured course topics, bite-sized lessons, and estimated completion times.
          </p>
        </div>

        <div className="card">
          <div style={{ color: 'var(--accent-orange)', marginBottom: '0.75rem' }}>
            <Award size={32} />
          </div>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>Interactive Assessments</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.4' }}>
            Instant scoring feedback, pass thresholds, and automated database progress tracking.
          </p>
        </div>
      </div>

    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/courses" element={<CourseCatalog />} />
              <Route path="/courses/:courseId" element={<CourseDetail />} />
              <Route path="/lessons/:lessonId" element={<LessonViewer />} />
              <Route path="/assessments/:assessmentId" element={<AssessmentRunner />} />
              <Route path="/dashboard" element={
                <PrivateRoute>
                  <LearnerDashboard />
                </PrivateRoute>
              } />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/profile" element={
                <PrivateRoute>
                  <ProfileDashboard />
                </PrivateRoute>
              } />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
