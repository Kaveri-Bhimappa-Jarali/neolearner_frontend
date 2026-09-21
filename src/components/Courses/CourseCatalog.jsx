import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../utils/i18n';
import { BookOpen, Globe, ChevronRight, Star, HelpCircle, ShieldAlert, Compass } from 'lucide-react';
import CourseRecommendationBanner from '../Dashboard/CourseRecommendationBanner';
import WhySeeingThisModal from '../Shared/WhySeeingThisModal';

const CourseCatalog = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [courses, setCourses] = useState([]);
  const [recommendations, setRecommendations] = useState(null);
  const [languages, setLanguages] = useState([]);
  const [selectedLang, setSelectedLang] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedModalRec, setSelectedModalRec] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [courseRes, langRes, recRes] = await Promise.all([
          api.get('/courses/'),
          api.get('/languages/'),
          api.get('/learning/recommendations/').catch(() => null)
        ]);
        if (courseRes.data) {
          setCourses(courseRes.data);
        }
        if (langRes.data) {
          setLanguages(langRes.data);
        }
        if (recRes && recRes.data) {
          setRecommendations(recRes.data);
        }
      } catch (err) {
        console.error('Failed to load courses from API:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Sync default target language filter from logged-in user profile
  useEffect(() => {
    if (user && user.target_language?.id) {
      setSelectedLang(user.target_language.id);
    }
  }, [user]);

  const filteredCourses = selectedLang
    ? courses.filter(c => c.language_id === selectedLang)
    : courses;

  // Build recommendation map lookup by course_id
  const recMap = {};
  if (recommendations && recommendations.all_ranked_courses) {
    recommendations.all_ranked_courses.forEach(r => {
      recMap[r.course_id] = r;
    });
  }

  return (
    <div className="page-container">
      
      {/* Top Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h1 className="page-title">
            <BookOpen color="var(--primary-color)" size={36} />
            {t('exploreTitle')}
          </h1>
          <p className="page-subtitle">{t('exploreSubtitle')}</p>
        </div>

        {languages.length > 0 && (
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Globe color="var(--text-muted)" size={18} />
            <select 
              className="form-select"
              value={selectedLang} 
              onChange={(e) => setSelectedLang(e.target.value)}
              style={{ width: 'auto', minWidth: '180px' }}
            >
              <option value="">{t('allLanguages')}</option>
              {languages.map(lang => (
                <option key={lang.id} value={lang.id}>{t(lang.name)} ({lang.native_name || lang.code})</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Adaptive Recommendation Banner */}
      <CourseRecommendationBanner />

      {/* Course Cards Grid */}
      <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '1rem' }}>
        {t('courses')} ({filteredCourses.length})
      </h2>

      <div className="grid-cards">
        {filteredCourses.map(course => {
          const recInfo = recMap[course.id];
          const isBestMatch = recInfo?.recommendation_type === 'primary';
          const isBooster = recInfo?.recommendation_type === 'skill_booster';
          const isLocked = recInfo?.is_locked;
          const matchScore = recInfo?.match_score || 70;
          const startUnit = recInfo?.starting_topic_index || 1;
          const skippedCount = recInfo?.skipped_topics_count || 0;

          return (
            <div key={course.id} className="card" style={{
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              border: isBestMatch ? '2px solid var(--primary-color)' : (isBooster ? '2px solid #8b5cf6' : '1px solid var(--border-color)'),
              opacity: isLocked ? 0.75 : 1.0, position: 'relative'
            }}>
              <div>
                {/* Header Badges */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '6px' }}>
                  {isBestMatch ? (
                    <span className="badge badge-gold" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', fontWeight: '800' }}>
                      <Star size={13} fill="currentColor" /> {t('bestMatch')} ({matchScore}%)
                    </span>
                  ) : isBooster ? (
                    <span className="badge badge-purple" style={{ fontSize: '0.78rem', fontWeight: '800' }}>
                      🎯 {t('skillBooster')} ({matchScore}%)
                    </span>
                  ) : isLocked ? (
                    <span className="badge badge-red" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', fontWeight: '800' }}>
                      <ShieldAlert size={13} /> {t('statusLocked')} ({matchScore}%)
                    </span>
                  ) : (
                    <span className="badge badge-blue">
                      CEFR {course.cefr_level || course.level} ({matchScore}% Match)
                    </span>
                  )}

                  {recInfo && (
                    <button
                      onClick={() => setSelectedModalRec(recInfo)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px', color: 'var(--text-muted)' }}
                      title={t('whyAmISeeingThis')}
                    >
                      <HelpCircle size={17} />
                    </button>
                  )}
                </div>

                <h3 style={{ fontSize: '1.35rem', marginBottom: '0.4rem', color: 'var(--text-main)', fontWeight: '800', lineHeight: '1.4' }}>
                  {t(course.title)}
                </h3>
                
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.25rem', lineHeight: '1.5' }}>
                  {t(course.description) || 'Comprehensive literacy and language exercises.'}
                </p>

                {/* Starting Unit Indicator */}
                {!isLocked && (
                  <div style={{
                    padding: '0.4rem 0.75rem', borderRadius: '10px',
                    background: 'rgba(28, 176, 246, 0.08)', fontSize: '0.82rem',
                    fontWeight: '700', color: 'var(--primary-color)', marginBottom: '1.25rem',
                    display: 'inline-flex', alignItems: 'center', gap: '6px'
                  }}>
                    <Compass size={14} />
                    <span>📍 {t('startingPointUnit', { index: startUnit })} {skippedCount > 0 ? `(${skippedCount} skipped)` : ''}</span>
                  </div>
                )}
              </div>

              {isLocked ? (
                <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'rgba(255, 75, 75, 0.1)', color: '#c62828', fontSize: '0.82rem', textAlign: 'center', fontWeight: '700' }}>
                  🔒 {t(recInfo?.lock_reason) || recInfo?.lock_reason || 'Requires higher proficiency band.'}
                </div>
              ) : (
                <Link to={`/courses/${course.id}`} className="btn btn-primary" style={{ width: '100%', gap: '8px' }}>
                  {t('viewSyllabus')} <ChevronRight size={18} />
                </Link>
              )}
            </div>
          );
        })}
      </div>

      {/* Why am I seeing this Modal */}
      <WhySeeingThisModal
        isOpen={!!selectedModalRec}
        onClose={() => setSelectedModalRec(null)}
        recommendation={selectedModalRec}
      />
    </div>
  );
};

export default CourseCatalog;
