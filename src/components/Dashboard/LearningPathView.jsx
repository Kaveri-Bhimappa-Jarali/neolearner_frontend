import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { 
  CheckCircle, Lock, Play, Award, BookOpen, Sparkles, 
  Trophy, ArrowRight, Zap, RefreshCw, BarChart2, Star
} from 'lucide-react';
import { useTranslation } from '../../utils/i18n';

const LearningPathView = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [learningPath, setLearningPath] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLearningPathData = async () => {
      setLoading(true);
      try {
        const [pathRes, predRes] = await Promise.all([
          api.get('/learning-paths/me'),
          api.get('/learning-paths/prediction')
        ]);
        setLearningPath(pathRes.data);
        setPrediction(predRes.data);
      } catch (err) {
        console.error('Failed to load learning path:', err);
        setError('Failed to load your learning roadmap. Please check connection.');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchLearningPathData();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: '4rem' }}>
        <div className="spinner" style={{ margin: '0 auto 1rem' }} />
        <p style={{ color: 'var(--text-muted)' }}>{t('analyzingProfile')}</p>
      </div>
    );
  }

  if (error || !learningPath) {
    return (
      <div className="page-container" style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ padding: '2rem', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', borderRadius: '12px', maxWidth: '600px', margin: '0 auto' }}>
          <p>{error || 'No learning path available.'}</p>
          <Link to="/dashboard" className="btn btn-primary" style={{ marginTop: '1rem' }}>{t('viewDashboard')}</Link>
        </div>
      </div>
    );
  }

  const nodes = learningPath.nodes || [];
  const hasCompletedTest = user?.has_completed_placement_test;

  if (!hasCompletedTest) {
    return (
      <div className="page-container" style={{ maxWidth: '800px', margin: '3rem auto', padding: '0 1rem' }}>
        <div className="card" style={{
          padding: '3rem 2rem', borderRadius: '24px', textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(255, 150, 0, 0.08), rgba(28, 176, 246, 0.08))',
          border: '2px dashed #ff9600'
        }}>
          <div style={{
            width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(255, 150, 0, 0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem'
          }}>
            <Lock size={36} color="#ff9600" />
          </div>

          <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-main)', margin: '0 0 0.5rem' }}>
            {t('lockedPreAssessmentTitle')}
          </h1>

          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '600px', margin: '0 auto 1.75rem', lineHeight: '1.6' }}>
            {t('lockedPreAssessmentDesc')}
          </p>

          <button
            className="btn btn-primary"
            style={{ padding: '1rem 2.25rem', fontSize: '1.1rem', fontWeight: '800', borderRadius: '14px' }}
            onClick={() => navigate('/initial-exam')}
          >
            {t('startAssessmentToUnlock')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1rem' }}>
      
      {/* Header Banner */}
      <div className="card" style={{ 
        padding: '2rem', marginBottom: '2.5rem', 
        background: 'linear-gradient(135deg, rgba(88, 204, 2, 0.08) 0%, rgba(28, 176, 246, 0.12) 100%)',
        border: '1px solid rgba(88, 204, 2, 0.25)', borderRadius: '20px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', background: 'rgba(88, 204, 2, 0.2)', color: '#2e7d32', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.75rem' }}>
              <Sparkles size={14} /> {t('aiAdaptiveLearningPathTag')}
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: '800', margin: '0 0 0.5rem', color: 'var(--text-main)', lineHeight: '1.3' }}>
              {t(learningPath.course_title)}
            </h1>
            <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.95rem' }}>
              {t('targetTrackLabel')} <strong style={{ color: 'var(--text-main)' }}>{t(learningPath.target_language_name)}</strong>
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <Link 
              to="/adaptive-practice" 
              className="btn btn-primary" 
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.75rem 1.25rem', boxShadow: '0 4px 12px rgba(88, 204, 2, 0.3)' }}
            >
              <Zap size={18} /> {t('aiAdaptiveWorkoutBtn')}
            </Link>
          </div>
        </div>

        {/* Progress and Benchmark Metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginTop: '1.75rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
              <span style={{ color: 'var(--text-muted)', fontWeight: '600' }}>{t('curriculumProgressLabel')}</span>
              <strong style={{ color: 'var(--primary-color)' }}>{learningPath.completion_rate}%</strong>
            </div>
            <div style={{ height: '10px', background: 'var(--border-color)', borderRadius: '9999px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${learningPath.completion_rate}%`, background: 'var(--primary-color)', transition: 'width 0.5s ease' }} />
            </div>
          </div>

          {prediction && (
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600', marginBottom: '4px' }}>
                {t('predictedBenchmarkLabel')}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="badge badge-green" style={{ fontSize: '0.8rem', padding: '4px 10px' }}>
                  {t(prediction.benchmark_level)}
                </span>
                <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-main)' }}>
                  ({prediction.composite_score}%)
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Node Roadmap */}
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '2.5rem', alignItems: 'center' }}>
        
        {/* Center Connecting Line */}
        <div style={{
          position: 'absolute', top: '40px', bottom: '40px', left: '50%',
          width: '4px', transform: 'translateX(-50%)',
          background: 'repeating-linear-gradient(to bottom, var(--primary-color) 0, var(--primary-color) 8px, transparent 8px, transparent 16px)',
          zIndex: 0
        }} />

        {nodes.map((node, index) => {
          const isCompleted = node.status === 'completed';
          const isInProgress = node.status === 'in_progress';
          const isLocked = node.status === 'locked';
          const isMilestone = node.type === 'milestone_checkpoint';
          const isQuiz = node.type === 'quiz';

          // Node styling based on status
          let nodeBg = 'var(--surface)';
          let borderColor = 'var(--border-color)';
          let iconColor = '#9e9e9e';
          let shadow = '0 4px 6px rgba(0,0,0,0.2)';

          if (isCompleted) {
            nodeBg = 'var(--primary-color)';
            borderColor = 'var(--primary-color)';
            iconColor = '#ffffff';
            shadow = '0 6px 14px rgba(88, 204, 2, 0.35)';
          } else if (isInProgress) {
            nodeBg = 'var(--secondary-color)';
            borderColor = 'var(--secondary-color)';
            iconColor = '#ffffff';
            shadow = '0 0 0 6px rgba(28, 176, 246, 0.25), 0 8px 16px rgba(28, 176, 246, 0.3)';
          }

          return (
            <div 
              key={node.id} 
              style={{
                position: 'relative',
                zIndex: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '100%',
                maxWidth: '380px'
              }}
            >
              {/* Node Circular Button */}
              <div 
                style={{
                  width: isMilestone ? '76px' : '64px',
                  height: isMilestone ? '76px' : '64px',
                  borderRadius: '50%',
                  background: isMilestone && isCompleted ? '#ffb703' : nodeBg,
                  border: `3px solid ${isMilestone && isCompleted ? '#fb8500' : borderColor}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: shadow,
                  cursor: isLocked ? 'not-allowed' : 'pointer',
                  transform: isInProgress ? 'scale(1.08)' : 'scale(1)',
                  zIndex: 3,
                  transition: 'all 0.25s ease'
                }}
                onClick={() => {
                  if (isLocked) return;
                  if (node.lesson_id) navigate(`/lessons/${node.lesson_id}`);
                  else if (node.assessment_id) navigate(`/assessments/${node.assessment_id}`);
                }}
              >
                {isCompleted && (
                  isMilestone ? <Trophy size={32} color="#ffffff" /> : <CheckCircle size={30} color="#ffffff" />
                )}
                {isInProgress && (
                  isQuiz ? <Award size={28} color="#ffffff" /> : <Play size={26} color="#ffffff" fill="#ffffff" />
                )}
                {isLocked && (
                  <Lock size={22} color="#9e9e9e" />
                )}
              </div>

              {/* Node Card / Label */}
              <div 
                className="card" 
                style={{
                  marginTop: '0.75rem',
                  padding: '1rem 1.25rem',
                  textAlign: 'center',
                  width: '100%',
                  border: isInProgress ? '2px solid var(--secondary-color)' : (isCompleted ? '1px solid rgba(88, 204, 2, 0.4)' : '1px solid var(--border-color)'),
                  background: isInProgress ? 'var(--surface-hover)' : (isCompleted ? 'var(--surface)' : 'var(--surface)'),
                  borderRadius: '16px',
                  boxShadow: isInProgress ? '0 8px 20px rgba(28, 176, 246, 0.2)' : '0 4px 10px rgba(0,0,0,0.2)',
                  zIndex: 2
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ 
                    fontSize: '0.72rem', 
                    fontWeight: '800', 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.5px',
                    color: isCompleted ? 'var(--primary-color)' : (isInProgress ? 'var(--secondary-color)' : 'var(--text-muted)')
                  }}>
                    {isCompleted ? t('statusCompleted') : (isInProgress ? t('statusActiveCheckpoint') : t('statusLocked'))}
                  </span>
                  {node.score !== null && node.score !== undefined && (
                    <span className="badge badge-green" style={{ fontSize: '0.7rem', padding: '2px 6px' }}>
                      {node.score.toFixed(0)}%
                    </span>
                  )}
                </div>

                <h4 style={{ margin: '0 0 6px', fontSize: '1rem', color: 'var(--text-main)', fontWeight: '700', lineHeight: '1.45' }}>
                  {t(node.title)}
                </h4>
                
                {node.description && (
                  <p style={{ margin: '0 0 10px', fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                    {t(node.description)}
                  </p>
                )}

                {/* Action button if active or completed */}
                {!isLocked && (
                  <button 
                    className={`btn ${isInProgress ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ padding: '0.45rem 1rem', fontSize: '0.82rem', marginTop: '4px', width: '100%' }}
                    onClick={() => {
                      if (node.lesson_id) navigate(`/lessons/${node.lesson_id}`);
                      else if (node.assessment_id) navigate(`/assessments/${node.assessment_id}`);
                    }}
                  >
                    {isCompleted ? t('reviewConceptBtn') : (isQuiz ? t('startQuizBtn') : t('startLessonBtn'))}
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {/* Final Course Complete Trophy */}
        <div style={{
          padding: '1.5rem', textAlign: 'center', background: 'rgba(255, 183, 3, 0.1)',
          border: '2px dashed #ffb703', borderRadius: '16px', maxWidth: '360px', marginTop: '1rem', zIndex: 2
        }}>
          <Trophy size={40} color="#fb8500" style={{ margin: '0 auto 8px' }} />
          <h3 style={{ margin: '0 0 4px', fontSize: '1.1rem' }}>{t('courseGraduationTitle')}</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, lineHeight: '1.5' }}>
            {t('courseGraduationDesc')}
          </p>
        </div>

      </div>

    </div>
  );
};

export default LearningPathView;
