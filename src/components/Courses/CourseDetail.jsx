import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import { BookOpen, Layers, FileText, ChevronRight, Clock, Sparkles, ArrowLeft, PlayCircle } from 'lucide-react';
import { useTranslation } from '../../utils/i18n';
import UnitGuidebookModal from '../Guidebooks/UnitGuidebookModal';
import Badge from '../ui/Badge';

const CourseDetail = () => {
  const { courseId } = useParams();
  const { t } = useTranslation();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeGuidebookTopicId, setActiveGuidebookTopicId] = useState(null);

  useEffect(() => {
    const fetchCourse = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/courses/${courseId}`);
        if (res.data) {
          setCourse(res.data);
        }
      } catch (err) {
        console.error('Failed to load course syllabus:', err);
      } finally {
        setLoading(false);
      }
    };
    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  if (loading) {
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: '5rem 1rem' }}>
        <div style={{ fontSize: '1.25rem', color: 'var(--text-muted)', fontWeight: '700' }}>
          Loading course syllabus...
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '1rem' }}>
          Course Not Found
        </h2>
        <Link to="/courses" className="btn btn-primary">
          Back to Course Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ maxWidth: '1050px' }}>
      
      {/* Back Button & Course Banner */}
      <div style={{ marginBottom: '2rem' }}>
        <Link 
          to="/courses" 
          style={{ 
            fontSize: '0.9rem', 
            color: 'var(--text-muted)', 
            marginBottom: '1rem', 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '6px',
            fontWeight: '700'
          }}
        >
          <ArrowLeft size={16} /> Back to Course Catalog
        </Link>

        <div 
          style={{
            background: 'var(--surface-card)',
            padding: '2rem',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-md)'
          }}
        >
          <div style={{ display: 'flex', gap: '8px', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
            <Badge variant="teal">CEFR {course.cefr_level || course.level || 'A1'}</Badge>
            <Badge variant="cyan">{course.language?.name || 'Regional Language'}</Badge>
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: '900', color: 'var(--text-main)', margin: '0 0 0.5rem 0', lineHeight: '1.2' }}>
            {course.title}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', margin: 0, lineHeight: '1.6', maxWidth: '750px' }}>
            {course.description || 'Comprehensive learning path with interactive quizzes and audio drills.'}
          </p>
        </div>
      </div>

      {/* Unit Topics Breakdown */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
        {course.topics?.map((topic, tIdx) => (
          <div 
            key={topic.id} 
            className="card" 
            style={{ 
              padding: '2rem',
              background: 'var(--surface-card)',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border-color)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
              <Badge variant="purple">Unit {tIdx + 1}</Badge>
              <h2 style={{ fontSize: '1.45rem', color: 'var(--text-main)', margin: 0, fontWeight: '800' }}>
                {topic.title}
              </h2>
              <button 
                onClick={() => setActiveGuidebookTopicId(topic.id)}
                className="btn btn-secondary"
                style={{ marginLeft: 'auto', padding: '0.5rem 1rem', fontSize: '0.85rem', fontWeight: '700', gap: '6px' }}
              >
                <BookOpen size={16} color="var(--primary-color)" /> Unit Guidebook
              </button>
            </div>

            {topic.description && (
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.95rem', lineHeight: '1.5' }}>
                {topic.description}
              </p>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {topic.lessons?.map((lesson) => (
                <div 
                  key={lesson.id} 
                  style={{ 
                    display: 'flex', 
                    justify: 'space-between', 
                    alignItems: 'center', 
                    padding: '1.15rem 1.35rem', 
                    background: 'var(--surface)', 
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border-color)', 
                    flexWrap: 'wrap', 
                    gap: '1rem',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ padding: '10px', background: 'rgba(20, 184, 166, 0.12)', borderRadius: '12px', color: 'var(--primary-color)', display: 'flex' }}>
                      <FileText size={20} />
                    </div>
                    <div>
                      <h4 style={{ color: 'var(--text-main)', fontSize: '1.08rem', fontWeight: '800', margin: '0 0 2px 0' }}>
                        {lesson.title}
                      </h4>
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={14} /> {lesson.duration_minutes || 10} mins estimated
                      </span>
                    </div>
                  </div>

                  <Link 
                    to={`/lessons/${lesson.id}`} 
                    className="btn btn-primary" 
                    style={{ padding: '0.65rem 1.25rem', fontSize: '0.9rem', fontWeight: '800', gap: '6px' }}
                  >
                    <PlayCircle size={16} /> Start Lesson
                  </Link>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {activeGuidebookTopicId && (
        <UnitGuidebookModal
          topicId={activeGuidebookTopicId}
          onClose={() => setActiveGuidebookTopicId(null)}
          languageCode={course.language?.code || 'kn'}
        />
      )}
    </div>
  );
};

export default CourseDetail;
