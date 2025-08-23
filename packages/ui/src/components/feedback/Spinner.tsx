import React from "react";

export interface SpinnerProps {
  /** Size of the spinner */
  size?: "sm" | "md" | "lg";
  /** Additional CSS class name */
  className?: string;
  /** Custom color for the spinner */
  color?: string;
  /** Whether to center the spinner */
  center?: boolean;
}

/**
 * Spinner - A loading spinner component
 *
 * Features:
 * - Multiple sizes (sm, md, lg)
 * - CSS-based animations
 * - Kid-friendly design
 */
export const Spinner: React.FC<SpinnerProps> = ({
  size = "md",
  className = "",
  color,
  center = false,
}) => {
  const spinnerClasses = [
    "elt-spinner",
    `elt-spinner--${size}`,
    !center && className, // Only add className to spinner if not centering
  ]
    .filter(Boolean)
    .join(" ");

  const spinnerStyle: React.CSSProperties = color
    ? {
        borderLeftColor: color,
      }
    : {};

  const spinnerElement = (
    <div
      className={spinnerClasses}
      style={spinnerStyle}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );

  if (center) {
    return (
      <div
        className={className}
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {spinnerElement}
      </div>
    );
  }

  return spinnerElement;
};
