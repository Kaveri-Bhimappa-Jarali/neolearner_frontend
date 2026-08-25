import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { TrendingUp, Award, Sparkles, BookOpen, CheckCircle, Clock } from 'lucide-react';

const LearnerDashboard = () => {
  const { user } = useAuth();
  const [progressList, setProgressList] = useState([]);
  const [resultsList, setResultsList] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const [progRes, resRes, recRes] = await Promise.all([
          api.get('/progress/me'),
          api.get('/assessments/results/me'),
          api.get('/recommendations/me')
        ]);
        setProgressList(progRes.data);
        setResultsList(resRes.data);
        setRecommendations(recRes.data);
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
  }, [user]);

  if (loading) return <div className="page-container" style={{ textAlign: 'center', padding: '4rem' }}>Loading Learner Dashboard...</div>;

  const completedCount = progressList.filter(p => p.status === 'completed').length;
  const avgScore = resultsList.length > 0 
    ? (resultsList.reduce((acc, r) => acc + r.score, 0) / resultsList.length).toFixed(0)
    : 0;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">
          <TrendingUp color="var(--primary-color)" size={36} />
          Learner Overview & Progress
        </h1>
        <p className="page-subtitle">Welcome back, {user?.full_name || 'Learner'}! Track your literacy progress and achievements.</p>
      </div>

      {/* Summary Cards */}
      <div className="inspector-stats" style={{ marginBottom: '2.5rem' }}>
        <div className="stat-card">
          <span className="stat-count" style={{ color: 'var(--primary-color)' }}>{completedCount}</span>
          <h4 style={{ margin: '0.5rem 0 0.25rem 0', color: 'var(--text-main)' }}>Lessons Completed</h4>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total completed learning units</p>
        </div>
        <div className="stat-card">
          <span className="stat-count" style={{ color: 'var(--secondary-color)' }}>{resultsList.length}</span>
          <h4 style={{ margin: '0.5rem 0 0.25rem 0', color: 'var(--text-main)' }}>Assessments Taken</h4>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Quizzes and module tests</p>
        </div>
        <div className="stat-card">
          <span className="stat-count" style={{ color: 'var(--accent-orange)' }}>{avgScore}%</span>
          <h4 style={{ margin: '0.5rem 0 0.25rem 0', color: 'var(--text-main)' }}>Average Quiz Score</h4>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Over all test submissions</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2rem' }}>
        
        {/* Recommended Courses Section */}
        <div className="card">
          <h2 style={{ fontSize: '1.35rem', marginBottom: '1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles color="var(--accent-orange)" size={20} /> Recommended for You
          </h2>
          {recommendations.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No specific recommendations generated yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {recommendations.map(rec => (
                <div key={rec.id} style={{ 
                  padding: '1rem', background: 'var(--background)', borderRadius: 'var(--radius-md)', 
                  border: '1px solid var(--border-color)' 
                }}>
                  <h4 style={{ color: 'var(--text-main)', marginBottom: '0.25rem' }}>{rec.recommended_course?.title || 'Recommended Course'}</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.75rem' }}>{rec.reason}</p>
                  <Link to={`/courses/${rec.recommended_course_id}`} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                    Start Recommended Course
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Assessment History Results */}
        <div className="card">
          <h2 style={{ fontSize: '1.35rem', marginBottom: '1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award color="var(--secondary-color)" size={20} /> Recent Quiz Scores
          </h2>
          {resultsList.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No quizzes taken yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {resultsList.map(res => (
                <div key={res.id} style={{ 
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '0.875rem 1rem', background: 'var(--background)', borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)'
                }}>
                  <div>
                    <h4 style={{ color: 'var(--text-main)', fontSize: '0.95rem' }}>{res.assessment?.title || 'Assessment'}</h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(res.completed_at).toLocaleDateString()}
                    </span>
                  </div>
                  <span className={`badge ${res.passed ? 'badge-green' : 'badge-orange'}`}>
                    {res.score.toFixed(0)}% ({res.passed ? 'PASSED' : 'RETRY'})
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default LearnerDashboard;
