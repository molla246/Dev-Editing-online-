import React, { useState, useEffect } from 'react';
import { Lock } from 'lucide-react';
import { getIconCandidates } from '../utils/favicon';

interface PasswordAvatarProps {
  posterUrl?: string;
  siteUrl?: string;
  title?: string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const PasswordAvatar: React.FC<PasswordAvatarProps> = ({
  posterUrl,
  siteUrl,
  title,
  size = 42,
  className = '',
  style,
}) => {
  const [candidateIndex, setCandidateIndex] = useState<number>(0);

  const candidates = getIconCandidates(posterUrl, siteUrl, title);

  // Reset candidate index whenever inputs change
  useEffect(() => {
    setCandidateIndex(0);
  }, [posterUrl, siteUrl, title]);

  const currentIconUrl = candidateIndex < candidates.length ? candidates[candidateIndex] : null;

  const letter = title && title.trim() ? title.trim().charAt(0).toUpperCase() : '';

  // Handle image load completion - if the image is corrupted (0 or 1px), try next candidate
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const img = e.currentTarget;
    if (!img.naturalWidth || img.naturalWidth <= 1) {
      setCandidateIndex((prev) => prev + 1);
    }
  };

  if (currentIconUrl) {
    return (
      <div
        className={className}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: '10px',
          overflow: 'hidden',
          backgroundColor: '#ffffff',
          boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
          border: '1px solid rgba(0,0,0,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          position: 'relative',
          ...style,
        }}
      >
        <img
          key={currentIconUrl}
          src={currentIconUrl}
          alt={title || 'Icon'}
          referrerPolicy="no-referrer"
          loading="eager"
          onLoad={handleImageLoad}
          onError={() => setCandidateIndex((prev) => prev + 1)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            padding: '3px',
          }}
        />
      </div>
    );
  }

  // Fallback: Neat colored badge with initial letter or Lock icon
  return (
    <div
      className={className}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '10px',
        backgroundColor: 'rgba(255, 94, 54, 0.12)',
        border: '1px solid rgba(255, 94, 54, 0.22)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        fontWeight: 800,
        color: '#ff5e36',
        fontSize: `${Math.max(12, Math.round(size * 0.45))}px`,
        textTransform: 'uppercase',
        ...style,
      }}
    >
      {letter ? letter : <Lock size={Math.round(size * 0.48)} color="#ff5e36" />}
    </div>
  );
};
