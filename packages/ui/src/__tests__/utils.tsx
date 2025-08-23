import React from "react";
import { render, type RenderOptions } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

/**
 * Test wrapper component that provides CSS context
 */
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="elt-test-wrapper">{children}</div>
);

/**
 * Custom render function that includes theme context
 */
export const renderWithTheme = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, "wrapper">,
) => {
  return {
    user: userEvent.setup(),
    ...render(ui, { wrapper: TestWrapper, ...options }),
  };
};

/**
 * Re-export everything from testing library
 */
export * from "@testing-library/react";
export { default as userEvent } from "@testing-library/user-event";
