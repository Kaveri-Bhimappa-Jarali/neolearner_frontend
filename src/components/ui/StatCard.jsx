import React from 'react';

const StatCard = ({ title, value, subtitle, icon: Icon, color = 'teal', trend }) => {
  const colorMap = {
    teal: { bg: 'rgba(20, 184, 166, 0.12)', border: 'rgba(20, 184, 166, 0.25)', text: '#14b8a6' },
    purple: { bg: 'rgba(139, 92, 246, 0.12)', border: 'rgba(139, 92, 246, 0.25)', text: '#8b5cf6' },
    indigo: { bg: 'rgba(99, 102, 241, 0.12)', border: 'rgba(99, 102, 241, 0.25)', text: '#6366f1' },
    gold: { bg: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245, 158, 11, 0.25)', text: '#f59e0b' },
    cyan: { bg: 'rgba(6, 182, 212, 0.12)', border: 'rgba(6, 182, 212, 0.25)', text: '#06b6d4' },
    red: { bg: 'rgba(239, 68, 68, 0.12)', border: 'rgba(239, 68, 68, 0.25)', text: '#ef4444' },
    green: { bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.25)', text: '#10b981' },
  };

  const currentTheme = colorMap[color] || colorMap.teal;

  return (
    <div 
      className="card"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1.25rem 1.5rem',
        background: 'var(--surface-card)',
        borderColor: currentTheme.border,
        boxShadow: 'var(--shadow-sm)',
        borderRadius: 'var(--radius-lg)'
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <span style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {title}
        </span>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
          <span style={{ fontSize: '1.85rem', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.5px' }}>
            {value}
          </span>
          {trend && (
            <span style={{ fontSize: '0.78rem', fontWeight: '700', color: currentTheme.text }}>
              {trend}
            </span>
          )}
        </div>
        {subtitle && (
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            {subtitle}
          </span>
        )}
      </div>

      {Icon && (
        <div 
          style={{ 
            padding: '0.85rem', 
            borderRadius: '16px', 
            background: currentTheme.bg,
            color: currentTheme.text,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Icon size={26} />
        </div>
      )}
    </div>
  );
};

export default StatCard;
