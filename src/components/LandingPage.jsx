import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { 
  BookOpen, Sparkles, ArrowRight, Globe, CheckCircle, Award, 
  Brain, Flame, Gem, Heart, Volume2, Mic, Compass, 
  RefreshCw, Users, Zap, MessageSquare, Headphones, RotateCcw, Download
} from 'lucide-react';

const LandingPage = () => {
  const { user } = useAuth();
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('srs');
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    fetchInsights();
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      alert('To install NeoLearner as an App on your device:\n\n• Mobile/Android: Tap browser menu (⋮) -> "Install app" or "Add to Home screen".\n• iPhone/Safari: Tap Share (⎋) -> "Add to Home Screen".\n• Desktop (Chrome/Edge): Click the Install icon (⤓) in your browser address bar.');
    }
  };

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

          <button 
            type="button"
            onClick={handleInstallApp}
            className="btn"
            style={{ 
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(59, 130, 246, 0.2))',
              border: '2px solid #10b981',
              color: '#ffffff',
              fontWeight: '800',
              padding: '0.85rem 1.4rem',
              borderRadius: '14px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.25)'
            }}
          >
            <Download size={18} color="#10b981" /> Install NeoLearner App
          </button>
        </div>
      </section>

      {/* 2. LIVE METRICS RIBBON */}
      {insights?.stats && (
        <section className="insights-metrics-section">
          <div className="insights-metrics-grid">
            
            <div className="card insights-metric-card">
              <div className="metric-icon-wrapper metric-icon-green">
                <Users size={22} />
              </div>
              <div className="metric-value metric-val-green">{insights.stats.total_learners ?? 0}</div>
              <div className="metric-label">Active Learners</div>
            </div>

            <div className="card insights-metric-card">
              <div className="metric-icon-wrapper metric-icon-blue">
                <Globe size={22} />
              </div>
              <div className="metric-value metric-val-blue">{insights.stats.supported_languages ?? 0}</div>
              <div className="metric-label">Languages Offered</div>
            </div>

            <div className="card insights-metric-card">
              <div className="metric-icon-wrapper metric-icon-orange">
                <BookOpen size={22} />
              </div>
              <div className="metric-value metric-val-orange">{insights.stats.courses_count ?? 0}</div>
              <div className="metric-label">Structured Courses</div>
            </div>

            <div className="card insights-metric-card">
              <div className="metric-icon-wrapper metric-icon-emerald">
                <CheckCircle size={22} />
              </div>
              <div className="metric-value metric-val-emerald">{insights.stats.questions_count ?? 0}</div>
              <div className="metric-label">Practice Drills</div>
            </div>

            <div className="card insights-metric-card">
              <div className="metric-icon-wrapper metric-icon-pink">
                <RefreshCw size={22} />
              </div>
              <div className="metric-value metric-val-pink">{insights.stats.vocabulary_words ?? 0}</div>
              <div className="metric-label">Vocab Cards</div>
            </div>

            <div className="card insights-metric-card">
              <div className="metric-icon-wrapper metric-icon-purple">
                <Award size={22} />
              </div>
              <div className="metric-value metric-val-purple">{insights.stats.achievements_count ?? 0}</div>
              <div className="metric-label">Badges & Rewards</div>
            </div>

          </div>
        </section>
      )}

      {/* 3. FEATURE SHOWCASE TABS */}
      <section className="insights-section">
        <div className="insights-section-header">
          <h2 className="insights-section-title">
            Why Learn With LinguaLearn?
          </h2>
          <p className="insights-section-subtitle">
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
                <Brain color="var(--primary-color)" size={26} /> <span>Spaced Repetition (SRS) & Adaptive Progress</span>
              </h3>
              <p className="insights-feature-desc">
                Never forget words you've learned. Our SM-2 algorithm automatically tracks recall confidence scores and schedules review sessions right when you need them.
              </p>
              <div className="insights-subgrid-2">
                <div className="card feature-box">
                  <h4 className="feature-box-title">
                    <RotateCcw size={18} color="#10b981" /> Smart Review Schedule
                  </h4>
                  <p className="feature-box-desc">
                    Words you master appear less frequently; words you struggle with are reviewed until perfected.
                  </p>
                </div>
                <div className="card feature-box">
                  <h4 className="feature-box-title">
                    <Sparkles size={18} color="#3b82f6" /> CEFR Level Placement
                  </h4>
                  <p className="feature-box-desc">
                    Start with a quick placement test to automatically jump to your exact proficiency level (A0 to C1).
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'gamification' && (
            <div>
              <h3 className="insights-feature-title">
                <Flame color="#ff9600" size={26} /> <span>Stay Motivated With Gamified Learning</span>
              </h3>
              <p className="insights-feature-desc">
                Turn daily learning into an exciting habit with streaks, XP rewards, energy hearts, and weekly league ladders.
              </p>
              <div className="insights-subgrid-4">
                <div className="card text-center feature-mini-card">
                  <Flame size={26} color="#ff9600" style={{ margin: '0 auto 0.5rem auto' }} />
                  <h4>Daily Streaks</h4>
                  <p>Build daily habits and shield your streak.</p>
                </div>
                <div className="card text-center feature-mini-card">
                  <Heart size={26} color="#ff4b4b" style={{ margin: '0 auto 0.5rem auto' }} />
                  <h4>5-Heart Energy</h4>
                  <p>Practice carefully and refill hearts.</p>
                </div>
                <div className="card text-center feature-mini-card">
                  <Gem size={26} color="#1cb0f6" style={{ margin: '0 auto 0.5rem auto' }} />
                  <h4>Gems & Shop</h4>
                  <p>Earn gems to unlock powerups.</p>
                </div>
                <div className="card text-center feature-mini-card">
                  <Award size={26} color="#ffd700" style={{ margin: '0 auto 0.5rem auto' }} />
                  <h4>League Ladders</h4>
                  <p>Climb from Bronze to Diamond.</p>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'speech' && (
            <div>
              <h3 className="insights-feature-title">
                <Volume2 color="#10b981" size={26} /> <span>Native Voice & Pronunciation Practice</span>
              </h3>
              <p className="insights-feature-desc">
                Hear native pronunciation for every word and sentence, and use your device microphone for real-time speech feedback.
              </p>
              <div className="insights-subgrid-2">
                <div className="card feature-box">
                  <h4 className="feature-box-title">
                    <Mic size={18} color="#10b981" /> Real-Time Voice Feedback
                  </h4>
                  <p className="feature-box-desc">
                    Speak directly into your microphone to receive instant accuracy scores and pronunciation tips.
                  </p>
                </div>
                <div className="card feature-box">
                  <h4 className="feature-box-title">
                    <Headphones size={18} color="#3b82f6" /> Clear Audio Playback
                  </h4>
                  <p className="feature-box-desc">
                    Listen to native audio at normal or slow speed to perfect your listening comprehension.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'stories' && (
            <div>
              <h3 className="insights-feature-title">
                <Compass color="#6366f1" size={26} /> <span>Interactive Stories & Real-World Scenarios</span>
              </h3>
              <p className="insights-feature-desc">
                Practice conversational skills in realistic scenarios like ordering food, shopping at local markets, or making new friends.
              </p>
              <div className="insights-subgrid-2">
                <div className="card feature-box">
                  <h4 className="feature-box-title">
                    <MessageSquare size={18} color="#6366f1" /> Branching Dialogues
                  </h4>
                  <p className="feature-box-desc">
                    Make choices during stories to see how conversations unfold in natural regional dialects.
                  </p>
                </div>
                <div className="card feature-box">
                  <h4 className="feature-box-title">
                    <Compass size={18} color="#ec4899" /> Roleplay Quests
                  </h4>
                  <p className="feature-box-desc">
                    Engage in interactive text-based adventures that make practicing grammar effortless.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 4. 7 EXERCISE TYPES SHOWCASE */}
      <section className="insights-section">
        <div className="insights-section-header">
          <h2 className="insights-section-title">
            7 Interactive Exercise Modes
          </h2>
          <p className="insights-section-subtitle">
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
            <div key={idx} className="card exercise-card">
              <div className="exercise-card-icon">{ex.icon}</div>
              <div className="exercise-card-content">
                <h4 className="exercise-card-title">{ex.title}</h4>
                <p className="exercise-card-desc">{ex.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. CALL TO ACTION FOOTER BANNER */}
      <section className="insights-cta-card">
        <h2 className="insights-cta-title">Ready to Start Your Language Journey?</h2>
        <p className="insights-hero-desc">
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
