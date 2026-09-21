import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useTranslation } from '../../utils/i18n';
import { FileText, Download, X, Printer, Award, Sparkles, CheckCircle2 } from 'lucide-react';

const ProgressReportModal = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchReport();
    }
  }, [isOpen]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reports/me');
      setReport(res.data);
    } catch (err) {
      console.error('Failed to load learning report:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0, 0, 0, 0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1100, padding: '1rem', backdropFilter: 'blur(4px)'
    }}>
      <div className="card" style={{
        maxWidth: '750px', width: '100%', maxHeight: '90vh', overflowY: 'auto',
        padding: '2rem', borderRadius: '24px', position: 'relative'
      }}>
        
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
        >
          <X size={24} />
        </button>

        {loading ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            {t('analyzingProfile')}
          </div>
        ) : report ? (
          <div>
            {/* Header */}
            <div style={{ borderBottom: '2px solid var(--border-color)', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-color)', fontWeight: 'bold', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                <FileText size={16} /> OFFICIAL LEARNER PROGRESS REPORT
              </div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-main)', margin: '0 0 0.5rem' }}>
                {report.learner_name}'s Literacy Transcript
              </h2>
              <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <span><strong>Date:</strong> {new Date(report.report_date).toLocaleDateString()}</span>
                <span><strong>CEFR Level:</strong> {report.cefr_level} ({report.benchmark_level})</span>
              </div>
            </div>

            {/* Metric Summary Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ background: 'var(--bg-subtle)', padding: '1rem', borderRadius: '14px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--primary-color)' }}>{report.composite_score}%</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>Mastery Index</div>
              </div>
              <div style={{ background: 'var(--bg-subtle)', padding: '1rem', borderRadius: '14px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#1cb0f6' }}>{report.lessons_completed_count}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>Lessons Done</div>
              </div>
              <div style={{ background: 'var(--bg-subtle)', padding: '1rem', borderRadius: '14px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#ff9600' }}>{report.total_xp} XP</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>Total XP</div>
              </div>
              <div style={{ background: 'var(--bg-subtle)', padding: '1rem', borderRadius: '14px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#e0115f' }}>{report.recent_pronunciation_score}%</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>Speech Score</div>
              </div>
            </div>

            {/* 6-Skill Competency List */}
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.75rem' }}>
              Competency breakdown:
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '1.5rem' }}>
              {Object.entries(report.skill_breakdown || {}).map(([skill, val]) => (
                <div key={skill} style={{ padding: '0.6rem 0.85rem', background: 'var(--surface)', border: '1px solid var(--border-color)', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>{skill.capitalize ? skill.capitalize() : skill}</span>
                  <span style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>{val}%</span>
                </div>
              ))}
            </div>

            {/* AI Recommendations */}
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.75rem' }}>
              💡 AI Personalized Next Steps:
            </h3>
            <ul style={{ paddingLeft: '1.25rem', margin: '0 0 1.5rem', lineHeight: '1.6', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              {report.recommendations.map((rec, idx) => (
                <li key={idx} style={{ marginBottom: '6px' }}>{rec}</li>
              ))}
            </ul>

            {/* Print / Close Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button className="btn btn-secondary" onClick={handlePrint} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Printer size={16} /> Print Report
              </button>
              <button className="btn btn-primary" onClick={onClose}>
                Done
              </button>
            </div>
          </div>
        ) : null}

      </div>
    </div>
  );
};

export default ProgressReportModal;
