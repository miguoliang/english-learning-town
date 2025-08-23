import React, { forwardRef } from "react";

export interface InputProps {
  /** Input placeholder text */
  placeholder?: string;
  /** Input value (for controlled inputs) */
  value?: string;
  /** Default value (for uncontrolled inputs) */
  defaultValue?: string;
  /** Change handler */
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  /** Input type */
  type?: "text" | "email" | "password" | "number" | "tel" | "url";
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Whether input has an error, or error message */
  error?: boolean | string;
  /** Whether input is disabled */
  disabled?: boolean;
  /** Whether input should take full width */
  fullWidth?: boolean;
  /** Input label */
  label?: string;
  /** Error message */
  errorMessage?: string;
  /** Help text */
  helpText?: string;
  /** Additional CSS class name */
  className?: string;
  /** Input name attribute */
  name?: string;
  /** Input id attribute */
  id?: string;
  /** Whether input is required */
  required?: boolean;
}

/**
 * Input - A styled text input component
 *
 * Features:
 * - Multiple sizes (sm, md, lg)
 * - Error states with validation styling
 * - Label and help text support
 * - CSS-based theming
 * - Full accessibility support
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      placeholder,
      value,
      defaultValue,
      onChange,
      type = "text",
      size = "md",
      error = false,
      disabled = false,
      fullWidth = false,
      label,
      errorMessage,
      helpText,
      className = "",
      name,
      id,
      required = false,
      ...rest
    },
    ref,
  ) => {
    // Handle error prop - can be boolean or string
    const hasError = Boolean(error);
    const errorText = typeof error === "string" ? error : errorMessage;

    // Build CSS classes
    const wrapperClasses = [
      "elt-input-wrapper",
      fullWidth && "elt-input-wrapper--full",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    const inputClasses = [
      "elt-input",
      `elt-input--${size}`,
      hasError && "elt-input--error",
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div className={wrapperClasses}>
        {label && (
          <label htmlFor={id} className="elt-input__label">
            {label}
            {required && <span aria-label="required"> *</span>}
          </label>
        )}

        <input
          ref={ref}
          type={type}
          id={id}
          name={name}
          className={inputClasses}
          placeholder={placeholder}
          value={value}
          defaultValue={defaultValue}
          onChange={onChange}
          disabled={disabled}
          required={required}
          aria-invalid={hasError}
          aria-describedby={
            errorText ? `${id}-error` : helpText ? `${id}-help` : undefined
          }
          {...rest}
        />

        {errorText && (
          <div id={`${id}-error`} className="elt-input__error" role="alert">
            {errorText}
          </div>
        )}

        {helpText && !errorText && (
          <div id={`${id}-help`} className="elt-input__help">
            {helpText}
          </div>
        )}
      </div>
    );
  },
);
