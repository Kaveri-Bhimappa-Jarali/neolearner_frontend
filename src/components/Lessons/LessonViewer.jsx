import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { FileText, CheckCircle, HelpCircle, ArrowRight, Clock, Volume2, Heart } from 'lucide-react';
import { useTranslation } from '../../utils/i18n';

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
  const { t } = useTranslation();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [activeSound, setActiveSound] = useState(null);

  const getTargetLangCode = () => {
    if (lesson && lesson.language_code) {
      const code = lesson.language_code.toLowerCase();
      if (code === 'kn') return 'kn-IN';
      if (code === 'te') return 'te-IN';
      if (code === 'mr') return 'mr-IN';
      if (code === 'hi') return 'hi-IN';
      if (code === 'en') return 'en-IN';
      if (code === 'es') return 'es-ES';
      if (code === 'fr') return 'fr-FR';
      if (code === 'de') return 'de-DE';
      if (code === 'ja') return 'ja-JP';
    }
    if (user && user.target_language && user.target_language.code) {
      const code = user.target_language.code.toLowerCase();
      if (code === 'kn') return 'kn-IN';
      if (code === 'te') return 'te-IN';
      if (code === 'mr') return 'mr-IN';
      if (code === 'hi') return 'hi-IN';
      if (code === 'en') return 'en-IN';
      if (code === 'es') return 'es-ES';
      if (code === 'fr') return 'fr-FR';
      if (code === 'de') return 'de-DE';
      if (code === 'ja') return 'ja-JP';
    }
    return 'en-IN';
  };

  const getVowelsList = () => {
    const lang = getTargetLangCode().split('-')[0].toLowerCase();
    if (lang === 'kn') {
      return [
        { id: 's1', label: 'ಅ (a)', vowel: 'ಅ' },
        { id: 's2', label: 'ಆ (aa)', vowel: 'ಆ' },
        { id: 's3', label: 'ಇ (i)', vowel: 'ಇ' },
        { id: 's4', label: 'ಈ (ee)', vowel: 'ಈ' },
        { id: 's5', label: 'ಉ (u)', vowel: 'ಉ' },
        { id: 's6', label: 'ಎ (e)', vowel: 'ಎ' },
        { id: 's7', label: 'ಒ (o)', vowel: 'ಒ' }
      ];
    }
    if (lang === 'te') {
      return [
        { id: 's1', label: 'అ (a)', vowel: 'అ' },
        { id: 's2', label: 'ఆ (aa)', vowel: 'ఆ' },
        { id: 's3', label: 'ఇ (i)', vowel: 'ఇ' },
        { id: 's4', label: 'ఈ (ee)', vowel: 'ఈ' },
        { id: 's5', label: 'ఉ (u)', vowel: 'ఉ' },
        { id: 's6', label: 'ఎ (e)', vowel: 'ఎ' },
        { id: 's7', label: 'ఒ (o)', vowel: 'ఒ' }
      ];
    }
    if (lang === 'mr' || lang === 'hi') {
      return [
        { id: 's1', label: 'अ (a)', vowel: 'अ' },
        { id: 's2', label: 'आ (aa)', vowel: 'आ' },
        { id: 's3', label: 'इ (i)', vowel: 'इ' },
        { id: 's4', label: 'ई (ee)', vowel: 'ई' },
        { id: 's5', label: 'उ (u)', vowel: 'उ' },
        { id: 's6', label: 'ए (e)', vowel: 'ए' },
        { id: 's7', label: 'ओ (o)', vowel: 'ओ' }
      ];
    }
    if (lang === 'ja') {
      return [
        { id: 's1', label: 'あ (a)', vowel: 'あ' },
        { id: 's2', label: 'い (i)', vowel: 'い' },
        { id: 's3', label: 'う (u)', vowel: 'う' },
        { id: 's4', label: 'え (e)', vowel: 'え' },
        { id: 's5', label: 'お (o)', vowel: 'お' }
      ];
    }
    return [
      { id: 's1', label: '/A/ sound', vowel: 'A' },
      { id: 's2', label: '/E/ sound', vowel: 'E' },
      { id: 's3', label: '/I/ sound', vowel: 'I' },
      { id: 's4', label: '/O/ sound', vowel: 'O' },
      { id: 's5', label: '/U/ sound', vowel: 'U' }
    ];
  };

  useEffect(() => {
    const fetchLesson = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/courses/lessons/${lessonId}`);
        if (res.data) {
          setLesson(res.data);
        }
      } catch (err) {
        console.error('Failed to load lesson from API:', err);
      } finally {
        setLoading(false);
      }
    };
    if (lessonId) {
      fetchLesson();
    }
  }, [lessonId]);

  // Warm up voices cache on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.getVoices();
      const handleVoicesChanged = () => {
        window.speechSynthesis.getVoices();
      };
      window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);
      return () => {
        window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
      };
    }
  }, []);

  const getVoiceForLanguage = (langCode) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return null;
    const voices = window.speechSynthesis.getVoices();
    const prefix = langCode.split('-')[0].toLowerCase();
    let matchingVoice = voices.find(v => v.lang.toLowerCase() === langCode.toLowerCase());
    if (!matchingVoice) {
      matchingVoice = voices.find(v => v.lang.toLowerCase().startsWith(prefix));
    }
    return matchingVoice || null;
  };

  const getPhoneticText = (vowel, langCode) => {
    const lang = langCode.split('-')[0].toLowerCase();
    const voice = getVoiceForLanguage(langCode);
    const isEnglishVoice = !voice || voice.lang.toLowerCase().startsWith('en');
    
    if (isEnglishVoice) {
      if (lang === 'es' || lang === 'de' || lang === 'ja') {
        const approximations = { 'A': 'ah', 'E': 'eh', 'I': 'ee', 'O': 'oh', 'U': 'ooh' };
        return approximations[vowel] || vowel;
      }
      if (lang === 'fr') {
        const approximations = { 'A': 'ah', 'E': 'euh', 'I': 'ee', 'O': 'oh', 'U': 'ew' };
        return approximations[vowel] || vowel;
      }
    } else {
      return vowel.toLowerCase();
    }
    return vowel.toLowerCase();
  };

  const handleAudio = (vowel, id) => {
    setActiveSound(id);
    
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      window.speechSynthesis.resume();
      const targetLang = getTargetLangCode();
      const textToSpeak = getPhoneticText(vowel, targetLang);
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = targetLang;
      const voice = getVoiceForLanguage(targetLang);
      if (voice) {
        utterance.voice = voice;
      }
      utterance.rate = 0.65; // slow down slightly for clear phonics
      window.speechSynthesis.speak(utterance);
    } else {
      // Fallback to tone oscillator
      const pitchMap = { 'A': 440, 'E': 523, 'I': 659, 'O': 783, 'U': 880 };
      playPhonicPitch(pitchMap[vowel] || 440);
    }
    
    setTimeout(() => setActiveSound(null), 800);
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

  if (user && user.hearts <= 0) {
    return (
      <div className="page-container" style={{ maxWidth: '600px', textAlign: 'center' }}>
        <div className="card" style={{ padding: '3rem' }}>
          <div style={{ display: 'inline-flex', padding: '1.5rem', borderRadius: '50%', background: 'rgba(255, 75, 75, 0.15)', marginBottom: '1.5rem' }}>
            <Heart size={64} color="#ff4b4b" fill="#ff4b4b" />
          </div>
          <h1 style={{ fontSize: '2rem', color: 'var(--text-main)', marginBottom: '0.75rem' }}>{t('noHeartsMsg')}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: '1.6', marginBottom: '2rem' }}>
            You need hearts to study a lesson. You can refill your hearts in the Shop or practice to replenish them for free!
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/shop" className="btn btn-primary" style={{ background: '#ff4b4b', borderColor: '#ff4b4b', padding: '0.75rem 2rem' }}>
              {t('restoreHeartsTitle')}
            </Link>
            <Link to="/practice-hub" className="btn btn-secondary" style={{ padding: '0.75rem 2rem' }}>
              {t('practiceToRefill')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="page-container" style={{ textAlign: 'center', padding: '4rem' }}>{t('analyzingProfile')}</div>;
  }

  if (!lesson) {
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: '4rem' }}>
        <h2>Lesson not found</h2>
        <Link to="/courses" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>{t('courses')}</Link>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ maxWidth: '850px' }}>
      <div className="card" style={{ padding: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '8px' }}>
          <span className="badge badge-blue" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={12} /> {lesson.duration_minutes} Minutes
          </span>
          {completed && (
            <span className="badge badge-green" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle size={14} /> {t('Lesson Completed')}
            </span>
          )}
        </div>

        <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--text-main)', lineHeight: '1.3' }}>{t(lesson.title)}</h1>

        {/* Audio Sound Practice Bar */}
        <div style={{ 
          background: 'var(--surface-hover)', padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)',
          display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' 
        }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Volume2 size={16} color="var(--primary-color)" /> Audio Practice:
          </span>
          {getVowelsList().map(s => (
            <button 
              key={s.id} 
              className={`sound-btn ${activeSound === s.id ? 'playing' : ''}`}
              onClick={() => handleAudio(s.vowel, s.id)}
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
          {t(lesson.content)}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <button 
            className={`btn ${completed ? 'btn-secondary' : 'btn-primary'}`} 
            onClick={markComplete}
            disabled={completing}
          >
            {completed ? `✓ ${t('Lesson Completed')}` : completing ? t('submittingWorkout') : t('Mark as Complete')}
          </button>

          {lesson.assessments && lesson.assessments.length > 0 && (
            <Link to={`/assessments/${lesson.assessments[0].id}`} className="btn btn-accent" style={{ gap: '8px' }}>
              <HelpCircle size={18} /> {t('Take Lesson Quiz')} <ArrowRight size={16} />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default LessonViewer;
