import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { Compass, CheckCircle, Sparkles, Play, ChevronLeft, MapPin } from 'lucide-react';

const AdventureCatalog = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [adventures, setAdventures] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdventures = async () => {
      setLoading(true);
      try {
        const res = await api.get('/adventures');
        setAdventures(res.data || []);
      } catch (err) {
        console.error('Failed to load adventures:', err);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchAdventures();
  }, [user]);

  return (
    <div className="page-container" style={{ maxWidth: '850px', margin: '0 auto', padding: '1.5rem 1rem' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
        <button onClick={() => navigate('/dashboard')} className="btn btn-secondary" style={{ padding: '0.5rem 0.75rem' }}>
          <ChevronLeft size={18} />
        </button>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#ff9600', fontSize: '0.85rem', fontWeight: 'bold' }}>
            <Compass size={16} /> NeoAdventures Immersive Scenarios
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', margin: '0.25rem 0 0', color: 'var(--text-main)' }}>
            Real-World Language Quests
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.95rem' }}>
            Step into branching real-life environments where your target-language decisions dictate your path.
          </p>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          Loading immersive adventures...
        </div>
      ) : adventures.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <MapPin size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem' }} />
          <h3>No adventures available for your target language yet.</h3>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {adventures.map((adv) => (
            <div 
              key={adv.id} 
              className="card" 
              style={{ 
                padding: '1.5rem 2rem', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                borderRadius: '16px',
                border: adv.is_completed ? '1px solid rgba(88, 204, 2, 0.4)' : '1px solid var(--border-color)',
                flexWrap: 'wrap',
                gap: '1rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <div style={{ 
                  fontSize: '2.5rem', background: 'rgba(255, 150, 0, 0.1)', 
                  width: '64px', height: '64px', borderRadius: '16px', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center' 
                }}>
                  {adv.scenario_type === 'airport' ? '✈️' : adv.scenario_type === 'market' ? '🛒' : '🏨'}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ 
                      background: 'rgba(255, 150, 0, 0.15)', color: '#ff9600', 
                      padding: '2px 8px', borderRadius: '6px', fontWeight: 'bold', fontSize: '0.75rem' 
                    }}>
                      Difficulty: Level {adv.difficulty_level}
                    </span>
                    {adv.is_completed && (
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
                    {adv.title}
                  </h3>
                  <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.85rem' }}>
                    {adv.intro_text}
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigate(`/adventures/${adv.id}`)}
                className={adv.is_completed ? "btn btn-secondary" : "btn btn-primary"}
                style={{ padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '12px' }}
              >
                <Play size={16} fill="currentColor" /> {adv.is_completed ? 'Replay Quest' : 'Start Adventure'}
              </button>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default AdventureCatalog;
