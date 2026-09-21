import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Onboarding from './components/Auth/Onboarding';
import ProfileDashboard from './components/Profile/ProfileDashboard';
import CourseCatalog from './components/Courses/CourseCatalog';
import CourseDetail from './components/Courses/CourseDetail';
import LessonViewer from './components/Lessons/LessonViewer';
import AssessmentRunner from './components/Assessments/AssessmentRunner';
import LearnerDashboard from './components/Dashboard/LearnerDashboard';
import Shop from './components/Shop/Shop';
import Practice from './components/Lessons/Practice';
import AdaptiveLessonRunner from './components/Lessons/AdaptiveLessonRunner';
import LearningPathView from './components/Dashboard/LearningPathView';
import PlacementTestRunner from './components/Assessments/PlacementTestRunner';
import MistakesPractice from './components/Review/MistakesPractice';
import SrsReview from './components/Review/SrsReview';
import DatabaseExplorer from './components/Admin/DatabaseExplorer';
import ConversationLab from './components/Conversation/ConversationLab';
import StoryCatalog from './components/Stories/StoryCatalog';
import StoryPlayer from './components/Stories/StoryPlayer';
import AdventureCatalog from './components/Adventures/AdventureCatalog';
import AdventureRunner from './components/Adventures/AdventureRunner';
import PracticeHubDashboard from './components/PracticeHub/PracticeHubDashboard';
import VisualFlashcards from './components/PracticeHub/VisualFlashcards';
import FriendsHub from './components/Social/FriendsHub';
import LeagueLadder from './components/Social/LeagueLadder';
import AdminDashboard from './components/Admin/AdminDashboard';
import PronunciationEvaluator from './components/Speech/PronunciationEvaluator';
import AchievementsGrid from './components/Achievements/AchievementsGrid';
import { BookOpen, Sparkles, ArrowRight, Globe, CheckCircle, Award } from 'lucide-react';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ padding: '2rem' }}>Loading Auth...</div>;
  return user ? children : <Navigate to="/login" />;
};

const Home = () => {
  const { user, loading } = useAuth();

  if (loading) return <div style={{ padding: '2rem' }}>Loading Auth...</div>;

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div style={{ textAlign: 'center', marginTop: '5vh', maxWidth: '850px', padding: '0 1rem' }}>
      
      <div style={{ 
        display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '0.4rem 1rem', 
        borderRadius: '9999px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)',
        color: '#10b981', fontSize: '0.85rem', fontWeight: '700', marginBottom: '1.5rem' 
      }}>
        <Sparkles size={16} /> Literacy & Language Assistance Platform
      </div>

      <h1 style={{ fontSize: '3.25rem', color: 'var(--text-main)', marginBottom: '1.25rem', fontWeight: '800', lineHeight: '1.15', letterSpacing: '-1px' }}>
        Empowering Reading & Language Literacy <span style={{ color: 'var(--primary-color)' }}>for Everyone.</span>
      </h1>

      <p style={{ 
        fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: '2.5rem', 
        lineHeight: '1.6', maxWidth: '720px', margin: '0 auto 2.5rem auto' 
      }}>
        Foundational phonics, structured reading modules, interactive assessments, and personalized learning progress.
      </p>

      <div style={{ display: 'flex', gap: '1.25rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '4rem' }}>
        <Link to="/courses" className="btn btn-primary" style={{ padding: '1rem 2.25rem', fontSize: '1.05rem', gap: '10px' }}>
          <BookOpen size={20} /> Explore Courses <ArrowRight size={18} />
        </Link>
        <Link to="/register" className="btn btn-secondary" style={{ padding: '1rem 2.25rem', fontSize: '1.05rem' }}>
          Create Free Account
        </Link>
      </div>

      {/* Target Language Selection Bar */}
      <div style={{ textAlign: 'left', margin: '4rem 0' }}>
        <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1.5rem', fontWeight: '700' }}>
          Available Target Languages
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
          {[
            { name: 'English', flag: '🇬🇧' },
            { name: 'Kannada (ಕನ್ನಡ)', flag: '🇮🇳' },
            { name: 'Telugu (తెలుగు)', flag: '🇮🇳' },
            { name: 'Marathi (मराठी)', flag: '🇮🇳' },
            { name: 'Hindi (हिन्दी)', flag: '🇮🇳' }
          ].map(lang => (
            <Link key={lang.name} to="/courses" className="flag-card">
              <span style={{ fontSize: '1.75rem' }}>{lang.flag}</span>
              <span style={{ fontWeight: '600', fontSize: '0.95rem' }}>{lang.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div style={{ 
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
        gap: '1.5rem', textAlign: 'left', margin: '3rem 0' 
      }}>
        <div className="card">
          <div style={{ color: 'var(--primary-color)', marginBottom: '0.75rem' }}>
            <Globe size={32} />
          </div>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>Multi-Language Support</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.4' }}>
            Learn reading, vocabulary, and grammar in Kannada, Telugu, Marathi, Hindi, and English.
          </p>
        </div>

        <div className="card">
          <div style={{ color: 'var(--secondary-color)', marginBottom: '0.75rem' }}>
            <CheckCircle size={32} />
          </div>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>Structured Phonics & Lessons</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.4' }}>
            Structured course topics, bite-sized lessons, and estimated completion times.
          </p>
        </div>

        <div className="card">
          <div style={{ color: 'var(--accent-orange)', marginBottom: '0.75rem' }}>
            <Award size={32} />
          </div>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>Interactive Assessments</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.4' }}>
            Instant scoring feedback, pass thresholds, and automated database progress tracking.
          </p>
        </div>
      </div>

    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/courses" element={<CourseCatalog />} />
              <Route path="/courses/:courseId" element={<CourseDetail />} />
              <Route path="/lessons/:lessonId" element={<LessonViewer />} />
              <Route path="/assessments/:assessmentId" element={<AssessmentRunner />} />
              <Route path="/dashboard" element={
                <PrivateRoute>
                  <LearnerDashboard />
                </PrivateRoute>
              } />
              <Route path="/learning-path" element={
                <PrivateRoute>
                  <LearningPathView />
                </PrivateRoute>
              } />
              <Route path="/initial-exam" element={
                <PrivateRoute>
                  <PlacementTestRunner />
                </PrivateRoute>
              } />
              <Route path="/placement-test" element={
                <PrivateRoute>
                  <PlacementTestRunner />
                </PrivateRoute>
              } />
              <Route path="/adaptive-practice" element={
                <PrivateRoute>
                  <AdaptiveLessonRunner />
                </PrivateRoute>
              } />
              <Route path="/shop" element={
                <PrivateRoute>
                  <Shop />
                </PrivateRoute>
              } />
              <Route path="/practice" element={
                <PrivateRoute>
                  <Practice />
                </PrivateRoute>
              } />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/onboarding" element={
                <PrivateRoute>
                  <Onboarding />
                </PrivateRoute>
              } />
              <Route path="/review/mistakes" element={
                <PrivateRoute>
                  <MistakesPractice />
                </PrivateRoute>
              } />
              <Route path="/review/srs" element={
                <PrivateRoute>
                  <SrsReview />
                </PrivateRoute>
              } />
              <Route path="/profile" element={
                <PrivateRoute>
                  <ProfileDashboard />
                </PrivateRoute>
              } />
              <Route path="/conversation" element={
                <PrivateRoute>
                  <ConversationLab />
                </PrivateRoute>
              } />
              <Route path="/stories" element={
                <PrivateRoute>
                  <StoryCatalog />
                </PrivateRoute>
              } />
              <Route path="/stories/:storyId" element={
                <PrivateRoute>
                  <StoryPlayer />
                </PrivateRoute>
              } />
              <Route path="/adventures" element={
                <PrivateRoute>
                  <AdventureCatalog />
                </PrivateRoute>
              } />
              <Route path="/adventures/:adventureId" element={
                <PrivateRoute>
                  <AdventureRunner />
                </PrivateRoute>
              } />
              <Route path="/practice-hub" element={
                <PrivateRoute>
                  <PracticeHubDashboard />
                </PrivateRoute>
              } />
              <Route path="/flashcards" element={
                <PrivateRoute>
                  <VisualFlashcards />
                </PrivateRoute>
              } />
              <Route path="/friends" element={
                <PrivateRoute>
                  <FriendsHub />
                </PrivateRoute>
              } />
              <Route path="/leagues" element={
                <PrivateRoute>
                  <LeagueLadder />
                </PrivateRoute>
              } />
              <Route path="/admin" element={
                <PrivateRoute>
                  <AdminDashboard />
                </PrivateRoute>
              } />
              <Route path="/speech-practice" element={
                <PrivateRoute>
                  <PronunciationEvaluator />
                </PrivateRoute>
              } />
              <Route path="/achievements" element={
                <PrivateRoute>
                  <AchievementsGrid />
                </PrivateRoute>
              } />
              <Route path="/database" element={<DatabaseExplorer />} />
              <Route path="/db-explorer" element={<DatabaseExplorer />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
