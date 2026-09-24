import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { 
  TrendingUp, Award, Sparkles, BookOpen, CheckCircle, Clock, Target, 
  Flame, Gem, Trophy, ArrowRight, Compass, Zap, Headphones, Mic, 
  PenTool, AlertTriangle, Layers, PlayCircle, ShieldCheck, CheckCircle2,
  Calendar, Activity, BarChart2
} from 'lucide-react';
import { useTranslation } from '../../utils/i18n';
import CourseRecommendationBanner from './CourseRecommendationBanner';
import SkillRadarChart from './SkillRadarChart';
import ProgressReportModal from './ProgressReportModal';
import StatCard from '../ui/StatCard';
import Badge from '../ui/Badge';

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

  // Calculate active days for the weekly calendar
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

  const getCEFRVariant = (cefr) => {
    switch (cefr) {
      case 'C2': case 'C1': return 'purple';
      case 'B2': case 'B1': return 'cyan';
      case 'A2': case 'A1': return 'teal';
      default: return 'gold';
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

  return (
    <div className="page-container" style={{ maxWidth: '1200px' }}>
      
      {/* Top Banner / Greeting Header */}
      <div 
        style={{
          background: 'var(--surface-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-xl)',
          padding: '2rem',
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
          boxShadow: 'var(--shadow-md)'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <span style={{ fontSize: '1.6rem' }}>{getLangFlag(user?.target_language?.code)}</span>
            <h1 style={{ fontSize: '1.85rem', fontWeight: '800', color: 'var(--text-main)', margin: 0, lineHeight: '1.2' }}>
              Welcome back, {user?.full_name?.split(' ')[0] || 'Learner'} 👋
            </h1>
            <Badge variant={getCEFRVariant(currentCEFR)}>
              {currentCEFR} Level
            </Badge>
          </div>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.98rem' }}>
            Learning {user?.target_language?.name || 'Kannada'} in {user?.preferred_language?.name || 'English'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {user?.is_admin && (
            <Link
              to="/admin"
              className="btn btn-primary"
              style={{ padding: '0.65rem 1.25rem', fontSize: '0.88rem', fontWeight: '800', background: 'linear-gradient(135deg, var(--accent-purple), var(--secondary-color))' }}
            >
              👑 Admin Portal
            </Link>
          )}
          <button
            className="btn btn-secondary"
            onClick={() => setShowReportModal(true)}
            style={{ padding: '0.65rem 1.25rem', fontSize: '0.88rem', fontWeight: '700' }}
          >
            📊 Learning Analytics
          </button>
          
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border-color)',
            padding: '8px 16px',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.88rem',
            fontWeight: '700',
            color: 'var(--primary-color)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Clock size={16} />
            <span>{user?.daily_minutes_goal || 15} min / day goal</span>
          </div>
        </div>
      </div>

      {/* Hero Alert: Initial Diagnostic Test Required */}
      {!hasCompletedTest && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.15) 0%, rgba(99, 102, 241, 0.15) 100%)',
          border: '2px dashed var(--primary-color)',
          borderRadius: 'var(--radius-xl)',
          padding: '2rem',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.5rem',
          boxShadow: 'var(--shadow-teal)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%',
              background: 'var(--primary-color)', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
              <Compass size={34} />
            </div>
            <div>
              <h3 style={{ margin: '0 0 6px', fontSize: '1.35rem', color: 'var(--text-main)', fontWeight: '800' }}>
                Diagnostic Placement Test Required
              </h3>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.98rem', maxWidth: '650px', lineHeight: '1.5' }}>
                Take our 10-minute diagnostic test across vocabulary, reading, listening, and speaking to unlock your personalized learning path.
              </p>
            </div>
          </div>
          <Link to="/initial-exam" className="btn btn-primary" style={{ padding: '0.9rem 2rem', fontWeight: '800', fontSize: '1.05rem', boxShadow: 'var(--shadow-teal)' }}>
            Start Diagnostic Test 🚀
          </Link>
        </div>
      )}

      {/* Adaptive Course Recommendation Banner */}
      {hasCompletedTest && <CourseRecommendationBanner />}

      {/* Top Stat KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
        <StatCard 
          title="Lessons Completed" 
          value={completedCount} 
          subtitle="Total finished units" 
          icon={BookOpen} 
          color="teal" 
        />
        <StatCard 
          title="Assessments Taken" 
          value={resultsList.length} 
          subtitle="Quizzes & level tests" 
          icon={Target} 
          color="indigo" 
        />
        <StatCard 
          title="Average Score" 
          value={`${avgScore}%`} 
          subtitle="Overall accuracy" 
          icon={TrendingUp} 
          color="cyan" 
        />
        <StatCard 
          title="Day Streak" 
          value={`${user?.streak || 0} 🔥`} 
          subtitle="Consecutive daily practice" 
          icon={Flame} 
          color="gold" 
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.75rem', marginBottom: '2rem' }}>
        
        {/* LEFT COLUMN: ACTIVE PATH, DIAGNOSTICS & BOOSTERS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>

          {/* Active Course & Continue Learning Card */}
          {hasCompletedTest && learningPath && (
            <div 
              className="card" 
              style={{ 
                padding: '1.75rem',
                background: 'var(--surface-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-xl)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <Badge variant="teal" icon={Compass}>Active Learning Track</Badge>
                <span style={{ fontSize: '0.88rem', fontWeight: '800', color: 'var(--primary-color)' }}>
                  {learningPath.completion_rate}% Complete
                </span>
              </div>

              <h2 style={{ fontSize: '1.45rem', margin: '0 0 0.4rem 0', color: 'var(--text-main)', fontWeight: '800' }}>
                {learningPath.course_title}
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
                Target: {learningPath.target_language_name} • {learningPath.total_nodes} Checkpoint Modules
              </p>

              {/* Progress Bar */}
              <div style={{ height: '10px', background: 'var(--surface)', borderRadius: '9999px', overflow: 'hidden', marginBottom: '1.5rem', border: '1px solid var(--border-color)' }}>
                <div style={{ 
                  height: '100%', 
                  width: `${Math.max(5, learningPath.completion_rate)}%`, 
                  background: 'linear-gradient(90deg, var(--primary-color), var(--accent-cyan))', 
                  transition: 'width 0.4s ease' 
                }} />
              </div>

              {/* Next Playable Node */}
              {nextNode && (
                <div style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.25rem',
                  display: 'flex',
                  justify: 'space-between',
                  alignItems: 'center',
                  gap: '1rem',
                  marginBottom: '1.25rem'
                }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--primary-color)', fontWeight: '800', letterSpacing: '0.5px' }}>
                      Up Next (Node {nextNode.order})
                    </span>
                    <h4 style={{ margin: '4px 0 2px 0', fontSize: '1.05rem', color: 'var(--text-main)', fontWeight: '800' }}>
                      {nextNode.title}
                    </h4>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      ⏱️ ~{nextNode.duration_minutes || 10} mins • {nextNode.competency_tag}
                    </span>
                  </div>

                  <Link 
                    to={getNextNodeUrl(nextNode)} 
                    className="btn btn-primary" 
                    style={{ padding: '0.7rem 1.35rem', fontWeight: '800', fontSize: '0.92rem', gap: '6px', whiteSpace: 'nowrap' }}
                  >
                    <PlayCircle size={18} /> Continue
                  </Link>
                </div>
              )}

              <Link to="/learning-path" className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center', fontWeight: '700' }}>
                Open Full Interactive Path →
              </Link>
            </div>
          )}

          {/* Diagnostic Competency Radar & Weak Areas */}
          {hasCompletedTest && (
            <div className="card" style={{ padding: '1.75rem', background: 'var(--surface-card)', borderRadius: 'var(--radius-xl)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <BarChart2 size={20} color="var(--primary-color)" /> Competency Radar
                </h3>
                <Badge variant="cyan">{currentCEFR} Level</Badge>
              </div>

              <SkillRadarChart />

              {/* Weak Areas & Strengths Pills */}
              <div style={{ marginTop: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                {strengths.length > 0 && (
                  <div style={{ background: 'var(--surface)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--success)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>
                      ✨ Strengths
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {strengths.map((s, idx) => (
                        <Badge key={idx} variant="green" size="small">{s}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {weakAreas.length > 0 && (
                  <div style={{ background: 'var(--surface)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--accent-orange)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>
                      🎯 Focus Target Areas
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {weakAreas.map((w, idx) => (
                        <Badge key={idx} variant="gold" size="small">{w}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: DAILY QUESTS, PRACTICE BOOSTERS & LEADERBOARD */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>

          {/* Daily Quests Widget */}
          <div className="card" style={{ padding: '1.75rem', background: 'var(--surface-card)', borderRadius: 'var(--radius-xl)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Target size={20} color="var(--primary-color)" /> Daily Quests
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              {quests.map(q => {
                const pct = Math.min(100, Math.round((q.current / q.target) * 100));
                const isComplete = q.current >= q.target;
                return (
                  <div key={q.id} style={{ background: 'var(--surface)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontWeight: '700', fontSize: '0.92rem', color: 'var(--text-main)' }}>{q.title}</span>
                      <span style={{ fontSize: '0.82rem', fontWeight: '800', color: isComplete ? 'var(--primary-color)' : 'var(--text-muted)' }}>
                        {q.current} / {q.target} {q.unit} {isComplete && '✅'}
                      </span>
                    </div>
                    <div style={{ height: '8px', background: 'var(--bg-dark)', borderRadius: '9999px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: isComplete ? 'var(--primary-color)' : 'var(--secondary-color)', transition: 'width 0.3s ease' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Weekly Practice Heatmap Calendar */}
          <div className="card" style={{ padding: '1.75rem', background: 'var(--surface-card)', borderRadius: 'var(--radius-xl)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={20} color="var(--accent-gold)" /> Weekly Activity
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', textAlign: 'center' }}>
              {weekDays.map((d, i) => {
                const dayName = d.toLocaleDateString('en-US', { weekday: 'narrow' });
                const isToday = d.toDateString() === todayStr;
                const isActive = activeDaysThisWeek.has(d.toDateString());
                return (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)' }}>{dayName}</span>
                    <div 
                      style={{
                        width: '36px', height: '36px', borderRadius: '50%',
                        background: isActive ? 'var(--primary-color)' : (isToday ? 'var(--surface-hover)' : 'var(--surface)'),
                        border: isToday ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
                        color: isActive ? '#ffffff' : 'var(--text-muted)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: '800', fontSize: '0.85rem'
                      }}
                    >
                      {isActive ? '✓' : d.getDate()}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Practice Boosters & Features */}
          <div className="card" style={{ padding: '1.75rem', background: 'var(--surface-card)', borderRadius: 'var(--radius-xl)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={20} color="var(--primary-color)" /> Practice Hub
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
              <Link to="/conversation" className="btn btn-secondary" style={{ flexDirection: 'column', padding: '1.15rem 0.85rem', alignItems: 'center', gap: '8px', textAlign: 'center' }}>
                <Mic size={22} color="var(--primary-color)" />
                <span style={{ fontSize: '0.9rem', fontWeight: '800' }}>AI Voice Lab</span>
              </Link>
              <Link to="/stories" className="btn btn-secondary" style={{ flexDirection: 'column', padding: '1.15rem 0.85rem', alignItems: 'center', gap: '8px', textAlign: 'center' }}>
                <BookOpen size={22} color="var(--secondary-color)" />
                <span style={{ fontSize: '0.9rem', fontWeight: '800' }}>Stories</span>
              </Link>
              <Link to="/flashcards" className="btn btn-secondary" style={{ flexDirection: 'column', padding: '1.15rem 0.85rem', alignItems: 'center', gap: '8px', textAlign: 'center' }}>
                <Layers size={22} color="var(--accent-gold)" />
                <span style={{ fontSize: '0.9rem', fontWeight: '800' }}>Flashcards</span>
              </Link>
              <Link to="/review/srs" className="btn btn-secondary" style={{ flexDirection: 'column', padding: '1.15rem 0.85rem', alignItems: 'center', gap: '8px', textAlign: 'center' }}>
                <Clock size={22} color="var(--accent-purple)" />
                <span style={{ fontSize: '0.9rem', fontWeight: '800' }}>SRS Drills</span>
              </Link>
            </div>
          </div>

        </div>

      </div>

      {/* Analytics Modal */}
      {showReportModal && (
        <ProgressReportModal onClose={() => setShowReportModal(false)} />
      )}
    </div>
  );
};

export default LearnerDashboard;
