import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Sparkles, X, CheckCircle2, XCircle, Lightbulb, BookOpen, ChevronRight } from 'lucide-react';

const ExplainMistakeModal = ({ questionId, questionText, selectedAnswerId, userAnswerText, correctAnswerText, onClose }) => {
  const [explanation, setExplanation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExplanation = async () => {
      setLoading(true);
      try {
        const res = await api.post('/ai/explain-mistake', {
          question_id: questionId || null,
          question_text: questionText,
          selected_answer_id: selectedAnswerId || null,
          user_answer_text: userAnswerText,
          correct_answer_text: correctAnswerText
        });
        setExplanation(res.data);
      } catch (err) {
        console.error('Failed to get AI explanation:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchExplanation();
  }, [questionId, selectedAnswerId, questionText, userAnswerText, correctAnswerText]);

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem', zIndex: 1100
    }}>
      <div className="card" style={{ 
        maxWidth: '650px', width: '100%', maxHeight: '85vh', 
        overflowY: 'auto', padding: '2rem', borderRadius: '24px', position: 'relative' 
      }}>
        
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
        >
          <X size={22} />
        </button>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#1cb0f6', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          <Sparkles size={16} /> Explain with AI
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', margin: '0 0 1.25rem', color: 'var(--text-main)' }}>
          Pedagogical Breakdown
        </h2>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            AI Tutor is formulating linguistic contrast breakdown...
          </div>
        ) : (
          <div>
            {/* Prompt text */}
            <div style={{ padding: '1rem', background: 'var(--bg-subtle)', borderRadius: '12px', marginBottom: '1.25rem', fontWeight: '600' }}>
              {explanation?.question_text}
            </div>

            {/* Answer Comparison Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ padding: '0.85rem 1rem', background: 'rgba(255, 75, 75, 0.1)', border: '1px solid rgba(255, 75, 75, 0.3)', borderRadius: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--error)', fontWeight: 'bold', fontSize: '0.8rem', marginBottom: '4px' }}>
                  <XCircle size={16} /> You Selected
                </div>
                <div style={{ fontWeight: '700', color: 'var(--text-main)', fontSize: '1rem' }}>
                  {explanation?.user_selection_text}
                </div>
              </div>

              <div style={{ padding: '0.85rem 1rem', background: 'rgba(88, 204, 2, 0.1)', border: '1px solid rgba(88, 204, 2, 0.3)', borderRadius: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary-color)', fontWeight: 'bold', fontSize: '0.8rem', marginBottom: '4px' }}>
                  <CheckCircle2 size={16} /> Correct Answer
                </div>
                <div style={{ fontWeight: '700', color: 'var(--text-main)', fontSize: '1rem' }}>
                  {explanation?.correct_answer_text}
                </div>
              </div>
            </div>

            {/* Why Incorrect */}
            <div style={{ marginBottom: '1.25rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '4px' }}>
                Why This Answer Didn't Work:
              </h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5', margin: 0 }}>
                {explanation?.why_incorrect}
              </p>
            </div>

            {/* The Underlying Grammar Rule */}
            <div style={{ padding: '1rem', background: 'var(--bg-subtle)', borderRadius: '12px', borderLeft: '4px solid #1cb0f6', marginBottom: '1.25rem' }}>
              <div style={{ fontWeight: 'bold', fontSize: '0.85rem', color: '#1cb0f6', marginBottom: '3px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <BookOpen size={16} /> Linguistic Rule
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: '1.5' }}>
                {explanation?.grammar_rule}
              </div>
            </div>

            {/* Contrast Examples */}
            {explanation?.contrast_examples && explanation.contrast_examples.length > 0 && (
              <div style={{ marginBottom: '1.25rem' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '6px' }}>
                  Side-by-Side Usage Examples:
                </h4>
                {explanation.contrast_examples.map((ex, i) => (
                  <div key={i} style={{ fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '4px', background: 'var(--card-bg)', padding: '6px 10px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    {ex}
                  </div>
                ))}
              </div>
            )}

            {/* Memory Tip */}
            {explanation?.memory_tip && (
              <div style={{ padding: '0.85rem 1rem', background: 'rgba(255, 150, 0, 0.1)', borderRadius: '12px', border: '1px solid rgba(255, 150, 0, 0.3)', color: 'var(--text-main)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                {explanation.memory_tip}
              </div>
            )}

            {/* Got It Button */}
            <button
              onClick={onClose}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', fontWeight: 'bold' }}
            >
              Got It! Continue Learning
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default ExplainMistakeModal;
