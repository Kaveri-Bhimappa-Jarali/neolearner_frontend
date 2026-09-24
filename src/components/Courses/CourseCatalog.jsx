import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../utils/i18n';
import { BookOpen, Globe, ChevronRight, Star, HelpCircle, ShieldAlert, Compass, Sparkles, Filter, Lock } from 'lucide-react';
import CourseRecommendationBanner from '../Dashboard/CourseRecommendationBanner';
import WhySeeingThisModal from '../Shared/WhySeeingThisModal';
import Badge from '../ui/Badge';

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
    <div className="page-container" style={{ maxWidth: '1200px' }}>
      
      {/* Top Header */}
      <div 
        style={{ 
          display: 'flex', 
          justify: 'space-between', 
          alignItems: 'center', 
          flexWrap: 'wrap', 
          gap: '1.5rem', 
          marginBottom: '2rem',
          background: 'var(--surface-card)',
          padding: '2rem',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-md)'
        }}
      >
        <div>
          <h1 className="page-title" style={{ margin: '0 0 6px 0', fontSize: '2rem' }}>
            <BookOpen color="var(--primary-color)" size={36} />
            Course Catalog
          </h1>
          <p className="page-subtitle" style={{ margin: 0 }}>
            Structured regional language courses calibrated to CEFR standards
          </p>
        </div>

        {languages.length > 0 && (
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <Globe color="var(--primary-color)" size={20} />
            <select 
              className="form-select"
              value={selectedLang} 
              onChange={(e) => setSelectedLang(e.target.value)}
              style={{
                width: 'auto',
                minWidth: '200px',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                background: 'var(--surface)',
                color: 'var(--text-main)',
                fontWeight: '700'
              }}
            >
              <option value="">All Languages</option>
              {languages.map(lang => (
                <option key={lang.id} value={lang.id}>{lang.name} ({lang.native_name || lang.code})</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Adaptive Recommendation Banner */}
      <CourseRecommendationBanner />

      {/* Course Cards Grid Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <h2 style={{ fontSize: '1.45rem', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>
          Available Courses ({filteredCourses.length})
        </h2>
      </div>

      {/* Course Cards Grid */}
      <div className="grid-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {filteredCourses.map(course => {
          const recInfo = recMap[course.id];
          const isBestMatch = recInfo?.recommendation_type === 'primary';
          const isBooster = recInfo?.recommendation_type === 'skill_booster';
          const isLocked = recInfo?.is_locked;
          const matchScore = recInfo?.match_score || 70;
          const startUnit = recInfo?.starting_topic_index || 1;
          const skippedCount = recInfo?.skipped_topics_count || 0;

          return (
            <div 
              key={course.id} 
              className="card" 
              style={{
                display: 'flex', 
                flexDirection: 'column', 
                justify: 'space-between',
                border: isBestMatch ? '2px solid var(--primary-color)' : (isBooster ? '2px solid var(--secondary-color)' : '1px solid var(--border-color)'),
                background: 'var(--surface-card)',
                borderRadius: 'var(--radius-xl)',
                opacity: isLocked ? 0.8 : 1.0, 
                position: 'relative',
                padding: '1.75rem'
              }}
            >
              <div>
                {/* Header Badges */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '6px' }}>
                  {isBestMatch ? (
                    <Badge variant="gold" icon={Star}>Best Match ({matchScore}%)</Badge>
                  ) : isBooster ? (
                    <Badge variant="purple" icon={Sparkles}>Skill Booster ({matchScore}%)</Badge>
                  ) : isLocked ? (
                    <Badge variant="red" icon={Lock}>Locked ({matchScore}%)</Badge>
                  ) : (
                    <Badge variant="cyan">CEFR {course.cefr_level || course.level || 'A1'}</Badge>
                  )}

                  {recInfo && (
                    <button
                      onClick={() => setSelectedModalRec(recInfo)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: 'var(--text-muted)' }}
                      title="Why am I seeing this?"
                    >
                      <HelpCircle size={18} />
                    </button>
                  )}
                </div>

                <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '0.5rem', lineHeight: '1.3' }}>
                  {course.title}
                </h3>
                
                <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: '1.25rem', lineHeight: '1.5' }}>
                  {course.description || 'Comprehensive regional language curriculum.'}
                </p>

                {/* Course Metadata Pills */}
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  <span>🎯 {course.level || 'Beginner'}</span>
                  <span>📖 {course.total_lessons || 10} Lessons</span>
                  {skippedCount > 0 && (
                    <span style={{ color: 'var(--primary-color)', fontWeight: '700' }}>⚡ Skipped {skippedCount} Known Units</span>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <div>
                {isLocked ? (
                  <button 
                    disabled 
                    className="btn btn-secondary" 
                    style={{ width: '100%', justifyContent: 'center', opacity: 0.6, cursor: 'not-allowed' }}
                  >
                    🔒 Complete Prerequisite Course First
                  </button>
                ) : (
                  <Link 
                    to={`/courses/${course.id}`} 
                    className="btn btn-primary" 
                    style={{ width: '100%', justifyContent: 'center', fontWeight: '800', gap: '6px' }}
                  >
                    {startUnit > 1 ? `Start at Unit ${startUnit}` : 'Explore Course'} <ChevronRight size={18} />
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Why Seeing This Recommendation Modal */}
      {selectedModalRec && (
        <WhySeeingThisModal 
          rec={selectedModalRec} 
          onClose={() => setSelectedModalRec(null)} 
        />
      )}
    </div>
  );
};

export default CourseCatalog;
