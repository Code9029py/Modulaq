# Contributing to Modulaq

Thanks for your interest in contributing to Modulaq.

Modulaq is in public preview and active development. The project is still evolving, so focused improvements are easier to review and maintain than broad rewrites.

## Set Up Locally

```bash
npm install
npm run dev
npm run build
npm run preview
```

## Propose Changes

Before opening a large pull request, consider starting with an issue or discussion that explains the problem, the proposed direction and any privacy or browser-compatibility tradeoffs.

Small fixes, documentation improvements and focused utility improvements are welcome.

## Preferred Scope

Good contribution areas include:

- Browser-based PDF, QR and text utilities
- Reusable utilities for @modulaq/core
- Documentation and educational examples
- Tests for existing behavior
- Accessibility, usability and privacy improvements

Please keep changes focused. Avoid mixing unrelated refactors, formatting churn and feature work in the same contribution.

## What Not to Commit

Do not commit generated files or local machine artifacts unless they are explicitly required by the project.

Please avoid committing:

- `node_modules`
- `.env` files or secrets
- Local cache folders
- Build output
- Generated files that can be reproduced from source

If a change needs configuration, document the required environment variables or setup steps instead of committing private values.
