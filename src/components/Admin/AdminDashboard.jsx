import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../utils/i18n';
import { 
  Users, BookOpen, BarChart3, Sparkles, Award, 
  ShieldAlert, RefreshCw, Eye, Compass, Activity, Database,
  FileCheck2, Crown, Zap, ChevronRight, CheckCircle2, ArrowUpRight
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
      
      {/* Royal Hero Card - Compact Content-Driven Height (Zero Empty Space) */}
      <div className="card admin-hero-card" style={{
        background: 'linear-gradient(135deg, rgba(11, 15, 25, 0.98) 0%, rgba(26, 21, 59, 0.95) 50%, rgba(13, 23, 42, 0.98) 100%)',
        borderRadius: '24px',
        padding: 'clamp(1.25rem, 3vw, 2rem)',
        border: '1px solid rgba(212, 175, 55, 0.3)',
        marginBottom: '1.75rem',
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.5), 0 0 24px rgba(109, 40, 217, 0.15)',
        width: '100%',
        boxSizing: 'border-box',
        position: 'relative',
        overflow: 'hidden',
        height: 'auto',
        minHeight: 0
      }}>
        {/* Subtle Ambient Radial Glow */}
        <div style={{
          position: 'absolute',
          top: '-80px',
          right: '-80px',
          width: '280px',
          height: '280px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(212, 175, 55, 0.15) 0%, rgba(109, 40, 217, 0.15) 50%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        {/* Top Control Bar: Badges, Status & Quick Action Buttons */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.25rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          {/* Left Status Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <Badge variant="purple" icon={ShieldAlert}>ADMINISTRATOR CONTROL PORTAL</Badge>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: '9999px',
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#34d399',
              fontSize: '0.78rem',
              fontWeight: '800'
            }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#34d399', boxShadow: '0 0 10px #34d399' }} />
              <span>System Online</span>
            </div>
          </div>

          {/* Right Admin Crown Tag & Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '0.45rem 0.95rem',
              borderRadius: '12px',
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

            <Link 
              to="/dashboard" 
              className="btn" 
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#f8fafc',
                padding: '0.5rem 1rem',
                fontSize: '0.85rem',
                fontWeight: '700',
                borderRadius: '12px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Eye size={15} /> Learner View
            </Link>

            <button 
              onClick={fetchOverview} 
              className="btn" 
              style={{
                background: 'rgba(212, 175, 55, 0.12)',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                color: '#fbbf24',
                padding: '0.5rem 0.95rem',
                fontSize: '0.85rem',
                fontWeight: '800',
                borderRadius: '12px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer'
              }} 
              title="Refresh metrics"
              disabled={loading}
            >
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} /> Refresh
            </button>
          </div>
        </div>

        {/* Title & Subtitle */}
        <div style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
          <h1 style={{ 
            fontSize: 'clamp(1.6rem, 3.8vw, 2.4rem)', 
            fontWeight: '900', 
            color: '#ffffff', 
            margin: '0 0 0.4rem 0', 
            lineHeight: '1.2',
            letterSpacing: '-0.02em',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <span>NeoLearner Admin Operations</span>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: '800',
              padding: '3px 10px',
              borderRadius: '9999px',
              background: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)',
              color: '#0b0f19',
              letterSpacing: '0.05em'
            }}>ROYAL SAAS</span>
          </h1>
          <p style={{ 
            color: '#94a3b8', 
            margin: 0, 
            fontSize: 'clamp(0.88rem, 2vw, 1rem)', 
            lineHeight: '1.5', 
            maxWidth: '780px'
          }}>
            Manage learners, modules, communication, and platform data from one place.
          </p>
        </div>

        {/* Compact 4-Stat Cards Ribbon directly inside Hero (No Empty Space) */}
        <div className="admin-metrics-ribbon" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '1rem',
          margin: 0,
          paddingTop: '1.25rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          <StatCard 
            title="Total Learners" 
            value={overview ? overview.total_learners : '...'} 
            subtitle="Registered Accounts"
            trend="Live Database"
            icon={Users} 
            color="teal" 
          />
          <StatCard 
            title="Active 7 Days" 
            value={overview ? overview.active_learners_7d : '...'} 
            subtitle="Weekly Engaged Users"
            trend="7D Activity"
            icon={Activity} 
            color="indigo" 
          />
          <StatCard 
            title="Lessons Completed" 
            value={overview ? overview.total_completed_lessons : '...'} 
            subtitle="Practice Modules"
            trend="Completed"
            icon={BookOpen} 
            color="gold" 
          />
          <StatCard 
            title="Avg Progress" 
            value={overview ? `${overview.avg_proficiency_score}%` : '...'} 
            subtitle="CEFR Index"
            trend="AI Calibrated"
            icon={BarChart3} 
            color="purple" 
          />
        </div>
      </div>

      {/* Admin Modules Quick Grid (Overview Tab Top Hub) */}
      {activeTab === 'overview' && (
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              <Zap size={20} color="#fbbf24" /> Platform Control Modules
            </h2>
            <span style={{ fontSize: '0.82rem', color: '#94a3b8', fontWeight: '600' }}>9 Modules Active</span>
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
                    padding: '1.1rem 1.25rem',
                    borderRadius: '16px',
                    background: isSelected ? 'rgba(109, 40, 217, 0.22)' : 'var(--surface-card)',
                    border: isSelected ? '1.5px solid #fbbf24' : '1px solid rgba(212, 175, 55, 0.2)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: isSelected ? '0 8px 24px rgba(109, 40, 217, 0.3)' : 'var(--shadow-sm)'
                  }}
                  className="admin-module-quick-card"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      padding: '10px',
                      borderRadius: '12px',
                      background: isSelected ? 'rgba(251, 191, 36, 0.2)' : 'rgba(212, 175, 55, 0.1)',
                      border: '1px solid rgba(212, 175, 55, 0.3)',
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
                  <ChevronRight size={18} color={isSelected ? '#fbbf24' : '#64748b'} />
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
            border: '1.5px solid #fbbf24',
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
                border: isActive ? '1.5px solid #fbbf24' : '1px solid rgba(212, 175, 55, 0.2)',
                background: isActive ? 'linear-gradient(135deg, #6d28d9 0%, #4c1d95 100%)' : 'var(--surface-card)',
                color: isActive ? '#ffffff' : 'var(--text-main)',
                boxShadow: isActive ? '0 4px 18px rgba(109, 40, 217, 0.4)' : 'none'
              }}
            >
              <IconComp size={16} color={isActive ? '#fbbf24' : '#94a3b8'} /> {tab.label}
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
