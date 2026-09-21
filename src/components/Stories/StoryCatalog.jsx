import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { BookOpen, CheckCircle, Sparkles, Award, Play, ChevronLeft, Zap } from 'lucide-react';

const StoryCatalog = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStories = async () => {
      setLoading(true);
      try {
        const res = await api.get('/stories');
        setStories(res.data || []);
      } catch (err) {
        console.error('Failed to load stories:', err);
        setError('Failed to load stories.');
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchStories();
  }, [user]);

  return (
    <div className="page-container" style={{ maxWidth: '850px', margin: '0 auto', padding: '1.5rem 1rem' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
        <button onClick={() => navigate('/dashboard')} className="btn btn-secondary" style={{ padding: '0.5rem 0.75rem' }}>
          <ChevronLeft size={18} />
        </button>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--primary-color)', fontSize: '0.85rem', fontWeight: 'bold' }}>
            <Sparkles size={16} /> NeoStories Narrative Engine
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', margin: '0.25rem 0 0', color: 'var(--text-main)' }}>
            Interactive Language Stories
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.95rem' }}>
            Follow characters through realistic dialogues, listen to native pronunciation, and answer inline comprehension questions.
          </p>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          Loading interactive stories...
        </div>
      ) : stories.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <BookOpen size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem' }} />
          <h3>No stories currently available for this language track.</h3>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {stories.map((story) => (
            <div 
              key={story.id} 
              className="card" 
              style={{ 
                padding: '1.5rem 2rem', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                borderRadius: '16px',
                border: story.is_completed ? '1px solid rgba(88, 204, 2, 0.4)' : '1px solid var(--border-color)',
                transition: 'all 0.2s ease',
                flexWrap: 'wrap',
                gap: '1rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <div style={{ 
                  fontSize: '2.5rem', background: 'var(--bg-subtle)', 
                  width: '64px', height: '64px', borderRadius: '16px', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center' 
                }}>
                  {story.icon || '📖'}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ 
                      background: 'rgba(28, 176, 246, 0.15)', color: '#1cb0f6', 
                      padding: '2px 8px', borderRadius: '6px', fontWeight: 'bold', fontSize: '0.75rem' 
                    }}>
                      CEFR {story.target_cefr}
                    </span>
                    {story.is_completed && (
                      <span style={{ 
                        background: 'rgba(88, 204, 2, 0.15)', color: 'var(--primary-color)', 
                        padding: '2px 8px', borderRadius: '6px', fontWeight: 'bold', fontSize: '0.75rem',
                        display: 'inline-flex', alignItems: 'center', gap: '4px' 
                      }}>
                        <CheckCircle size={12} /> Completed
                      </span>
                    )}
                  </div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-main)', margin: '0 0 4px' }}>
                    {story.title}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    <span>+{story.xp_reward} XP</span>
                    <span>•</span>
                    <span>+{story.gem_reward} Gems</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => navigate(`/stories/${story.id}`)}
                className={story.is_completed ? "btn btn-secondary" : "btn btn-primary"}
                style={{ padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '12px' }}
              >
                <Play size={16} fill="currentColor" /> {story.is_completed ? 'Replay Story' : 'Start Story'}
              </button>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default StoryCatalog;
