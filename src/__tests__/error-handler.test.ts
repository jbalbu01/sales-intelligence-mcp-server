import { describe, it, expect } from "vitest";
import { AxiosError, AxiosHeaders } from "axios";
import { handleApiError, truncateResponse } from "../services/error-handler.js";

// ─── handleApiError ──────────────────────────────────────────

describe("handleApiError", () => {
  it("returns a 400 message for bad requests", () => {
    const error = new AxiosError("Bad Request", "ERR_BAD_REQUEST", undefined, undefined, {
      status: 400,
      data: { message: "Invalid parameter" },
      statusText: "Bad Request",
      headers: {},
      config: { headers: new AxiosHeaders() },
    });
    const result = handleApiError(error, "TestService");
    expect(result).toContain("TestService");
    expect(result).toContain("Bad request");
    expect(result).toContain("Invalid parameter");
  });

  it("returns a 401 message for auth failures", () => {
    const error = new AxiosError("Unauthorized", "ERR_BAD_RESPONSE", undefined, undefined, {
      status: 401,
      data: {},
      statusText: "Unauthorized",
      headers: {},
      config: { headers: new AxiosHeaders() },
    });
    const result = handleApiError(error, "Gong");
    expect(result).toContain("Gong");
    expect(result).toContain("Authentication failed");
  });

  it("returns a 403 message for permission errors", () => {
    const error = new AxiosError("Forbidden", "ERR_BAD_RESPONSE", undefined, undefined, {
      status: 403,
      data: {},
      statusText: "Forbidden",
      headers: {},
      config: { headers: new AxiosHeaders() },
    });
    const result = handleApiError(error, "Clay");
    expect(result).toContain("Permission denied");
  });

  it("returns a 404 message for missing resources", () => {
    const error = new AxiosError("Not Found", "ERR_BAD_RESPONSE", undefined, undefined, {
      status: 404,
      data: { message: "Call not found" },
      statusText: "Not Found",
      headers: {},
      config: { headers: new AxiosHeaders() },
    });
    const result = handleApiError(error, "Gong");
    expect(result).toContain("Resource not found");
    expect(result).toContain("Call not found");
  });

  it("returns a 429 message for rate limits", () => {
    const error = new AxiosError("Too Many Requests", "ERR_BAD_RESPONSE", undefined, undefined, {
      status: 429,
      data: {},
      statusText: "Too Many Requests",
      headers: {},
      config: { headers: new AxiosHeaders() },
    });
    const result = handleApiError(error, "ZoomInfo");
    expect(result).toContain("Rate limit");
  });

  it("returns a 5xx message for server errors", () => {
    for (const status of [500, 502, 503]) {
      const error = new AxiosError("Server Error", "ERR_BAD_RESPONSE", undefined, undefined, {
        status,
        data: {},
        statusText: "Server Error",
        headers: {},
        config: { headers: new AxiosHeaders() },
      });
      const result = handleApiError(error, "Clay");
      expect(result).toContain("temporarily unavailable");
      expect(result).toContain(String(status));
    }
  });

  it("handles ECONNABORTED (timeout)", () => {
    const error = new AxiosError("timeout", "ECONNABORTED");
    const result = handleApiError(error, "LinkedIn");
    expect(result).toContain("timed out");
  });

  it("handles ECONNREFUSED", () => {
    const error = new AxiosError("connection refused", "ECONNREFUSED");
    const result = handleApiError(error, "Gong");
    expect(result).toContain("Connection refused");
  });

  it("handles generic Error objects", () => {
    const error = new Error("Something broke");
    const result = handleApiError(error, "Clay");
    expect(result).toBe("Clay Error: Something broke");
  });

  it("handles unknown error types", () => {
    const result = handleApiError("string-error", "ZoomInfo");
    expect(result).toBe("ZoomInfo Error: An unexpected error occurred.");
  });
});

// ─── truncateResponse ────────────────────────────────────────

describe("truncateResponse", () => {
  it("returns text unchanged when under limit", () => {
    const text = "Hello world";
    expect(truncateResponse(text, 100)).toBe(text);
  });

  it("returns text unchanged when exactly at limit", () => {
    const text = "a".repeat(100);
    expect(truncateResponse(text, 100)).toBe(text);
  });

  it("truncates and appends warning when over limit", () => {
    const text = "a".repeat(500);
    const result = truncateResponse(text, 300);
    expect(result.length).toBeLessThan(500);
    expect(result).toContain("truncated");
    expect(result).toContain("500");
  });

  it("preserves content before truncation point", () => {
    const text = "KEEP_THIS" + "x".repeat(500);
    const result = truncateResponse(text, 300);
    expect(result).toContain("KEEP_THIS");
  });
});
