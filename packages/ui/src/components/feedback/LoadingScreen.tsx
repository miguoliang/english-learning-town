import React from "react";
import { Spinner } from "./Spinner";
import { AnimatedEmoji } from "../basic/AnimatedEmoji";

export interface LoadingScreenProps {
  /** Loading title */
  title?: string;
  /** Loading message */
  message?: string;
  /** Loading subtitle (alias for message) */
  subtitle?: string;
  /** Progress percentage (0-100) */
  progress?: number;
  /** Show spinner */
  showSpinner?: boolean;
  /** Spinner size */
  spinnerSize?: "sm" | "md" | "lg";
  /** Show animated emoji */
  showEmoji?: boolean;
  /** Emoji to display */
  emoji?: string;
  /** Additional CSS class name */
  className?: string;
  /** Loading hints to display */
  hints?: string[];
  /** Whether to cover full screen */
  fullScreen?: boolean;
}

/**
 * LoadingScreen - A full-screen loading component
 *
 * Features:
 * - Customizable title and message
 * - Optional spinner and emoji
 * - Kid-friendly design
 * - CSS-based theming
 */
export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  title = "Loading...",
  message = "Please wait while we prepare your learning adventure!",
  subtitle,
  progress,
  showSpinner = true,
  spinnerSize = "lg",
  showEmoji = true,
  emoji = "🎓",
  className = "",
  hints,
  fullScreen = false,
}) => {
  // Use subtitle as message if provided
  const displayMessage = subtitle || message;

  const classes = [
    "elt-loading",
    fullScreen && "elt-loading--fullscreen",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={classes}
      aria-live="polite"
      style={
        fullScreen
          ? {
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }
          : undefined
      }
    >
      {showEmoji && <AnimatedEmoji emoji={emoji} mood="thinking" size="3rem" />}

      <h1 className="elt-loading__title">{title}</h1>

      <p className="elt-loading__message">{displayMessage}</p>

      {progress !== undefined && (
        <div
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          className="elt-loading__progress"
        >
          <div
            className="elt-loading__progress-bar"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {hints && hints.length > 0 && (
        <div className="elt-loading__hints">
          {hints.map((hint, index) => (
            <p key={index} className="elt-loading__hint">
              💡 Tip: {hint}
            </p>
          ))}
        </div>
      )}

      {showSpinner && <Spinner size={spinnerSize} />}
    </div>
  );
};
