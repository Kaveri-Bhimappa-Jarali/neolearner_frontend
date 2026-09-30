import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../utils/i18n';
import { 
  Users, BookOpen, BarChart3, Sparkles, Award, 
  ShieldAlert, RefreshCw, Eye, Compass, Activity, Database,
  FileCheck2, Crown, Zap, ChevronRight
} from 'lucide-react';
import LearnerManagement from './LearnerManagement';
import LearningAnalytics from './LearningAnalytics';
import ContentManagement from './ContentManagement';
import AiMonitoring from './AiMonitoring';
import AchievementManagement from './AchievementManagement';
import DatabaseExplorer from './DatabaseExplorer';
import StoryAdventureManagement from './StoryAdventureManagement';
import VocabularyManagement from './VocabularyManagement';
import TestManagement from './TestManagement';
import Badge from '../ui/Badge';
import StatCard from '../ui/StatCard';

const ADMIN_TABS = [
  { id: 'overview', label: 'Learner Management', icon: Users, desc: 'Manage user profiles, roles & levels' },
  { id: 'tests', label: 'Assessment Tests', icon: FileCheck2, desc: 'Configure exams, pass scores & metrics' },
  { id: 'content', label: 'Curriculum Studio', icon: BookOpen, desc: 'Edit modules, topics & lesson content' },
  { id: 'achievements', label: 'Achievements Manager', icon: Award, desc: 'Setup platform badges & XP rewards' },
  { id: 'stories_adventures', label: 'Stories & Roleplay', icon: Compass, desc: 'Manage interactive AI story paths' },
  { id: 'vocabulary', label: 'Vocabulary & SRS', icon: RefreshCw, desc: 'Inspect Spaced Repetition items' },
  { id: 'analytics', label: 'Learning Analytics', icon: BarChart3, desc: 'Deep dive performance metrics' },
  { id: 'ai_monitoring', label: 'AI & Recommendations', icon: Sparkles, desc: 'Monitor LLM engine & prompt metrics' },
  { id: 'database', label: 'Universal DB Inspector', icon: Database, desc: 'Direct SQLite schema & table explorer' }
];

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
    <div className="admin-container" style={{ maxWidth: '1380px', margin: '0 auto', padding: '1rem 1.25rem', animation: 'fadeIn 0.3s ease', width: '100%', boxSizing: 'border-box' }}>
      
      {/* Page Hero Card / SaaS Header */}
      <div className="card admin-hero-card" style={{
        background: 'linear-gradient(135deg, rgba(17, 23, 38, 0.95) 0%, rgba(30, 27, 75, 0.85) 50%, rgba(13, 23, 42, 0.95) 100%)',
        borderRadius: '24px',
        padding: 'clamp(1.25rem, 3.5vw, 2.25rem)',
        border: '1px solid rgba(109, 40, 217, 0.35)',
        marginBottom: '2rem',
        boxShadow: '0 12px 36px rgba(0, 0, 0, 0.45)',
        width: '100%',
        boxSizing: 'border-box',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Subtle Ambient Background Accent */}
        <div style={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '240px',
          height: '240px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(109, 40, 217, 0.25) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div className="admin-header-flex">
          <div style={{ flex: '1 1 340px', minWidth: 0, textAlign: 'left' }}>
            {/* Status & Badge Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.6rem', flexWrap: 'wrap' }}>
              <Badge variant="purple" icon={ShieldAlert}>ADMINISTRATOR CONTROL PORTAL</Badge>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '3px 10px',
                borderRadius: '9999px',
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: '#34d399',
                fontSize: '0.75rem',
                fontWeight: '700'
              }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#34d399', boxShadow: '0 0 8px #34d399' }} />
                <span>System Online</span>
              </div>
            </div>

            <h1 style={{ 
              fontSize: 'clamp(1.5rem, 3.5vw, 2.35rem)', 
              fontWeight: '900', 
              color: '#ffffff', 
              margin: '0.3rem 0 0.4rem', 
              lineHeight: '1.25',
              letterSpacing: '-0.02em'
            }}>
              NeoLearner Admin Operations
            </h1>
            <p style={{ 
              color: '#94a3b8', 
              margin: 0, 
              fontSize: 'clamp(0.88rem, 2.2vw, 1.02rem)', 
              lineHeight: '1.55', 
              maxWidth: '740px', 
              textAlign: 'left' 
            }}>
              Manage learners, modules, communication, and platform data from one place.
            </p>
          </div>

          {/* Action Buttons & Admin Identity */}
          <div className="admin-header-actions">
            <Link to="/dashboard" className="btn btn-secondary" style={{ padding: '0.65rem 1.15rem', fontSize: '0.88rem', fontWeight: '700', gap: '6px', borderRadius: '12px' }}>
              <Eye size={16} /> Learner View
            </Link>
            
            <button 
              onClick={fetchOverview} 
              className="btn btn-secondary" 
              style={{ padding: '0.65rem 1rem', fontSize: '0.88rem', gap: '6px', borderRadius: '12px' }} 
              title="Refresh metrics"
              disabled={loading}
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh
            </button>

            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '0.5rem 1rem',
              borderRadius: '14px',
              background: 'rgba(212, 175, 55, 0.12)',
              border: '1px solid rgba(212, 175, 55, 0.35)',
              color: '#fbbf24',
              fontWeight: '800',
              fontSize: '0.85rem'
            }}>
              <Crown size={16} color="#fbbf24" />
              <span>{user.full_name}</span>
              <span style={{
                background: '#d97706',
                color: '#0b0f19',
                fontSize: '0.65rem',
                fontWeight: '900',
                padding: '2px 6px',
                borderRadius: '6px',
                letterSpacing: '0.05em'
              }}>ADMIN</span>
            </div>
          </div>
        </div>

        {/* Statistics Dashboard Ribbon (4 Cards Grid) */}
        {overview && (
          <div className="admin-metrics-ribbon">
            <StatCard 
              title="Total Learners" 
              value={overview.total_learners} 
              subtitle="Registered Platform Accounts"
              trend="Total System Accounts"
              icon={Users} 
              color="teal" 
            />
            <StatCard 
              title="Active 7 Days" 
              value={overview.active_learners_7d} 
              subtitle="Weekly Active Learners"
              trend="Engaged Users"
              icon={Activity} 
              color="indigo" 
            />
            <StatCard 
              title="Lessons Completed" 
              value={overview.total_completed_lessons} 
              subtitle="Interactive Practice Sessions"
              trend="Completed Modules"
              icon={BookOpen} 
              color="gold" 
            />
            <StatCard 
              title="Avg Progress" 
              value={`${overview.avg_proficiency_score}%`} 
              subtitle="CEFR Benchmark Index"
              trend="AI Score"
              icon={BarChart3} 
              color="purple" 
            />
          </div>
        )}
      </div>

      {/* Admin Modules Quick Grid (Overview Tab Top Quick Hub) */}
      {activeTab === 'overview' && (
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              <Zap size={20} color="#fbbf24" /> Platform Control Modules
            </h2>
            <span style={{ fontSize: '0.82rem', color: '#94a3b8', fontWeight: '600' }}>9 Modules Available</span>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1rem'
          }}>
            {ADMIN_TABS.map(t => {
              const TabIcon = t.icon;
              const isSelected = activeTab === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  style={{
                    padding: '1.15rem 1.25rem',
                    borderRadius: '16px',
                    background: isSelected ? 'rgba(109, 40, 217, 0.2)' : 'var(--surface-card)',
                    border: isSelected ? '1.5px solid var(--primary-color)' : '1px solid var(--border-color)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                  className="admin-module-quick-card"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      padding: '10px',
                      borderRadius: '12px',
                      background: 'rgba(212, 175, 55, 0.1)',
                      border: '1px solid rgba(212, 175, 55, 0.25)',
                      color: '#fbbf24',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <TabIcon size={20} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#ffffff' }}>{t.label}</div>
                      <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>{t.desc}</div>
                    </div>
                  </div>
                  <ChevronRight size={18} color="#64748b" />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Mobile Select Tab Switcher */}
      <div className="admin-mobile-tab-wrapper" style={{ marginBottom: '1.25rem' }}>
        <label style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem', display: 'block' }}>
          Select Admin Module:
        </label>
        <select
          className="form-select admin-mobile-tab-select"
          value={activeTab}
          onChange={(e) => setActiveTab(e.target.value)}
          style={{
            width: '100%',
            padding: '0.85rem 1rem',
            borderRadius: '14px',
            background: 'var(--surface-card)',
            color: 'var(--text-main)',
            border: '1.5px solid var(--primary-color)',
            fontWeight: '800',
            fontSize: '0.95rem'
          }}
        >
          {ADMIN_TABS.map(t => (
            <option key={t.id} value={t.id}>{t.label}</option>
          ))}
        </select>
      </div>

      {/* Desktop/Tablet Horizontal Navigation Tabs Bar */}
      <div className="admin-tabs-bar" style={{ display: 'flex', gap: '0.65rem', overflowX: 'auto', paddingBottom: '0.75rem', marginBottom: '1.75rem', scrollbarWidth: 'thin' }}>
        {ADMIN_TABS.map(tab => {
          const IconComp = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              className={`btn ${isActive ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab(tab.id)}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                padding: '0.7rem 1.25rem', 
                whiteSpace: 'nowrap', 
                borderRadius: '14px',
                fontWeight: '800',
                fontSize: '0.88rem',
                border: isActive ? '1px solid var(--primary-color)' : '1px solid var(--border-color)',
                boxShadow: isActive ? '0 4px 16px rgba(109, 40, 217, 0.35)' : 'none'
              }}
            >
              <IconComp size={16} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Active Tab Panel Body */}
      {activeTab === 'overview' && <LearnerManagement />}
      {activeTab === 'tests' && <TestManagement />}
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
