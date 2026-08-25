import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { HelpCircle, CheckCircle, XCircle, Award, ArrowRight, RotateCcw } from 'lucide-react';

const SAMPLE_ASSESSMENT = {
  id: "a1111111-1111-1111-1111-111111111111",
  title: "Spanish Vowel Pronunciation Quiz",
  type: "quiz",
  pass_percentage: 70.0,
  questions: [
    {
      id: "q1111111-1111-1111-1111-111111111111",
      text: "How is the Spanish vowel 'E' pronounced?",
      answers: [
        { id: "ans1", text: "Like 'e' in 'get'", is_correct: true },
        { id: "ans2", text: "Like 'ee' in 'see'", is_correct: false },
        { id: "ans3", text: "Like 'ay' in 'say'", is_correct: false }
      ]
    },
    {
      id: "q2222222-2222-2222-2222-222222222222",
      text: "Which letter sound matches Spanish 'I'?",
      answers: [
        { id: "ans4", text: "Like 'i' in 'sit'", is_correct: false },
        { id: "ans5", text: "Like 'ee' in 'machine'", is_correct: true },
        { id: "ans6", text: "Like 'eye'", is_correct: false }
      ]
    }
  ]
};

const AssessmentRunner = () => {
  const { assessmentId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState(SAMPLE_ASSESSMENT);
  const [answersMap, setAnswersMap] = useState({});
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        const res = await api.get(`/assessments/${assessmentId}`);
        if (res.data) {
          setAssessment(res.data);
        }
      } catch (err) {
        console.warn('Backend API offline or loading fallback assessment:', err);
      }
    };
    if (assessmentId) {
      fetchAssessment();
    }
  }, [assessmentId]);

  const selectAnswer = (questionId, answerId) => {
    setAnswersMap(prev => ({
      ...prev,
      [questionId]: answerId
    }));
  };

  const handleSubmit = async () => {
    if (user) {
      setSubmitting(true);
      try {
        const payload = {
          assessment_id: assessmentId,
          answers: Object.entries(answersMap).map(([qId, aId]) => ({
            question_id: qId,
            selected_answer_id: aId
          }))
        };
        const res = await api.post(`/assessments/${assessmentId}/submit`, payload);
        setResult(res.data);
        setSubmitting(false);
        return;
      } catch (err) {
        console.warn('Backend API offline, scoring locally:', err);
      }
    }

    // Local calculation fallback
    let correctCount = 0;
    assessment.questions?.forEach(q => {
      const selectedId = answersMap[q.id];
      const correctAns = q.answers?.find(a => a.is_correct);
      if (correctAns && selectedId === correctAns.id) {
        correctCount++;
      }
    });

    const scorePct = (correctCount / (assessment.questions?.length || 1)) * 100;
    setResult({
      score: scorePct,
      passed: scorePct >= assessment.pass_percentage
    });
    setSubmitting(false);
  };

  return (
    <div className="page-container" style={{ maxWidth: '800px' }}>
      <div className="card" style={{ padding: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.75rem', color: 'var(--text-main)' }}>{assessment.title}</h1>
          <span className="badge badge-purple">{assessment.type.toUpperCase()}</span>
        </div>

        {result ? (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div style={{ 
              display: 'inline-flex', padding: '1.5rem', borderRadius: '50%', 
              background: result.passed ? 'rgba(88, 204, 2, 0.15)' : 'rgba(255, 75, 75, 0.15)',
              marginBottom: '1rem'
            }}>
              {result.passed ? (
                <CheckCircle size={64} color="var(--primary-color)" />
              ) : (
                <XCircle size={64} color="var(--error)" />
              )}
            </div>
            <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: result.passed ? 'var(--primary-color)' : 'var(--error)' }}>
              {result.passed ? 'Assessment Passed!' : 'Needs Revision'}
            </h2>
            <p style={{ fontSize: '1.25rem', color: 'var(--text-main)', marginBottom: '1.5rem' }}>
              Your Score: <strong>{result.score.toFixed(0)}%</strong> (Passing Threshold: {assessment.pass_percentage}%)
            </p>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
              <button onClick={() => setResult(null)} className="btn btn-secondary" style={{ gap: '6px' }}>
                <RotateCcw size={16} /> Retake Quiz
              </button>
              <Link to="/courses" className="btn btn-primary" style={{ gap: '6px' }}>
                <Award size={16} /> Explore More Courses <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        ) : (
          <div>
            {assessment.questions?.map((question, qIdx) => (
              <div key={question.id} style={{ 
                marginBottom: '2rem', padding: '1.5rem', background: 'var(--background)',
                borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' 
              }}>
                <h3 style={{ fontSize: '1.15rem', color: 'var(--text-main)', marginBottom: '1rem' }}>
                  {qIdx + 1}. {question.text}
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {question.answers?.map((ans) => {
                    const isSelected = answersMap[question.id] === ans.id;
                    return (
                      <div 
                        key={ans.id}
                        onClick={() => selectAnswer(question.id, ans.id)}
                        style={{ 
                          padding: '0.875rem 1.25rem', borderRadius: 'var(--radius-sm)',
                          border: `2px solid ${isSelected ? 'var(--primary-color)' : 'var(--border-color)'}`,
                          background: isSelected ? 'rgba(88, 204, 2, 0.1)' : 'var(--surface)',
                          cursor: 'pointer', transition: 'all 0.2s ease', color: 'var(--text-main)'
                        }}
                      >
                        {ans.text}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            <button 
              className="btn btn-primary" 
              onClick={handleSubmit} 
              disabled={submitting || Object.keys(answersMap).length === 0}
              style={{ width: '100%', marginTop: '1rem' }}
            >
              {submitting ? 'Submitting & Scoring...' : 'Submit Assessment'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssessmentRunner;
