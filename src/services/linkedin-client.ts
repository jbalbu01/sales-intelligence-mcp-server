/**
 * LinkedIn Sales Navigator API Client
 *
 * Extracted from linkedin-tools.ts to match the service-per-client
 * pattern used by Gong, ZoomInfo, and Clay clients.
 *
 * Requires SNAP partner access or LinkedIn Sales Navigator API subscription.
 * Set the LINKEDIN_ACCESS_TOKEN environment variable.
 */

import axios from "axios";
import { LINKEDIN_API_BASE_URL, API_TIMEOUT } from "../constants.js";

// ─── Auth ────────────────────────────────────────────────────

function getHeaders(): Record<string, string> {
  const token = process.env.LINKEDIN_ACCESS_TOKEN;
  if (!token) {
    throw new Error(
      "LinkedIn credentials not configured. Set LINKEDIN_ACCESS_TOKEN environment variable. " +
        "Requires LinkedIn SNAP partner access or a LinkedIn Sales Navigator API subscription.",
    );
  }
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-Restli-Protocol-Version": "2.0.0",
  };
}

// ─── HTTP helpers ────────────────────────────────────────────

export async function linkedInGet<T>(endpoint: string, params?: Record<string, unknown>): Promise<T> {
  const response = await axios.get<T>(`${LINKEDIN_API_BASE_URL}${endpoint}`, {
    params,
    headers: getHeaders(),
    timeout: API_TIMEOUT,
  });
  return response.data;
}

export async function linkedInPost<T>(endpoint: string, data?: Record<string, unknown>): Promise<T> {
  const response = await axios.post<T>(`${LINKEDIN_API_BASE_URL}${endpoint}`, data, {
    headers: getHeaders(),
    timeout: API_TIMEOUT,
  });
  return response.data;
}

// ─── Config check ────────────────────────────────────────────

export function isLinkedInConfigured(): boolean {
  return Boolean(process.env.LINKEDIN_ACCESS_TOKEN);
}
