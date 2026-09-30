import React from 'react';
import { TrendingUp } from 'lucide-react';

const StatCard = ({ title, value, subtitle, icon: Icon, color = 'teal', trend }) => {
  const colorMap = {
    teal: { 
      bg: 'rgba(20, 184, 166, 0.12)', 
      border: 'rgba(20, 184, 166, 0.28)', 
      text: '#2dd4bf', 
      glow: 'rgba(20, 184, 166, 0.12)',
      gradient: 'linear-gradient(135deg, rgba(20, 184, 166, 0.15) 0%, rgba(11, 15, 25, 0.5) 100%)'
    },
    purple: { 
      bg: 'rgba(168, 85, 247, 0.12)', 
      border: 'rgba(168, 85, 247, 0.28)', 
      text: '#c084fc', 
      glow: 'rgba(168, 85, 247, 0.12)',
      gradient: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(11, 15, 25, 0.5) 100%)'
    },
    indigo: { 
      bg: 'rgba(99, 102, 241, 0.12)', 
      border: 'rgba(99, 102, 241, 0.28)', 
      text: '#a5b4fc', 
      glow: 'rgba(99, 102, 241, 0.12)',
      gradient: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(11, 15, 25, 0.5) 100%)'
    },
    gold: { 
      bg: 'rgba(245, 158, 11, 0.12)', 
      border: 'rgba(212, 175, 55, 0.35)', 
      text: '#fbbf24', 
      glow: 'rgba(245, 158, 11, 0.15)',
      gradient: 'linear-gradient(135deg, rgba(212, 175, 55, 0.18) 0%, rgba(11, 15, 25, 0.5) 100%)'
    }
  };

  const currentTheme = colorMap[color] || colorMap.teal;

  return (
    <div 
      className="card stat-card-inner"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1.2rem 1.25rem',
        background: 'rgba(17, 24, 39, 0.75)',
        backdropFilter: 'blur(16px)',
        border: `1px solid ${currentTheme.border}`,
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
        borderRadius: '16px',
        minWidth: 0,
        boxSizing: 'border-box',
        position: 'relative',
        overflow: 'hidden',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease'
      }}
    >
      {/* Subtle Top Accent Highlight Line */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: '2px',
        background: currentTheme.text,
        opacity: 0.9
      }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: 0, flex: 1 }}>
        <span style={{ 
          fontSize: '0.75rem', 
          fontWeight: '800', 
          color: '#94a3b8', 
          textTransform: 'uppercase', 
          letterSpacing: '0.06em',
          lineHeight: '1.2'
        }}>
          {title}
        </span>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap', marginTop: '2px' }}>
          <span style={{ 
            fontSize: 'clamp(1.8rem, 4vw, 2.3rem)', 
            fontWeight: '900', 
            color: '#f8fafc', 
            letterSpacing: '-0.02em', 
            lineHeight: '1.05',
            fontFamily: "'Plus Jakarta Sans', sans-serif"
          }}>
            {value}
          </span>

          {trend && (
            <span style={{ 
              fontSize: '0.7rem', 
              fontWeight: '800', 
              color: currentTheme.text,
              background: currentTheme.bg,
              padding: '2px 7px',
              borderRadius: '6px',
              border: `1px solid ${currentTheme.border}`,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px'
            }}>
              <TrendingUp size={11} /> {trend}
            </span>
          )}
        </div>

        {subtitle && (
          <span style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: '600', lineHeight: '1.3', marginTop: '2px' }}>
            {subtitle}
          </span>
        )}
      </div>

      {Icon && (
        <div 
          style={{ 
            width: '46px',
            height: '46px',
            borderRadius: '14px', 
            background: currentTheme.gradient,
            border: `1px solid ${currentTheme.border}`,
            color: currentTheme.text,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            marginLeft: '0.75rem',
            boxShadow: `0 4px 14px ${currentTheme.glow}`
          }}
        >
          <Icon size={22} />
        </div>
      )}
    </div>
  );
};

export default StatCard;
