/**
 * Gong MCP Tools — Unit Tests
 *
 * Validates tool handler behavior using mocked API responses.
 * Tests cover: successful responses (markdown + JSON), empty results,
 * pagination cursors, and API error propagation.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerGongTools } from "../tools/gong-tools.js";

// ─── Mock the Gong client ────────────────────────────────────
// vi.mock hoists to the top of the file automatically.

vi.mock("../services/gong-client.js", () => ({
  gongPost: vi.fn(),
  gongGet: vi.fn(),
  isGongConfigured: vi.fn(() => true),
}));

import { gongPost } from "../services/gong-client.js";
const mockGongPost = vi.mocked(gongPost);

// ─── Helper: capture registered tool handlers ────────────────
// McpServer.registerTool stores the callback; we intercept it
// so we can call handlers directly without spinning up transport.

type ToolHandler = (
  params: Record<string, unknown>,
) => Promise<{ content: { type: string; text: string }[]; isError?: boolean }>;

function captureTools(): Record<string, ToolHandler> {
  const tools: Record<string, ToolHandler> = {};
  const fakeServer = {
    registerTool: (name: string, _config: unknown, handler: ToolHandler) => {
      tools[name] = handler;
    },
  } as unknown as McpServer;
  registerGongTools(fakeServer);
  return tools;
}

// ─── Fixtures ────────────────────────────────────────────────

const sampleCall = {
  id: "call-001",
  title: "Discovery Call — Acme Corp",
  started: "2024-01-15T14:00:00Z",
  duration: 1800,
  url: "https://app.gong.io/call?id=call-001",
  direction: "Outbound",
  scope: "External",
  parties: [
    { id: "p1", name: "Alice Smith", emailAddress: "alice@acme.com", affiliation: "external", title: "VP Sales" },
    { id: "p2", name: "Bob Jones", emailAddress: "bob@myco.com", affiliation: "internal" },
  ],
};

const sampleTranscript = {
  callId: "call-001",
  transcript: [
    { start: 0, end: 5000, text: "Welcome everyone.", speakerId: "p1" },
    { start: 5000, end: 12000, text: "Thanks for joining.", speakerId: "p2" },
    { start: 12000, end: 20000, text: "Let me share the agenda.", speakerId: "p1" },
  ],
};

const sampleCallDetails = {
  metaData: sampleCall,
  content: {
    topics: [
      { name: "Pricing", duration: 300 },
      { name: "Timeline", duration: 180 },
    ],
    trackers: [{ name: "Competitor mention", count: 2, occurrences: [{ startTime: 600 }] }],
    pointsOfInterest: {
      actionItems: [{ snippet: "Send updated proposal by Friday", speakerId: "p2" }],
    },
  },
  interaction: {
    interactionStats: [{ name: "talkRatio", value: 0.42 }],
    speakers: [
      { id: "p1", talkTime: 900 },
      { id: "p2", talkTime: 750 },
    ],
  },
};

// ─── Tests ───────────────────────────────────────────────────

describe("Gong Tools", () => {
  let tools: Record<string, ToolHandler>;

  beforeEach(() => {
    vi.clearAllMocks();
    tools = captureTools();
  });

  // ── Registration ──────────────────────────────────────────

  it("registers all 5 Gong tools", () => {
    expect(Object.keys(tools)).toEqual([
      "gong_search_calls",
      "gong_get_transcript",
      "gong_get_call_details",
      "gong_search_calls_by_participant",
      "gong_get_call_stats",
    ]);
  });

  // ── gong_search_calls ─────────────────────────────────────

  describe("gong_search_calls", () => {
    it("returns markdown-formatted call list", async () => {
      mockGongPost.mockResolvedValueOnce({
        calls: [sampleCall],
        records: { totalRecords: 1 },
      });

      const result = await tools.gong_search_calls({
        from_date: "2024-01-01T00:00:00Z",
        to_date: "2024-02-01T00:00:00Z",
        response_format: "markdown",
      });

      expect(result.content[0].text).toContain("# Gong Calls");
      expect(result.content[0].text).toContain("Discovery Call");
      expect(result.content[0].text).toContain("Alice Smith");
      expect(result.content[0].text).toContain("30m 0s");
      expect(result.isError).toBeUndefined();
    });

    it("returns JSON when requested", async () => {
      mockGongPost.mockResolvedValueOnce({
        calls: [sampleCall],
        records: { totalRecords: 1 },
      });

      const result = await tools.gong_search_calls({
        from_date: "2024-01-01T00:00:00Z",
        to_date: "2024-02-01T00:00:00Z",
        response_format: "json",
      });

      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.total).toBe(1);
      expect(parsed.calls[0].id).toBe("call-001");
    });

    it("handles empty results gracefully", async () => {
      mockGongPost.mockResolvedValueOnce({ calls: [], records: {} });

      const result = await tools.gong_search_calls({
        from_date: "2024-01-01T00:00:00Z",
        to_date: "2024-02-01T00:00:00Z",
        response_format: "markdown",
      });

      expect(result.content[0].text).toContain("No calls found");
    });

    it("includes pagination cursor when present", async () => {
      mockGongPost.mockResolvedValueOnce({
        calls: [sampleCall],
        records: { totalRecords: 50, cursor: "next-page-abc" },
      });

      const result = await tools.gong_search_calls({
        from_date: "2024-01-01T00:00:00Z",
        to_date: "2024-02-01T00:00:00Z",
        response_format: "markdown",
      });

      expect(result.content[0].text).toContain("next-page-abc");
    });

    it("returns isError on API failure", async () => {
      mockGongPost.mockRejectedValueOnce(new Error("Network timeout"));

      const result = await tools.gong_search_calls({
        from_date: "2024-01-01T00:00:00Z",
        to_date: "2024-02-01T00:00:00Z",
        response_format: "markdown",
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain("Gong Error");
    });
  });

  // ── gong_get_transcript ───────────────────────────────────

  describe("gong_get_transcript", () => {
    it("returns markdown transcript with speaker labels", async () => {
      mockGongPost.mockResolvedValueOnce({ callTranscripts: [sampleTranscript] });

      const result = await tools.gong_get_transcript({
        call_id: "call-001",
        response_format: "markdown",
      });

      expect(result.content[0].text).toContain("# Transcript");
      expect(result.content[0].text).toContain("Speaker p1");
      expect(result.content[0].text).toContain("Welcome everyone.");
      expect(result.content[0].text).toContain("Thanks for joining.");
    });

    it("returns JSON transcript when requested", async () => {
      mockGongPost.mockResolvedValueOnce({ callTranscripts: [sampleTranscript] });

      const result = await tools.gong_get_transcript({
        call_id: "call-001",
        response_format: "json",
      });

      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.callId).toBe("call-001");
      expect(parsed.sentences).toHaveLength(3);
    });

    it("handles missing transcript", async () => {
      mockGongPost.mockResolvedValueOnce({ callTranscripts: [] });

      const result = await tools.gong_get_transcript({
        call_id: "call-999",
        response_format: "markdown",
      });

      expect(result.content[0].text).toContain("No transcript available");
    });
  });

  // ── gong_get_call_details ─────────────────────────────────

  describe("gong_get_call_details", () => {
    it("returns full markdown details with topics, trackers, and action items", async () => {
      mockGongPost.mockResolvedValueOnce({ calls: [sampleCallDetails] });

      const result = await tools.gong_get_call_details({
        call_id: "call-001",
        response_format: "markdown",
      });

      const text = result.content[0].text;
      expect(text).toContain("# Call Details");
      expect(text).toContain("Pricing");
      expect(text).toContain("Timeline");
      expect(text).toContain("Competitor mention");
      expect(text).toContain("Send updated proposal by Friday");
      expect(text).toContain("Speaker p1");
      expect(text).toContain("talkRatio");
    });

    it("handles call with no details", async () => {
      mockGongPost.mockResolvedValueOnce({ calls: [] });

      const result = await tools.gong_get_call_details({
        call_id: "call-999",
        response_format: "markdown",
      });

      expect(result.content[0].text).toContain("No details found");
    });
  });

  // ── gong_search_calls_by_participant ──────────────────────

  describe("gong_search_calls_by_participant", () => {
    it("filters calls by participant email", async () => {
      mockGongPost.mockResolvedValueOnce({
        calls: [sampleCall],
        records: { totalRecords: 1 },
      });

      const result = await tools.gong_search_calls_by_participant({
        email: "alice@acme.com",
        from_date: "2024-01-01T00:00:00Z",
        to_date: "2024-02-01T00:00:00Z",
        response_format: "markdown",
      });

      expect(result.content[0].text).toContain("alice@acme.com");
      expect(result.content[0].text).toContain("Discovery Call");

      // Verify the API was called with the email filter
      expect(mockGongPost).toHaveBeenCalledWith("/calls", {
        filter: {
          fromDateTime: "2024-01-01T00:00:00Z",
          toDateTime: "2024-02-01T00:00:00Z",
          callParticipantsEmailAddresses: ["alice@acme.com"],
        },
      });
    });

    it("handles no calls for participant", async () => {
      mockGongPost.mockResolvedValueOnce({ calls: [], records: {} });

      const result = await tools.gong_search_calls_by_participant({
        email: "nobody@example.com",
        from_date: "2024-01-01T00:00:00Z",
        to_date: "2024-02-01T00:00:00Z",
        response_format: "markdown",
      });

      expect(result.content[0].text).toContain("No calls found");
      expect(result.content[0].text).toContain("nobody@example.com");
    });
  });

  // ── gong_get_call_stats ───────────────────────────────────

  describe("gong_get_call_stats", () => {
    it("computes aggregate stats from call data", async () => {
      const calls = [
        { ...sampleCall, duration: 1800, direction: "Outbound" },
        { ...sampleCall, id: "call-002", duration: 900, direction: "Inbound", parties: [] },
        { ...sampleCall, id: "call-003", duration: 2700, direction: "Outbound" },
      ];
      mockGongPost.mockResolvedValueOnce({ calls, records: { totalRecords: 3 } });

      const result = await tools.gong_get_call_stats({
        from_date: "2024-01-01T00:00:00Z",
        to_date: "2024-02-01T00:00:00Z",
        response_format: "markdown",
      });

      const text = result.content[0].text;
      expect(text).toContain("Total Calls**: 3");
      expect(text).toContain("Outbound");
      expect(text).toContain("Inbound");
      expect(text).toContain("Most Active Participants");
    });

    it("returns JSON stats when requested", async () => {
      mockGongPost.mockResolvedValueOnce({
        calls: [sampleCall],
        records: { totalRecords: 1 },
      });

      const result = await tools.gong_get_call_stats({
        from_date: "2024-01-01T00:00:00Z",
        to_date: "2024-02-01T00:00:00Z",
        response_format: "json",
      });

      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.totalCalls).toBe(1);
      expect(parsed.averageDurationSeconds).toBe(1800);
      expect(parsed.directionBreakdown).toHaveProperty("Outbound");
      expect(parsed.topParticipants).toHaveLength(2);
    });

    it("handles zero calls", async () => {
      mockGongPost.mockResolvedValueOnce({ calls: [], records: { totalRecords: 0 } });

      const result = await tools.gong_get_call_stats({
        from_date: "2024-06-01T00:00:00Z",
        to_date: "2024-06-30T00:00:00Z",
        response_format: "json",
      });

      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.totalCalls).toBe(0);
      expect(parsed.averageDurationSeconds).toBe(0);
    });
  });
});
