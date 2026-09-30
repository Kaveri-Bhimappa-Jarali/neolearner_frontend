import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { 
  TrendingUp, Award, Sparkles, BookOpen, CheckCircle, Clock, Target, 
  Flame, Gem, Trophy, ArrowRight, Compass, Zap, Headphones, Mic, 
  PenTool, AlertTriangle, Layers, PlayCircle, ShieldCheck, CheckCircle2,
  Calendar, Activity, BarChart2, Star, ChevronRight, User, Globe
} from 'lucide-react';
import { useTranslation } from '../../utils/i18n';
import CourseRecommendationBanner from './CourseRecommendationBanner';
import SkillRadarChart from './SkillRadarChart';
import ProgressReportModal from './ProgressReportModal';

const LearnerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [progressList, setProgressList] = useState([]);
  const [resultsList, setResultsList] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [aiRecommendations, setAiRecommendations] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [learningPath, setLearningPath] = useState(null);
  const [leaderboardData, setLeaderboardData] = useState(null);
  const [diagnosticStatus, setDiagnosticStatus] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const [progRes, resRes, recRes, leadRes, aiRecRes, predRes, pathRes, diagRes] = await Promise.all([
          api.get('/progress/me').catch(() => ({ data: [] })),
          api.get('/assessments/results/me').catch(() => ({ data: [] })),
          api.get('/recommendations/me').catch(() => ({ data: [] })),
          api.get('/learners/leaderboard').catch(() => ({ data: null })),
          api.get('/learning-paths/recommendations').catch(() => ({ data: [] })),
          api.get('/learning-paths/prediction').catch(() => ({ data: null })),
          api.get('/learning-paths/me').catch(() => ({ data: null })),
          api.get('/diagnostic/status').catch(() => ({ data: null }))
        ]);
        setProgressList(progRes?.data || []);
        setResultsList(resRes?.data || []);
        setRecommendations(recRes?.data || []);
        setLeaderboardData(leadRes?.data || null);
        setAiRecommendations(aiRecRes?.data || []);
        setPrediction(predRes?.data || null);
        setLearningPath(pathRes?.data || null);
        setDiagnosticStatus(diagRes?.data || null);
      } catch (err) {
        console.error('Error fetching learner dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboard();
    } else {
      setLoading(false);
    }
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: '5rem 1rem' }}>
        <div style={{ fontSize: '1.25rem', color: 'var(--text-muted)', fontWeight: '700' }}>
          {t('analyzingProfile') || 'Analyzing your learning profile...'}
        </div>
      </div>
    );
  }

  const completedCount = progressList.filter(p => p.status === 'completed').length;
  const avgScore = resultsList.length > 0 
    ? (resultsList.reduce((acc, r) => acc + (r.score || 0), 0) / resultsList.length).toFixed(0)
    : 0;

  // Calculate Daily Quests progress
  const todayStr = new Date().toDateString();
  const lessonsCompletedToday = progressList.filter(
    p => p.status === 'completed' && new Date(p.last_accessed).toDateString() === todayStr
  ).length;

  const quizzesCompletedToday = resultsList.filter(
    r => new Date(r.completed_at).toDateString() === todayStr
  ).length;

  const serverXpEarned = user?.daily_xp_earned ?? 0;
  const serverXpGoal = user?.daily_xp_goal ?? 30;

  const quests = [
    { id: 1, title: t('earnXPToday') || 'Earn Daily XP', current: serverXpEarned, target: serverXpGoal, unit: 'XP' },
    { id: 2, title: t('completeLessonToday') || 'Complete 1 Lesson', current: lessonsCompletedToday, target: 1, unit: 'lesson' },
    { id: 3, title: t('completeQuizToday') || 'Complete 1 Quiz', current: quizzesCompletedToday, target: 1, unit: 'quiz' }
  ];

  // Helper flags
  const getLangFlag = (code) => {
    switch (code) {
      case 'en': return '🇬🇧';
      case 'kn': return '🇮🇳';
      case 'te': return '🇮🇳';
      case 'mr': return '🇮🇳';
      case 'hi': return '🇮🇳';
      default: return '🌐';
    }
  };

  const currentCEFR = diagnosticStatus?.cefr_level || user?.cefr_level || 'A0';
  const hasCompletedTest = diagnosticStatus?.has_completed_placement_test || user?.has_completed_placement_test;
  const weakAreas = diagnosticStatus?.weak_areas || [];
  const strengths = diagnosticStatus?.strengths || [];

  // Find next actionable node in learning path
  const nextNode = learningPath?.nodes?.find(n => n.status === 'in_progress') ||
                   learningPath?.nodes?.find(n => n.status !== 'completed') ||
                   learningPath?.nodes?.[0];

  const getNextNodeUrl = (node) => {
    if (!node) return '/learning-path';
    if (node.lesson_id) return `/lessons/${node.lesson_id}`;
    if (node.assessment_id) return `/assessments/${node.assessment_id}`;
    return '/learning-path';
  };

  // Learning categories array (6 core skills)
  const categories = [
    { id: 'speaking', title: 'Speaking', desc: 'AI Voice Conversation Lab', icon: Mic, color: '#4F46E5', link: '/conversation', badge: 'AI Voice' },
    { id: 'listening', title: 'Listening', desc: 'Audio Lessons & Dialogues', icon: Headphones, color: '#6D28D9', link: '/courses', badge: 'Audio' },
    { id: 'reading', title: 'Reading', desc: 'Interactive Culture Stories', icon: BookOpen, color: '#D4A72C', link: '/stories', badge: 'Stories' },
    { id: 'writing', title: 'Writing', desc: 'Mistakes Review & Quizzes', icon: PenTool, color: '#059669', link: '/review/mistakes', badge: 'Practice' },
    { id: 'vocabulary', title: 'Vocabulary', desc: 'Visual Flashcards & SRS', icon: Layers, color: '#DC2626', link: '/flashcards', badge: 'SRS' },
    { id: 'grammar', title: 'Grammar', desc: 'Interactive Practice Hub', icon: Zap, color: '#2563EB', link: '/practice-hub', badge: 'Hub' }
  ];

  return (
    <div className="learner-dashboard-wrapper">
      
      {/* ========================================================
          1. HEADER & WELCOME SECTION
          ======================================================== */}
      <div className="learner-header-card">
        <div className="learner-header-main">
          <div className="learner-avatar-badge">
            <span className="lang-flag">{getLangFlag(user?.target_language?.code)}</span>
          </div>
          <div className="learner-greeting-block">
            <div className="learner-name-row">
              <h1 className="learner-welcome-title">
                Welcome back, {user?.full_name?.split(' ')[0] || 'Learner'}! 👋
              </h1>
              <span className="cefr-badge-pill">{currentCEFR} Level</span>
            </div>
            <p className="learner-motivation-subtitle">
              ✨ Consistency is key! You are mastering <strong>{user?.target_language?.name || 'Kannada'}</strong> in {user?.preferred_language?.name || 'English'}.
            </p>
          </div>
        </div>

        <div className="learner-header-actions">
          {user?.is_admin && (
            <Link to="/admin" className="mobile-admin-link-btn">
              👑 Admin Portal
            </Link>
          )}
          <button 
            className="mobile-analytics-btn"
            onClick={() => setShowReportModal(true)}
          >
            📊 Analytics
          </button>
          <div className="daily-goal-pill">
            <Clock size={16} color="#D4A72C" />
            <span>{user?.daily_minutes_goal || 15}m daily goal</span>
          </div>
        </div>
      </div>

      {/* Hero Alert: Initial Diagnostic Test Required */}
      {!hasCompletedTest && (
        <div className="diagnostic-hero-alert">
          <div className="diagnostic-alert-left">
            <div className="diagnostic-icon-circle">
              <Compass size={28} />
            </div>
            <div>
              <h3 className="diagnostic-alert-title">
                Diagnostic Placement Test Required
              </h3>
              <p className="diagnostic-alert-text">
                Take our 10-minute diagnostic placement test across vocabulary, reading, listening, and speaking to unlock your personalized learning path.
              </p>
            </div>
          </div>
          <Link to="/initial-exam" className="diagnostic-start-btn">
            Start Placement Test 🚀
          </Link>
        </div>
      )}

      {/* Adaptive Course Recommendation Banner */}
      {hasCompletedTest && <CourseRecommendationBanner />}

      {/* ========================================================
          2. CONTINUE LEARNING SECTION
          ======================================================== */}
      {hasCompletedTest && learningPath && (
        <div className="continue-learning-card">
          <div className="continue-card-header">
            <div className="continue-track-badge">
              <Compass size={16} /> Active Learning Track
            </div>
            <span className="continue-rate-text">
              {learningPath.completion_rate}% Complete
            </span>
          </div>

          <h2 className="continue-course-title">
            {learningPath.course_title}
          </h2>
          <p className="continue-course-meta">
            Target Language: {learningPath.target_language_name} • {learningPath.total_nodes} Checkpoint Modules
          </p>

          {/* Animated Progress Bar */}
          <div className="continue-progress-track">
            <div 
              className="continue-progress-fill" 
              style={{ width: `${Math.max(5, learningPath.completion_rate)}%` }} 
            />
          </div>

          {/* Next Playable Node Box */}
          {nextNode && (
            <div className="next-node-box">
              <div className="next-node-info">
                <span className="next-node-tag">
                  Module {nextNode.order} • Up Next
                </span>
                <h4 className="next-node-title">
                  {nextNode.title}
                </h4>
                <span className="next-node-meta">
                  ⏱️ ~{nextNode.duration_minutes || 10} mins • {nextNode.competency_tag}
                </span>
              </div>

              <Link to={getNextNodeUrl(nextNode)} className="continue-btn-cta">
                <PlayCircle size={20} /> Continue Lesson
              </Link>
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          3. PROGRESS SUMMARY KPI GRID
          ======================================================== */}
      <div className="progress-kpi-grid">
        <div className="kpi-card kpi-teal">
          <div className="kpi-icon-wrapper">
            <BookOpen size={22} color="#059669" />
          </div>
          <div className="kpi-content">
            <span className="kpi-value">{completedCount}</span>
            <span className="kpi-label">Lessons Completed</span>
          </div>
        </div>

        <div className="kpi-card kpi-gold">
          <div className="kpi-icon-wrapper">
            <Flame size={22} color="#D4A72C" />
          </div>
          <div className="kpi-content">
            <span className="kpi-value">{user?.streak || 0} 🔥</span>
            <span className="kpi-label">Day Streak</span>
          </div>
        </div>

        <div className="kpi-card kpi-indigo">
          <div className="kpi-icon-wrapper">
            <TrendingUp size={22} color="#4F46E5" />
          </div>
          <div className="kpi-content">
            <span className="kpi-value">{avgScore}%</span>
            <span className="kpi-label">Average Score</span>
          </div>
        </div>

        <div className="kpi-card kpi-purple">
          <div className="kpi-icon-wrapper">
            <Award size={22} color="#6D28D9" />
          </div>
          <div className="kpi-content">
            <span className="kpi-value">{currentCEFR}</span>
            <span className="kpi-label">CEFR Mastery</span>
          </div>
        </div>
      </div>

      {/* ========================================================
          4. LEARNING CATEGORIES (6 SKILLS GRID)
          ======================================================== */}
      <div className="categories-section">
        <div className="section-header-row">
          <h3 className="section-title">
            <Sparkles size={20} color="#6D28D9" /> Learning Categories
          </h3>
          <span className="section-subtitle">Choose a skill to practice</span>
        </div>

        <div className="categories-grid">
          {categories.map((cat) => {
            const IconComp = cat.icon;
            return (
              <Link to={cat.link} key={cat.id} className="category-card-item">
                <div className="category-card-top">
                  <div className="category-icon-box" style={{ background: `${cat.color}15`, color: cat.color }}>
                    <IconComp size={24} />
                  </div>
                  <span className="category-badge-chip" style={{ color: cat.color, borderColor: `${cat.color}30`, background: `${cat.color}10` }}>
                    {cat.badge}
                  </span>
                </div>
                <div className="category-card-body">
                  <h4 className="category-title">{cat.title}</h4>
                  <p className="category-desc">{cat.desc}</p>
                </div>
                <div className="category-card-arrow">
                  <span>Start</span>
                  <ChevronRight size={16} />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ========================================================
          5. RECOMMENDED / RECENT ACTIVITY & QUESTS SECTION
          ======================================================== */}
      <div className="secondary-widgets-grid">
        
        {/* Daily Quests Widget */}
        <div className="widget-card">
          <h3 className="widget-title">
            <Target size={20} color="#4F46E5" /> Daily Quests
          </h3>
          <div className="quests-list">
            {quests.map(q => {
              const pct = Math.min(100, Math.round((q.current / q.target) * 100));
              const isComplete = q.current >= q.target;
              return (
                <div key={q.id} className="quest-item-box">
                  <div className="quest-item-header">
                    <span className="quest-item-title">{q.title}</span>
                    <span className={`quest-item-status ${isComplete ? 'complete' : ''}`}>
                      {q.current} / {q.target} {q.unit} {isComplete && '✅'}
                    </span>
                  </div>
                  <div className="quest-progress-track">
                    <div 
                      className={`quest-progress-fill ${isComplete ? 'complete' : ''}`} 
                      style={{ width: `${pct}%` }} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Skill Diagnostic Radar & Weak Areas */}
        {hasCompletedTest && (
          <div className="widget-card">
            <div className="widget-header-flex">
              <h3 className="widget-title">
                <BarChart2 size={20} color="#6D28D9" /> Diagnostic Competency
              </h3>
              <span className="widget-badge">{currentCEFR} Level</span>
            </div>

            <SkillRadarChart />

            {/* Strengths & Focus Areas */}
            <div className="strengths-weakness-grid">
              {strengths.length > 0 && (
                <div className="sw-pill-group sw-green">
                  <span className="sw-label">Key Strengths</span>
                  <div className="sw-pills-row">
                    {strengths.map((s, idx) => (
                      <span key={idx} className="sw-pill pill-green">{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {weakAreas.length > 0 && (
                <div className="sw-pill-group sw-orange">
                  <span className="sw-label">Needs Focus</span>
                  <div className="sw-pills-row">
                    {weakAreas.map((w, idx) => (
                      <span key={idx} className="sw-pill pill-gold">{w}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* Analytics Modal */}
      {showReportModal && (
        <ProgressReportModal onClose={() => setShowReportModal(false)} />
      )}
    </div>
  );
};

export default LearnerDashboard;
