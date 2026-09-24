import React from 'react';

const Skeleton = ({ width = '100%', height = '20px', borderRadius = 'var(--radius-sm)', style }) => {
  return (
    <div 
      style={{
        width,
        height,
        borderRadius,
        background: 'linear-gradient(90deg, var(--surface) 25%, var(--surface-hover) 50%, var(--surface) 75%)',
        backgroundSize: '200% 100%',
        animation: 'skeletonShimmer 1.5s infinite linear',
        ...style
      }}
    />
  );
};

export const SkeletonCard = () => (
  <div className="card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
    <Skeleton width="40%" height="24px" />
    <Skeleton width="80%" height="16px" />
    <Skeleton width="100%" height="48px" borderRadius="var(--radius-md)" />
  </div>
);

export default Skeleton;
