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
    <div className="landing-root-container">
      
      {/* 1. HERO BANNER */}
      <section className="landing-hero-section">
        <div className="landing-hero-badge">
          <Sparkles size={15} /> <span>INTELLIGENT LITERACY PLATFORM</span>
        </div>

        <h1 className="landing-hero-title">
          Master Reading, Phonics & Conversation <br className="desktop-only-br" />
          <span className="landing-title-gradient">
            In Regional Languages
          </span>
        </h1>

        <p className="landing-hero-subtitle">
          Empowering neo-learners to build fluency in <strong>Kannada, Telugu, Hindi, Marathi, Spanish, and English</strong> through bite-sized gamified lessons, voice pronunciation practice, daily streaks, and smart memory review.
        </p>

        {/* Action Buttons */}
        <div className="landing-cta-flex">
          {user ? (
            <Link to="/dashboard" className="btn btn-primary landing-btn-hero">
              <Zap size={20} /> Go to Learner Dashboard <ArrowRight size={20} />
            </Link>
          ) : (
            <>
              <Link to="/register" className="btn btn-primary landing-btn-hero">
                <Sparkles size={20} /> Start Learning Free <ArrowRight size={20} />
              </Link>
              <Link to="/courses" className="btn btn-secondary landing-btn-hero-sec">
                Explore Course Catalog
              </Link>
            </>
          )}
        </div>
      </section>

      {/* 2. LIVE METRICS RIBBON */}
      {insights?.stats && (
        <section className="landing-metrics-section">
          <div className="landing-metrics-grid">
            
            <div className="landing-metric-card">
              <div className="metric-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.12)', color: 'var(--primary-color)' }}>
                <Users size={22} />
              </div>
              <div className="metric-value" style={{ color: 'var(--primary-color)' }}>{insights.stats.total_learners ?? 0}</div>
              <div className="metric-label">Active Learners</div>
            </div>

            <div className="landing-metric-card">
              <div className="metric-icon-wrapper" style={{ background: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6' }}>
                <Globe size={22} />
              </div>
              <div className="metric-value" style={{ color: '#3b82f6' }}>{insights.stats.supported_languages ?? 0}</div>
              <div className="metric-label">Languages Offered</div>
            </div>

            <div className="landing-metric-card">
              <div className="metric-icon-wrapper" style={{ background: 'rgba(255, 150, 0, 0.12)', color: '#ff9600' }}>
                <BookOpen size={22} />
              </div>
              <div className="metric-value" style={{ color: '#ff9600' }}>{insights.stats.courses_count ?? 0}</div>
              <div className="metric-label">Structured Courses</div>
            </div>

            <div className="landing-metric-card">
              <div className="metric-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#10b981' }}>
                <CheckCircle size={22} />
              </div>
              <div className="metric-value" style={{ color: '#10b981' }}>{insights.stats.questions_count ?? 0}</div>
              <div className="metric-label">Practice Drills</div>
            </div>

            <div className="landing-metric-card">
              <div className="metric-icon-wrapper" style={{ background: 'rgba(236, 72, 153, 0.12)', color: '#ec4899' }}>
                <RefreshCw size={22} />
              </div>
              <div className="metric-value" style={{ color: '#ec4899' }}>{insights.stats.vocabulary_words ?? 0}</div>
              <div className="metric-label">Vocab Cards</div>
            </div>

            <div className="landing-metric-card">
              <div className="metric-icon-wrapper" style={{ background: 'rgba(139, 92, 246, 0.12)', color: 'var(--accent-purple)' }}>
                <Award size={22} />
              </div>
              <div className="metric-value" style={{ color: 'var(--accent-purple)' }}>{insights.stats.achievements_count ?? 0}</div>
              <div className="metric-label">Badges & Rewards</div>
            </div>

          </div>
        </section>
      )}

      {/* 3. FEATURE SHOWCASE TABS */}
      <section className="landing-features-section">
        <div className="landing-section-header">
          <h2>Why Learn With LinguaLearn?</h2>
          <p>Designed specifically for quick, effective literacy building and long-term memory retention.</p>
        </div>

        {/* Responsive Tab Bar */}
        <div className="landing-tabs-wrapper">
          <div className="landing-tabs-scroll">
            {[
              { id: 'srs', label: 'Smart Memory (SRS)', icon: <Brain size={18} /> },
              { id: 'gamification', label: 'Fun Gamification', icon: <Flame size={18} /> },
              { id: 'speech', label: 'Voice & Phonics', icon: <Mic size={18} /> },
              { id: 'stories', label: 'Interactive Stories', icon: <Compass size={18} /> }
            ].map(tab => (
              <button
                key={tab.id}
                className={`landing-tab-btn ${activeSection === tab.id ? 'active' : ''}`}
                onClick={() => setActiveSection(tab.id)}
              >
                {tab.icon} <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content Display */}
        <div className="landing-feature-display-card">
          {activeSection === 'srs' && (
            <div>
              <div className="feature-card-header">
                <Brain color="var(--primary-color)" size={28} />
                <h3>Spaced Repetition (SRS) & Adaptive Progress</h3>
              </div>
              <p className="feature-card-desc">
                Never forget words you've learned. Our SM-2 algorithm automatically tracks recall confidence scores and schedules review sessions right when you need them.
              </p>
              <div className="feature-card-grid">
                <div className="feature-subbox">
                  <h4><RotateCcw size={18} color="#10b981" /> Smart Review Schedule</h4>
                  <p>Words you master appear less frequently; words you struggle with are reviewed until perfected.</p>
                </div>
                <div className="feature-subbox">
                  <h4><Sparkles size={18} color="#3b82f6" /> CEFR Level Placement</h4>
                  <p>Start with a quick placement test to automatically jump to your exact proficiency level (A0 to C1).</p>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'gamification' && (
            <div>
              <div className="feature-card-header">
                <Flame color="#ff9600" size={28} />
                <h3>Stay Motivated With Gamified Learning</h3>
              </div>
              <p className="feature-card-desc">
                Turn daily learning into an exciting habit with streaks, XP rewards, energy hearts, and weekly league ladders.
              </p>
              <div className="feature-card-grid-4">
                <div className="feature-mini-box">
                  <Flame size={26} color="#ff9600" />
                  <h4>Daily Streaks</h4>
                  <p>Build daily habits and shield your streak.</p>
                </div>
                <div className="feature-mini-box">
                  <Heart size={26} color="#ff4b4b" />
                  <h4>5-Heart Energy</h4>
                  <p>Practice carefully and refill hearts through practice.</p>
                </div>
                <div className="feature-mini-box">
                  <Gem size={26} color="#1cb0f6" />
                  <h4>Gems & Shop</h4>
                  <p>Earn gems upon lesson completion to unlock items.</p>
                </div>
                <div className="feature-mini-box">
                  <Award size={26} color="#ffd700" />
                  <h4>League Ladders</h4>
                  <p>Climb from Bronze to Diamond league ranks weekly.</p>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'speech' && (
            <div>
              <div className="feature-card-header">
                <Volume2 color="#10b981" size={28} />
                <h3>Native Voice & Pronunciation Practice</h3>
              </div>
              <p className="feature-card-desc">
                Hear native pronunciation for every word and sentence, and use your device microphone for real-time speech feedback.
              </p>
              <div className="feature-card-grid">
                <div className="feature-subbox">
                  <h4><Mic size={18} color="#10b981" /> Real-Time Voice Feedback</h4>
                  <p>Speak directly into your microphone to receive instant accuracy scores and pronunciation tips.</p>
                </div>
                <div className="feature-subbox">
                  <h4><Headphones size={18} color="#3b82f6" /> Clear Audio Playback</h4>
                  <p>Listen to native audio at normal or slow speed to perfect your listening comprehension.</p>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'stories' && (
            <div>
              <div className="feature-card-header">
                <Compass color="#6366f1" size={28} />
                <h3>Interactive Stories & Real-World Scenarios</h3>
              </div>
              <p className="feature-card-desc">
                Practice conversational skills in realistic scenarios like ordering food, shopping at local markets, or making new friends.
              </p>
              <div className="feature-card-grid">
                <div className="feature-subbox">
                  <h4><MessageSquare size={18} color="#6366f1" /> Branching Dialogues</h4>
                  <p>Make choices during stories to see how conversations unfold in natural regional dialects.</p>
                </div>
                <div className="feature-subbox">
                  <h4><Compass size={18} color="#ec4899" /> Roleplay Quests</h4>
                  <p>Engage in interactive text-based adventures that make practicing grammar effortless.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 4. 7 EXERCISE TYPES SHOWCASE */}
      <section className="landing-exercises-section">
        <div className="landing-section-header">
          <h2>7 Interactive Exercise Modes</h2>
          <p>Varied quiz modes keep learning engaging, multi-sensory, and effective.</p>
        </div>

        <div className="landing-exercise-grid">
          {[
            { title: 'Multiple Choice Quiz', desc: 'Select correct meanings and translations', icon: '🎯' },
            { title: 'Voice Pronunciation', desc: 'Speak into mic with real-time feedback', icon: '🗣️' },
            { title: 'Audio Listening Practice', desc: 'Listen to spoken words and identify sounds', icon: '🎧' },
            { title: 'Word Order Unscramble', desc: 'Arrange words to form proper sentences', icon: '🧩' },
            { title: 'Fill in the Blanks', desc: 'Complete missing words in vocabulary cards', icon: '✍️' },
            { title: 'Matching Pairs', desc: 'Match regional words with their meanings', icon: '🔄' },
            { title: 'Sentence Translation', desc: 'Translate sentences between target languages', icon: '🌐' }
          ].map((ex, idx) => (
            <div key={idx} className="landing-exercise-card">
              <div className="exercise-icon-badge">{ex.icon}</div>
              <div className="exercise-info">
                <h4>{ex.title}</h4>
                <p>{ex.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. CALL TO ACTION FOOTER BANNER */}
      <section className="landing-cta-banner">
        <h2>Ready to Start Your Language Journey?</h2>
        <p>Join thousands of learners building reading, phonics, and regional language skills today.</p>
        <div className="landing-cta-flex">
          {user ? (
            <Link to="/dashboard" className="btn btn-primary landing-btn-hero">
              <Zap size={20} /> Go to Learner Dashboard
            </Link>
          ) : (
            <Link to="/register" className="btn btn-primary landing-btn-hero">
              <Sparkles size={20} /> Create Free Account
            </Link>
          )}
          <Link to="/courses" className="btn btn-secondary landing-btn-hero-sec">
            Browse Course Catalog
          </Link>
        </div>
      </section>

    </div>
  );
};

export default LandingPage;
