# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 1.1.x   | Yes       |
| < 1.1   | No        |

## Reporting a Vulnerability

If you discover a security vulnerability, **please do not open a public issue.** Instead:

1. **Email**: Send a detailed report to **jbalbuena334@gmail.com**
2. **Subject line**: `[SECURITY] sales-intelligence-mcp-server — <brief description>`
3. **Include**:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if you have one)

## Response Timeline

| Stage | Target |
|-------|--------|
| Acknowledgment | Within 48 hours |
| Initial assessment | Within 5 business days |
| Fix or mitigation | Within 30 days for critical issues |

## Scope

The following are in scope for security reports:

- **Credential exposure** — any path that could leak API keys (Gong, ZoomInfo, Clay, LinkedIn) beyond the local environment.
- **Input validation bypasses** — crafted tool inputs that circumvent Zod schema validation.
- **Injection attacks** — inputs that could be forwarded unsafely to downstream APIs.
- **Dependency vulnerabilities** — known CVEs in production dependencies (`axios`, `zod`, `@modelcontextprotocol/sdk`).

The following are **out of scope**:

- Issues in the third-party APIs themselves (Gong, ZoomInfo, Clay, LinkedIn).
- Social engineering attacks.
- Denial of service via legitimate API rate limits.

## Security Design

This server follows several security principles:

- **No credentials in code** — all API keys are read from environment variables at runtime.
- **No secrets in git** — `.gitignore` excludes `.env` files. `.env.example` contains only blank placeholders.
- **No build artifacts in git** — `dist/` is excluded to prevent accidental bundling of environment-specific code.
- **Input validation** — all tool inputs are validated with Zod `.strict()` schemas, rejecting unexpected fields.
- **stdio transport only** — the server communicates over stdio, not HTTP, reducing network attack surface.
- **Graceful degradation** — unconfigured services return setup instructions rather than exposing partial auth state.

## Acknowledgments

We appreciate responsible disclosure and will credit reporters (with permission) in the changelog.
