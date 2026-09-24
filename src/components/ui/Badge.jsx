import React from 'react';

const Badge = ({ children, variant = 'teal', size = 'medium', icon: Icon }) => {
  const variantStyles = {
    teal: { bg: 'rgba(20, 184, 166, 0.15)', color: '#14b8a6', border: 'rgba(20, 184, 166, 0.3)' },
    purple: { bg: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6', border: 'rgba(139, 92, 246, 0.3)' },
    indigo: { bg: 'rgba(99, 102, 241, 0.15)', color: '#6366f1', border: 'rgba(99, 102, 241, 0.3)' },
    gold: { bg: 'rgba(245, 158, 11, 0.18)', color: '#f59e0b', border: 'rgba(245, 158, 11, 0.35)' },
    cyan: { bg: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4', border: 'rgba(6, 182, 212, 0.3)' },
    green: { bg: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: 'rgba(16, 185, 129, 0.3)' },
    red: { bg: 'rgba(239, 68, 68, 0.18)', color: '#ef4444', border: 'rgba(239, 68, 68, 0.35)' },
  };

  const currentStyle = variantStyles[variant] || variantStyles.teal;

  const sizePadding = size === 'small' ? '0.2rem 0.6rem' : '0.35rem 0.85rem';
  const fontSize = size === 'small' ? '0.7rem' : '0.78rem';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: sizePadding,
        borderRadius: '9999px',
        background: currentStyle.bg,
        color: currentStyle.color,
        border: `1px solid ${currentStyle.border}`,
        fontWeight: '800',
        fontSize: fontSize,
        letterSpacing: '0.4px',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap'
      }}
    >
      {Icon && <Icon size={size === 'small' ? 12 : 14} />}
      {children}
    </span>
  );
};

export default Badge;
