import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Sparkles, HelpCircle, ArrowRight, Target, Compass, Zap } from 'lucide-react';
import api from '../../api/axios';
import WhySeeingThisModal from '../Shared/WhySeeingThisModal';
import { useTranslation } from '../../utils/i18n';

export const translateReason = (reasonObj, t) => {
  if (!reasonObj) return '';
  const text = typeof reasonObj === 'string' ? reasonObj : reasonObj.text || '';
  if (!text) return '';
  
  let m = text.match(/Perfect match for your current (\w+) level/i);
  if (m) return t('recReasonLevelExact', { level: m[1] });

  m = text.match(/Appropriate level review building on your (\w+) foundation/i);
  if (m) return t('recReasonLevelReview', { level: m[1] });

  m = text.match(/Directly matches your selected '([^']+)' goal/i);
  if (m) {
    const rawGoal = m[1].toLowerCase();
    const goalKeyMap = {
      travel: 'goalTravel',
      career: 'goalCareer',
      exam: 'goalExam',
      family: 'goalFamily',
      brain: 'goalBrain',
      conversation: 'goalConversation'
    };
    const translatedGoal = t(goalKeyMap[rawGoal]) || m[1];
    return t('recReasonGoal', { goal: translatedGoal });
  }

  m = text.match(/Targeted booster to improve your weakest skill: (.+)/i);
  if (m) return t('recReasonWeakSkill', { skills: m[1] });

  if (text.toLowerCase().includes('prerequisites unlocked')) return t('recReasonPrereq');

  m = text.match(/Recommended starting point: Unit (\d+) \(Matched to CEFR (\w+)\)/i);
  if (m) return t('recReasonStartingUnit', { index: m[1], cefr: m[2] });

  return t(text) || text;
};

const CourseRecommendationBanner = ({ onRefresh }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [recommendationData, setRecommendationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedModalRec, setSelectedModalRec] = useState(null);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const res = await api.get('/learning/recommendations');
      setRecommendationData(res.data);
    } catch (err) {
      console.error('Failed to fetch course recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem', textAlign: 'center' }}>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Analyzing your learning profile & ranking paths...</div>
      </div>
    );
  }

  if (!recommendationData || !recommendationData.primary_recommendation) {
    return null;
  }

  const primary = recommendationData.primary_recommendation;
  const boosters = recommendationData.skill_boosters || [];
  const topReasonRaw = primary.reasons && primary.reasons.length > 0 ? primary.reasons[0] : 'Best match for your CEFR level and learning goals.';
  const topReasonFormatted = translateReason(topReasonRaw, t);

  return (
    <div style={{ marginBottom: '2rem' }}>
      
      {/* Primary Recommendation Banner */}
      <div className="card" style={{
        padding: '2rem 2.25rem', borderRadius: '24px',
        background: 'linear-gradient(135deg, rgba(28, 176, 246, 0.12), rgba(16, 185, 129, 0.12))',
        border: '2px solid rgba(28, 176, 246, 0.35)',
        boxShadow: '0 12px 32px rgba(0,0,0,0.06)',
        position: 'relative', overflow: 'hidden'
      }}>

        {/* Top Badges */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge badge-gold" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase' }}>
              <Star size={15} fill="currentColor" /> {t('bestMatchTag', { score: primary.match_score })}
            </span>
            <span style={{
              padding: '3px 10px', borderRadius: '9999px',
              fontSize: '0.78rem', fontWeight: '800', background: 'var(--primary-color, #1cb0f6)', color: '#ffffff'
            }}>
              CEFR {primary.cefr_level}
            </span>
          </div>

          <button
            onClick={() => setSelectedModalRec(primary)}
            style={{
              background: 'var(--surface)', border: '1px solid var(--border-color)',
              borderRadius: '9999px', padding: '0.35rem 0.9rem', fontSize: '0.82rem',
              fontWeight: '700', color: 'var(--primary-color, #1cb0f6)', display: 'inline-flex',
              alignItems: 'center', gap: '6px', cursor: 'pointer', transition: 'all 0.2s'
            }}
          >
            <HelpCircle size={15} /> {t('whyAmISeeingThisBtn')}
          </button>
        </div>

        {/* Course Title & Description */}
        <div style={{ marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--text-main)', margin: '0 0 0.4rem', letterSpacing: '-0.3px' }}>
            {t(primary.title) || primary.title}
          </h2>
          <p style={{ fontSize: '1rem', color: 'var(--text-muted)', margin: 0, lineHeight: '1.5' }}>
            {t(primary.description) || primary.description || 'Personalized multi-skill course tailored to your diagnostic performance.'}
          </p>
        </div>

        {/* Reason Pill & Starting Unit Badge */}
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '1.5rem' }}>
          <div style={{
            padding: '0.5rem 0.9rem', borderRadius: '12px',
            background: 'var(--surface)', border: '1px solid var(--border-color)',
            fontSize: '0.88rem', fontWeight: '600', color: 'var(--text-main)',
            display: 'inline-flex', alignItems: 'center', gap: '8px'
          }}>
            <Sparkles size={16} color="#10b981" />
            <span>{topReasonFormatted}</span>
          </div>

          <div style={{
            padding: '0.5rem 0.9rem', borderRadius: '12px',
            background: 'rgba(28, 176, 246, 0.15)', border: '1px solid rgba(28, 176, 246, 0.3)',
            fontSize: '0.88rem', fontWeight: '700', color: 'var(--primary-color, #1cb0f6)',
            display: 'inline-flex', alignItems: 'center', gap: '6px'
          }}>
            <Compass size={16} />
            <span>{t('startAtUnitTag', { index: primary.starting_topic_index })}</span>
          </div>
        </div>

        {/* Action Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            className="btn btn-primary"
            style={{ padding: '0.9rem 1.75rem', fontSize: '1.05rem', fontWeight: '800', borderRadius: '14px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            onClick={() => navigate(`/courses/${primary.course_id}`)}
          >
            {t('startRecommendedCourseBtn')} <ArrowRight size={20} />
          </button>
        </div>

      </div>

      {/* Secondary Skill Boosters Ribbon (if available) */}
      {boosters.length > 0 && (
        <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          {boosters.slice(0, 2).map(b => (
            <div key={b.course_id} className="card" style={{
              padding: '1.15rem 1.25rem', borderRadius: '18px',
              border: '1px solid var(--border-color, #e5e7eb)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
              <div>
                <span className="badge badge-purple" style={{ fontSize: '0.72rem', fontWeight: '800', marginBottom: '4px', display: 'inline-block' }}>
                  {t('skillBoosterTag', { score: b.match_score })}
                </span>
                <h4 style={{ margin: '0 0 2px', fontSize: '1rem', fontWeight: '800', color: 'var(--text-main)' }}>
                  {t(b.title) || b.title}
                </h4>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  CEFR {b.cefr_level} • Unit {b.starting_topic_index}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button
                  onClick={() => setSelectedModalRec(b)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', color: 'var(--text-muted)' }}
                  title={t('whyAmISeeingThisBtn')}
                >
                  <HelpCircle size={18} />
                </button>
                <button
                  className="btn btn-secondary"
                  style={{ padding: '0.5rem 0.9rem', fontSize: '0.85rem', fontWeight: '700', borderRadius: '10px' }}
                  onClick={() => navigate(`/courses/${b.course_id}`)}
                >
                  {t('viewActionBtn')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <WhySeeingThisModal
        isOpen={!!selectedModalRec}
        onClose={() => setSelectedModalRec(null)}
        recommendation={selectedModalRec}
      />

    </div>
  );
};

export default CourseRecommendationBanner;

