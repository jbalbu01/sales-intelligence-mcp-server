<div align="center">

# Sales Intelligence MCP Server

**16 tools for Gong, ZoomInfo, Clay, and LinkedIn Sales Navigator — unified through the Model Context Protocol.**

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/jbalbu01/sales-intelligence-mcp-server)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![MCP SDK](https://img.shields.io/badge/MCP_SDK-1.12-purple.svg)](https://modelcontextprotocol.io/)

[Quick Start](#quick-start) · [Tools](#tool-reference) · [Configuration](#configuration) · [Architecture](#architecture)

---

</div>

## What Is This?

A Model Context Protocol (MCP) server that gives Claude direct access to four major sales intelligence platforms through a single, unified interface. Connect it to Claude Desktop, Claude Code, or any MCP-compatible client.

### Why This Exists

Official MCP connectors from Gong, ZoomInfo, Clay, and LinkedIn either don't exist yet or provide limited functionality. This server fills the gap with **16 purpose-built tools** designed specifically for sales workflows — call transcript analysis, org chart mapping, contact enrichment, and lead discovery.

### Key Features

- **16 tools** across 4 platforms + 1 status utility
- **Graceful degradation** — configure only the services you use; unconfigured ones return helpful setup messages
- **TypeScript** with full type safety
- **stdio transport** for fast local communication
- **Pre-built dist/** included — just `npm install` and go

---

## Quick Start

### 1. Install

```bash
git clone https://github.com/jbalbu01/sales-intelligence-mcp-server.git
cd sales-intelligence-mcp-server/sales-intelligence-mcp-server
npm install
```

### 2. Configure API Keys

Set environment variables for the services you want to use. **You only need keys for the services you plan to use** — everything else degrades gracefully.

```bash
# Gong (Basic Auth)
export GONG_ACCESS_KEY="your-access-key"
export GONG_ACCESS_KEY_SECRET="your-access-key-secret"

# ZoomInfo (JWT Auth)
export ZOOMINFO_CLIENT_ID="your-client-id"
export ZOOMINFO_PRIVATE_KEY="your-private-key"

# Clay (API Key)
export CLAY_API_KEY="your-api-key"

# LinkedIn Sales Navigator (OAuth — requires SNAP partnership)
export LINKEDIN_ACCESS_TOKEN="your-oauth-token"
```

### 3. Connect to Claude

**Claude Desktop** — add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "sales-intelligence": {
      "command": "node",
      "args": ["/absolute/path/to/dist/index.js"],
      "env": {
        "GONG_ACCESS_KEY": "your-key",
        "GONG_ACCESS_KEY_SECRET": "your-secret",
        "ZOOMINFO_CLIENT_ID": "your-id",
        "ZOOMINFO_PRIVATE_KEY": "your-key",
        "CLAY_API_KEY": "your-key",
        "LINKEDIN_ACCESS_TOKEN": "your-token"
      }
    }
  }
}
```

**Claude Code / Cowork** — add to `.mcp.json`:

```json
{
  "mcpServers": {
    "sales-intelligence": {
      "command": "node",
      "args": ["./path/to/dist/index.js"],
      "env": {
        "GONG_ACCESS_KEY": "",
        "GONG_ACCESS_KEY_SECRET": "",
        "ZOOMINFO_CLIENT_ID": "",
        "ZOOMINFO_PRIVATE_KEY": "",
        "CLAY_API_KEY": "",
        "LINKEDIN_ACCESS_TOKEN": ""
      }
    }
  }
}
```

### 4. Verify

Ask Claude: *"Check my sales intelligence status"* — it will call `sales_intel_status` and report which services are connected.

---

## Tool Reference

### Gong (5 tools)

| Tool | Description |
|---|---|
| `gong_search_calls` | Search calls by date range with pagination |
| `gong_get_transcript` | Get full timestamped transcript for a call |
| `gong_get_call_details` | Get topics, trackers, action items, speaker stats |
| `gong_search_calls_by_participant` | Find calls by participant email address |
| `gong_get_call_stats` | Aggregate stats — total calls, avg duration, top participants |

### ZoomInfo (4 tools)

| Tool | Description |
|---|---|
| `zoominfo_search_company` | Search by name, domain, industry, employee count, revenue |
| `zoominfo_search_contact` | Search by name, title, department, company, seniority level |
| `zoominfo_get_org_chart` | Get full reporting hierarchy for a company |
| `zoominfo_get_tech_stack` | Get technology stack and vendor relationships |

### Clay (3 tools)

| Tool | Description |
|---|---|
| `clay_enrich_person` | Enrich by email, LinkedIn URL, or name + company |
| `clay_enrich_company` | Enrich by domain or company name |
| `clay_trigger_enrichment` | Send data to a Clay webhook table for async enrichment |

### LinkedIn Sales Navigator (3 tools)

| Tool | Description |
|---|---|
| `linkedin_search_leads` | Search leads by keywords, title, company, seniority, geography |
| `linkedin_get_profile` | Get detailed profile by URL or member ID |
| `linkedin_search_companies` | Search companies by name, industry, size, geography |

### Utility (1 tool)

| Tool | Description |
|---|---|
| `sales_intel_status` | Check which services are configured and reachable |

---

## Configuration

### Getting API Keys

| Service | How to Get Keys | Auth Method |
|---|---|---|
| **Gong** | Settings → Integrations → API → Create Access Key | Basic Auth |
| **ZoomInfo** | Developer Portal → Create App → Get Client ID + Private Key | JWT |
| **Clay** | Settings → API → Generate Key (Enterprise plan required) | API Key |
| **LinkedIn** | Requires SNAP partnership — apply at LinkedIn Developer Portal | OAuth Bearer |

### Environment Variables

| Variable | Service | Required |
|---|---|---|
| `GONG_ACCESS_KEY` | Gong | Only if using Gong |
| `GONG_ACCESS_KEY_SECRET` | Gong | Only if using Gong |
| `ZOOMINFO_CLIENT_ID` | ZoomInfo | Only if using ZoomInfo |
| `ZOOMINFO_PRIVATE_KEY` | ZoomInfo | Only if using ZoomInfo |
| `CLAY_API_KEY` | Clay | Only if using Clay |
| `LINKEDIN_ACCESS_TOKEN` | LinkedIn | Only if using LinkedIn |

---

## Architecture

```
src/
├── index.ts              # Server entry point — registers all 16 tools
├── constants.ts          # API base URLs, rate limits, timeouts
├── types.ts              # TypeScript interfaces for all services
├── services/
│   ├── gong-client.ts    # Gong API client (Basic Auth)
│   ├── zoominfo-client.ts # ZoomInfo API client (JWT)
│   ├── clay-client.ts    # Clay API client (API Key + Webhooks)
│   └── error-handler.ts  # Shared error handling and response truncation
└── tools/
    ├── gong-tools.ts     # 5 Gong tool definitions
    ├── zoominfo-tools.ts # 4 ZoomInfo tool definitions
    ├── clay-tools.ts     # 3 Clay tool definitions
    └── linkedin-tools.ts # 3 LinkedIn tool definitions
```

### Tech Stack

- **Runtime**: Node.js
- **Language**: TypeScript 5.3
- **MCP SDK**: `@modelcontextprotocol/sdk` 1.12
- **Transport**: stdio (local process communication)
- **Auth**: Basic Auth (Gong), JWT (ZoomInfo), API Key (Clay), OAuth (LinkedIn)

---

## Development

```bash
# Build from source
npm run build

# Watch mode (rebuild on changes)
npm run dev

# Type check
npx tsc --noEmit
```

---

## Related

- [Sales Enablement Plugin](https://github.com/jbalbu01/sales-enablement-plugin) — The Claude plugin that bundles this server with 18 sales skills
- [Model Context Protocol](https://modelcontextprotocol.io/) — The open protocol this server implements
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk) — The SDK used to build this server

---

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## Author

**Jose Balbuena** — [GitHub](https://github.com/jbalbu01)

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
