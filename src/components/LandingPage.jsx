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
    <div className="insights-container">
      
      {/* 1. HERO BANNER */}
      <div className="card insights-hero-card">
        <div className="insights-hero-badge">
          <Sparkles size={16} /> Intelligent Language & Literacy Platform
        </div>

        <h1 className="insights-hero-title">
          Master Reading, Phonics & Conversation <br className="desktop-br" />
          <span style={{ 
            background: 'linear-gradient(135deg, var(--primary-color), #3b82f6)', 
            WebkitBackgroundClip: 'text', 
            WebkitTextFillColor: 'transparent' 
          }}>
            In Regional Languages
          </span>
        </h1>

        <p className="insights-hero-desc">
          Empowering neo-learners to build fluency in <strong>Kannada, Telugu, Hindi, Marathi, Spanish, and English</strong> through bite-sized gamified lessons, voice pronunciation practice, daily streaks, and smart memory review.
        </p>

        {/* Action Buttons */}
        <div className="insights-action-flex">
          {user ? (
            <Link to="/dashboard" className="btn btn-primary">
              <Zap size={20} /> Go to Dashboard <ArrowRight size={20} />
            </Link>
          ) : (
            <>
              <Link to="/register" className="btn btn-primary">
                <Sparkles size={20} /> Start Learning Free <ArrowRight size={20} />
              </Link>
              <Link to="/courses" className="btn btn-secondary">
                Explore Courses
              </Link>
            </>
          )}
        </div>
      </div>

      {/* 2. METRICS RIBBON */}
      {insights?.stats && (
        <div className="insights-metrics-grid">
          <div className="card" style={{ padding: '1.25rem 0.5rem', textAlign: 'center', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
            <Users size={24} color="var(--primary-color)" style={{ marginBottom: '6px' }} />
            <div style={{ fontSize: '1.75rem', fontWeight: '900', color: 'var(--primary-color)' }}>{insights.stats.total_learners ?? 0}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Active Learners</div>
          </div>

          <div className="card" style={{ padding: '1.25rem 0.5rem', textAlign: 'center', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
            <Globe size={24} color="#3b82f6" style={{ marginBottom: '6px' }} />
            <div style={{ fontSize: '1.75rem', fontWeight: '900', color: '#3b82f6' }}>{insights.stats.supported_languages ?? 0}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Languages Offered</div>
          </div>

          <div className="card" style={{ padding: '1.25rem 0.5rem', textAlign: 'center', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
            <BookOpen size={24} color="#ff9600" style={{ marginBottom: '6px' }} />
            <div style={{ fontSize: '1.75rem', fontWeight: '900', color: '#ff9600' }}>{insights.stats.courses_count ?? 0}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Structured Courses</div>
          </div>

          <div className="card" style={{ padding: '1.25rem 0.5rem', textAlign: 'center', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
            <CheckCircle size={24} color="#10b981" style={{ marginBottom: '6px' }} />
            <div style={{ fontSize: '1.75rem', fontWeight: '900', color: '#10b981' }}>{insights.stats.questions_count ?? 0}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Practice Exercises</div>
          </div>

          <div className="card" style={{ padding: '1.25rem 0.5rem', textAlign: 'center', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
            <RefreshCw size={24} color="#ec4899" style={{ marginBottom: '6px' }} />
            <div style={{ fontSize: '1.75rem', fontWeight: '900', color: '#ec4899' }}>{insights.stats.vocabulary_words ?? 0}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Vocab Terms</div>
          </div>

          <div className="card" style={{ padding: '1.25rem 0.5rem', textAlign: 'center', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
            <Award size={24} color="var(--accent-purple)" style={{ marginBottom: '6px' }} />
            <div style={{ fontSize: '1.75rem', fontWeight: '900', color: 'var(--accent-purple)' }}>{insights.stats.achievements_count ?? 0}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Badges to Earn</div>
          </div>
        </div>
      )}

      {/* 3. LEARNER FEATURE HIGHLIGHT TABS */}
      <div style={{ marginBottom: '3.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
            Why Learn With LinguaLearn?
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '640px', margin: '0 auto' }}>
            Designed specifically for quick, effective literacy building and long-term language retention.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="insights-tabs-bar">
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
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* SECTION 1: SRS */}
        {activeSection === 'srs' && (
          <div className="card insights-feature-card">
            <h3 className="insights-feature-title">
              <Brain color="var(--primary-color)" size={26} /> Spaced Repetition (SRS) & Adaptive Progress
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: '1.6', marginBottom: '1.75rem' }}>
              Never forget words you've learned. Our algorithm automatically tracks word recall scores and schedules review sessions right when you're about to forget them.
            </p>

            <div className="insights-subgrid-2">
              <div style={{ background: 'var(--background)', padding: '1.25rem', borderRadius: '18px', border: '1px solid var(--border-color)' }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#10b981', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <RotateCcw size={18} /> Smart Review Schedule
                </h4>
                <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: '1.5', margin: 0 }}>
                  Words you get right appear less frequently; words you struggle with are reviewed more often until mastered.
                </p>
              </div>

              <div style={{ background: 'var(--background)', padding: '1.25rem', borderRadius: '18px', border: '1px solid var(--border-color)' }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#3b82f6', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={18} /> CEFR Level Placement
                </h4>
                <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: '1.5', margin: 0 }}>
                  Start with a placement assessment to automatically jump to your exact proficiency level (Beginner A1 to Advanced C1).
                </p>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2: GAMIFICATION */}
        {activeSection === 'gamification' && (
          <div className="card insights-feature-card">
            <h3 className="insights-feature-title">
              <Flame color="#ff9600" size={26} /> Stay Motivated With Gamified Learning
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: '1.6', marginBottom: '1.75rem' }}>
              Turn daily learning into a fun habit with streaks, rewards, energy hearts, and friendly weekly leaderboards.
            </p>

            <div className="insights-subgrid-4">
              <div style={{ background: 'var(--background)', padding: '1.25rem 0.75rem', borderRadius: '18px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                <Flame size={28} color="#ff9600" style={{ marginBottom: '6px' }} />
                <h4 style={{ fontSize: '1.05rem', fontWeight: '800', marginBottom: '4px', color: 'var(--text-main)' }}>Daily Streaks</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, lineHeight: '1.4' }}>Build daily habits and protect your streak with shields.</p>
              </div>

              <div style={{ background: 'var(--background)', padding: '1.25rem 0.75rem', borderRadius: '18px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                <Heart size={28} color="#ff4b4b" style={{ marginBottom: '6px' }} />
                <h4 style={{ fontSize: '1.05rem', fontWeight: '800', marginBottom: '4px', color: 'var(--text-main)' }}>5-Heart Energy</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, lineHeight: '1.4' }}>Practice carefully; complete review sessions to refill hearts.</p>
              </div>

              <div style={{ background: 'var(--background)', padding: '1.25rem 0.75rem', borderRadius: '18px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                <Gem size={28} color="#1cb0f6" style={{ marginBottom: '6px' }} />
                <h4 style={{ fontSize: '1.05rem', fontWeight: '800', marginBottom: '4px', color: 'var(--text-main)' }}>Gems & Shop</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, lineHeight: '1.4' }}>Earn gems when completing lessons and unlock fun items.</p>
              </div>

              <div style={{ background: 'var(--background)', padding: '1.25rem 0.75rem', borderRadius: '18px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                <Award size={28} color="#ffd700" style={{ marginBottom: '6px' }} />
                <h4 style={{ fontSize: '1.05rem', fontWeight: '800', marginBottom: '4px', color: 'var(--text-main)' }}>League Ladders</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, lineHeight: '1.4' }}>Climb from Bronze to Diamond league ranks weekly.</p>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 3: SPEECH */}
        {activeSection === 'speech' && (
          <div className="card insights-feature-card">
            <h3 className="insights-feature-title">
              <Volume2 color="#10b981" size={26} /> Native Voice & Pronunciation Practice
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: '1.6', marginBottom: '1.75rem' }}>
              Hear native pronunciation for every word and sentence, and use your microphone to get instant feedback on your spoken speech fluency.
            </p>

            <div className="insights-subgrid-2">
              <div style={{ background: 'var(--background)', padding: '1.25rem', borderRadius: '18px', border: '1px solid var(--border-color)' }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#10b981', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Mic size={18} /> Real-Time Voice Feedback
                </h4>
                <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: '1.5', margin: 0 }}>
                  Speak directly into your device to receive instant accuracy scores and pronunciation guidance.
                </p>
              </div>

              <div style={{ background: 'var(--background)', padding: '1.25rem', borderRadius: '18px', border: '1px solid var(--border-color)' }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#3b82f6', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Headphones size={18} /> Clear Audio Playback
                </h4>
                <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: '1.5', margin: 0 }}>
                  Listen to native audio at normal or slow speed to perfect your listening comprehension.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 4: STORIES */}
        {activeSection === 'stories' && (
          <div className="card insights-feature-card">
            <h3 className="insights-feature-title">
              <Compass color="#6366f1" size={26} /> Interactive Stories & Real-World Scenarios
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: '1.6', marginBottom: '1.75rem' }}>
              Practice conversational skills in realistic scenarios like ordering food, shopping at local markets, or making new friends.
            </p>

            <div className="insights-subgrid-2">
              <div style={{ background: 'var(--background)', padding: '1.25rem', borderRadius: '18px', border: '1px solid var(--border-color)' }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#6366f1', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MessageSquare size={18} /> Branching Storylines
                </h4>
                <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: '1.5', margin: 0 }}>
                  Make choices during stories to see how conversations unfold in natural regional dialects.
                </p>
              </div>

              <div style={{ background: 'var(--background)', padding: '1.25rem', borderRadius: '18px', border: '1px solid var(--border-color)' }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#ec4899', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Compass size={18} /> Roleplay Adventures
                </h4>
                <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: '1.5', margin: 0 }}>
                  Engage in interactive text-based adventure games that make practicing grammar effortless.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. 7 EXERCISE TYPES SHOWCASE */}
      <div style={{ marginBottom: '3.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
            7 Interactive Exercise Types
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
            Varied quiz modes keep learning engaging, multi-sensory, and effective.
          </p>
        </div>

        <div className="insights-exercise-grid">
          {[
            { title: 'Multiple Choice Quiz', desc: 'Select correct meanings and translations', icon: '🎯' },
            { title: 'Voice Pronunciation', desc: 'Speak into mic with real-time feedback', icon: '🗣️' },
            { title: 'Audio Listening Practice', desc: 'Listen to spoken words and identify sounds', icon: '🎧' },
            { title: 'Word Order Unscramble', desc: 'Arrange words to form proper sentences', icon: '🧩' },
            { title: 'Fill in the Blanks', desc: 'Complete missing words in vocabulary cards', icon: '✍️' },
            { title: 'Matching Pairs', desc: 'Match regional words with their meanings', icon: '🔄' },
            { title: 'Sentence Translation', desc: 'Translate sentences between target languages', icon: '🌐' }
          ].map((ex, idx) => (
            <div key={idx} className="card" style={{ padding: '1.25rem', borderRadius: '18px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{ fontSize: '1.8rem', lineHeight: 1 }}>{ex.icon}</div>
              <div>
                <div style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '4px' }}>{ex.title}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>{ex.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. CALL TO ACTION FOOTER */}
      <div className="card insights-cta-card">
        <h2 className="insights-cta-title">
          Ready to Start Your Language Journey?
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '620px', margin: '0 auto 1.75rem auto', lineHeight: '1.6' }}>
          Join thousands of learners building reading, phonics, and vocabulary skills today.
        </p>
        <div className="insights-action-flex">
          {user ? (
            <Link to="/dashboard" className="btn btn-primary">
              Go to Dashboard
            </Link>
          ) : (
            <Link to="/register" className="btn btn-primary">
              Create Free Account
            </Link>
          )}
          <Link to="/courses" className="btn btn-secondary">
            Browse Course Catalog
          </Link>
        </div>
      </div>

    </div>
  );
};

export default LandingPage;
