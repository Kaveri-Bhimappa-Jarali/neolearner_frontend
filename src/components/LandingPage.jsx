import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { 
  BookOpen, Sparkles, ArrowRight, Globe, CheckCircle, Award, 
  Brain, Flame, Gem, Heart, Volume2, Mic, Compass, 
  RefreshCw, Users, Zap, MessageSquare, Headphones, RotateCcw
} from 'lucide-react';

const LandingPage = () => {
  const { user } = useAuth();
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('srs');

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
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.25rem' }}>
      
      {/* 1. HERO BANNER */}
      <div className="card" style={{
        padding: '3.5rem 2.5rem',
        borderRadius: '32px',
        marginBottom: '3rem',
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(59, 130, 246, 0.1) 50%, rgba(139, 92, 246, 0.1) 100%)',
        border: '1px solid rgba(16, 185, 129, 0.25)',
        textAlign: 'center',
        boxShadow: '0 12px 32px rgba(0, 0, 0, 0.04)'
      }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '0.45rem 1.4rem',
          borderRadius: '9999px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)',
          color: '#10b981', fontSize: '0.88rem', fontWeight: '800', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.5px'
        }}>
          <Sparkles size={16} /> Intelligent Language & Literacy Platform
        </div>

        <h1 style={{ 
          fontSize: '3.1rem', 
          color: 'var(--text-main)', 
          marginBottom: '1.25rem', 
          fontWeight: '900', 
          lineHeight: '1.18', 
          letterSpacing: '-0.8px' 
        }}>
          Master Reading, Phonics & Conversation <br />
          <span style={{ 
            background: 'linear-gradient(135deg, var(--primary-color), #3b82f6)', 
            WebkitBackgroundClip: 'text', 
            WebkitTextFillColor: 'transparent' 
          }}>
            In Regional Languages
          </span>
        </h1>

        <p style={{ 
          fontSize: '1.18rem', 
          color: 'var(--text-muted)', 
          marginBottom: '2.5rem', 
          lineHeight: '1.65', 
          maxWidth: '800px', 
          margin: '0 auto 2.5rem auto' 
        }}>
          Empowering neo-learners to build fluency in <strong>Kannada, Telugu, Hindi, Marathi, Spanish, and English</strong> through bite-sized gamified lessons, voice pronunciation practice, daily streaks, and smart memory review.
        </p>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '1.25rem', justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center' }}>
          {user ? (
            <Link to="/dashboard" className="btn btn-primary" style={{ padding: '0.9rem 2.25rem', fontSize: '1.05rem', fontWeight: '800', gap: '10px', borderRadius: '16px' }}>
              <Zap size={20} /> Go to Dashboard <ArrowRight size={20} />
            </Link>
          ) : (
            <>
              <Link to="/register" className="btn btn-primary" style={{ padding: '0.9rem 2.25rem', fontSize: '1.05rem', fontWeight: '800', gap: '10px', borderRadius: '16px' }}>
                <Sparkles size={20} /> Start Learning Free <ArrowRight size={20} />
              </Link>
              <Link to="/courses" className="btn btn-secondary" style={{ padding: '0.9rem 2rem', fontSize: '1.05rem', fontWeight: '800', borderRadius: '16px' }}>
                Explore Courses
              </Link>
            </>
          )}
        </div>
      </div>

      {/* 2. METRICS RIBBON */}
      {insights?.stats && (
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
          gap: '1.25rem', marginBottom: '3.5rem'
        }}>
          <div className="card" style={{ padding: '1.5rem 1rem', textAlign: 'center', borderRadius: '22px', border: '1px solid var(--border-color)' }}>
            <Users size={26} color="var(--primary-color)" style={{ marginBottom: '8px' }} />
            <div style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--primary-color)' }}>{insights.stats.total_learners ?? 0}</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Active Learners</div>
          </div>

          <div className="card" style={{ padding: '1.5rem 1rem', textAlign: 'center', borderRadius: '22px', border: '1px solid var(--border-color)' }}>
            <Globe size={26} color="#3b82f6" style={{ marginBottom: '8px' }} />
            <div style={{ fontSize: '2rem', fontWeight: '900', color: '#3b82f6' }}>{insights.stats.supported_languages ?? 0}</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Languages Offered</div>
          </div>

          <div className="card" style={{ padding: '1.5rem 1rem', textAlign: 'center', borderRadius: '22px', border: '1px solid var(--border-color)' }}>
            <BookOpen size={26} color="#ff9600" style={{ marginBottom: '8px' }} />
            <div style={{ fontSize: '2rem', fontWeight: '900', color: '#ff9600' }}>{insights.stats.courses_count ?? 0}</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Structured Courses</div>
          </div>

          <div className="card" style={{ padding: '1.5rem 1rem', textAlign: 'center', borderRadius: '22px', border: '1px solid var(--border-color)' }}>
            <CheckCircle size={26} color="#10b981" style={{ marginBottom: '8px' }} />
            <div style={{ fontSize: '2rem', fontWeight: '900', color: '#10b981' }}>{insights.stats.questions_count ?? 0}</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Practice Exercises</div>
          </div>

          <div className="card" style={{ padding: '1.5rem 1rem', textAlign: 'center', borderRadius: '22px', border: '1px solid var(--border-color)' }}>
            <RefreshCw size={26} color="#ec4899" style={{ marginBottom: '8px' }} />
            <div style={{ fontSize: '2rem', fontWeight: '900', color: '#ec4899' }}>{insights.stats.vocabulary_words ?? 0}</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Vocab Terms</div>
          </div>

          <div className="card" style={{ padding: '1.5rem 1rem', textAlign: 'center', borderRadius: '22px', border: '1px solid var(--border-color)' }}>
            <Award size={26} color="var(--accent-purple)" style={{ marginBottom: '8px' }} />
            <div style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--accent-purple)' }}>{insights.stats.achievements_count ?? 0}</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Badges to Earn</div>
          </div>
        </div>
      )}

      {/* 3. LEARNER FEATURE HIGHLIGHT TABS */}
      <div style={{ marginBottom: '4rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: '900', color: 'var(--text-main)', marginBottom: '0.6rem' }}>
            Why Learn With LinguaLearn?
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '640px', margin: '0 auto' }}>
            Designed specifically for quick, effective literacy building and long-term language retention.
          </p>
        </div>

        {/* Tab Buttons */}
        <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', justifyContent: 'center', marginBottom: '2.5rem', paddingBottom: '0.5rem' }}>
          {[
            { id: 'srs', label: 'Smart Memory (SRS)', icon: <Brain size={18} /> },
            { id: 'gamification', label: 'Fun Gamification', icon: <Flame size={18} /> },
            { id: 'speech', label: 'Voice & Phonics', icon: <Mic size={18} /> },
            { id: 'stories', label: 'Interactive Stories', icon: <Compass size={18} /> }
          ].map(tab => (
            <button
              key={tab.id}
              className={`btn ${activeSection === tab.id ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveSection(tab.id)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.75rem 1.5rem', whiteSpace: 'nowrap', borderRadius: '14px', fontWeight: '800' }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* SECTION 1: SRS */}
        {activeSection === 'srs' && (
          <div className="card" style={{ padding: '2.5rem', borderRadius: '28px', border: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '1.6rem', fontWeight: '900', marginBottom: '1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Brain color="var(--primary-color)" size={28} /> Spaced Repetition (SRS) & Adaptive Progress
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: '1.65', marginBottom: '2rem' }}>
              Never forget words you've learned. Our algorithm automatically tracks word recall scores and schedules review sessions right when you're about to forget them.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
              <div style={{ background: 'var(--background)', padding: '1.5rem', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
                <h4 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#10b981', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <RotateCcw size={18} /> Smart Review Schedule
                </h4>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: '1.55', margin: 0 }}>
                  Words you get right appear less frequently; words you struggle with are reviewed more often until mastered.
                </p>
              </div>

              <div style={{ background: 'var(--background)', padding: '1.5rem', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
                <h4 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#3b82f6', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={18} /> CEFR Level Placement
                </h4>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: '1.55', margin: 0 }}>
                  Start with a placement assessment to automatically jump to your exact proficiency level (Beginner A1 to Advanced C1).
                </p>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2: GAMIFICATION */}
        {activeSection === 'gamification' && (
          <div className="card" style={{ padding: '2.5rem', borderRadius: '28px', border: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '1.6rem', fontWeight: '900', marginBottom: '1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Flame color="#ff9600" size={28} /> Stay Motivated With Gamified Learning
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: '1.65', marginBottom: '2rem' }}>
              Turn daily learning into a fun habit with streaks, rewards, energy hearts, and friendly weekly leaderboards.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
              <div style={{ background: 'var(--background)', padding: '1.5rem 1rem', borderRadius: '20px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                <Flame size={32} color="#ff9600" style={{ marginBottom: '8px' }} />
                <h4 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '6px', color: 'var(--text-main)' }}>Daily Streaks</h4>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: 0, lineHeight: '1.4' }}>Build daily habits and protect your streak with shields.</p>
              </div>

              <div style={{ background: 'var(--background)', padding: '1.5rem 1rem', borderRadius: '20px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                <Heart size={32} color="#ff4b4b" style={{ marginBottom: '8px' }} />
                <h4 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '6px', color: 'var(--text-main)' }}>5-Heart Energy</h4>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: 0, lineHeight: '1.4' }}>Practice carefully; complete review sessions to refill hearts.</p>
              </div>

              <div style={{ background: 'var(--background)', padding: '1.5rem 1rem', borderRadius: '20px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                <Gem size={32} color="#1cb0f6" style={{ marginBottom: '8px' }} />
                <h4 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '6px', color: 'var(--text-main)' }}>Gems & Shop</h4>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: 0, lineHeight: '1.4' }}>Earn gems when completing lessons and unlock fun items.</p>
              </div>

              <div style={{ background: 'var(--background)', padding: '1.5rem 1rem', borderRadius: '20px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                <Award size={32} color="#ffd700" style={{ marginBottom: '8px' }} />
                <h4 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '6px', color: 'var(--text-main)' }}>League Ladders</h4>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: 0, lineHeight: '1.4' }}>Climb from Bronze to Diamond league ranks weekly.</p>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 3: SPEECH */}
        {activeSection === 'speech' && (
          <div className="card" style={{ padding: '2.5rem', borderRadius: '28px', border: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '1.6rem', fontWeight: '900', marginBottom: '1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Volume2 color="#10b981" size={28} /> Native Voice & Pronunciation Practice
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: '1.65', marginBottom: '2rem' }}>
              Hear native pronunciation for every word and sentence, and use your microphone to get instant feedback on your spoken speech fluency.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
              <div style={{ background: 'var(--background)', padding: '1.5rem', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
                <h4 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#10b981', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Mic size={18} /> Real-Time Voice Feedback
                </h4>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: '1.55', margin: 0 }}>
                  Speak directly into your device to receive instant accuracy scores and pronunciation guidance.
                </p>
              </div>

              <div style={{ background: 'var(--background)', padding: '1.5rem', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
                <h4 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#3b82f6', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Headphones size={18} /> Clear Audio Audio Playback
                </h4>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: '1.55', margin: 0 }}>
                  Listen to native audio at normal or slow speed to perfect your listening comprehension.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 4: STORIES */}
        {activeSection === 'stories' && (
          <div className="card" style={{ padding: '2.5rem', borderRadius: '28px', border: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '1.6rem', fontWeight: '900', marginBottom: '1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Compass color="#6366f1" size={28} /> Interactive Stories & Real-World Scenarios
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: '1.65', marginBottom: '2rem' }}>
              Practice conversational skills in realistic scenarios like ordering food, shopping at local markets, or making new friends.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
              <div style={{ background: 'var(--background)', padding: '1.5rem', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
                <h4 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#6366f1', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MessageSquare size={18} /> Branching Storylines
                </h4>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: '1.55', margin: 0 }}>
                  Make choices during stories to see how conversations unfold in natural regional dialects.
                </p>
              </div>

              <div style={{ background: 'var(--background)', padding: '1.5rem', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
                <h4 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#ec4899', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Compass size={18} /> Roleplay Adventures
                </h4>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: '1.55', margin: 0 }}>
                  Engage in interactive text-based adventure games that make practicing grammar effortless.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. 7 EXERCISE TYPES SHOWCASE */}
      <div style={{ marginBottom: '4rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
            7 Interactive Exercise Types
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>
            Varied quiz modes keep learning engaging, multi-sensory, and effective.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
          {[
            { title: 'Multiple Choice Quiz', desc: 'Select correct meanings and translations', icon: '🎯', color: '#10b981' },
            { title: 'Voice Pronunciation', desc: 'Speak into mic with real-time feedback', icon: '🗣️', color: '#3b82f6' },
            { title: 'Audio Listening Practice', desc: 'Listen to spoken words and identify sounds', icon: '🎧', color: '#ff9600' },
            { title: 'Word Order Unscramble', desc: 'Arrange words to form proper sentences', icon: '🧩', color: '#8b5cf6' },
            { title: 'Fill in the Blanks', desc: 'Complete missing words in vocabulary cards', icon: '✍️', color: '#ec4899' },
            { title: 'Matching Pairs', desc: 'Match regional words with their meanings', icon: '🔄', color: '#06b6d4' },
            { title: 'Sentence Translation', desc: 'Translate sentences between target languages', icon: '🌐', color: '#f59e0b' }
          ].map((ex, idx) => (
            <div key={idx} className="card" style={{ padding: '1.5rem', borderRadius: '22px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
              <div style={{ fontSize: '2rem', lineHeight: 1 }}>{ex.icon}</div>
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '4px' }}>{ex.title}</div>
                <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>{ex.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. CALL TO ACTION FOOTER */}
      <div className="card" style={{
        padding: '3.5rem 2rem', 
        borderRadius: '32px', 
        textAlign: 'center',
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(16, 185, 129, 0.12) 100%)',
        border: '1px solid var(--primary-color)',
        boxShadow: '0 12px 32px rgba(0, 0, 0, 0.04)'
      }}>
        <h2 style={{ fontSize: '2.4rem', fontWeight: '900', marginBottom: '0.75rem', color: 'var(--text-main)' }}>
          Ready to Start Your Language Journey?
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '620px', margin: '0 auto 2rem auto', lineHeight: '1.6' }}>
          Join thousands of learners building reading, phonics, and vocabulary skills today.
        </p>
        <div style={{ display: 'flex', gap: '1.25rem', justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center' }}>
          {user ? (
            <Link to="/dashboard" className="btn btn-primary" style={{ padding: '0.9rem 2.25rem', fontWeight: '800', fontSize: '1.05rem', borderRadius: '16px' }}>
              Go to Dashboard
            </Link>
          ) : (
            <Link to="/register" className="btn btn-primary" style={{ padding: '0.9rem 2.25rem', fontWeight: '800', fontSize: '1.05rem', borderRadius: '16px' }}>
              Create Free Account
            </Link>
          )}
          <Link to="/courses" className="btn btn-secondary" style={{ padding: '0.9rem 2.25rem', fontWeight: '800', fontSize: '1.05rem', borderRadius: '16px' }}>
            Browse Course Catalog
          </Link>
        </div>
      </div>

    </div>
  );
};

export default LandingPage;
