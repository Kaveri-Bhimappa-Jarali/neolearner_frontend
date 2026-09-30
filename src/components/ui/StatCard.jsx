import React from 'react';
import { TrendingUp } from 'lucide-react';

const StatCard = ({ title, value, subtitle, icon: Icon, color = 'teal', trend }) => {
  const colorMap = {
    teal: { 
      bg: 'rgba(20, 184, 166, 0.14)', 
      border: 'rgba(20, 184, 166, 0.3)', 
      text: '#14b8a6', 
      glow: 'rgba(20, 184, 166, 0.15)',
      gradient: 'linear-gradient(135deg, rgba(20, 184, 166, 0.18) 0%, rgba(13, 23, 42, 0.4) 100%)'
    },
    purple: { 
      bg: 'rgba(168, 85, 247, 0.14)', 
      border: 'rgba(168, 85, 247, 0.3)', 
      text: '#c084fc', 
      glow: 'rgba(168, 85, 247, 0.15)',
      gradient: 'linear-gradient(135deg, rgba(168, 85, 247, 0.18) 0%, rgba(13, 23, 42, 0.4) 100%)'
    },
    indigo: { 
      bg: 'rgba(99, 102, 241, 0.14)', 
      border: 'rgba(99, 102, 241, 0.3)', 
      text: '#818cf8', 
      glow: 'rgba(99, 102, 241, 0.15)',
      gradient: 'linear-gradient(135deg, rgba(99, 102, 241, 0.18) 0%, rgba(13, 23, 42, 0.4) 100%)'
    },
    gold: { 
      bg: 'rgba(245, 158, 11, 0.14)', 
      border: 'rgba(245, 158, 11, 0.3)', 
      text: '#fbbf24', 
      glow: 'rgba(245, 158, 11, 0.15)',
      gradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.18) 0%, rgba(13, 23, 42, 0.4) 100%)'
    },
    cyan: { 
      bg: 'rgba(56, 189, 248, 0.14)', 
      border: 'rgba(56, 189, 248, 0.3)', 
      text: '#38bdf8', 
      glow: 'rgba(56, 189, 248, 0.15)',
      gradient: 'linear-gradient(135deg, rgba(56, 189, 248, 0.18) 0%, rgba(13, 23, 42, 0.4) 100%)'
    },
    red: { 
      bg: 'rgba(239, 68, 68, 0.14)', 
      border: 'rgba(239, 68, 68, 0.3)', 
      text: '#f87171', 
      glow: 'rgba(239, 68, 68, 0.15)',
      gradient: 'linear-gradient(135deg, rgba(239, 68, 68, 0.18) 0%, rgba(13, 23, 42, 0.4) 100%)'
    },
    green: { 
      bg: 'rgba(16, 185, 129, 0.14)', 
      border: 'rgba(16, 185, 129, 0.3)', 
      text: '#34d399', 
      glow: 'rgba(16, 185, 129, 0.15)',
      gradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.18) 0%, rgba(13, 23, 42, 0.4) 100%)'
    },
  };

  const currentTheme = colorMap[color] || colorMap.teal;

  return (
    <div 
      className="card stat-card-inner"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1.15rem 1.25rem',
        background: 'var(--surface-card)',
        border: `1px solid ${currentTheme.border}`,
        boxShadow: 'var(--shadow-sm)',
        borderRadius: '16px',
        minWidth: 0,
        boxSizing: 'border-box',
        position: 'relative',
        overflow: 'hidden',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease'
      }}
    >
      {/* Top Accent Highlight Line */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: '3px',
        background: currentTheme.text,
        opacity: 0.85
      }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', minWidth: 0, flex: 1 }}>
        <span style={{ 
          fontSize: '0.75rem', 
          fontWeight: '800', 
          color: 'var(--text-muted)', 
          textTransform: 'uppercase', 
          letterSpacing: '0.6px',
          whiteSpace: 'normal',
          wordBreak: 'normal',
          overflowWrap: 'normal',
          hyphens: 'none',
          lineHeight: '1.2'
        }}>
          {title}
        </span>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ 
            fontSize: 'clamp(1.6rem, 3.5vw, 2.1rem)', 
            fontWeight: '900', 
            color: 'var(--text-main)', 
            letterSpacing: '-0.02em', 
            lineHeight: '1.1',
            fontFamily: "'Plus Jakarta Sans', sans-serif"
          }}>
            {value}
          </span>

          {trend && (
            <span style={{ 
              fontSize: '0.72rem', 
              fontWeight: '800', 
              color: currentTheme.text,
              background: currentTheme.bg,
              padding: '2px 6px',
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
          <span style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', fontWeight: '600', lineHeight: '1.3' }}>
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
