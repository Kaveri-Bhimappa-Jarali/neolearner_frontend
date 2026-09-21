import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../utils/i18n';
import { 
  Target, Heart, RotateCcw, Sparkles, BookOpen, 
  MessageSquare, Compass, Award, Zap, ChevronLeft, 
  Flame, Layers, Headphones, Mic, PenTool, CheckCircle2, ArrowRight, Lock
} from 'lucide-react';

const PracticeHubDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverview = async () => {
      setLoading(true);
      try {
        const res = await api.get('/practice-hub/overview');
        setOverview(res.data);
      } catch (err) {
        console.error('Failed to load practice hub overview:', err);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchOverview();
  }, [user]);

  const hasCompletedTest = user?.has_completed_placement_test;

  return (
    <div className="page-container" style={{ maxWidth: '1050px', margin: '0 auto', padding: '1.5rem 1rem' }}>
      
      {/* Header Banner */}
      <div className="card" style={{ 
        padding: '2rem', borderRadius: '24px', marginBottom: '2rem',
        background: 'linear-gradient(135deg, rgba(88, 204, 2, 0.1) 0%, rgba(28, 176, 246, 0.12) 100%)',
        border: '1px solid rgba(88, 204, 2, 0.25)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--primary-color)', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              <Target size={16} /> {t('targetTrainingHeader')}
            </div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: '800', margin: '0 0 0.5rem', color: 'var(--text-main)', lineHeight: '1.3' }}>
              {t('aiPracticeSuite')}
            </h1>
            <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.95rem', maxWidth: '650px', lineHeight: '1.5' }}>
              {t('reviewCenterDesc')}
            </p>
          </div>

          {overview?.active_boost && (
            <div style={{ 
              background: 'rgba(255, 150, 0, 0.15)', border: '1px solid #ff9600', 
              padding: '0.75rem 1.25rem', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '10px' 
            }}>
              <Flame size={24} color="#ff9600" fill="#ff9600" />
              <div>
                <div style={{ fontWeight: 'bold', color: '#ff9600', fontSize: '0.9rem' }}>2× XP Boost Active!</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {Math.floor(overview.active_boost.remaining_seconds / 60)} mins remaining
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Diagnostic Metrics Ribbon */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: 'rgba(255, 75, 75, 0.15)', padding: '10px', borderRadius: '12px' }}>
              <Heart size={20} color="#ff4b4b" fill="#ff4b4b" />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>HEARTS</div>
              <div style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-main)' }}>{overview?.current_hearts ?? 5} / 5</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: 'rgba(28, 176, 246, 0.15)', padding: '10px', borderRadius: '12px' }}>
              <RotateCcw size={20} color="#1cb0f6" />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>SRS DUE</div>
              <div style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-main)' }}>{overview?.due_srs_count ?? 0} Cards</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: 'rgba(255, 150, 0, 0.15)', padding: '10px', borderRadius: '12px' }}>
              <Target size={20} color="#ff9600" />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>MISTAKES</div>
              <div style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-main)' }}>{overview?.mistakes_count ?? 0} Items</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: 'rgba(88, 204, 2, 0.15)', padding: '10px', borderRadius: '12px' }}>
              <Layers size={20} color="var(--primary-color)" />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>FLASHCARDS</div>
              <div style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-main)' }}>{overview?.flashcards_deck_size ?? 20} In Deck</div>
            </div>
          </div>
        </div>
      </div>

      {/* Pre-Assessment Locked Guard */}
      {!hasCompletedTest ? (
        <div className="card" style={{
          padding: '2.5rem', borderRadius: '24px', textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(255, 150, 0, 0.08), rgba(28, 176, 246, 0.08))',
          border: '2px dashed #ff9600', marginBottom: '2rem'
        }}>
          <div style={{
            width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(255, 150, 0, 0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem'
          }}>
            <Lock size={36} color="#ff9600" />
          </div>

          <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-main)', margin: '0 0 0.5rem' }}>
            {t('lockedPreAssessmentTitle')}
          </h2>

          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '620px', margin: '0 auto 1.5rem', lineHeight: '1.6' }}>
            {t('lockedPracticeHubNotice')}
          </p>

          <button
            className="btn btn-primary"
            style={{ padding: '0.95rem 2rem', fontSize: '1.05rem', fontWeight: '800', borderRadius: '14px' }}
            onClick={() => navigate('/initial-exam')}
          >
            {t('startAssessmentToUnlock')}
          </button>
        </div>
      ) : (
        <>
          {/* Weak Competencies Remedial Alert */}
          {overview?.weak_competencies && overview.weak_competencies.length > 0 && (
            <div style={{ 
              background: 'rgba(255, 150, 0, 0.08)', border: '1px solid rgba(255, 150, 0, 0.3)', 
              padding: '1rem 1.5rem', borderRadius: '16px', marginBottom: '2rem',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' 
            }}>
              <div>
                <span style={{ fontWeight: 'bold', color: '#ff9600', marginRight: '8px' }}>⚡ AI Target Recommendation:</span>
                <span style={{ color: 'var(--text-main)', fontSize: '0.95rem' }}>
                  Your {overview.weak_competencies.map(w => `${t(w.skill)} (${w.score}%)`).join(', ')} competency is lower than average. Focus on speaking and listening today!
                </span>
              </div>
              <Link to="/adaptive-practice?focus=speaking" className="btn btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}>
                {t('Start Boost Workout')}
              </Link>
            </div>
          )}

          {/* 12 Practice Modes Grid */}
          <h2 style={{ fontSize: '1.35rem', fontWeight: '800', marginBottom: '1.25rem', color: 'var(--text-main)' }}>
            {t('targetedPracticeModes')}
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {overview?.modes?.map((mode) => {
              const titleKeyMap = {
                hearts: 'restoreHeartsTitle',
                mistakes: 'mistakesQueueTitle',
                srs: 'srsTitle',
                flashcards: 'flashcardsTitle',
                speaking: 'speakingLabTitle',
                listening: 'listeningStudioTitle',
                writing: 'writingSpellingTitle',
                matching: 'speedMatchingTitle',
                conversation: 'aiConversationLabTitle',
                stories: 'storiesTitle',
                adventures: 'adventuresTitle',
                smart_adaptive: 'smartWorkoutTitle'
              };

              const descKeyMap = {
                hearts: 'restoreHeartsDesc',
                mistakes: 'mistakesQueueDesc',
                srs: 'srsDesc',
                flashcards: 'flashcardsDesc',
                speaking: 'speakingLabDesc',
                listening: 'listeningStudioDesc',
                writing: 'writingSpellingDesc',
                matching: 'speedMatchingDesc',
                conversation: 'aiConversationLabDesc',
                stories: 'storiesDesc',
                adventures: 'adventuresDesc',
                smart_adaptive: 'smartWorkoutDesc'
              };

              const titleKey = titleKeyMap[mode.id];
              const descKey = descKeyMap[mode.id];

              const localizedTitle = titleKey ? t(titleKey) : (t(mode.title) || mode.title);
              const localizedDesc = descKey ? t(descKey) : (t(mode.desc) || mode.desc);

              return (
                <Link
                  key={mode.id}
                  to={mode.route}
                  className="card"
                  style={{
                    padding: '1.5rem',
                    borderRadius: '18px',
                    textDecoration: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    border: '1px solid var(--border-color)',
                    transition: 'transform 0.2s ease, border-color 0.2s ease'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <div style={{ fontSize: '2rem', background: 'var(--bg-subtle)', width: '52px', height: '52px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {mode.icon}
                      </div>
                      {mode.badge && (
                        <span style={{
                          padding: '3px 8px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 'bold',
                          background: mode.badge.includes('URGENT') || mode.badge.includes('REFILL') ? 'rgba(255, 75, 75, 0.15)' : 'rgba(88, 204, 2, 0.15)',
                          color: mode.badge.includes('URGENT') || mode.badge.includes('REFILL') ? 'var(--error)' : 'var(--primary-color)'
                        }}>
                          {t(mode.badge)}
                        </span>
                      )}
                    </div>

                    <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--text-main)', margin: '0 0 0.5rem', lineHeight: '1.4' }}>
                      {localizedTitle}
                    </h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: '1.5', margin: 0 }}>
                      {localizedDesc}
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary-color)', fontWeight: 'bold', fontSize: '0.85rem', marginTop: '1.25rem' }}>
                    {t('launchWorkout')} <ArrowRight size={16} />
                  </div>
                </Link>
              );
            })}
          </div>
        </>
      )}

    </div>
  );
};

export default PracticeHubDashboard;
