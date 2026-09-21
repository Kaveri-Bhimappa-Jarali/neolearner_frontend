import React from 'react';
import { useTranslation } from '../../utils/i18n';
import { Award, BookOpen, Mic, Headphones, PenTool, Brain } from 'lucide-react';

const SkillRadarChart = ({ skillBreakdown = {} }) => {
  const { t } = useTranslation();

  const skillsList = [
    { key: 'vocabulary', label: 'Vocabulary & Translation', icon: <BookOpen size={16} color="#1cb0f6" />, score: skillBreakdown.vocabulary || 25.0, color: '#1cb0f6' },
    { key: 'grammar', label: 'Grammar & Syntax', icon: <Brain size={16} color="#9966cc" />, score: skillBreakdown.grammar || 25.0, color: '#9966cc' },
    { key: 'reading', label: 'Reading & Phonics', icon: <BookOpen size={16} color="#58cc02" />, score: skillBreakdown.reading || 25.0, color: '#58cc02' },
    { key: 'listening', label: 'Listening & Auditory', icon: <Headphones size={16} color="#ff9600" />, score: skillBreakdown.listening || 25.0, color: '#ff9600' },
    { key: 'writing', label: 'Writing & Spelling', icon: <PenTool size={16} color="#ff4b4b" />, score: skillBreakdown.writing || 25.0, color: '#ff4b4b' },
    { key: 'speaking', label: 'Speaking & Pronunciation', icon: <Mic size={16} color="#e0115f" />, score: skillBreakdown.speaking || 25.0, color: '#e0115f' }
  ];

  return (
    <div className="card" style={{ padding: '1.5rem', borderRadius: '20px', border: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Award size={20} color="var(--primary-color)" /> Multi-Skill Competency Vectors
        </h3>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>
          Real-time AI Assessment
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {skillsList.map((s) => (
          <div key={s.key}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', fontSize: '0.85rem' }}>
              <span style={{ fontWeight: '700', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                {s.icon} {t(s.label)}
              </span>
              <span style={{ fontWeight: '800', color: s.color }}>
                {s.score}%
              </span>
            </div>

            <div style={{ height: '10px', background: 'var(--bg-subtle)', borderRadius: '9999px', overflow: 'hidden' }}>
              <div style={{
                height: '100%', background: s.color,
                width: `${Math.min(100, Math.max(5, s.score))}%`,
                transition: 'width 0.5s ease', borderRadius: '9999px'
              }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkillRadarChart;
