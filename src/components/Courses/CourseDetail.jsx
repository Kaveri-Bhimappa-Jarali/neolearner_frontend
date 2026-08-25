import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import { BookOpen, Layers, FileText, ChevronRight, Clock } from 'lucide-react';

const SAMPLE_SYLLABUS = {
  id: "c1111111-1111-1111-1111-111111111111",
  title: "Spanish Literacy Foundations",
  description: "Master elementary Spanish reading, phonics, and conversational basics.",
  topics: [
    {
      id: "t1111111-1111-1111-1111-111111111111",
      title: "Vowels & Basic Sounds",
      description: "Introduction to Spanish vowel pronunciation and sounds.",
      lessons: [
        {
          id: "l1111111-1111-1111-1111-111111111111",
          title: "Pronouncing Spanish Vowels (A, E, I, O, U)",
          duration_minutes: 15
        },
        {
          id: "l2222222-2222-2222-2222-222222222222",
          title: "Consonant Blends & Syllables",
          duration_minutes: 20
        }
      ]
    },
    {
      id: "t2222222-2222-2222-2222-222222222222",
      title: "Everyday Greetings & Phrases",
      description: "Elementary reading for daily conversation.",
      lessons: [
        {
          id: "l3333333-3333-3333-3333-333333333333",
          title: "Common Greetings & Introductions",
          duration_minutes: 10
        }
      ]
    }
  ]
};

const CourseDetail = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState(SAMPLE_SYLLABUS);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await api.get(`/courses/${courseId}`);
        if (res.data) {
          setCourse(res.data);
        }
      } catch (err) {
        console.warn('Backend API offline or loading fallback syllabus:', err);
      }
    };
    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  return (
    <div className="page-container">
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <Link to="/courses" style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'inline-block' }}>
          &larr; Back to Catalog
        </Link>
        <h1 className="page-title">{course.title}</h1>
        <p className="page-subtitle">{course.description}</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {course.topics?.map((topic, tIdx) => (
          <div key={topic.id} className="card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.25rem' }}>
              <span className="badge badge-purple">Topic {tIdx + 1}</span>
              <h2 style={{ fontSize: '1.4rem', color: 'var(--text-main)' }}>{topic.title}</h2>
            </div>
            {topic.description && (
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>{topic.description}</p>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {topic.lessons?.map((lesson) => (
                <div key={lesson.id} style={{ 
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                  padding: '1rem 1.25rem', background: 'var(--background)', borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)' 
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <FileText color="var(--secondary-color)" size={20} />
                    <div>
                      <h4 style={{ color: 'var(--text-main)', fontSize: '1.05rem' }}>{lesson.title}</h4>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                        <Clock size={12} /> {lesson.duration_minutes} mins estimated
                      </span>
                    </div>
                  </div>

                  <Link to={`/lessons/${lesson.id}`} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', gap: '4px' }}>
                    Start Lesson <ChevronRight size={14} />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourseDetail;
