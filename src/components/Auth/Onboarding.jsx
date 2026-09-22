import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { 
  Globe, BookOpen, Target, Sparkles, Compass, 
  ArrowRight, ArrowLeft, Check, Award, Clock, 
  Plane, Briefcase, MessageCircle, GraduationCap, 
  FileText, Home, Star, ShieldCheck
} from 'lucide-react';

const Onboarding = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  const [step, setStep] = useState(1);
  const totalSteps = 5;

  // Form State
  const [preferredLang, setPreferredLang] = useState('');
  const [targetLang, setTargetLang] = useState('');
  const [priorKnowledge, setPriorKnowledge] = useState('complete_beginner');
  const [learningGoal, setLearningGoal] = useState('conversation');
  const [dailyMinutes, setDailyMinutes] = useState(15);
  const [dailyXp, setDailyXp] = useState(30);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (user.preferred_language_id) setPreferredLang(user.preferred_language_id);
    if (user.target_language_id) setTargetLang(user.target_language_id);
    if (user.prior_knowledge) setPriorKnowledge(user.prior_knowledge);
    if (user.learning_goal) setLearningGoal(user.learning_goal);
    if (user.daily_minutes_goal) setDailyMinutes(user.daily_minutes_goal);

    const DEFAULT_LANGS = [
      { id: 1, code: 'en', name: 'English', native_name: 'English' },
      { id: 2, code: 'kn', name: 'Kannada', native_name: 'ಕನ್ನಡ' },
      { id: 3, code: 'te', name: 'Telugu', native_name: 'తెలుగు' },
      { id: 4, code: 'mr', name: 'Marathi', native_name: 'ಮರಾಠಿ' },
      { id: 5, code: 'hi', name: 'Hindi', native_name: 'हिन्दी' },
      { id: 6, code: 'es', name: 'Spanish', native_name: 'Español' }
    ];

    const fetchLanguages = async () => {
      try {
        const res = await api.get('/languages/');
        const langData = (Array.isArray(res.data) && res.data.length > 0) ? res.data : DEFAULT_LANGS;
        setLanguages(langData);
        if (!user.preferred_language_id && langData.length > 0) {
          const en = langData.find(l => l.code === 'en') || langData[0];
          setPreferredLang(en.id);
        }
        if (!user.target_language_id && langData.length > 1) {
          const kn = langData.find(l => l.code === 'kn') || langData[1];
          setTargetLang(kn.id);
        }
      } catch (err) {
        console.warn('Failed to fetch languages in onboarding, using defaults:', err);
        setLanguages(DEFAULT_LANGS);
        if (!user.preferred_language_id) setPreferredLang(1);
        if (!user.target_language_id) setTargetLang(2);
      } finally {
        setLoading(false);
      }
    };
    fetchLanguages();
  }, [user, navigate]);

  const knowledgeLevels = [
    {
      id: 'complete_beginner',
      title: "I'm a complete beginner",
      desc: "Starting from scratch. No prior experience.",
      icon: "🌱",
      badge: "A0"
    },
    {
      id: 'know_few_words',
      title: "I know a few basic words",
      desc: "Can recognize basic greetings and simple vocabulary.",
      icon: "🌿",
      badge: "A1"
    },
    {
      id: 'basic_sentences',
      title: "I understand basic sentences",
      desc: "Can read and construct simple everyday phrases.",
      icon: "🌳",
      badge: "A2"
    },
    {
      id: 'simple_conversations',
      title: "I can have simple conversations",
      desc: "Comfortable with basic dialogs and everyday situations.",
      icon: "💬",
      badge: "B1"
    },
    {
      id: 'intermediate',
      title: "I'm intermediate",
      desc: "Understand past/future tenses and intermediate texts.",
      icon: "⚡",
      badge: "B2"
    },
    {
      id: 'advanced',
      title: "I'm advanced or looking for fluency",
      desc: "Looking to master idioms, pronunciation, and literature.",
      icon: "🏆",
      badge: "C1/C2"
    }
  ];

  const goalsList = [
    { id: 'conversation', title: 'Everyday Conversation', desc: 'Chat comfortably with friends, family, and locals.', icon: MessageCircle, color: '#10b981' },
    { id: 'travel', title: 'Travel & Tourism', desc: 'Navigate airports, hotels, directions, and ordering food.', icon: Plane, color: '#3b82f6' },
    { id: 'career', title: 'Career & Professional Growth', desc: 'Boost your resume and communicate in professional settings.', icon: Briefcase, color: '#8b5cf6' },
    { id: 'education', title: 'Education & Academics', desc: 'Prepare for school, exams, and formal studies.', icon: GraduationCap, color: '#f59e0b' },
    { id: 'relocation', title: 'Relocation & Living Abroad', desc: 'Integrate seamlessly into a new community.', icon: Home, color: '#ec4899' },
    { id: 'personal_interest', title: 'Culture & Personal Growth', desc: 'Enjoy media, literature, and expand your cognitive horizon.', icon: Star, color: '#06b6d4' }
  ];

  const commitmentPlans = [
    { minutes: 5, xp: 10, label: 'Casual', desc: '5 min / day' },
    { minutes: 10, xp: 20, label: 'Regular', desc: '10 min / day' },
    { minutes: 15, xp: 30, label: 'Serious', desc: '15 min / day' },
    { minutes: 20, xp: 50, label: 'Intense', desc: '20 min / day' },
    { minutes: 30, xp: 75, label: 'Mastery', desc: '30 min / day' },
    { minutes: 60, xp: 100, label: 'Immersion', desc: '60 min / day' }
  ];

  const handleNextStep = () => {
    setError('');
    if (step === 1 && !preferredLang) {
      setError('Please select your preferred interface language.');
      return;
    }
    if (step === 2) {
      if (!targetLang) {
        setError('Please select the language you want to learn.');
        return;
      }
      if (preferredLang === targetLang) {
        setError('Your interface language and target learning language cannot be the same.');
        return;
      }
    }
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      handleCompleteOnboarding();
    }
  };

  const handleCompleteOnboarding = async () => {
    setSaving(true);
    setError('');
    try {
      const payload = {
        preferred_language_id: preferredLang,
        target_language_id: targetLang,
        prior_knowledge: priorKnowledge,
        learning_goal: learningGoal,
        daily_minutes_goal: dailyMinutes,
        daily_xp_goal: dailyXp
      };
      const res = await api.put('/learners/me', payload);
      setUser(res.data);
      // Seamlessly transition directly to the Initial Assessment!
      navigate('/initial-exam');
    } catch (err) {
      console.error('Failed to save onboarding settings:', err);
      setError('Failed to save your preferences. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <div style={{ fontSize: '1.25rem', color: 'var(--text-muted)' }}>Loading NeoLearner setup...</div>
      </div>
    );
  }

  const selectedTargetLangObj = languages.find(l => l.id === targetLang);

  return (
    <div style={{ maxWidth: '780px', margin: '2rem auto', padding: '0 1rem' }}>
      
      {/* Progress Stepper */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--primary-color)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Step {step} of {totalSteps}
          </span>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {step === 1 && 'Interface Language'}
            {step === 2 && 'Learning Target'}
            {step === 3 && 'Prior Knowledge'}
            {step === 4 && 'Learning Goal'}
            {step === 5 && 'Daily Commitment'}
          </span>
        </div>
        <div style={{ width: '100%', height: '8px', background: 'var(--border-color)', borderRadius: '9999px', overflow: 'hidden' }}>
          <div 
            style={{ 
              width: `${(step / totalSteps) * 100}%`, 
              height: '100%', 
              background: 'linear-gradient(90deg, var(--primary-color), #3b82f6)', 
              borderRadius: '9999px',
              transition: 'width 0.3s ease-in-out' 
            }} 
          />
        </div>
      </div>

      <div className="auth-card" style={{ padding: '2.5rem' }}>
        
        {error && (
          <div className="form-error" style={{ marginBottom: '1.5rem', padding: '1rem', borderRadius: '12px' }}>
            {error}
          </div>
        )}

        {/* STEP 1: INTERFACE LANGUAGE */}
        {step === 1 && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ 
                display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '0.4rem 1rem', 
                borderRadius: '9999px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', 
                fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.75rem' 
              }}>
                <Globe size={16} /> UI & Instructions
              </div>
              <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.5rem', color: 'var(--text-main)' }}>
                What language should NeoLearner use?
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                This controls all buttons, explanations, hints, and navigation menus.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              {languages.map(lang => {
                const isSelected = preferredLang === lang.id;
                return (
                  <div
                    key={lang.id}
                    onClick={() => setPreferredLang(lang.id)}
                    style={{
                      padding: '1.25rem',
                      borderRadius: '16px',
                      border: isSelected ? '2.5px solid var(--primary-color)' : '2px solid var(--border-color)',
                      background: isSelected ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-card)',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '1.05rem', color: isSelected ? 'var(--primary-color)' : 'var(--text-main)' }}>
                        {lang.name}
                      </div>
                      {lang.native_name && (
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {lang.native_name}
                        </div>
                      )}
                    </div>
                    {isSelected && <Check size={20} color="var(--primary-color)" style={{ strokeWidth: 3 }} />}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 2: LEARNING / TARGET LANGUAGE */}
        {step === 2 && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ 
                display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '0.4rem 1rem', 
                borderRadius: '9999px', background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', 
                fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.75rem' 
              }}>
                <BookOpen size={16} /> Target Language
              </div>
              <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.5rem', color: 'var(--text-main)' }}>
                What language do you want to learn?
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                All course modules, listening tests, speaking lab, and reading drills will evaluate this language.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              {languages.map(lang => {
                const isSelected = targetLang === lang.id;
                const isSameAsPref = preferredLang === lang.id;
                return (
                  <div
                    key={lang.id}
                    onClick={() => {
                      if (!isSameAsPref) setTargetLang(lang.id);
                    }}
                    style={{
                      padding: '1.25rem',
                      borderRadius: '16px',
                      border: isSelected ? '2.5px solid #3b82f6' : '2px solid var(--border-color)',
                      background: isSelected ? 'rgba(59, 130, 246, 0.08)' : (isSameAsPref ? 'rgba(0,0,0,0.02)' : 'var(--bg-card)'),
                      opacity: isSameAsPref ? 0.45 : 1,
                      cursor: isSameAsPref ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '1.05rem', color: isSelected ? '#3b82f6' : 'var(--text-main)' }}>
                        {lang.name}
                      </div>
                      {lang.native_name && (
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {lang.native_name}
                        </div>
                      )}
                      {isSameAsPref && (
                        <span style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: '600' }}>
                          (Current Interface)
                        </span>
                      )}
                    </div>
                    {isSelected && <Check size={20} color="#3b82f6" style={{ strokeWidth: 3 }} />}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 3: PRIOR KNOWLEDGE */}
        {step === 3 && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ 
                display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '0.4rem 1rem', 
                borderRadius: '9999px', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', 
                fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.75rem' 
              }}>
                <Award size={16} /> Prior Experience
              </div>
              <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.5rem', color: 'var(--text-main)' }}>
                How much {selectedTargetLangObj?.name || 'this language'} do you already know?
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                This initializes your placement diagnostic so questions calibrate quickly to your level.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '2rem' }}>
              {knowledgeLevels.map(lvl => {
                const isSelected = priorKnowledge === lvl.id;
                return (
                  <div
                    key={lvl.id}
                    onClick={() => setPriorKnowledge(lvl.id)}
                    style={{
                      padding: '1.15rem 1.5rem',
                      borderRadius: '16px',
                      border: isSelected ? '2.5px solid var(--primary-color)' : '2px solid var(--border-color)',
                      background: isSelected ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-card)',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '1rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span style={{ fontSize: '1.5rem' }}>{lvl.icon}</span>
                      <div>
                        <div style={{ fontWeight: '700', fontSize: '1.05rem', color: isSelected ? 'var(--primary-color)' : 'var(--text-main)' }}>
                          {lvl.title}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {lvl.desc}
                        </div>
                      </div>
                    </div>
                    <span style={{ 
                      fontSize: '0.8rem', fontWeight: '800', background: isSelected ? 'var(--primary-color)' : 'var(--border-color)',
                      color: isSelected ? '#ffffff' : 'var(--text-muted)', padding: '4px 10px', borderRadius: '9999px' 
                    }}>
                      {lvl.badge}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 4: LEARNING GOAL */}
        {step === 4 && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ 
                display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '0.4rem 1rem', 
                borderRadius: '9999px', background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6', 
                fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.75rem' 
              }}>
                <Target size={16} /> Motivation
              </div>
              <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.5rem', color: 'var(--text-main)' }}>
                Why are you learning {selectedTargetLangObj?.name || 'this language'}?
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                We customize course recommendations and conversation scenarios around your specific goal.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              {goalsList.map(g => {
                const isSelected = learningGoal === g.id;
                const IconComponent = g.icon;
                return (
                  <div
                    key={g.id}
                    onClick={() => setLearningGoal(g.id)}
                    style={{
                      padding: '1.25rem',
                      borderRadius: '16px',
                      border: isSelected ? `2.5px solid ${g.color}` : '2px solid var(--border-color)',
                      background: isSelected ? `${g.color}15` : 'var(--bg-card)',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '1rem'
                    }}
                  >
                    <div style={{ 
                      padding: '10px', borderRadius: '12px', background: `${g.color}20`, color: g.color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center' 
                    }}>
                      <IconComponent size={24} />
                    </div>
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '1.05rem', color: isSelected ? g.color : 'var(--text-main)' }}>
                        {g.title}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px', lineHeight: '1.35' }}>
                        {g.desc}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 5: DAILY COMMITMENT */}
        {step === 5 && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ 
                display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '0.4rem 1rem', 
                borderRadius: '9999px', background: 'rgba(236, 72, 153, 0.15)', color: '#ec4899', 
                fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.75rem' 
              }}>
                <Clock size={16} /> Daily Target
              </div>
              <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.5rem', color: 'var(--text-main)' }}>
                Set your daily learning goal
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                Consistency is key to language mastery. You can change this anytime in settings.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              {commitmentPlans.map(p => {
                const isSelected = dailyMinutes === p.minutes;
                return (
                  <div
                    key={p.minutes}
                    onClick={() => {
                      setDailyMinutes(p.minutes);
                      setDailyXp(p.xp);
                    }}
                    style={{
                      padding: '1.25rem',
                      borderRadius: '16px',
                      border: isSelected ? '2.5px solid var(--primary-color)' : '2px solid var(--border-color)',
                      background: isSelected ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-card)',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ fontSize: '1.2rem', fontWeight: '800', color: isSelected ? 'var(--primary-color)' : 'var(--text-main)' }}>
                      {p.label}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '4px', fontWeight: '600' }}>
                      {p.desc}
                    </div>
                    <div style={{ 
                      display: 'inline-block', fontSize: '0.75rem', fontWeight: '700', 
                      background: isSelected ? 'var(--primary-color)' : 'var(--border-color)', 
                      color: isSelected ? '#ffffff' : 'var(--text-muted)',
                      padding: '3px 10px', borderRadius: '9999px', marginTop: '10px'
                    }}>
                      +{p.xp} XP / day
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Assessment Intro Notice */}
            <div style={{ 
              padding: '1.25rem', borderRadius: '16px', background: 'rgba(59, 130, 246, 0.08)', 
              border: '1px solid rgba(59, 130, 246, 0.25)', marginBottom: '1.5rem',
              display: 'flex', alignItems: 'center', gap: '1rem' 
            }}>
              <ShieldCheck size={28} color="#3b82f6" style={{ flexShrink: 0 }} />
              <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: '1.4' }}>
                <strong>Next: Multi-Skill Diagnostic Assessment</strong>
                <br />
                We will conduct a 15-question diagnostic across vocabulary, grammar, reading, listening, writing, and speaking to establish your CEFR level and generate your custom course.
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', gap: '1rem' }}>
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="btn btn-secondary"
              style={{ padding: '0.9rem 1.5rem', gap: '8px', fontSize: '1rem' }}
            >
              <ArrowLeft size={18} /> Back
            </button>
          ) : <div />}

          <button
            type="button"
            onClick={handleNextStep}
            disabled={saving}
            className="btn btn-primary"
            style={{ padding: '0.9rem 2.25rem', gap: '8px', fontSize: '1.05rem', fontWeight: '800' }}
          >
            {saving ? 'Saving...' : (step === totalSteps ? 'START INITIAL ASSESSMENT' : 'CONTINUE')}
            <ArrowRight size={18} />
          </button>
        </div>

      </div>
    </div>
  );
};

export default Onboarding;
