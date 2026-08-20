# A-Guy-Shared repository rules

- This repository owns reusable UI and API consumer contracts only.
- Never add authentication secrets, database access, Payload, application
  authorization, or product-specific pages.
- The API client may forward an incoming HttpOnly cookie but must never read,
  decode, store, expose, or log its value.
- Keep React and TypeScript as peer dependencies where possible.
- Preserve explicit package exports and backwards compatibility.
- Run typecheck, lint, format check, tests, build, and package smoke checks.
- Prefix shell commands with `rtk`.
