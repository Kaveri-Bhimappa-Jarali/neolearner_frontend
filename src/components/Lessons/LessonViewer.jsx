import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { FileText, CheckCircle, HelpCircle, ArrowRight, Clock, Volume2 } from 'lucide-react';

const SAMPLE_LESSON = {
  id: "l1111111-1111-1111-1111-111111111111",
  title: "Pronouncing Spanish Vowels (A, E, I, O, U)",
  duration_minutes: 15,
  content: `# Spanish Vowels\nUnlike English, Spanish vowels always maintain consistent sounds:\n- A as in *father*\n- E as in *get*\n- I as in *machine*\n- O as in *go*\n- U as in *rule*`,
  assessments: [
    {
      id: "a1111111-1111-1111-1111-111111111111",
      title: "Spanish Vowel Pronunciation Quiz"
    }
  ]
};

const playPhonicPitch = (freq) => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch (e) {}
};

const LessonViewer = () => {
  const { lessonId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(SAMPLE_LESSON);
  const [completing, setCompleting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [activeSound, setActiveSound] = useState(null);

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const res = await api.get(`/courses/lessons/${lessonId}`);
        if (res.data) {
          setLesson(res.data);
        }
      } catch (err) {
        console.warn('Backend API offline or loading fallback lesson:', err);
      }
    };
    if (lessonId) {
      fetchLesson();
    }
  }, [lessonId]);

  const handleAudio = (freq, id) => {
    setActiveSound(id);
    playPhonicPitch(freq);
    setTimeout(() => setActiveSound(null), 500);
  };

  const markComplete = async () => {
    if (!user) {
      setCompleted(true);
      return;
    }
    setCompleting(true);
    try {
      await api.post(`/progress/lesson/${lessonId}`, {
        status: 'completed',
        percentage_completed: 100.0
      });
      setCompleted(true);
    } catch (err) {
      console.warn('Backend offline, marking complete locally:', err);
      setCompleted(true);
    } finally {
      setCompleting(false);
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: '850px' }}>
      <div className="card" style={{ padding: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <span className="badge badge-blue" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={12} /> {lesson.duration_minutes} Minutes
          </span>
          {completed && (
            <span className="badge badge-green" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle size={14} /> Completed
            </span>
          )}
        </div>

        <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--text-main)' }}>{lesson.title}</h1>

        {/* Audio Sound Practice Bar */}
        <div style={{ 
          background: 'var(--surface-hover)', padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)',
          display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' 
        }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Volume2 size={16} color="var(--primary-color)" /> Audio Practice:
          </span>
          {[
            { id: 's1', label: '/A/ sound', freq: 440 },
            { id: 's2', label: '/E/ sound', freq: 523 },
            { id: 's3', label: '/I/ sound', freq: 659 },
            { id: 's4', label: '/O/ sound', freq: 783 },
            { id: 's5', label: '/U/ sound', freq: 880 }
          ].map(s => (
            <button 
              key={s.id} 
              className={`sound-btn ${activeSound === s.id ? 'playing' : ''}`}
              onClick={() => handleAudio(s.freq, s.id)}
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
            >
              🔊 {s.label}
            </button>
          ))}
        </div>

        <div style={{ 
          background: 'var(--background)', padding: '1.5rem', borderRadius: 'var(--radius-md)', 
          border: '1px solid var(--border-color)', marginBottom: '2rem', color: 'var(--text-main)',
          lineHeight: '1.7', whiteSpace: 'pre-wrap'
        }}>
          {lesson.content}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <button 
            className={`btn ${completed ? 'btn-secondary' : 'btn-primary'}`} 
            onClick={markComplete}
            disabled={completing}
          >
            {completed ? '✓ Lesson Completed' : completing ? 'Saving...' : 'Mark as Complete'}
          </button>

          {lesson.assessments && lesson.assessments.length > 0 && (
            <Link to={`/assessments/${lesson.assessments[0].id}`} className="btn btn-accent" style={{ gap: '8px' }}>
              <HelpCircle size={18} /> Take Lesson Quiz <ArrowRight size={16} />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default LessonViewer;
