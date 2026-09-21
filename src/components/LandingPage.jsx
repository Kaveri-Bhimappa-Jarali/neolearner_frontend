import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { 
  BookOpen, Sparkles, ArrowRight, Globe, CheckCircle, Award, 
  Brain, ShieldCheck, Flame, Gem, Heart, Volume2, Mic, Compass, 
  Layers, RefreshCw, Layers3, Activity, BarChart3, Users, Zap, ExternalLink
} from 'lucide-react';

const LandingPage = () => {
  const { user } = useAuth();
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('overview');

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const res = await api.get('/insights');
      setInsights(res.data);
    } catch (err) {
      console.error('Failed to load project insights:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1250px', margin: '0 auto', padding: '1.5rem 1rem' }}>
      
      {/* 1. HERO BANNER */}
      <div className="card" style={{
        padding: '3rem 2rem',
        borderRadius: '28px',
        marginBottom: '2.5rem',
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(59, 130, 246, 0.12), rgba(153, 102, 204, 0.12))',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        textAlign: 'center'
      }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '0.4rem 1.25rem',
          borderRadius: '9999px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)',
          color: '#10b981', fontSize: '0.85rem', fontWeight: '700', marginBottom: '1.5rem'
        }}>
          <Sparkles size={16} /> LINGUALEARN PLATFORM INSIGHTS & ARCHITECTURE
        </div>

        <h1 style={{ fontSize: '3rem', color: 'var(--text-main)', marginBottom: '1.25rem', fontWeight: '800', lineHeight: '1.15', letterSpacing: '-1px' }}>
          Intelligent Literacy & Language Assistance Platform <br />
          <span style={{ color: 'var(--primary-color)' }}>for Neo-Learners</span>
        </h1>

        <p style={{ fontSize: '1.15rem', color: 'var(--text-muted)', marginBottom: '2.5rem', lineHeight: '1.6', maxWidth: '820px', margin: '0 auto 2.5rem auto' }}>
          LinguaLearn combines foundational phonics, AI proficiency estimation, SuperMemo-2 spaced repetition (SRS), server-validated gamification, and multi-modal speech evaluation for Kannada, Telugu, Hindi, Marathi, and English.
        </p>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          {user ? (
            <Link to="/dashboard" className="btn btn-primary" style={{ padding: '0.85rem 2rem', fontSize: '1rem', fontWeight: 'bold', gap: '8px' }}>
              <Zap size={18} /> Enter Student Dashboard <ArrowRight size={18} />
            </Link>
          ) : (
            <>
              <Link to="/register" className="btn btn-primary" style={{ padding: '0.85rem 2rem', fontSize: '1rem', fontWeight: 'bold', gap: '8px' }}>
                <Sparkles size={18} /> Create Free Account <ArrowRight size={18} />
              </Link>
              <Link to="/courses" className="btn btn-secondary" style={{ padding: '0.85rem 1.75rem', fontSize: '1rem', fontWeight: 'bold' }}>
                Explore Courses
              </Link>
            </>
          )}

          <Link to="/admin" className="btn btn-secondary" style={{ padding: '0.85rem 1.75rem', fontSize: '1rem', fontWeight: 'bold', color: 'var(--accent-purple)', borderColor: 'var(--accent-purple)' }}>
            👑 Admin Portal & DB Explorer
          </Link>
        </div>
      </div>

      {/* 2. LIVE METRICS RIBBON */}
      {insights && (
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
          gap: '1rem', marginBottom: '3rem'
        }}>
          <div className="card" style={{ padding: '1.25rem', textAlign: 'center', borderRadius: '18px' }}>
            <Users size={24} color="var(--primary-color)" style={{ marginBottom: '6px' }} />
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--primary-color)' }}>{insights.stats.total_learners}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '700' }}>REGISTERED LEARNERS</div>
          </div>

          <div className="card" style={{ padding: '1.25rem', textAlign: 'center', borderRadius: '18px' }}>
            <Globe size={24} color="#3b82f6" style={{ marginBottom: '6px' }} />
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#3b82f6' }}>{insights.stats.supported_languages}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '700' }}>TARGET LANGUAGES</div>
          </div>

          <div className="card" style={{ padding: '1.25rem', textAlign: 'center', borderRadius: '18px' }}>
            <BookOpen size={24} color="#ff9600" style={{ marginBottom: '6px' }} />
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#ff9600' }}>{insights.stats.courses_count} / {insights.stats.lessons_count}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '700' }}>COURSES & LESSONS</div>
          </div>

          <div className="card" style={{ padding: '1.25rem', textAlign: 'center', borderRadius: '18px' }}>
            <CheckCircle size={24} color="#10b981" style={{ marginBottom: '6px' }} />
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#10b981' }}>{insights.stats.questions_count}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '700' }}>ASSESSMENT QUESTIONS</div>
          </div>

          <div className="card" style={{ padding: '1.25rem', textAlign: 'center', borderRadius: '18px' }}>
            <RefreshCw size={24} color="#ec4899" style={{ marginBottom: '6px' }} />
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#ec4899' }}>{insights.stats.vocabulary_words}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '700' }}>SRS VOCABULARY TERMS</div>
          </div>

          <div className="card" style={{ padding: '1.25rem', textAlign: 'center', borderRadius: '18px' }}>
            <Award size={24} color="var(--accent-purple)" style={{ marginBottom: '6px' }} />
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--accent-purple)' }}>{insights.stats.achievements_count}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '700' }}>BADGE DEFINITIONS</div>
          </div>
        </div>
      )}

      {/* 3. DEEP DIVE INSIGHT TABS */}
      <div style={{ marginBottom: '3rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
            Core Project Innovations & Engine Insights
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Explore the architectural pillars driving adaptive literacy learning in LinguaLearn.
          </p>
        </div>

        {/* Tab Buttons */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', justifyContent: 'center', marginBottom: '2rem', paddingBottom: '0.5rem' }}>
          {[
            { id: 'overview', label: 'Platform Overview', icon: <Sparkles size={16} /> },
            { id: 'ai_srs', label: 'AI & SRS Memory Engine', icon: <Brain size={16} /> },
            { id: 'gamification', label: 'Server Gamification', icon: <Flame size={16} /> },
            { id: 'speech', label: 'Phonics & Web Speech API', icon: <Mic size={16} /> },
            { id: 'stories', label: 'Stories & AI Roleplay', icon: <Compass size={16} /> },
            { id: 'architecture', label: 'Tech Stack & DB Architecture', icon: <Layers size={16} /> }
          ].map(tab => (
            <button
              key={tab.id}
              className={`btn ${activeSection === tab.id ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveSection(tab.id)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.65rem 1.25rem', whiteSpace: 'nowrap', borderRadius: '12px' }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* SECTION 1: OVERVIEW */}
        {activeSection === 'overview' && insights && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {insights.core_innovations.map((item, idx) => (
              <div key={idx} className="card" style={{ padding: '1.5rem', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span className="badge badge-purple">{item.badge}</span>
                  <Sparkles size={18} color="var(--primary-color)" />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '0.5rem', color: 'var(--text-main)' }}>{item.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5', margin: 0 }}>{item.description}</p>
              </div>
            ))}
          </div>
        )}

        {/* SECTION 2: AI & SRS */}
        {activeSection === 'ai_srs' && (
          <div className="card" style={{ padding: '2rem', borderRadius: '24px', border: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Brain color="var(--primary-color)" /> SuperMemo-2 (SM-2) Spaced Repetition & AI Proficiency Engine
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
              The platform tracks individual word competencies and predicts learner CEFR ratings (`A0`, `A1`, `A2`, `B1`, `B2`, `C1`) using real performance metrics across reading, listening, and speaking quizzes.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
              <div style={{ background: 'var(--background)', padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#10b981', marginBottom: '0.5rem' }}>SM-2 Interval Calculation</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                  Calculates <code>interval</code> (days), <code>ease_factor</code> (default 2.5), and <code>repetitions</code> for every vocabulary item based on review recall scores (0 to 5).
                </p>
              </div>

              <div style={{ background: 'var(--background)', padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#3b82f6', marginBottom: '0.5rem' }}>Automated Weak Area Detection</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                  Identifies specific weaknesses (e.g., Speaking, Grammar, Phonics) and queues mistake review cards to automatically refill learner hearts.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 3: GAMIFICATION */}
        {activeSection === 'gamification' && (
          <div className="card" style={{ padding: '2rem', borderRadius: '24px', border: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Flame color="#ff9600" /> Server-Side Validated Gamification & Social League Ladders
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
              According to development rule #2, all XP rewards, streaks, gem transactions, and heart recharges are computed server-side in <code>backend/gamification.py</code> to prevent client tampering.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', textAlign: 'center' }}>
              <div style={{ background: 'var(--background)', padding: '1rem', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                <Flame size={28} color="#ff9600" />
                <h4 style={{ fontSize: '1rem', fontWeight: '800', margin: '6px 0 4px' }}>Daily Streaks & Freeze</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Streak shields & double-or-nothing wagers.</p>
              </div>
              <div style={{ background: 'var(--background)', padding: '1rem', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                <Heart size={28} color="#ff4b4b" />
                <h4 style={{ fontSize: '1rem', fontWeight: '800', margin: '6px 0 4px' }}>5-Heart Energy Bar</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Mistakes consume hearts; refill via practice.</p>
              </div>
              <div style={{ background: 'var(--background)', padding: '1rem', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                <Gem size={28} color="#1cb0f6" />
                <h4 style={{ fontSize: '1rem', fontWeight: '800', margin: '6px 0 4px' }}>Gems & Shop Rewards</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Earn gems on lesson pass to buy powerups.</p>
              </div>
              <div style={{ background: 'var(--background)', padding: '1rem', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                <Award size={28} color="#ffd700" />
                <h4 style={{ fontSize: '1rem', fontWeight: '800', margin: '6px 0 4px' }}>10 League Tiers</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Bronze to Diamond weekly leaderboard ranks.</p>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 4: SPEECH */}
        {activeSection === 'speech' && (
          <div className="card" style={{ padding: '2rem', borderRadius: '24px', border: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Volume2 color="#10b981" /> Web Speech API & Phonics Audio Engine
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
              Integrated <code>SpeechSynthesis</code> for native text-to-speech pronunciation playback and <code>SpeechRecognition</code> for voice input evaluation, with graceful silent fallback for unsupported browsers.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
              <div style={{ background: 'var(--background)', padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#10b981', marginBottom: '0.5rem' }}>Voice Pronunciation Evaluation</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                  Analyzes spoken audio against target phrases, computes accuracy and fluency scores, and highlights problematic phonemes.
                </p>
              </div>
              <div style={{ background: 'var(--background)', padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#3b82f6', marginBottom: '0.5rem' }}>Phonics & Regional Accents</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                  Supports speech synthesis in Kannada (`kn-IN`), Hindi (`hi-IN`), Telugu (`te-IN`), Marathi (`mr-IN`), and English (`en-US`).
                </p>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 5: STORIES */}
        {activeSection === 'stories' && (
          <div className="card" style={{ padding: '2rem', borderRadius: '24px', border: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Compass color="#6366f1" /> Interactive Immersion Stories & AI Roleplay Adventures
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
              Contextual narrative scenarios designed to practice conversational comprehension in real-world contexts like market shopping, ordering food, or asking directions.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
              <div style={{ background: 'var(--background)', padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#6366f1', marginBottom: '0.5rem' }}>Branching Stories</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                  Interactive scene-by-scene choices with real-time feedback and XP completion rewards.
                </p>
              </div>
              <div style={{ background: 'var(--background)', padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#ec4899', marginBottom: '0.5rem' }}>Text Adventures</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                  Scenario-driven conversation simulator guided by structured LLM system prompts and starting context messages.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 6: ARCHITECTURE & STACK */}
        {activeSection === 'architecture' && (
          <div className="card" style={{ padding: '2rem', borderRadius: '24px', border: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Layers color="var(--primary-color)" /> Technology Stack & Architectural Specifications
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
              <div style={{ background: 'var(--background)', padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#3b82f6', marginBottom: '0.5rem' }}>Frontend Architecture</h4>
                <ul style={{ fontSize: '0.85rem', color: 'var(--text-muted)', paddingLeft: '1.2rem', margin: 0, lineHeight: '1.6' }}>
                  <li>React (Vite SPA bundler)</li>
                  <li>CSS Variables & Utility Classes</li>
                  <li>Lucide Icons library</li>
                  <li>Controlled React Form State</li>
                  <li>Web Speech Recognition & Synthesis</li>
                </ul>
              </div>

              <div style={{ background: 'var(--background)', padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#10b981', marginBottom: '0.5rem' }}>Backend Architecture</h4>
                <ul style={{ fontSize: '0.85rem', color: 'var(--text-muted)', paddingLeft: '1.2rem', margin: 0, lineHeight: '1.6' }}>
                  <li>FastAPI (Python)</li>
                  <li>SQLAlchemy ORM Data Layer</li>
                  <li>SQLite Database (Absolute path resolution to <code>backend/literacy.db</code>)</li>
                  <li>OAuth2 Password Bearer & JWT Tokens</li>
                  <li>Pydantic v2 Schemas</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. SUPPORTED EXERCISE TYPES SHOWCASE */}
      {insights && insights.exercise_types && (
        <div style={{ marginBottom: '3.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '0.35rem' }}>
              7 Supported Interactive Exercise Engine Types
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Engineered for multi-modal literacy assessment and adaptive practice.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            {insights.exercise_types.map((ex) => (
              <div key={ex.type} className="card" style={{ padding: '1rem 1.25rem', borderRadius: '16px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CheckCircle size={20} color="var(--primary-color)" />
                <div>
                  <div style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--text-main)' }}>{ex.name}</div>
                  <code style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{ex.type}</code>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. CALL TO ACTION FOOTER */}
      <div className="card" style={{
        padding: '2.5rem', borderRadius: '24px', textAlign: 'center',
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.12), rgba(16, 185, 129, 0.12))',
        border: '1px solid var(--primary-color)'
      }}>
        <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.5rem', color: 'var(--text-main)' }}>
          Start Learning or Exploring the Platform Now
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '600px', margin: '0 auto 1.5rem auto' }}>
          Join NeoLearners today to master reading and vocabulary in regional languages.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/register" className="btn btn-primary" style={{ padding: '0.8rem 2rem', fontWeight: 'bold' }}>
            Create Free Account
          </Link>
          <Link to="/courses" className="btn btn-secondary" style={{ padding: '0.8rem 2rem', fontWeight: 'bold' }}>
            View Course Catalog
          </Link>
          <Link to="/db-explorer" className="btn btn-secondary" style={{ padding: '0.8rem 2rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Layers size={16} /> Database Inspector
          </Link>
        </div>
      </div>

    </div>
  );
};

export default LandingPage;
