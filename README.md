# A-Guy Shared

Reusable, versioned infrastructure for A-Guy applications.

## Packages

- `@a-guy/ui` — application shell, theme, locale, and brand primitives.
- `@a-guy/api-client` — typed requests to the A-Guy platform API.

The packages never own authentication, sessions, users, database access, or
application-specific authorization. Those remain in
[A-Guy-Web](https://github.com/A-Guy-educ/A-Guy-Web).

## Development

```bash
pnpm install
pnpm check
pnpm pack:all
```

Tagged releases publish immutable package tarballs as GitHub release assets.
Consumers pin the complete release URL and upgrade deliberately.
