import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { BookOpen, Volume2, X, AlertTriangle, Sparkles, CheckCircle2, Award } from 'lucide-react';
import { speakText } from '../../utils/audio';

const UnitGuidebookModal = ({ topicId, onClose, onTestOut, languageCode = 'kn' }) => {
  const [guidebook, setGuidebook] = useState(null);
  const [mastery, setMastery] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGuidebook = async () => {
      setLoading(true);
      try {
        const [gRes, mRes] = await Promise.all([
          api.get(`/guidebooks/topic/${topicId}`),
          api.get(`/guidebooks/mastery/${topicId}`).catch(() => ({ data: null }))
        ]);
        setGuidebook(gRes.data);
        setMastery(mRes.data);
      } catch (err) {
        console.error('Failed to load unit guidebook:', err);
      } finally {
        setLoading(false);
      }
    };
    if (topicId) fetchGuidebook();
  }, [topicId]);

  if (!topicId) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem', zIndex: 1050
    }}>
      <div className="card" style={{ 
        maxWidth: '750px', width: '100%', maxHeight: '85vh', 
        overflowY: 'auto', padding: '2rem', borderRadius: '24px', position: 'relative' 
      }}>
        
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
        >
          <X size={24} />
        </button>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            Loading Unit Grammar Guide...
          </div>
        ) : (
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--primary-color)', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              <BookOpen size={16} /> Unit Grammar Guidebook
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: '800', margin: '0 0 1rem', color: 'var(--text-main)' }}>
              {guidebook?.title}
            </h2>

            {/* Mastery Level Badge */}
            {mastery && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem', background: 'var(--bg-subtle)', padding: '0.75rem 1rem', borderRadius: '12px' }}>
                <Award size={20} color="var(--primary-color)" />
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Mastery Level: </span>
                  <strong style={{ textTransform: 'capitalize', color: 'var(--text-main)' }}>{mastery.level}</strong>
                  {mastery.legendary_passed && <span style={{ marginLeft: '6px' }}>👑 Legendary Crown</span>}
                </div>
              </div>
            )}

            {/* Grammar Notes */}
            <div style={{ background: 'var(--bg-subtle)', padding: '1.25rem', borderRadius: '14px', marginBottom: '1.5rem', lineHeight: '1.6', fontSize: '0.95rem' }}>
              <div dangerouslySetInnerHTML={{ __html: guidebook?.grammar_notes_md?.replace(/\n/g, '<br/>') || '' }} />
            </div>

            {/* Key Phrases */}
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '0.75rem' }}>Key Phrases</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
              {guidebook?.key_phrases?.map((kp, idx) => (
                <div key={idx} style={{ padding: '0.85rem 1rem', background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontWeight: '700', color: 'var(--text-main)', fontSize: '1rem' }}>{kp.phrase}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{kp.meaning}</div>
                  </div>
                  <button 
                    onClick={() => speakText(kp.phrase, languageCode)}
                    style={{ background: 'rgba(28, 176, 246, 0.1)', border: 'none', color: '#1cb0f6', padding: '6px', borderRadius: '8px', cursor: 'pointer' }}
                  >
                    <Volume2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            {/* Common Mistakes */}
            {guidebook?.common_mistakes_md && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px', color: '#ff9600' }}>
                  <AlertTriangle size={18} /> Common Pitfalls to Avoid
                </h3>
                <div style={{ padding: '1rem', background: 'rgba(255, 150, 0, 0.08)', borderRadius: '12px', borderLeft: '4px solid #ff9600', fontSize: '0.9rem', lineHeight: '1.5' }}>
                  <div dangerouslySetInnerHTML={{ __html: guidebook.common_mistakes_md.replace(/\n/g, '<br/>') }} />
                </div>
              </div>
            )}

            {/* Cultural Context */}
            {guidebook?.cultural_tips_md && (
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary-color)' }}>
                  <Sparkles size={18} /> Cultural Context
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
                  {guidebook.cultural_tips_md}
                </p>
              </div>
            )}

            {/* Action Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', flexWrap: 'wrap', gap: '1rem' }}>
              <button onClick={onClose} className="btn btn-secondary" style={{ padding: '0.75rem 1.5rem', borderRadius: '12px' }}>
                Close Guide
              </button>

              {onTestOut && (
                <button 
                  onClick={() => {
                    onClose();
                    onTestOut(topicId);
                  }} 
                  className="btn btn-primary" 
                  style={{ padding: '0.75rem 1.75rem', borderRadius: '12px' }}
                >
                  ⚡ Test Out of Unit (Score 80%+)
                </button>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default UnitGuidebookModal;
