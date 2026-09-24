import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../utils/i18n';
import { 
  Users, BookOpen, BarChart3, Sparkles, Award, 
  ShieldAlert, Layers, CheckCircle2, Search, Filter, RefreshCw, Eye, Compass, Activity, Database
} from 'lucide-react';
import LearnerManagement from './LearnerManagement';
import LearningAnalytics from './LearningAnalytics';
import ContentManagement from './ContentManagement';
import AiMonitoring from './AiMonitoring';
import AchievementManagement from './AchievementManagement';
import DatabaseExplorer from './DatabaseExplorer';
import StoryAdventureManagement from './StoryAdventureManagement';
import VocabularyManagement from './VocabularyManagement';
import Badge from '../ui/Badge';
import StatCard from '../ui/StatCard';

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
      <div className="page-container" style={{ maxWidth: '640px', textAlign: 'center', margin: '4rem auto' }}>
        <div className="card" style={{ padding: '3rem', border: '1px solid var(--error)', borderRadius: 'var(--radius-xl)', background: 'var(--surface-card)' }}>
          <ShieldAlert size={64} color="var(--error)" style={{ marginBottom: '1.25rem' }} />
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
            403 Admin Access Forbidden
          </h2>
          <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '1.5rem' }}>
            You must be logged in with an administrator account (`is_admin: true`) to access the system administration portal.
          </p>
          <Link to="/dashboard" className="btn btn-primary">Return to Learner Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container" style={{ maxWidth: '1250px', margin: '0 auto', padding: '1rem', animation: 'fadeIn 0.3s ease' }}>
      
      {/* Header Banner */}
      <div className="card admin-header-card" style={{ background: 'var(--surface-card)', borderRadius: 'var(--radius-xl)', padding: '2.25rem', border: '1px solid var(--border-color)', marginBottom: '2rem', boxShadow: 'var(--shadow-md)' }}>
        <div className="admin-header-flex" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem' }}>
          <div>
            <Badge variant="purple" icon={ShieldAlert}>ADMINISTRATOR CONTROL PORTAL</Badge>
            <h1 className="page-title" style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)', fontWeight: '900', color: 'var(--text-main)', margin: '0.5rem 0 0.35rem' }}>
              NeoLearner Admin Operations
            </h1>
            <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.95rem' }}>
              Manage learners, monitor AI engines, configure curricula, and inspect system database records.
            </p>
          </div>

          <div className="admin-header-actions" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <Link to="/dashboard" className="btn btn-secondary" style={{ padding: '0.65rem 1.25rem', fontSize: '0.88rem', fontWeight: '700', gap: '6px' }}>
              <Eye size={16} /> Learner View
            </Link>
            <button onClick={fetchOverview} className="btn btn-secondary" style={{ padding: '0.65rem 1rem', fontSize: '0.88rem', gap: '6px' }} title="Refresh metrics">
              <RefreshCw size={16} /> Refresh
            </button>
            <Badge variant="teal">👑 Admin: {user.full_name}</Badge>
          </div>
        </div>

        {/* Top Metric Cards Ribbon */}
        {overview && (
          <div className="admin-metrics-ribbon" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginTop: '1.75rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
            <StatCard title="Total Learners" value={overview.total_learners} icon={Users} color="teal" />
            <StatCard title="Active (7 Days)" value={overview.active_learners_7d} icon={Activity} color="indigo" />
            <StatCard title="Lessons Completed" value={overview.total_completed_lessons} icon={BookOpen} color="gold" />
            <StatCard title="Avg Proficiency" value={`${overview.avg_proficiency_score}%`} icon={BarChart3} color="purple" />
          </div>
        )}
      </div>

      {/* Navigation Tabs Bar */}
      <div className="admin-tabs-bar" style={{ display: 'flex', gap: '0.65rem', overflowX: 'auto', paddingBottom: '0.75rem', marginBottom: '1.75rem', scrollbarWidth: 'thin' }}>
        {[
          { id: 'overview', label: 'Learner Management', icon: <Users size={16} /> },
          { id: 'content', label: 'Curriculum Studio', icon: <BookOpen size={16} /> },
          { id: 'achievements', label: 'Achievements Manager', icon: <Award size={16} /> },
          { id: 'stories_adventures', label: 'Stories & Roleplay', icon: <Compass size={16} /> },
          { id: 'vocabulary', label: 'Vocabulary & SRS', icon: <RefreshCw size={16} /> },
          { id: 'analytics', label: 'Learning Analytics', icon: <BarChart3 size={16} /> },
          { id: 'ai_monitoring', label: 'AI & Recommendations', icon: <Sparkles size={16} /> },
          { id: 'database', label: 'Universal DB Inspector', icon: <Database size={16} /> }
        ].map(tab => (
          <button
            key={tab.id}
            className={`btn ${activeTab === tab.id ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab(tab.id)}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              padding: '0.7rem 1.25rem', 
              whiteSpace: 'nowrap', 
              borderRadius: 'var(--radius-md)',
              fontWeight: '800',
              fontSize: '0.9rem'
            }}
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
