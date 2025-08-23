import { describe, it, expect } from "vitest";
import {
  getDefaultErrorTitle,
  getDefaultErrorMessage,
  getErrorFallbackButtonSize,
  getErrorFallbackEmojiSize,
  shouldShowErrorCode,
  shouldShowRefreshButton,
} from "../utils/errorFallbackHelpers";

describe("errorFallbackHelpers", () => {
  describe("getDefaultErrorTitle", () => {
    it("returns correct title for minimal variant", () => {
      expect(getDefaultErrorTitle("minimal")).toBe("Error");
    });

    it("returns correct title for fullscreen variant", () => {
      expect(getDefaultErrorTitle("fullscreen")).toBe("Application Error");
    });

    it("returns correct title for detailed variant", () => {
      expect(getDefaultErrorTitle("detailed")).toBe("Something went wrong");
    });
  });

  describe("getDefaultErrorMessage", () => {
    it("returns correct message for minimal variant", () => {
      expect(getDefaultErrorMessage("minimal")).toBe("Please try again.");
    });

    it("returns correct message for fullscreen variant", () => {
      expect(getDefaultErrorMessage("fullscreen")).toBe(
        "The application encountered an unexpected error. Please refresh the page or contact support if the problem persists.",
      );
    });

    it("returns correct message for detailed variant", () => {
      expect(getDefaultErrorMessage("detailed")).toBe(
        "An unexpected error occurred. Please try again or refresh the page.",
      );
    });
  });

  describe("getErrorFallbackButtonSize", () => {
    it("returns sm for minimal variant", () => {
      expect(getErrorFallbackButtonSize("minimal")).toBe("sm");
    });

    it("returns lg for fullscreen variant", () => {
      expect(getErrorFallbackButtonSize("fullscreen")).toBe("lg");
    });

    it("returns md for detailed variant", () => {
      expect(getErrorFallbackButtonSize("detailed")).toBe("md");
    });
  });

  describe("getErrorFallbackEmojiSize", () => {
    it("returns correct size for minimal variant", () => {
      expect(getErrorFallbackEmojiSize("minimal")).toBe("1.5rem");
    });

    it("returns correct size for fullscreen variant", () => {
      expect(getErrorFallbackEmojiSize("fullscreen")).toBe("3rem");
    });

    it("returns correct size for detailed variant", () => {
      expect(getErrorFallbackEmojiSize("detailed")).toBe("2rem");
    });
  });

  describe("shouldShowErrorCode", () => {
    it("returns false for minimal variant", () => {
      expect(shouldShowErrorCode("minimal")).toBe(false);
    });

    it("returns true for fullscreen variant", () => {
      expect(shouldShowErrorCode("fullscreen")).toBe(true);
    });

    it("returns true for detailed variant", () => {
      expect(shouldShowErrorCode("detailed")).toBe(true);
    });
  });

  describe("shouldShowRefreshButton", () => {
    it("returns false for minimal variant", () => {
      expect(shouldShowRefreshButton("minimal")).toBe(false);
    });

    it("returns true for fullscreen variant", () => {
      expect(shouldShowRefreshButton("fullscreen")).toBe(true);
    });

    it("returns true for detailed variant", () => {
      expect(shouldShowRefreshButton("detailed")).toBe(true);
    });
  });
});
