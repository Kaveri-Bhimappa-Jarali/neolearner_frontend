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
      <section className="insights-hero-card">
        <div className="insights-hero-badge">
          <Sparkles size={14} /> <span>INTELLIGENT LITERACY PLATFORM</span>
        </div>

        <h1 className="insights-hero-title">
          Master Reading, Phonics & Conversation <br className="desktop-br" />
          <span style={{ background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
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
              <Zap size={18} /> Go to Learner Dashboard <ArrowRight size={18} />
            </Link>
          ) : (
            <>
              <Link to="/register" className="btn btn-primary">
                <Sparkles size={18} /> Start Learning Free <ArrowRight size={18} />
              </Link>
              <Link to="/courses" className="btn btn-outline">
                Explore Course Catalog
              </Link>
            </>
          )}
        </div>
      </section>

      {/* 2. LIVE METRICS RIBBON */}
      {insights?.stats && (
        <section style={{ marginBottom: '3rem' }}>
          <div className="insights-metrics-grid">
            
            <div className="card text-center" style={{ padding: '1.25rem 0.75rem' }}>
              <div className="metric-icon-wrapper" style={{ margin: '0 auto 0.5rem auto', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 44, height: 44, borderRadius: '50%', background: 'rgba(16, 185, 129, 0.12)', color: 'var(--primary-color)' }}>
                <Users size={22} />
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--primary-color)' }}>{insights.stats.total_learners ?? 0}</div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)' }}>Active Learners</div>
            </div>

            <div className="card text-center" style={{ padding: '1.25rem 0.75rem' }}>
              <div className="metric-icon-wrapper" style={{ margin: '0 auto 0.5rem auto', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 44, height: 44, borderRadius: '50%', background: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6' }}>
                <Globe size={22} />
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#3b82f6' }}>{insights.stats.supported_languages ?? 0}</div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)' }}>Languages Offered</div>
            </div>

            <div className="card text-center" style={{ padding: '1.25rem 0.75rem' }}>
              <div className="metric-icon-wrapper" style={{ margin: '0 auto 0.5rem auto', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 44, height: 44, borderRadius: '50%', background: 'rgba(255, 150, 0, 0.12)', color: '#ff9600' }}>
                <BookOpen size={22} />
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#ff9600' }}>{insights.stats.courses_count ?? 0}</div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)' }}>Structured Courses</div>
            </div>

            <div className="card text-center" style={{ padding: '1.25rem 0.75rem' }}>
              <div className="metric-icon-wrapper" style={{ margin: '0 auto 0.5rem auto', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 44, height: 44, borderRadius: '50%', background: 'rgba(16, 185, 129, 0.12)', color: '#10b981' }}>
                <CheckCircle size={22} />
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#10b981' }}>{insights.stats.questions_count ?? 0}</div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)' }}>Practice Drills</div>
            </div>

            <div className="card text-center" style={{ padding: '1.25rem 0.75rem' }}>
              <div className="metric-icon-wrapper" style={{ margin: '0 auto 0.5rem auto', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 44, height: 44, borderRadius: '50%', background: 'rgba(236, 72, 153, 0.12)', color: '#ec4899' }}>
                <RefreshCw size={22} />
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#ec4899' }}>{insights.stats.vocabulary_words ?? 0}</div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)' }}>Vocab Cards</div>
            </div>

            <div className="card text-center" style={{ padding: '1.25rem 0.75rem' }}>
              <div className="metric-icon-wrapper" style={{ margin: '0 auto 0.5rem auto', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 44, height: 44, borderRadius: '50%', background: 'rgba(139, 92, 246, 0.12)', color: 'var(--accent-purple)' }}>
                <Award size={22} />
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--accent-purple)' }}>{insights.stats.achievements_count ?? 0}</div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)' }}>Badges & Rewards</div>
            </div>

          </div>
        </section>
      )}

      {/* 3. FEATURE SHOWCASE TABS */}
      <section style={{ marginBottom: '3.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <h2 style={{ fontSize: 'clamp(1.3rem, 3.5vw, 2.1rem)', fontWeight: 900, marginBottom: '0.5rem', color: 'var(--text-main)' }}>
            Why Learn With LinguaLearn?
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Designed specifically for quick, effective literacy building and long-term memory retention.
          </p>
        </div>

        {/* Responsive Tab Bar */}
        <div className="insights-tabs-bar">
          {[
            { id: 'srs', label: 'Smart Memory (SRS)', icon: <Brain size={18} /> },
            { id: 'gamification', label: 'Fun Gamification', icon: <Flame size={18} /> },
            { id: 'speech', label: 'Voice & Phonics', icon: <Mic size={18} /> },
            { id: 'stories', label: 'Interactive Stories', icon: <Compass size={18} /> }
          ].map(tab => (
            <button
              key={tab.id}
              className={`btn ${activeSection === tab.id ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveSection(tab.id)}
            >
              {tab.icon} <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content Display */}
        <div className="insights-feature-card">
          {activeSection === 'srs' && (
            <div>
              <h3 className="insights-feature-title">
                <Brain color="var(--primary-color)" size={26} /> Spaced Repetition (SRS) & Adaptive Progress
              </h3>
              <p className="insights-hero-desc" style={{ textAlign: 'left', margin: '0 0 1.5rem 0' }}>
                Never forget words you've learned. Our SM-2 algorithm automatically tracks recall confidence scores and schedules review sessions right when you need them.
              </p>
              <div className="insights-subgrid-2">
                <div className="card" style={{ padding: '1.25rem' }}>
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, margin: '0 0 0.5rem 0', color: 'var(--text-main)' }}>
                    <RotateCcw size={18} color="#10b981" /> Smart Review Schedule
                  </h4>
                  <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.5 }}>
                    Words you master appear less frequently; words you struggle with are reviewed until perfected.
                  </p>
                </div>
                <div className="card" style={{ padding: '1.25rem' }}>
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, margin: '0 0 0.5rem 0', color: 'var(--text-main)' }}>
                    <Sparkles size={18} color="#3b82f6" /> CEFR Level Placement
                  </h4>
                  <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.5 }}>
                    Start with a quick placement test to automatically jump to your exact proficiency level (A0 to C1).
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'gamification' && (
            <div>
              <h3 className="insights-feature-title">
                <Flame color="#ff9600" size={26} /> Stay Motivated With Gamified Learning
              </h3>
              <p className="insights-hero-desc" style={{ textAlign: 'left', margin: '0 0 1.5rem 0' }}>
                Turn daily learning into an exciting habit with streaks, XP rewards, energy hearts, and weekly league ladders.
              </p>
              <div className="insights-subgrid-4">
                <div className="card text-center" style={{ padding: '1.1rem 0.5rem' }}>
                  <Flame size={26} color="#ff9600" style={{ margin: '0 auto 0.5rem auto' }} />
                  <h4 style={{ fontWeight: 800, margin: '0 0 0.25rem 0', fontSize: '0.95rem' }}>Daily Streaks</h4>
                  <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.8rem' }}>Build daily habits and shield your streak.</p>
                </div>
                <div className="card text-center" style={{ padding: '1.1rem 0.5rem' }}>
                  <Heart size={26} color="#ff4b4b" style={{ margin: '0 auto 0.5rem auto' }} />
                  <h4 style={{ fontWeight: 800, margin: '0 0 0.25rem 0', fontSize: '0.95rem' }}>5-Heart Energy</h4>
                  <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.8rem' }}>Practice carefully and refill hearts.</p>
                </div>
                <div className="card text-center" style={{ padding: '1.1rem 0.5rem' }}>
                  <Gem size={26} color="#1cb0f6" style={{ margin: '0 auto 0.5rem auto' }} />
                  <h4 style={{ fontWeight: 800, margin: '0 0 0.25rem 0', fontSize: '0.95rem' }}>Gems & Shop</h4>
                  <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.8rem' }}>Earn gems to unlock powerups.</p>
                </div>
                <div className="card text-center" style={{ padding: '1.1rem 0.5rem' }}>
                  <Award size={26} color="#ffd700" style={{ margin: '0 auto 0.5rem auto' }} />
                  <h4 style={{ fontWeight: 800, margin: '0 0 0.25rem 0', fontSize: '0.95rem' }}>League Ladders</h4>
                  <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.8rem' }}>Climb from Bronze to Diamond.</p>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'speech' && (
            <div>
              <h3 className="insights-feature-title">
                <Volume2 color="#10b981" size={26} /> Native Voice & Pronunciation Practice
              </h3>
              <p className="insights-hero-desc" style={{ textAlign: 'left', margin: '0 0 1.5rem 0' }}>
                Hear native pronunciation for every word and sentence, and use your device microphone for real-time speech feedback.
              </p>
              <div className="insights-subgrid-2">
                <div className="card" style={{ padding: '1.25rem' }}>
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, margin: '0 0 0.5rem 0', color: 'var(--text-main)' }}>
                    <Mic size={18} color="#10b981" /> Real-Time Voice Feedback
                  </h4>
                  <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.5 }}>
                    Speak directly into your microphone to receive instant accuracy scores and pronunciation tips.
                  </p>
                </div>
                <div className="card" style={{ padding: '1.25rem' }}>
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, margin: '0 0 0.5rem 0', color: 'var(--text-main)' }}>
                    <Headphones size={18} color="#3b82f6" /> Clear Audio Playback
                  </h4>
                  <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.5 }}>
                    Listen to native audio at normal or slow speed to perfect your listening comprehension.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'stories' && (
            <div>
              <h3 className="insights-feature-title">
                <Compass color="#6366f1" size={26} /> Interactive Stories & Real-World Scenarios
              </h3>
              <p className="insights-hero-desc" style={{ textAlign: 'left', margin: '0 0 1.5rem 0' }}>
                Practice conversational skills in realistic scenarios like ordering food, shopping at local markets, or making new friends.
              </p>
              <div className="insights-subgrid-2">
                <div className="card" style={{ padding: '1.25rem' }}>
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, margin: '0 0 0.5rem 0', color: 'var(--text-main)' }}>
                    <MessageSquare size={18} color="#6366f1" /> Branching Dialogues
                  </h4>
                  <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.5 }}>
                    Make choices during stories to see how conversations unfold in natural regional dialects.
                  </p>
                </div>
                <div className="card" style={{ padding: '1.25rem' }}>
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, margin: '0 0 0.5rem 0', color: 'var(--text-main)' }}>
                    <Compass size={18} color="#ec4899" /> Roleplay Quests
                  </h4>
                  <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.5 }}>
                    Engage in interactive text-based adventures that make practicing grammar effortless.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 4. 7 EXERCISE TYPES SHOWCASE */}
      <section style={{ marginBottom: '3.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <h2 style={{ fontSize: 'clamp(1.3rem, 3.5vw, 2.1rem)', fontWeight: 900, marginBottom: '0.5rem', color: 'var(--text-main)' }}>
            7 Interactive Exercise Modes
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
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
            <div key={idx} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.1rem' }}>
              <div style={{ fontSize: '1.75rem', flexShrink: 0 }}>{ex.icon}</div>
              <div>
                <h4 style={{ fontWeight: 800, margin: '0 0 0.25rem 0', fontSize: '0.98rem', color: 'var(--text-main)' }}>{ex.title}</h4>
                <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.3 }}>{ex.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. CALL TO ACTION FOOTER BANNER */}
      <section className="insights-cta-card">
        <h2 className="insights-cta-title">Ready to Start Your Language Journey?</h2>
        <p className="insights-hero-desc" style={{ margin: '0 auto 1.5rem auto' }}>
          Join thousands of learners building reading, phonics, and regional language skills today.
        </p>
        <div className="insights-action-flex">
          {user ? (
            <Link to="/dashboard" className="btn btn-primary">
              <Zap size={18} /> Go to Learner Dashboard
            </Link>
          ) : (
            <Link to="/register" className="btn btn-primary">
              <Sparkles size={18} /> Create Free Account
            </Link>
          )}
          <Link to="/courses" className="btn btn-outline">
            Browse Course Catalog
          </Link>
        </div>
      </section>

    </div>
  );
};

export default LandingPage;
