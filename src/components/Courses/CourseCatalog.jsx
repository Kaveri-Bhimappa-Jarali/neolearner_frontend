import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { BookOpen, Globe, ChevronRight, Sparkles } from 'lucide-react';

const DEFAULT_COURSES = [
  {
    id: "c1111111-1111-1111-1111-111111111111",
    title: "Spanish Literacy Foundations",
    description: "Master elementary Spanish reading, phonics, and conversational basics.",
    level: "Beginner",
    language: { name: "Spanish" }
  },
  {
    id: "c2222222-2222-2222-2222-222222222222",
    title: "Foundational English Phonics",
    description: "Learn essential English vowel and consonant letter-sound associations.",
    level: "Beginner",
    language: { name: "English" }
  },
  {
    id: "c3333333-3333-3333-3333-333333333333",
    title: "French Elementary Reading",
    description: "Introductory course for French vocabulary, accents, and basic sentence reading.",
    level: "Intermediate",
    language: { name: "French" }
  }
];

const CourseCatalog = () => {
  const [courses, setCourses] = useState(DEFAULT_COURSES);
  const [languages, setLanguages] = useState([]);
  const [selectedLang, setSelectedLang] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [courseRes, langRes] = await Promise.all([
          api.get('/courses/'),
          api.get('/languages/')
        ]);
        if (courseRes.data && courseRes.data.length > 0) {
          setCourses(courseRes.data);
        }
        if (langRes.data) {
          setLanguages(langRes.data);
        }
      } catch (err) {
        console.warn('Backend API offline or loading fallback data:', err);
      }
    };
    fetchData();
  }, []);

  const filteredCourses = selectedLang
    ? courses.filter(c => c.language_id === selectedLang)
    : courses;

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">
            <BookOpen color="var(--primary-color)" size={36} />
            Explore Courses & Literacy Modules
          </h1>
          <p className="page-subtitle">Select a target language course to begin lessons and assessments.</p>
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
              <option value="">All Languages</option>
              {languages.map(lang => (
                <option key={lang.id} value={lang.id}>{lang.name} ({lang.native_name || lang.code})</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="grid-cards">
        {filteredCourses.map(course => (
          <div key={course.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span className="badge badge-green">{course.level} Level</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--secondary-color)', fontWeight: '700' }}>
                  {course.language?.name || 'Language Course'}
                </span>
              </div>
              <h3 style={{ fontSize: '1.35rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>{course.title}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: '1.4' }}>
                {course.description || 'Comprehensive literacy and language exercises.'}
              </p>
            </div>

            <Link to={`/courses/${course.id}`} className="btn btn-primary" style={{ width: '100%', gap: '8px' }}>
              View Course Syllabus <ChevronRight size={18} />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourseCatalog;
