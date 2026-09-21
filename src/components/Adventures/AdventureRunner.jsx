import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { 
  Volume2, Compass, ArrowRight, CheckCircle2, Award, 
  RotateCcw, ChevronLeft, Zap, ShieldCheck
} from 'lucide-react';
import { speakText } from '../../utils/audio';
import { sounds } from '../../utils/sounds';

const AdventureRunner = () => {
  const { adventureId } = useParams();
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const [adventure, setAdventure] = useState(null);
  const [currentStepKey, setCurrentStepKey] = useState('start');
  const [loading, setLoading] = useState(true);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [stepFeedback, setStepFeedback] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [totalXp, setTotalXp] = useState(0);

  useEffect(() => {
    const fetchAdv = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/adventures/${adventureId}`);
        setAdventure(res.data);
        setCurrentStepKey('start');
      } catch (err) {
        console.error('Failed to load adventure:', err);
      } finally {
        setLoading(false);
      }
    };
    if (adventureId) fetchAdv();
  }, [adventureId]);

  const currentStep = adventure?.steps?.find(s => s.step_key === currentStepKey) || adventure?.steps?.[0];

  useEffect(() => {
    if (currentStep?.prompt_in_target) {
      speakText(currentStep.prompt_in_target, user?.target_language?.code || 'kn');
    }
  }, [currentStepKey]);

  const handleSelectChoice = async (idx) => {
    if (submitting || stepFeedback) return;
    setSelectedIdx(idx);
    setSubmitting(true);

    try {
      const res = await api.post(`/adventures/${adventureId}/step`, {
        step_key: currentStep.step_key,
        chosen_index: idx
      });

      setStepFeedback(res.data.narrative_feedback);
      setTotalXp(prev => prev + res.data.xp_earned);
      sounds.playCorrect();

      setTimeout(() => {
        if (res.data.is_final) {
          setIsCompleted(true);
          sounds.playCelebration();
        } else {
          setCurrentStepKey(res.data.next_step_key);
          setSelectedIdx(null);
          setStepFeedback(null);
        }
        setSubmitting(false);
      }, 1800);
    } catch (err) {
      console.error('Failed to submit adventure step:', err);
      setSubmitting(false);
    }
  };

  if (loading || !adventure) {
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: '4rem' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading adventure quest...</p>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ maxWidth: '750px', margin: '0 auto', padding: '1.5rem 1rem' }}>
      
      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <button onClick={() => navigate('/adventures')} className="btn btn-secondary" style={{ padding: '0.5rem 0.75rem' }}>
          <ChevronLeft size={18} />
        </button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#ff9600', fontSize: '0.8rem', fontWeight: 'bold' }}>
            <Compass size={14} /> Interactive Scenario Quest
          </div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>
            {adventure.title}
          </h2>
        </div>
        <span style={{ background: 'rgba(255, 150, 0, 0.15)', color: '#ff9600', padding: '4px 10px', borderRadius: '12px', fontWeight: 'bold', fontSize: '0.8rem' }}>
          +{totalXp} XP
        </span>
      </div>

      {/* Narrative Card */}
      <div className="card" style={{ padding: '2rem', borderRadius: '20px', marginBottom: '2rem', border: '1px solid var(--border-color)', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
        <div style={{ fontSize: '1.1rem', color: 'var(--text-main)', lineHeight: '1.6', marginBottom: '1.5rem' }}>
          {currentStep?.narrative}
        </div>

        <div style={{ padding: '1.25rem', background: 'var(--bg-subtle)', borderRadius: '14px', borderLeft: '4px solid #ff9600', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 'bold', marginBottom: '4px' }}>
            YOUR RESPONSE OBJECTIVE:
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-main)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>{currentStep?.prompt_in_target}</span>
            <button 
              onClick={() => speakText(currentStep.prompt_in_target, user?.target_language?.code || 'kn')}
              style={{ background: 'none', border: 'none', color: '#ff9600', cursor: 'pointer' }}
            >
              <Volume2 size={20} />
            </button>
          </div>
        </div>

        {/* Choices List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {currentStep?.choices?.map((choice, cIdx) => {
            const isSelected = selectedIdx === cIdx;
            return (
              <button
                key={cIdx}
                onClick={() => handleSelectChoice(cIdx)}
                disabled={submitting || stepFeedback !== null}
                style={{
                  padding: '1.15rem 1.25rem',
                  borderRadius: '14px',
                  textAlign: 'left',
                  background: isSelected ? 'rgba(88, 204, 2, 0.15)' : 'var(--card-bg)',
                  border: isSelected ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
                  cursor: submitting ? 'default' : 'pointer',
                  fontWeight: '600',
                  fontSize: '1.05rem',
                  color: 'var(--text-main)',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <span>{choice.text}</span>
                <ArrowRight size={18} style={{ opacity: 0.5 }} />
              </button>
            );
          })}
        </div>

        {stepFeedback && (
          <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(88, 204, 2, 0.15)', borderRadius: '12px', border: '1px solid var(--primary-color)', color: 'var(--primary-color)', fontWeight: 'bold' }}>
            ✨ {stepFeedback}
          </div>
        )}
      </div>

      {/* Completion Dialog */}
      {isCompleted && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '1rem', zIndex: 1000
        }}>
          <div className="card" style={{ maxWidth: '480px', width: '100%', padding: '2.5rem', textAlign: 'center', borderRadius: '20px' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🎉</div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '0.5rem', color: 'var(--text-main)' }}>
              Adventure Completed!
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
              You successfully navigated the real-world scenario in your target language.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold', color: 'var(--primary-color)', fontSize: '1.25rem' }}>
                <Zap size={22} /> +{totalXp} XP
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold', color: '#ff9600', fontSize: '1.25rem' }}>
                <Award size={22} /> +10 Gems
              </div>
            </div>

            <button 
              onClick={() => navigate('/adventures')}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.85rem', borderRadius: '12px' }}
            >
              Back to Adventures
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdventureRunner;
