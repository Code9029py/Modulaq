# Modulaq

Modulaq is a privacy-first open-source toolkit for browser-based digital utilities.

The current focus is PDF, QR and text utilities that are useful for everyday work, learning and lightweight developer workflows. Available tools process files locally in the browser whenever possible, avoiding unnecessary server uploads.

Modulaq is currently in public preview and active development. It should be treated as an evolving project, not as a mature production platform.

## Current Tools

- Text cleaner
- QR generator
- PDF page counter
- Image to PDF
- Merge PDFs
- Split PDF
- Reorder PDF pages
- PDF to images
- Extract text from PDF
- Compress PDF

## Privacy Model

Modulaq is local-first by default. The available tools are designed to run in the browser whenever possible, so files and text can be processed on the user's device instead of being uploaded to a server unnecessarily.

This model is especially important for PDF and text workflows, where documents may contain personal, academic, business or otherwise sensitive information.

## Stack

Modulaq currently uses:

- React
- Vite
- TypeScript
- TailwindCSS
- vite-react-ssg
- @modulaq/core

## Local Development

```bash
npm install
npm run dev
npm run build
npm run preview
```

## Limitations

- Some PDF behavior depends on browser capabilities and the internal structure of each PDF.
- Scanned PDFs may need OCR, which is not guaranteed by the current tools.
- Current tools are frontend and local-first.
- Future APIs are planned, but they are not the default path for local tools.

## Roadmap

Long-term goals include:

- More browser-based tools
- Reusable @modulaq/core utilities
- Educational examples for students and developers
- Improved tests and documentation
- Future SDK/API-oriented workflows where justified
- Keeping privacy and transparency as core principles

## Contributing

Contributions are welcome while the project is still taking shape. Please read [CONTRIBUTING.md](CONTRIBUTING.md) before proposing changes.

## Security and Privacy

If you discover a security or privacy issue, please follow the private reporting guidance in [SECURITY.md](SECURITY.md). Do not open public issues with exploit details or sensitive information.

## License

Modulaq is released under the [MIT License](LICENSE).
