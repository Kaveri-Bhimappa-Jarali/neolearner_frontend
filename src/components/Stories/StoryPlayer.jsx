import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { 
  Volume2, ArrowRight, CheckCircle2, XCircle, Award, 
  Sparkles, RotateCcw, ChevronLeft, Zap, Heart
} from 'lucide-react';
import { speakText } from '../../utils/audio';
import { sounds } from '../../utils/sounds';

const StoryPlayer = () => {
  const { storyId } = useParams();
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [visibleScenesCount, setVisibleScenesCount] = useState(1);
  const [currentExercise, setCurrentExercise] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [rewards, setRewards] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStory = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/stories/${storyId}`);
        setStory(res.data);
        setVisibleScenesCount(1);
        // Play first scene audio
        if (res.data?.scenes?.[0]) {
          speakText(res.data.scenes[0].dialogue_target, user?.target_language?.code || 'kn');
        }
      } catch (err) {
        console.error('Failed to load story:', err);
        setError('Failed to load story details.');
      } finally {
        setLoading(false);
      }
    };
    if (storyId) fetchStory();
  }, [storyId, user]);

  const handleNextScene = () => {
    if (!story) return;

    // Check if there's an exercise triggered after the current scene
    const matchingExercise = story.exercises?.find(ex => ex.scene_number === visibleScenesCount);
    if (matchingExercise && !currentExercise) {
      setCurrentExercise(matchingExercise);
      setSelectedOption(null);
      setIsAnswered(false);
      return;
    }

    if (visibleScenesCount < story.scenes.length) {
      const nextCount = visibleScenesCount + 1;
      setVisibleScenesCount(nextCount);
      setCurrentExercise(null);
      // Play next dialogue audio
      const nextScene = story.scenes[nextCount - 1];
      if (nextScene) {
        speakText(nextScene.dialogue_target, user?.target_language?.code || 'kn');
      }
    } else {
      handleCompleteStory();
    }
  };

  const handleSelectOption = (idx) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);

    const isCorrect = currentExercise.options[idx]?.is_correct;
    if (isCorrect) {
      sounds.playCorrect();
    } else {
      sounds.playIncorrect();
    }
  };

  const handleExerciseContinue = () => {
    setCurrentExercise(null);
    setSelectedOption(null);
    setIsAnswered(false);

    if (visibleScenesCount < story.scenes.length) {
      const nextCount = visibleScenesCount + 1;
      setVisibleScenesCount(nextCount);
      const nextScene = story.scenes[nextCount - 1];
      if (nextScene) {
        speakText(nextScene.dialogue_target, user?.target_language?.code || 'kn');
      }
    } else {
      handleCompleteStory();
    }
  };

  const handleCompleteStory = async () => {
    try {
      const res = await api.post(`/stories/${storyId}/complete`, { score: 100.0 });
      setRewards(res.data);
      setIsCompleted(true);
      sounds.playCelebration();
      const uRes = await api.get('/learners/me');
      setUser(uRes.data);
    } catch (err) {
      console.error('Failed to complete story:', err);
      setIsCompleted(true);
    }
  };

  if (loading) {
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: '4rem' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading story scene...</p>
      </div>
    );
  }

  if (error || !story) {
    return (
      <div className="page-container" style={{ padding: '2rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--error)' }}>{error || 'Story not found.'}</p>
        <button onClick={() => navigate('/stories')} className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Back to Stories
        </button>
      </div>
    );
  }

  const displayedScenes = story.scenes.slice(0, visibleScenesCount);

  return (
    <div className="page-container" style={{ maxWidth: '750px', margin: '0 auto', padding: '1.5rem 1rem' }}>
      
      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <button onClick={() => navigate('/stories')} className="btn btn-secondary" style={{ padding: '0.5rem 0.75rem' }}>
          <ChevronLeft size={18} />
        </button>
        <h2 style={{ fontSize: '1.3rem', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>
          {story.title}
        </h2>
        <span style={{ background: 'rgba(88, 204, 2, 0.15)', color: 'var(--primary-color)', padding: '4px 10px', borderRadius: '12px', fontWeight: 'bold', fontSize: '0.8rem' }}>
          +{story.xp_reward} XP
        </span>
      </div>

      {/* Progress Bar */}
      <div style={{ width: '100%', height: '8px', background: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden', marginBottom: '2rem' }}>
        <div style={{ 
          width: `${(visibleScenesCount / story.scenes.length) * 100}%`, 
          height: '100%', 
          background: 'var(--primary-color)', 
          transition: 'width 0.3s ease' 
        }} />
      </div>

      {/* Story Timeline Dialogues */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2.5rem' }}>
        {displayedScenes.map((sc, idx) => (
          <div 
            key={idx} 
            className="card" 
            style={{ 
              padding: '1.25rem 1.5rem', 
              borderRadius: '16px',
              border: idx === visibleScenesCount - 1 ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
              animation: 'fadeIn 0.3s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '1.5rem' }}>{sc.character_avatar || '👤'}</span>
              <span style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--text-muted)' }}>{sc.character_name}</span>
              <button 
                onClick={() => speakText(sc.dialogue_target, user?.target_language?.code || 'kn')}
                style={{ 
                  marginLeft: 'auto', background: 'rgba(28, 176, 246, 0.1)', 
                  border: 'none', color: '#1cb0f6', padding: '4px 8px', borderRadius: '8px', 
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem' 
                }}
              >
                <Volume2 size={16} /> Listen
              </button>
            </div>

            <div style={{ fontSize: '1.35rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.35rem', lineHeight: '1.4' }}>
              {sc.dialogue_target}
            </div>
            <div style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>
              {sc.dialogue_translation}
            </div>
          </div>
        ))}
      </div>

      {/* Mid-Story Interactive Comprehension Checkpoint */}
      {currentExercise && (
        <div className="card" style={{ padding: '1.75rem', borderRadius: '16px', background: 'rgba(28, 176, 246, 0.05)', border: '2px solid #1cb0f6', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#1cb0f6', fontWeight: 'bold', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
            <Sparkles size={16} /> Comprehension Checkpoint
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1.25rem', color: 'var(--text-main)' }}>
            {currentExercise.question_text}
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {currentExercise.options.map((opt, oIdx) => {
              const isSelected = selectedOption === oIdx;
              let bg = 'var(--card-bg)';
              let border = '1px solid var(--border-color)';
              if (isAnswered) {
                if (opt.is_correct) {
                  bg = 'rgba(88, 204, 2, 0.15)';
                  border = '2px solid var(--primary-color)';
                } else if (isSelected) {
                  bg = 'rgba(255, 75, 75, 0.15)';
                  border = '2px solid var(--error)';
                }
              }

              return (
                <button
                  key={oIdx}
                  onClick={() => handleSelectOption(oIdx)}
                  disabled={isAnswered}
                  style={{
                    padding: '1rem',
                    borderRadius: '12px',
                    textAlign: 'left',
                    background: bg,
                    border: border,
                    cursor: isAnswered ? 'default' : 'pointer',
                    fontWeight: '600',
                    fontSize: '1rem',
                    color: 'var(--text-main)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <span>{opt.text}</span>
                  {isAnswered && opt.is_correct && <CheckCircle2 size={18} color="var(--primary-color)" />}
                  {isAnswered && isSelected && !opt.is_correct && <XCircle size={18} color="var(--error)" />}
                </button>
              );
            })}
          </div>

          {isAnswered && (
            <button 
              onClick={handleExerciseContinue}
              className="btn btn-primary" 
              style={{ width: '100%', padding: '0.85rem', borderRadius: '12px' }}
            >
              Continue Story →
            </button>
          )}
        </div>
      )}

      {/* Next Dialogue Button */}
      {!currentExercise && !isCompleted && (
        <div style={{ textAlign: 'center' }}>
          <button 
            onClick={handleNextScene}
            className="btn btn-primary"
            style={{ padding: '0.85rem 2.5rem', fontSize: '1.05rem', borderRadius: '14px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            {visibleScenesCount === story.scenes.length ? 'Finish Story 🎉' : 'Next Dialogue →'}
          </button>
        </div>
      )}

      {/* Completion Modal */}
      {isCompleted && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '1rem', zIndex: 1000
        }}>
          <div className="card" style={{ maxWidth: '480px', width: '100%', padding: '2.5rem', textAlign: 'center', borderRadius: '20px' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🏆</div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '0.5rem', color: 'var(--text-main)' }}>
              Story Completed!
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
              You followed all character dialogues and successfully solved the comprehension checkpoints.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold', color: 'var(--primary-color)', fontSize: '1.15rem' }}>
                <Zap size={22} /> +{rewards?.xp_earned || story.xp_reward} XP
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold', color: '#1cb0f6', fontSize: '1.15rem' }}>
                <Award size={22} /> +{rewards?.gems_earned || story.gem_reward} Gems
              </div>
            </div>

            <button 
              onClick={() => navigate('/stories')}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.85rem', borderRadius: '12px' }}
            >
              Back to Stories Catalog
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default StoryPlayer;
