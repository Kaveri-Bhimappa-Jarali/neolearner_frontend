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
import LandingPage from './components/LandingPage';
import { BookOpen, Sparkles, ArrowRight, Globe, CheckCircle, Award } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Unhandled React Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '3rem 1.5rem', textAlign: 'center', maxWidth: '600px', margin: '3rem auto' }} className="card">
          <h2 style={{ fontSize: '1.75rem', color: 'var(--text-main)', marginBottom: '1rem', fontWeight: '800' }}>Something went wrong loading this view</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>An unexpected error occurred. Click below to refresh the application.</p>
          <button onClick={() => { this.setState({ hasError: false }); window.location.reload(); }} className="btn btn-primary" style={{ padding: '0.75rem 1.75rem', fontWeight: 'bold' }}>
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ padding: '2rem' }}>Loading Auth...</div>;
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Navbar />
          <main className="main-content">
            <ErrorBoundary>
              <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/insights" element={<LandingPage />} />
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
            </ErrorBoundary>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
