import React from 'react';

const EmptyState = ({ 
  icon: Icon, 
  title = 'No items found', 
  description = 'There are no items to display at this time.', 
  actionLabel, 
  onAction 
}) => {
  return (
    <div 
      className="card"
      style={{
        textAlign: 'center',
        padding: '3.5rem 2rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justify-content: 'center',
        background: 'var(--surface-card)',
        borderRadius: 'var(--radius-xl)',
        border: '1px dashed var(--border-color)',
        maxWidth: '560px',
        margin: '2rem auto'
      }}
    >
      {Icon && (
        <div 
          style={{
            padding: '1.25rem',
            borderRadius: '50%',
            background: 'rgba(20, 184, 166, 0.12)',
            color: 'var(--primary-color)',
            marginBottom: '1.25rem'
          }}
        >
          <Icon size={36} />
        </div>
      )}
      <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
        {title}
      </h3>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '420px', marginBottom: actionLabel ? '1.5rem' : '0' }}>
        {description}
      </p>
      {actionLabel && onAction && (
        <button onClick={onAction} className="btn btn-primary" style={{ padding: '0.7rem 1.75rem', fontWeight: '700' }}>
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
