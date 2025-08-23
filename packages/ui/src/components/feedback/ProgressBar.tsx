import React from "react";
import { AnimatedEmoji } from "../basic/AnimatedEmoji";

export interface Milestone {
  position: number; // 0-100
  emoji: string;
  label?: string;
}

export interface ProgressBarProps {
  /** Current progress value (0-100) */
  progress: number;
  /** Optional label text */
  label?: string;
  /** Show percentage text */
  showPercentage?: boolean;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Color variant */
  variant?: "default" | "success" | "warning" | "error";
  /** Enable animations */
  animated?: boolean;
  /** Milestones to show on progress bar */
  milestones?: Milestone[];
  /** Custom class name */
  className?: string;
}

/**
 * ProgressBar - A visual progress indicator with optional milestones
 *
 * Features:
 * - Multiple sizes and color variants
 * - Optional percentage display
 * - Milestone markers with emojis
 * - Smooth animations
 * - CSS-based theming
 */
export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  label,
  showPercentage = true,
  size = "md",
  variant = "default",
  animated = true,
  milestones = [],
  className = "",
}) => {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  // Build CSS classes
  const containerClasses = ["elt-progress", className]
    .filter(Boolean)
    .join(" ");

  const trackClasses = ["elt-progress__track", `elt-progress__track--${size}`]
    .filter(Boolean)
    .join(" ");

  const fillClasses = [
    "elt-progress__fill",
    `elt-progress__fill--${variant}`,
    animated && "elt-progress__fill--animated",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={containerClasses}>
      {(label || showPercentage) && (
        <div className="elt-progress__label">
          <span className="elt-progress__text">{label || ""}</span>
          {showPercentage && (
            <span className="elt-progress__percentage">
              {Math.round(clampedProgress)}%
            </span>
          )}
        </div>
      )}

      <div className={trackClasses} style={{ position: "relative" }}>
        <div className={fillClasses} style={{ width: `${clampedProgress}%` }} />

        {milestones.map((milestone, index) => (
          <div
            key={index}
            className={`elt-progress__milestone ${
              clampedProgress >= milestone.position
                ? "elt-progress__milestone--achieved"
                : "elt-progress__milestone--pending"
            }`}
            style={{ left: `${milestone.position}%` }}
            title={milestone.label}
          >
            <AnimatedEmoji
              emoji={milestone.emoji}
              mood={
                clampedProgress >= milestone.position ? "happy" : "thinking"
              }
              size="1.2rem"
            />
          </div>
        ))}
      </div>
    </div>
  );
};
