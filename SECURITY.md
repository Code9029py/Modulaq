# Security and Privacy

Modulaq prioritizes local, browser-based processing whenever possible. Available tools are designed to avoid unnecessary server uploads, especially for files and text that may contain sensitive information.

## Reporting Issues

Please report security or privacy issues privately. Do not open public issues with exploit details, private files, proof-of-concept attacks or sensitive user information.

If you need to report a vulnerability, include:

- A clear description of the issue
- Steps to reproduce it
- The affected tool or workflow
- Any privacy impact you believe it may have

Please share only the minimum information needed to understand and reproduce the issue.

## Secrets and Local Files

Users and contributors should not commit secrets, API keys, tokens or `.env` files. Keep local configuration private and use documented environment variable names when configuration is needed.

Because Modulaq's current tools are frontend and local-first, treat any future server-side or API-oriented workflow as a separate security review area before it becomes part of the default user experience.
