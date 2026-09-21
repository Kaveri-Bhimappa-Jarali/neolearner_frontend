import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { BookOpen, Plus, Layers, FileText, CheckCircle2 } from 'lucide-react';

const ContentManagement = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/content/courses');
      setCourses(res.data);
    } catch (err) {
      console.error('Failed to load course content:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ padding: '1.5rem', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>
          Curriculum Content Management Studio
        </h3>
      </div>

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading course catalog...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {courses.map((c) => (
            <div key={c.id} style={{ padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--border-color)', background: 'var(--surface)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span className="badge badge-blue">{c.language}</span>
                <span className="badge badge-green">Published</span>
              </div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: '800', margin: '0 0 0.5rem' }}>{c.title}</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0 0 1rem' }}>
                Level: {c.level} | CEFR: {c.cefr_level} | {c.topics_count} Topics
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContentManagement;
