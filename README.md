# Sales Intelligence MCP Server

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)](https://www.typescriptlang.org/)
[![MCP SDK](https://img.shields.io/badge/MCP_SDK-1.6-purple)](https://modelcontextprotocol.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![CI](https://github.com/jbalbu01/sales-intelligence-mcp-server/actions/workflows/ci.yml/badge.svg)](https://github.com/jbalbu01/sales-intelligence-mcp-server/actions/workflows/ci.yml)

A unified [Model Context Protocol](https://modelcontextprotocol.io/) server that gives AI assistants real-time access to your sales stack — **Gong**, **ZoomInfo**, **Clay**, and **LinkedIn Sales Navigator** — through 16 tools in a single integration.

## Why This Exists

Sales teams live across four or five tabs. This server collapses them into one MCP integration so Claude can pull call transcripts, enrich a lead, check a company's tech stack, and find decision-makers — all in a single conversation.

## Architecture

```
src/
├── index.ts              # Server entry point & status tool
├── constants.ts          # Shared API URLs, limits, timeouts
├── types.ts              # TypeScript interfaces for all services
├── services/
│   ├── gong-client.ts        # Gong API — Basic Auth
│   ├── zoominfo-client.ts    # ZoomInfo API — JWT with auto-refresh
│   ├── clay-client.ts        # Clay API — API Key
│   ├── linkedin-client.ts    # LinkedIn API — OAuth Bearer
│   └── error-handler.ts      # Shared HTTP error handling
└── tools/
    ├── gong-tools.ts         # 5 tools — calls, transcripts, analytics
    ├── zoominfo-tools.ts     # 4 tools — companies, contacts, org charts, tech
    ├── clay-tools.ts         # 3 tools — person/company enrichment, webhooks
    └── linkedin-tools.ts     # 3 tools — lead search, profiles, company search
```

**Key design decisions:**

- **One service client per API** — each client manages its own auth strategy (Basic, JWT, API Key, OAuth Bearer).
- **Graceful degradation** — tools for unconfigured services return setup instructions instead of crashing.
- **Zod `.strict()` validation** — all tool inputs are validated; extra fields are rejected, not silently ignored.
- **Response truncation** — long responses are truncated to stay within MCP payload limits (25 000 chars).

## Tools (16 total)

| Service | Tool | Description |
|---------|------|-------------|
| **Gong** | `gong_search_calls` | Search call recordings by date range, keywords, or filters |
| | `gong_get_transcript` | Get the full transcript for a specific call |
| | `gong_get_call_details` | Get metadata and participants for a call |
| | `gong_search_calls_by_participant` | Find calls by email address |
| | `gong_get_call_stats` | Get aggregate call analytics |
| **ZoomInfo** | `zoominfo_search_company` | Search companies by name, domain, industry, size, tech |
| | `zoominfo_search_contact` | Search contacts by name, title, company, seniority |
| | `zoominfo_get_org_chart` | Get organizational hierarchy for a company |
| | `zoominfo_get_tech_stack` | Get technology stack for a company |
| **Clay** | `clay_enrich_person` | Enrich a person via email, LinkedIn URL, or name |
| | `clay_enrich_company` | Enrich a company via domain or name |
| | `clay_trigger_enrichment` | Trigger a Clay table webhook enrichment |
| **LinkedIn** | `linkedin_search_leads` | Search leads by title, company, seniority, geography |
| | `linkedin_get_profile` | Get a detailed LinkedIn profile |
| | `linkedin_search_companies` | Search companies on LinkedIn |
| **Status** | `sales_intel_status` | Check which services are configured |

## Quick Start

### Prerequisites

- Node.js 20+
- API credentials for one or more services (see below)

### Install & Build

```bash
git clone https://github.com/jbalbu01/sales-intelligence-mcp-server.git
cd sales-intelligence-mcp-server
npm install
npm run build
```

### Configure

Copy the example environment file and fill in credentials for the services you use:

```bash
cp .env.example .env
```

| Service | Variables | Where to get them |
|---------|-----------|-------------------|
| Gong | `GONG_ACCESS_KEY`, `GONG_ACCESS_KEY_SECRET` | Gong Settings > Integrations > API |
| ZoomInfo | `ZOOMINFO_CLIENT_ID`, `ZOOMINFO_PRIVATE_KEY` | ZoomInfo Developer Portal |
| Clay | `CLAY_API_KEY` | Clay Settings > API (Enterprise plan) |
| LinkedIn | `LINKEDIN_ACCESS_TOKEN` | LinkedIn Developer Portal (SNAP required) |

You only need credentials for the services you want. Unconfigured services return setup instructions.

### Connect to Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "sales-intelligence": {
      "command": "node",
      "args": ["/absolute/path/to/sales-intelligence-mcp-server/dist/index.js"],
      "env": {
        "GONG_ACCESS_KEY": "your-key",
        "GONG_ACCESS_KEY_SECRET": "your-secret"
      }
    }
  }
}
```

### Connect to Claude Code

```bash
claude mcp add sales-intelligence node /absolute/path/to/dist/index.js \
  -e GONG_ACCESS_KEY=your-key \
  -e GONG_ACCESS_KEY_SECRET=your-secret
```

## Development

```bash
npm run dev          # Hot-reload with tsx
npm run lint         # ESLint
npm run format       # Prettier
npm run typecheck    # tsc --noEmit
npm test             # Vitest
npm run test:coverage # Vitest with V8 coverage
npm run build        # Compile to dist/
```

## License

[MIT](LICENSE) — Jose Balbuena
