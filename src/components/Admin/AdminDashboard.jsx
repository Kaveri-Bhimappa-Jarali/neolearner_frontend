import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../utils/i18n';
import { 
  Users, BookOpen, BarChart3, Sparkles, Award, 
  ShieldAlert, Layers, CheckCircle2, Search, Filter, RefreshCw, Eye, Compass
} from 'lucide-react';
import LearnerManagement from './LearnerManagement';
import LearningAnalytics from './LearningAnalytics';
import ContentManagement from './ContentManagement';
import AiMonitoring from './AiMonitoring';
import AchievementManagement from './AchievementManagement';
import DatabaseExplorer from './DatabaseExplorer';
import StoryAdventureManagement from './StoryAdventureManagement';
import VocabularyManagement from './VocabularyManagement';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('overview');
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOverview();
  }, []);

  const fetchOverview = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/admin/overview');
      setOverview(res.data);
    } catch (err) {
      console.error('Failed to load admin overview:', err);
      setError(err.response?.data?.detail || 'Admin access forbidden. You must be an authorized admin.');
    } finally {
      setLoading(false);
    }
  };

  if (!user || !user.is_admin) {
    return (
      <div className="page-container" style={{ maxWidth: '600px', textAlign: 'center', margin: '4rem auto' }}>
        <div className="card" style={{ padding: '3rem', border: '2px dashed var(--error)', borderRadius: '24px' }}>
          <ShieldAlert size={64} color="var(--error)" style={{ marginBottom: '1.25rem' }} />
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
            403 Admin Access Forbidden
          </h2>
          <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '1.5rem' }}>
            You must be logged in with an administrator account (`is_admin: true`) to access the system administration portal.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.5rem 1rem' }}>
      
      {/* Header Banner */}
      <div className="card" style={{ padding: '2rem', borderRadius: '24px', marginBottom: '2rem', background: 'linear-gradient(135deg, rgba(153, 102, 204, 0.12), rgba(59, 130, 246, 0.12))', border: '1px solid var(--accent-purple)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--accent-purple)', display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '0.35rem' }}>
              <ShieldAlert size={16} /> ADMINISTRATOR SYSTEM CONTROL PORTAL
            </span>
            <h1 style={{ fontSize: '2.2rem', fontWeight: '800', color: 'var(--text-main)', margin: '0 0 0.5rem' }}>
              NeoLearner Admin Operations
            </h1>
            <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.95rem' }}>
              Manage learners, monitor AI proficiency engines, configure courses, and inspect system analytics.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <Link to="/dashboard" className="btn btn-secondary" style={{ padding: '0.65rem 1.15rem', fontSize: '0.85rem', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Eye size={16} /> 👤 Learner View
            </Link>
            <button onClick={fetchOverview} className="btn btn-secondary" style={{ padding: '0.65rem 0.9rem', fontSize: '0.85rem', gap: '4px' }} title="Refresh metrics">
              <RefreshCw size={15} /> Refresh
            </button>
            <div style={{ background: 'var(--surface)', padding: '0.65rem 1.15rem', borderRadius: '14px', border: '1px solid var(--border-color)', fontWeight: 'bold', fontSize: '0.85rem' }}>
              👑 Admin: {user.full_name}
            </div>
          </div>
        </div>

        {/* Top Metric Cards Ribbon */}
        {overview && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)' }}>
            <div style={{ background: 'var(--surface)', padding: '1rem', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>TOTAL LEARNERS</div>
              <div style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--primary-color)' }}>{overview.total_learners}</div>
            </div>
            <div style={{ background: 'var(--surface)', padding: '1rem', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>ACTIVE (7 DAYS)</div>
              <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#1cb0f6' }}>{overview.active_learners_7d}</div>
            </div>
            <div style={{ background: 'var(--surface)', padding: '1rem', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>LESSONS COMPLETED</div>
              <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#ff9600' }}>{overview.total_completed_lessons}</div>
            </div>
            <div style={{ background: 'var(--surface)', padding: '1rem', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>AVG PROFICIENCY</div>
              <div style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--accent-purple)' }}>{overview.avg_proficiency_score}%</div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Tabs Bar */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '2rem', paddingBottom: '0.5rem' }}>
        {[
          { id: 'overview', label: 'Learner Management', icon: <Users size={16} /> },
          { id: 'content', label: 'Curriculum Studio', icon: <BookOpen size={16} /> },
          { id: 'achievements', label: 'Achievements Manager', icon: <Award size={16} /> },
          { id: 'stories_adventures', label: 'Stories & Roleplay', icon: <Compass size={16} /> },
          { id: 'vocabulary', label: 'Vocabulary & SRS', icon: <RefreshCw size={16} /> },
          { id: 'analytics', label: 'Learning Analytics', icon: <BarChart3 size={16} /> },
          { id: 'ai_monitoring', label: 'AI & Recommendations', icon: <Sparkles size={16} /> },
          { id: 'database', label: 'Universal DB Inspector', icon: <Layers size={16} /> }
        ].map(tab => (
          <button
            key={tab.id}
            className={`btn ${activeTab === tab.id ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab(tab.id)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.65rem 1.25rem', whiteSpace: 'nowrap', borderRadius: '12px' }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Active Tab Panel Body */}
      {activeTab === 'overview' && <LearnerManagement />}
      {activeTab === 'content' && <ContentManagement />}
      {activeTab === 'achievements' && <AchievementManagement />}
      {activeTab === 'stories_adventures' && <StoryAdventureManagement />}
      {activeTab === 'vocabulary' && <VocabularyManagement />}
      {activeTab === 'analytics' && <LearningAnalytics />}
      {activeTab === 'ai_monitoring' && <AiMonitoring />}
      {activeTab === 'database' && <DatabaseExplorer />}

    </div>
  );
};

export default AdminDashboard;

