import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import { BookOpen, Layers, FileText, ChevronRight, Clock, Sparkles } from 'lucide-react';
import { useTranslation } from '../../utils/i18n';
import UnitGuidebookModal from '../Guidebooks/UnitGuidebookModal';

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
    return <div className="page-container" style={{ textAlign: 'center', padding: '4rem' }}>{t('analyzingProfile')}</div>;
  }

  if (!course) {
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: '4rem' }}>
        <h2>Course not found</h2>
        <Link to="/courses" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>{t('courses')}</Link>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <Link to="/courses" style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'inline-block' }}>
          &larr; {t('exploreTitle')}
        </Link>
        <h1 className="page-title">{t(course.title)}</h1>
        <p className="page-subtitle">{t(course.description)}</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {course.topics?.map((topic, tIdx) => (
          <div key={topic.id} className="card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
              <span className="badge badge-purple">{t(`Topic ${tIdx + 1}`)}</span>
              <h2 style={{ fontSize: '1.4rem', color: 'var(--text-main)', margin: 0, lineHeight: '1.4' }}>{t(topic.title)}</h2>
              <button 
                onClick={() => setActiveGuidebookTopicId(topic.id)}
                className="btn btn-secondary"
                style={{ marginLeft: 'auto', padding: '0.4rem 0.85rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <BookOpen size={14} /> {t('Unit Guidebook')}
              </button>
            </div>
            {topic.description && (
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.95rem', lineHeight: '1.5' }}>{t(topic.description)}</p>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {topic.lessons?.map((lesson) => (
                <div key={lesson.id} style={{ 
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                  padding: '1rem 1.25rem', background: 'var(--background)', borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)', flexWrap: 'wrap', gap: '1rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <FileText color="var(--secondary-color)" size={20} />
                    <div>
                      <h4 style={{ color: 'var(--text-main)', fontSize: '1.05rem', lineHeight: '1.4' }}>{t(lesson.title)}</h4>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                        <Clock size={12} /> {lesson.duration_minutes} mins estimated
                      </span>
                    </div>
                  </div>

                  <Link to={`/lessons/${lesson.id}`} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', gap: '4px' }}>
                    {t('Start Lesson')} <ChevronRight size={14} />
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
