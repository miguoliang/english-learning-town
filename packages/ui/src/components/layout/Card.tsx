import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  footer?: React.ReactNode;
  variant?: 'default' | 'outlined' | 'elevated';
  elevated?: boolean;
  interactive?: boolean;
  onClick?: () => void;
  className?: string;
}

/**
 * Card - A flexible container component for grouping related content
 * 
 * Features:
 * - Multiple variants (default, outlined, elevated)
 * - Optional header with title and subtitle
 * - Optional footer section
 * - Interactive hover effects
 * - CSS-based theming
 */
export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  footer,
  variant = 'default',
  elevated = false,
  interactive = false,
  onClick,
  className = '',
}) => {
  // Build CSS classes
  const classes = [
    'elt-card',
    variant && `elt-card--${variant}`,
    elevated && 'elt-card--elevated',
    interactive && 'elt-card--interactive',
    className
  ].filter(Boolean).join(' ');

  return (
    <div
      className={classes}
      onClick={onClick}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onKeyDown={interactive ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      } : undefined}
    >
      {(title || subtitle) && (
        <div className="elt-card__header">
          {title && <h3 className="elt-card__title">{title}</h3>}
          {subtitle && <p className="elt-card__subtitle">{subtitle}</p>}
        </div>
      )}
      
      <div className="elt-card__content">
        {children}
      </div>
      
      {footer && (
        <div className="elt-card__footer">
          {footer}
        </div>
      )}
    </div>
  );
};