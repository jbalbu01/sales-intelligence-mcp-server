# Contributing to Sales Intelligence MCP Server

Thank you for your interest in contributing! This guide will help you get set up and submit high-quality changes.

## Development Setup

```bash
# Clone the repo
git clone https://github.com/jbalbu01/sales-intelligence-mcp-server.git
cd sales-intelligence-mcp-server

# Use the correct Node version
nvm use          # reads .nvmrc → Node 20

# Install dependencies
npm ci

# Copy env template (fill in the services you plan to test)
cp .env.example .env
```

## Development Workflow

```bash
# Run the dev server with hot reload
npm run dev

# Run the full verification suite before committing
npm run lint && npm run format:check && npm run typecheck && npm test && npm run build
```

## Branch Naming

Use descriptive prefixes:

| Prefix | Purpose | Example |
|--------|---------|---------|
| `feat/` | New feature or tool | `feat/add-outreach-tool` |
| `fix/` | Bug fix | `fix/zoominfo-auth-refresh` |
| `chore/` | Maintenance, deps, CI | `chore/update-mcp-sdk` |
| `docs/` | Documentation only | `docs/improve-readme` |
| `test/` | Adding or fixing tests | `test/clay-tools-coverage` |

## Code Standards

- **TypeScript strict mode** — no `any` types unless absolutely necessary (and documented with a comment).
- **Zod `.strict()`** on all tool input schemas — extra fields must be rejected.
- **ESLint + Prettier** — run `npm run lint:fix && npm run format` before committing.
- **Import ordering** — Node builtins first, then external packages, then local modules.
- **One file per service client** in `src/services/`. One file per service's tools in `src/tools/`.

## Adding a New Service Integration

1. Create `src/services/<service>-client.ts` — export typed HTTP helpers and an `is<Service>Configured()` check.
2. Add base URL and any constants to `src/constants.ts`.
3. Add TypeScript interfaces to `src/types.ts`.
4. Create `src/tools/<service>-tools.ts` — export a `register<Service>Tools(server)` function.
5. Register tools in `src/index.ts`.
6. Add env vars to `.env.example` and update `README.md`.
7. Write tests in `src/__tests__/<service>-tools.test.ts`.

## Adding a New Tool to an Existing Service

1. Define the Zod schema with `.strict()` at the top of the tool file.
2. Register the tool with MCP annotations (`readOnlyHint`, `destructiveHint`, etc.).
3. Include a detailed `description` with Args, Returns, and Examples.
4. Wrap API calls in try/catch using `handleApiError`.
5. Respect `CHARACTER_LIMIT` using `truncateResponse`.
6. Support both `markdown` and `json` response formats.
7. Add tests for the new tool handler.

## Testing

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

We use **Vitest** with **V8 coverage**. Tests should:

- Mock external API clients with `vi.mock()`.
- Test both markdown and JSON output formats.
- Test empty/missing data edge cases.
- Test error propagation (API failures should return `isError: true`).

## Pull Request Checklist

Before opening a PR, verify:

- [ ] `npm run lint` passes with zero warnings
- [ ] `npm run format:check` passes
- [ ] `npm run typecheck` passes
- [ ] `npm test` passes
- [ ] `npm run build` succeeds
- [ ] New tools have MCP annotations
- [ ] New env vars are documented in `.env.example`
- [ ] `CHANGELOG.md` is updated under `[Unreleased]`

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add Salesforce CRM integration with 4 tools
fix: handle ZoomInfo 429 rate-limit with exponential backoff
chore: update MCP SDK to 1.7.0
test: add mock-based tests for LinkedIn tools
docs: add architecture diagram to README
```

## Questions?

Open an issue or reach out to the maintainer. All contributions — from typo fixes to new integrations — are welcome.
