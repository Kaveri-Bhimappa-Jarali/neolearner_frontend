import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { 
  TrendingUp, Award, Sparkles, BookOpen, CheckCircle, Clock, Target, 
  Flame, Gem, Trophy, ArrowRight, Compass, Zap, Headphones, Mic, 
  PenTool, AlertTriangle, Layers, PlayCircle, ShieldCheck, CheckCircle2
} from 'lucide-react';
import { useTranslation } from '../../utils/i18n';
import CourseRecommendationBanner from './CourseRecommendationBanner';
import SkillRadarChart from './SkillRadarChart';
import ProgressReportModal from './ProgressReportModal';
import AchievementsGrid from '../Achievements/AchievementsGrid';
import PronunciationEvaluator from '../Speech/PronunciationEvaluator';

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
          api.get('/progress/me'),
          api.get('/assessments/results/me'),
          api.get('/recommendations/me'),
          api.get('/learners/leaderboard'),
          api.get('/learning-paths/recommendations'),
          api.get('/learning-paths/prediction'),
          api.get('/learning-paths/me'),
          api.get('/diagnostic/status').catch(() => ({ data: null }))
        ]);
        setProgressList(progRes.data || []);
        setResultsList(resRes.data || []);
        setRecommendations(recRes.data || []);
        setLeaderboardData(leadRes.data || null);
        setAiRecommendations(aiRecRes.data || []);
        setPrediction(predRes.data || null);
        setLearningPath(pathRes.data || null);
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
      <div className="page-container" style={{ textAlign: 'center', padding: '5rem' }}>
        <div style={{ fontSize: '1.25rem', color: 'var(--text-muted)', fontWeight: '600' }}>
          {t('analyzingProfile')}
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
    { id: 1, title: t('earnXPToday'), current: serverXpEarned, target: serverXpGoal, unit: 'XP' },
    { id: 2, title: t('completeLessonToday'), current: lessonsCompletedToday, target: 1, unit: 'lesson' },
    { id: 3, title: t('completeQuizToday'), current: quizzesCompletedToday, target: 1, unit: 'quiz' }
  ];

  // Calculate active days for the weekly calendar (Mon-Sun)
  const activeDaysThisWeek = new Set();
  const getWeekDays = () => {
    const days = [];
    const curr = new Date();
    const first = curr.getDate() - curr.getDay() + (curr.getDay() === 0 ? -6 : 1);
    for (let i = 0; i < 7; i++) {
      const next = new Date(new Date().setDate(first + i));
      days.push(next);
    }
    return days;
  };
  
  const weekDays = getWeekDays();

  progressList.forEach(p => {
    if (p.status === 'completed' && p.last_accessed) {
      activeDaysThisWeek.add(new Date(p.last_accessed).toDateString());
    }
  });

  resultsList.forEach(r => {
    if (r.completed_at) {
      activeDaysThisWeek.add(new Date(r.completed_at).toDateString());
    }
  });

  // Helper flags & labels
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

  const getGoalLabel = (goal) => {
    switch (goal) {
      case 'travel': return t('goalTravel');
      case 'career': return t('goalCareer');
      case 'exam': return t('goalExam');
      case 'family': return t('goalFamily');
      case 'brain': return t('goalBrain');
      case 'conversation': return t('goalConversation');
      default: return t('goalConversation');
    }
  };

  const getCEFRBadge = (cefr) => {
    switch (cefr) {
      case 'C2': return { label: 'C2 Proficient', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.15)' };
      case 'C1': return { label: 'C1 Advanced', color: '#6366f1', bg: 'rgba(99, 102, 241, 0.15)' };
      case 'B2': return { label: 'B2 Upper-Int', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)' };
      case 'B1': return { label: 'B1 Intermediate', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' };
      case 'A2': return { label: 'A2 Elementary', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' };
      case 'A1': return { label: 'A1 Beginner', color: '#ff9600', bg: 'rgba(255, 150, 0, 0.15)' };
      default: return { label: 'A0 Beginner', color: '#64748b', bg: 'rgba(100, 116, 139, 0.15)' };
    }
  };

  const currentCEFR = diagnosticStatus?.cefr_level || user?.cefr_level || 'A0';
  const cefrInfo = getCEFRBadge(currentCEFR);
  const hasCompletedTest = diagnosticStatus?.has_completed_placement_test || user?.has_completed_placement_test;
  const weakAreas = diagnosticStatus?.weak_areas || [];
  const strengths = diagnosticStatus?.strengths || [];
  const skillBreakdown = diagnosticStatus?.skill_breakdown || {};

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

  return (
    <div className="page-container" style={{ maxWidth: '1200px' }}>
      
      {/* Top Banner / Header */}
      <div style={{
        background: 'var(--surface-hover)',
        border: '1px solid var(--border-color)',
        borderRadius: '20px',
        padding: '1.75rem 2rem',
        marginBottom: '2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.5rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <span style={{ fontSize: '1.5rem' }}>{getLangFlag(user?.target_language?.code)}</span>
            <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-main)', margin: 0, lineHeight: '1.3' }}>
              {t('learningTarget', { language: t(user?.target_language?.name) || user?.target_language?.name || 'Language' })}
            </h1>
            <span style={{
              background: cefrInfo.bg,
              color: cefrInfo.color,
              border: `1px solid ${cefrInfo.color}`,
              padding: '3px 10px',
              borderRadius: '9999px',
              fontWeight: '800',
              fontSize: '0.85rem'
            }}>
              {t(cefrInfo.label)}
            </span>
          </div>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            {t('welcomeUser', { name: user?.full_name || 'Learner', interfaceLang: t(user?.preferred_language?.name) || user?.preferred_language?.name || 'English' })}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {user?.is_admin && (
            <Link
              to="/admin"
              className="btn btn-primary"
              style={{ padding: '0.6rem 1.15rem', fontSize: '0.85rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', background: 'linear-gradient(135deg, #9966cc, #3b82f6)' }}
            >
              👑 Admin Portal →
            </Link>
          )}
          <button
            className="btn btn-secondary"
            onClick={() => setShowReportModal(true)}
            style={{ padding: '0.6rem 1.15rem', fontSize: '0.85rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            📊 View Learning Report
          </button>
          
          <div style={{
            background: 'var(--background)',
            border: '1px solid var(--border-color)',
            padding: '8px 14px',
            borderRadius: '12px',
            fontSize: '0.85rem',
            fontWeight: '600',
            color: 'var(--primary-color)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <Clock size={16} />
            <span>{t('dailyGoalMinutes', { minutes: user?.daily_minutes_goal || diagnosticStatus?.daily_minutes_goal || 15 })}</span>
          </div>
        </div>
      </div>

      {/* Hero Alert: Initial Diagnostic Placement Test Required */}
      {!hasCompletedTest && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(88, 204, 2, 0.15), rgba(28, 176, 246, 0.15))',
          border: '2px dashed var(--primary-color)',
          borderRadius: '20px',
          padding: '2rem',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{
              width: '60px', height: '60px', borderRadius: '50%',
              background: 'var(--primary-color)', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
              <Compass size={32} />
            </div>
            <div>
              <h3 style={{ margin: '0 0 6px', fontSize: '1.35rem', color: 'var(--text-main)', fontWeight: '800' }}>
                {t('initialExamTitle')}
              </h3>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '650px', lineHeight: '1.5' }}>
                {t('initialExamDesc')}
              </p>
            </div>
          </div>
          <Link to="/initial-exam" className="btn btn-primary" style={{ padding: '0.9rem 1.8rem', fontWeight: '800', fontSize: '1.05rem', boxShadow: '0 4px 14px rgba(88, 204, 2, 0.35)' }}>
            {t('startInitialExam')}
          </Link>
        </div>
      )}

      {/* Adaptive Course Recommendation Banner */}
      {hasCompletedTest && <CourseRecommendationBanner />}

      {/* Top Stat Counters */}
      <div className="inspector-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
        <div className="stat-card">
          <span className="stat-count" style={{ color: 'var(--primary-color)' }}>{completedCount}</span>
          <h4 style={{ margin: '0.5rem 0 0.25rem 0', color: 'var(--text-main)' }}>{t('lessonsCompleted')}</h4>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('totalCompletedUnits')}</p>
        </div>
        <div className="stat-card">
          <span className="stat-count" style={{ color: 'var(--secondary-color)' }}>{resultsList.length}</span>
          <h4 style={{ margin: '0.5rem 0 0.25rem 0', color: 'var(--text-main)' }}>{t('assessmentsTaken')}</h4>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('quizzesAndTests')}</p>
        </div>
        <div className="stat-card">
          <span className="stat-count" style={{ color: 'var(--accent-orange)' }}>{avgScore}%</span>
          <h4 style={{ margin: '0.5rem 0 0.25rem 0', color: 'var(--text-main)' }}>{t('avgScore')}</h4>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('overAllSubmissions')}</p>
        </div>
        <div className="stat-card">
          <span className="stat-count" style={{ color: '#ff9600' }}>{user?.streak || 0} 🔥</span>
          <h4 style={{ margin: '0.5rem 0 0.25rem 0', color: 'var(--text-main)' }}>{t('dayStreak')}</h4>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('consecutiveActiveDays')}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        
        {/* LEFT COLUMN: ACTIVE PATH, DIAGNOSTICS & ADAPTIVE BOOSTERS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Active Course & Continue Learning Card (Only Unlocked After Diagnostic Assessment) */}
          {hasCompletedTest ? (
            learningPath && (
              <div className="card" style={{ 
                padding: '1.5rem',
                background: 'linear-gradient(135deg, rgba(88, 204, 2, 0.08) 0%, rgba(28, 176, 246, 0.08) 100%)',
                border: '2px solid rgba(88, 204, 2, 0.3)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                  <span className="badge badge-green" style={{ fontSize: '0.78rem', padding: '3px 9px', textTransform: 'uppercase', fontWeight: '800' }}>
                    {t('activeLearningTrack')}
                  </span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                    {t('completeRate', { rate: learningPath.completion_rate })}
                  </span>
                </div>

                <h2 style={{ fontSize: '1.35rem', margin: '0 0 0.4rem 0', color: 'var(--text-main)', fontWeight: '800', lineHeight: '1.3' }}>
                  {t(learningPath.course_title)}
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '1rem' }}>
                  Target: {t(learningPath.target_language_name)} • {t('checkpointModulesCount', { count: learningPath.total_nodes })}
                </p>

                {/* Progress Bar */}
                <div style={{ height: '8px', background: 'var(--border-color)', borderRadius: '9999px', overflow: 'hidden', marginBottom: '1.25rem' }}>
                  <div style={{ 
                    height: '100%', 
                    width: `${Math.max(5, learningPath.completion_rate)}%`, 
                    background: 'linear-gradient(90deg, #58cc02, #1cb0f6)', 
                    transition: 'width 0.4s ease' 
                  }} />
                </div>

                {/* Next Playable Node */}
                {nextNode && (
                  <div style={{
                    background: 'var(--background)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    padding: '1rem 1.15rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '1rem',
                    marginBottom: '1rem'
                  }}>
                    <div>
                      <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--primary-color)', fontWeight: '800', letterSpacing: '0.5px' }}>
                        {t('upNextNode', { order: nextNode.order })}
                      </span>
                      <h4 style={{ margin: '3px 0 2px 0', fontSize: '1rem', color: 'var(--text-main)', fontWeight: '700', lineHeight: '1.3' }}>
                        {t(nextNode.title)}
                      </h4>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        ⏱️ ~{nextNode.duration_minutes || 10} mins • {nextNode.competency_tag}
                      </span>
                    </div>

                    <Link 
                      to={getNextNodeUrl(nextNode)} 
                      className="btn btn-primary" 
                      style={{ padding: '0.65rem 1.25rem', fontWeight: '700', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}
                    >
                      <PlayCircle size={16} /> {t('continueBtn')}
                    </Link>
                  </div>
                )}

                <Link to="/learning-path" className="btn btn-secondary" style={{ width: '100%', textAlign: 'center', display: 'block', padding: '0.65rem', fontWeight: '700', fontSize: '0.9rem' }}>
                  {t('openInteractivePath')}
                </Link>
              </div>
            )
          ) : (
            <div className="card" style={{
              padding: '1.75rem',
              borderRadius: '18px',
              textAlign: 'center',
              background: 'linear-gradient(135deg, rgba(255, 150, 0, 0.08), rgba(28, 176, 246, 0.08))',
              border: '2px dashed #ff9600'
            }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255, 150, 0, 0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.85rem'
              }}>
                <Compass size={24} color="#ff9600" />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', margin: '0 0 0.4rem', color: 'var(--text-main)' }}>
                {t('lockedPreAssessmentTitle')}
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem', lineHeight: '1.4' }}>
                {t('lockedPreAssessmentDesc')}
              </p>
              <Link to="/initial-exam" className="btn btn-primary" style={{ padding: '0.7rem 1.35rem', fontWeight: '800', borderRadius: '10px', fontSize: '0.9rem' }}>
                {t('startAssessmentToUnlock')}
              </Link>
            </div>
          )}

          {/* CEFR Diagnostic & 6-Skill Competency Card (If Tested) */}
          {hasCompletedTest && (
            <div className="card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.25rem', margin: 0, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800' }}>
                  <ShieldCheck color="var(--primary-color)" size={22} /> {t('cefrDiagnosticProfileTitle')}
                </h2>
                <span style={{
                  background: cefrInfo.bg,
                  color: cefrInfo.color,
                  border: `1px solid ${cefrInfo.color}`,
                  padding: '3px 10px',
                  borderRadius: '9999px',
                  fontWeight: '800',
                  fontSize: '0.8rem'
                }}>
                  {t(cefrInfo.label)}
                </span>
              </div>

              {/* Strengths & Weak Areas Tags */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.85rem', marginBottom: '1.25rem' }}>
                <div style={{ background: 'rgba(88, 204, 2, 0.08)', border: '1px solid rgba(88, 204, 2, 0.25)', borderRadius: '10px', padding: '0.75rem 0.85rem' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--primary-color)', textTransform: 'uppercase' }}>
                    {t('keyStrengths')}
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                    {strengths.length > 0 ? strengths.map(s => (
                      <span key={s} style={{ fontSize: '0.75rem', background: 'rgba(88, 204, 2, 0.15)', color: 'var(--primary-color)', padding: '2px 6px', borderRadius: '5px', fontWeight: '600' }}>
                        {t(s)}
                      </span>
                    )) : <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Solid balance</span>}
                  </div>
                </div>

                <div style={{ background: 'rgba(255, 150, 0, 0.08)', border: '1px solid rgba(255, 150, 0, 0.25)', borderRadius: '10px', padding: '0.75rem 0.85rem' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: '700', color: '#ff9600', textTransform: 'uppercase' }}>
                    {t('needsFocus')}
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                    {weakAreas.length > 0 ? weakAreas.map(w => (
                      <span key={w} style={{ fontSize: '0.75rem', background: 'rgba(255, 150, 0, 0.15)', color: '#ff9600', padding: '2px 6px', borderRadius: '5px', fontWeight: '600' }}>
                        {t(w)}
                      </span>
                    )) : <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No major weak points</span>}
                  </div>
                </div>
              </div>

              {/* 6-Skill Progress Bars */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
                {[
                  { label: t('vocabTranslationLabel'), key: 'vocabulary', color: 'var(--primary-color)', val: skillBreakdown.vocabulary ?? 75 },
                  { label: t('grammarSyntaxLabel'), key: 'grammar', color: '#3b82f6', val: skillBreakdown.grammar ?? 65 },
                  { label: t('readingComprehensionLabel'), key: 'reading', color: '#9c27b0', val: skillBreakdown.reading ?? 70 },
                  { label: t('listeningAuditoryLabel'), key: 'listening', color: '#ff9600', val: skillBreakdown.listening ?? 60 },
                  { label: t('writingSpellingLabel'), key: 'writing', color: '#00bcd4', val: skillBreakdown.writing ?? 65 },
                  { label: t('speakingPronunciationLabel'), key: 'speaking', color: '#e91e63', val: skillBreakdown.speaking ?? 55 }
                ].map(item => (
                  <div key={item.key}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '3px' }}>
                      <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>{item.label}</span>
                      <strong style={{ color: item.color }}>{item.val}%</strong>
                    </div>
                    <div style={{ height: '5px', background: 'var(--border-color)', borderRadius: '9999px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${item.val}%`, background: item.color, transition: 'width 0.4s ease' }} />
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.85rem', borderTop: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {t('placementScoreLabel')} <strong>{(diagnosticStatus?.placement_score || user?.placement_score || 0).toFixed(0)}%</strong>
                </span>
                <Link to="/initial-exam" style={{ fontSize: '0.8rem', color: 'var(--secondary-color)', fontWeight: '700', textDecoration: 'none' }}>
                  {t('Retake Diagnostic Test →')}
                </Link>
              </div>
            </div>
          )}

          {/* Adaptive Skill Boosters (Duolingo-style Focus Labs) */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.25rem', margin: '0 0 3px 0', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800' }}>
                <Zap color="var(--accent-orange)" size={22} /> {t('adaptivePracticeBoostersTitle')}
              </h2>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                {t('adaptivePracticeBoostersSubtitle')}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
              
              {/* Listening Studio */}
              <Link to="/adaptive-practice?focus=listening" style={{
                background: 'var(--background)',
                border: weakAreas.includes('Listening') ? '2px solid #ff9600' : '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '1rem',
                textDecoration: 'none',
                color: 'var(--text-main)',
                transition: 'all 0.2s',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: 'rgba(255, 150, 0, 0.15)', color: '#ff9600', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Headphones size={18} />
                    </div>
                    {weakAreas.includes('Listening') && (
                      <span className="badge badge-orange" style={{ fontSize: '0.6rem', padding: '2px 5px' }}>
                        {t('priorityFocusBadge')}
                      </span>
                    )}
                  </div>
                  <h4 style={{ margin: '0 0 3px 0', fontSize: '0.95rem', fontWeight: '700' }}>{t('listeningStudioTitle')}</h4>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {t('listeningStudioDesc')}
                  </p>
                </div>
                <span style={{ marginTop: '0.85rem', fontSize: '0.78rem', color: 'var(--primary-color)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {t('startListeningDrillBtn')} <ArrowRight size={13} />
                </span>
              </Link>

              {/* Speaking Lab */}
              <Link to="/adaptive-practice?focus=speaking" style={{
                background: 'var(--background)',
                border: weakAreas.includes('Speaking') ? '2px solid #e91e63' : '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '1rem',
                textDecoration: 'none',
                color: 'var(--text-main)',
                transition: 'all 0.2s',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: 'rgba(233, 30, 99, 0.15)', color: '#e91e63', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Mic size={18} />
                    </div>
                    {weakAreas.includes('Speaking') && (
                      <span className="badge badge-purple" style={{ fontSize: '0.6rem', padding: '2px 5px' }}>
                        {t('priorityFocusBadge')}
                      </span>
                    )}
                  </div>
                  <h4 style={{ margin: '0 0 3px 0', fontSize: '0.95rem', fontWeight: '700' }}>{t('speakingLabTitle')}</h4>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {t('speakingLabDesc')}
                  </p>
                </div>
                <span style={{ marginTop: '0.85rem', fontSize: '0.78rem', color: 'var(--primary-color)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {t('startSpeakingDrillBtn')} <ArrowRight size={13} />
                </span>
              </Link>

              {/* Writing & Grammar Workshop */}
              <Link to="/adaptive-practice?focus=writing" style={{
                background: 'var(--background)',
                border: (weakAreas.includes('Writing') || weakAreas.includes('Grammar')) ? '2px solid #00bcd4' : '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '1rem',
                textDecoration: 'none',
                color: 'var(--text-main)',
                transition: 'all 0.2s',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: 'rgba(0, 188, 212, 0.15)', color: '#00bcd4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <PenTool size={18} />
                    </div>
                    {(weakAreas.includes('Writing') || weakAreas.includes('Grammar')) && (
                      <span className="badge badge-green" style={{ fontSize: '0.6rem', padding: '2px 5px' }}>
                        {t('priorityFocusBadge')}
                      </span>
                    )}
                  </div>
                  <h4 style={{ margin: '0 0 3px 0', fontSize: '0.95rem', fontWeight: '700' }}>{t('writingSpellingTitle')}</h4>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {t('writingSpellingDesc')}
                  </p>
                </div>
                <span style={{ marginTop: '0.85rem', fontSize: '0.78rem', color: 'var(--primary-color)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {t('startWritingDrillBtn')} <ArrowRight size={13} />
                </span>
              </Link>

              {/* Speed Word Matching */}
              <Link to="/adaptive-practice?focus=match_pairs" style={{
                background: 'var(--background)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '1rem',
                textDecoration: 'none',
                color: 'var(--text-main)',
                transition: 'all 0.2s',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: 'rgba(88, 204, 2, 0.15)', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Layers size={18} />
                    </div>
                  </div>
                  <h4 style={{ margin: '0 0 3px 0', fontSize: '0.95rem', fontWeight: '700' }}>{t('speedMatchingTitle')}</h4>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {t('speedMatchingDesc')}
                  </p>
                </div>
                <span style={{ marginTop: '0.85rem', fontSize: '0.78rem', color: 'var(--primary-color)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {t('startSpeedDrillBtn')} <ArrowRight size={13} />
                </span>
              </Link>

            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: STREAK, QUESTS, RADAR, REVIEW & SCORES */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Streak Calendar Widget */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800' }}>
              <Flame color="#ff9600" size={22} /> {t('weeklyActivityCalendar')}
            </h2>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.25rem 0' }}>
              {weekDays.map((day, idx) => {
                const dayName = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][idx];
                const dayStr = day.toDateString();
                const isActive = activeDaysThisWeek.has(dayStr);
                const isToday = dayStr === new Date().toDateString();
                
                return (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: isToday ? 'bold' : 'normal' }}>
                      {dayName}
                    </span>
                    <div style={{
                      width: '38px', height: '38px', borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: isActive ? 'var(--primary-color)' : (isToday ? 'rgba(255, 150, 0, 0.15)' : 'var(--background)'),
                      border: isToday ? '2px solid #ff9600' : '2px solid var(--border-color)',
                      color: isActive ? '#fff' : (isToday ? '#ff9600' : 'var(--text-muted)'),
                      fontWeight: 'bold', fontSize: '0.95rem',
                      boxShadow: isActive ? '0 3px 6px rgba(88, 204, 2, 0.25)' : 'none'
                    }}>
                      {isActive ? '🔥' : day.getDate()}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Daily Quests Widget */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800' }}>
              <Target color="#ff4b4b" size={22} /> {t('dailyQuests')}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {quests.map(quest => {
                const pct = Math.min(100, (quest.current / quest.target) * 100);
                return (
                  <div key={quest.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.35rem' }}>
                      <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>{quest.title}</span>
                      <span style={{ color: 'var(--text-muted)', fontWeight: 'bold' }}>
                        {quest.current} / {quest.target} {quest.unit}
                      </span>
                    </div>
                    <div style={{ height: '7px', background: 'var(--border-color)', borderRadius: '9999px', overflow: 'hidden' }}>
                      <div style={{ 
                        height: '100%', 
                        background: pct >= 100 ? 'var(--primary-color)' : 'var(--secondary-color)', 
                        width: `${pct}%`,
                        transition: 'width 0.4s ease'
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Multi-Skill Competency Radar Chart */}
          <SkillRadarChart skillBreakdown={prediction ? {
            reading: prediction.reading,
            writing: prediction.writing,
            comprehension: prediction.comprehension,
            listening: prediction.listening,
            speaking: prediction.speaking,
            vocabulary: Math.round((prediction.reading || 25.0) * 0.95)
          } : {}} />

          {/* Review Center Widget */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '0.4rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800' }}>
              <BookOpen color="var(--primary-color)" size={22} /> {t('reviewCenter')}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '1rem', lineHeight: '1.4' }}>
              {t('reviewCenterDesc')}
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <Link to="/review/srs" style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '0.85rem', background: 'var(--surface-hover)', borderRadius: '10px',
                border: '1px solid var(--border-color)', textDecoration: 'none', color: 'var(--text-main)',
                transition: 'all 0.2s'
              }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700' }}>
                    🌱 {t('spacedRepetitionReviews')}
                  </h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {t('practiceVocabTarget')}
                  </span>
                </div>
                <ArrowRight size={16} color="var(--secondary-color)" />
              </Link>
              
              <Link to="/review/mistakes" style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '0.85rem', background: 'var(--surface-hover)', borderRadius: '10px',
                border: '1px solid var(--border-color)', textDecoration: 'none', color: 'var(--text-main)',
                transition: 'all 0.2s'
              }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700' }}>
                    🎯 {t('mistakesPractice')}
                  </h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {t('reviewIncorrectQuestions')}
                  </span>
                </div>
                <ArrowRight size={16} color="var(--error)" />
              </Link>
            </div>
          </div>

          {/* Assessment History Results */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '0.85rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800' }}>
              <Award color="var(--secondary-color)" size={20} /> {t('recentScores')}
            </h2>
            {resultsList.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{t('noQuizzes')}</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {resultsList.slice(0, 5).map(res => (
                  <div key={res.id} style={{ 
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '0.75rem 0.85rem', background: 'var(--background)', borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)'
                  }}>
                    <div>
                      <h4 style={{ color: 'var(--text-main)', fontSize: '0.88rem', margin: '0 0 2px 0' }}>
                        {t(res.assessment?.title) || (res.cefr_level ? `${t('initialExamTitle')} (${res.cefr_level})` : t('smartWorkoutTitle'))}
                      </h4>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {new Date(res.completed_at).toLocaleDateString()}
                      </span>
                    </div>
                    <span className={`badge ${res.passed ? 'badge-green' : 'badge-orange'}`} style={{ fontSize: '0.75rem', padding: '2px 7px' }}>
                      {res.score.toFixed(0)}% ({res.passed ? t('done') : 'RETRY'})
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Real Gamification & Achievements Grid */}
      <div style={{ marginTop: '2.5rem' }}>
        <AchievementsGrid />
      </div>

      {/* Progress Report Modal */}
      <ProgressReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
      />

    </div>
  );
};

export default LearnerDashboard;
