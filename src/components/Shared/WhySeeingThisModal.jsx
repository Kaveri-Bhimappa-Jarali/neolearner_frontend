import React from 'react';
import { HelpCircle, CheckCircle2, ShieldAlert, Sparkles, Target, Award, Compass, X } from 'lucide-react';
import { useTranslation } from '../../utils/i18n';
import { translateReason } from '../Dashboard/CourseRecommendationBanner';

const WhySeeingThisModal = ({ isOpen, onClose, recommendation }) => {
  const { t } = useTranslation();

  if (!isOpen || !recommendation) return null;

  const {
    title,
    cefr_level,
    match_score,
    recommendation_type,
    reasons = [],
    skills_covered = [],
    target_goals = [],
    starting_topic_index = 1,
    skipped_topics_count = 0,
    is_locked = false,
    lock_reason = null
  } = recommendation;

  return (
    <div className="modal-overlay" style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1100, padding: '1rem'
    }} onClick={onClose}>
      <div className="modal-card" style={{
        background: 'var(--surface, #1e293b)', borderRadius: '24px',
        maxWidth: '540px', width: '100%', padding: '2rem',
        boxShadow: '0 20px 50px rgba(0,0,0,0.5)', border: '1px solid var(--border-color, #334155)',
        position: 'relative', overflow: 'hidden'
      }} onClick={e => e.stopPropagation()}>
        
        {/* Close button */}
        <button 
          onClick={onClose}
          style={{
            position: 'absolute', top: '1.25rem', right: '1.25rem',
            background: 'var(--surface-hover, #334155)', border: 'none', borderRadius: '50%',
            width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'var(--text-muted)'
          }}
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.25rem' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '16px',
            background: 'linear-gradient(135deg, rgba(28, 176, 246, 0.2), rgba(88, 204, 2, 0.2))',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <HelpCircle size={28} color="var(--primary-color, #1cb0f6)" />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: '800', color: 'var(--text-main)' }}>
              {t('whyRecommendedTitle')}
            </h2>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {t('aiAnalysisSubtitle')}
            </span>
          </div>
        </div>

        {/* Course Banner */}
        <div style={{
          padding: '1.1rem 1.25rem', borderRadius: '16px', marginBottom: '1.5rem',
          background: is_locked ? 'rgba(255, 75, 75, 0.08)' : 'linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(59, 130, 246, 0.12))',
          border: `1.5px solid ${is_locked ? 'rgba(255, 75, 75, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div>
            <span style={{
              display: 'inline-block', padding: '3px 10px', borderRadius: '9999px',
              fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase',
              background: 'var(--primary-color, #1cb0f6)', color: '#ffffff', marginBottom: '4px'
            }}>
              CEFR {cefr_level}
            </span>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-main)' }}>
              {t(title) || title}
            </h3>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '1.4rem', fontWeight: '900', color: 'var(--primary-color, #1cb0f6)', display: 'block' }}>
              {match_score}%
            </span>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              {t('matchScoreLabel')}
            </span>
          </div>
        </div>

        {/* Lock Warning if locked */}
        {is_locked && (
          <div style={{
            padding: '0.85rem 1rem', borderRadius: '12px', marginBottom: '1.25rem',
            background: 'rgba(255, 75, 75, 0.12)', border: '1px solid rgba(255, 75, 75, 0.3)',
            color: '#ef4444', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '10px'
          }}>
            <ShieldAlert size={20} />
            <span><strong>{t('lockedPrefix') || 'Locked:'}</strong> {lock_reason || 'Proficiency prerequisite required.'}</span>
          </div>
        )}

        {/* Reasons List */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {t('keyFactorsHeader')}
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {reasons.map((r, idx) => (
              <div key={idx} style={{
                padding: '0.85rem 1rem', borderRadius: '12px',
                background: 'var(--background, #0f172a)', border: '1px solid var(--border-color, #334155)',
                display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.92rem', color: 'var(--text-main)'
              }}>
                <CheckCircle2 size={18} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{translateReason(r, t)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Starting Unit Placement Info */}
        <div style={{
          padding: '1rem', borderRadius: '14px', background: 'rgba(28, 176, 246, 0.08)',
          border: '1px solid rgba(28, 176, 246, 0.25)', marginBottom: '1.5rem',
          display: 'flex', alignItems: 'center', gap: '12px'
        }}>
          <Compass size={24} color="var(--primary-color, #1cb0f6)" />
          <div style={{ fontSize: '0.88rem', color: 'var(--text-main)' }}>
            <strong>{t('startingPointUnit', { index: starting_topic_index })}</strong>
            {skipped_topics_count > 0 ? (
              <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '2px' }}>
                {skipped_topics_count} prior topics skipped based on your high assessment score.
              </span>
            ) : (
              <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '2px' }}>
                Build your foundation starting from Unit 1.
              </span>
            )}
          </div>
        </div>

        {/* Skills Covered */}
        {skills_covered.length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
              {t('targetSkillsTaught')}
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {skills_covered.map(s => (
                <span key={s} style={{
                  padding: '4px 10px', borderRadius: '8px', background: 'var(--surface-hover, #334155)',
                  fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-main)', textTransform: 'capitalize'
                }}>
                  {t(s) || s}
                </span>
              ))}
            </div>
          </div>
        )}

        <button 
          className="btn btn-primary"
          style={{ width: '100%', padding: '0.9rem', fontSize: '1rem', fontWeight: '700', borderRadius: '14px' }}
          onClick={onClose}
        >
          {t('gotItBtn')}
        </button>

      </div>
    </div>
  );
};

export default WhySeeingThisModal;

