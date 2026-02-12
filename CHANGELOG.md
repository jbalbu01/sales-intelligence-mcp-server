# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] — 2026-02-12

### Added

- ESLint + Prettier for linting and formatting
- Vitest with V8 coverage
- GitHub Actions CI pipeline (lint, format, typecheck, test, build)
- `.env.example` with all required environment variables
- `.nvmrc` pinned to Node 20
- `CHANGELOG.md` following Keep a Changelog format
- Unit tests for `error-handler.ts`

### Changed

- Extracted LinkedIn client into `src/services/linkedin-client.ts` for architectural consistency
- Moved `LINKEDIN_API_BASE_URL` into `src/constants.ts`
- Version is now read from `package.json` at runtime (single source of truth)
- Reorganized imports in `src/index.ts` (Node builtins first, then dependencies, then local)
- Replaced `isLinkedInConfigured` export from `linkedin-tools.ts` with `linkedin-client.ts`

### Fixed

- README badge versions now match actual `package.json` dependencies
- Removed committed `dist/` build artifacts from git tracking
- Added `.gitignore` to prevent future build artifact commits

## [1.0.0] — 2026-02-10

### Added

- Initial release with 16 MCP tools across 4 services
- Gong: 5 tools (search calls, get transcript, call details, search by participant, call stats)
- ZoomInfo: 4 tools (search companies, search contacts, org chart, tech stack)
- Clay: 3 tools (enrich person, enrich company, trigger webhook enrichment)
- LinkedIn Sales Navigator: 3 tools (search leads, get profile, search companies)
- Status tool for checking service configuration
- Shared error handler with HTTP status differentiation
- Response truncation utility for MCP payload limits
- Zod `.strict()` validation on all tool inputs
- Graceful degradation for unconfigured services
