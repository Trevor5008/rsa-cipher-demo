# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- `docs/RSA-FOUNDATIONS.md`, a learner-oriented guide to the key-distribution problem, hybrid encryption, RSA key generation, encryption/decryption equations, a worked example, real-world roles, and post-quantum transition context.
- LaTeX math in `docs/RSA-FOUNDATIONS.md` and the README, rendered natively on GitHub.
- Layered readability in the foundations guide: reading paths for different comfort levels, a symbol glossary, and a "math you need" primer on primes, modular arithmetic, GCD, and modular inverses.
- Equation cards (plain words, formula, read-aloud line, example numbers, collapsible "Go deeper") with stable `eq-*` anchors for future in-app information links.
- Worked-example derivations (extended Euclidean algorithm and square-and-multiply), a "Why decryption works" explanation, a key-generation diagram, and self-check answers for the review questions.
- Teaching-mode RSA API (`POST /teaching/keys`, `/teaching/encrypt`, `/teaching/decrypt`) that encrypts one Unicode character at a time and returns every intermediate value, a per-character trace, and structured, learner-friendly validation errors. RSA values are serialized as decimal strings. Documented in `docs/TEACHING-API.md`.
- Backend `pytest` suite (`requirements-dev.txt`, `pytest.ini`, `tests/`) covering the teaching API and guarding the legacy endpoints.
- Guided workspace that replaces the modal UI: a sticky header with an accessible Encrypt/Decrypt switch, three numbered cards (key pair, input, output), and a "How it works" region with concept steps, a worked example, a trace table, and a teaching-mode notice.
- Key-pair panel with `Textbook (61, 53)` (e = 17) and `Bigger primes (1009, 1013)` presets, editable custom values, live `n`/`φ(n)`/`d`, public and private key cards, and an "In use" indicator that follows the mode.
- Loading, inline-validation, and API-failure (with retry) states that never clear the learner's inputs.
- Frontend tests with Vitest, React Testing Library, and jsdom (`npm test`).

### Changed
- Expanded the root README with the importance of asymmetric encryption, a map from application actions to RSA concepts, and an explicit educational security boundary.
- Corrected the backend architecture description so the demo's general-purpose random prime generation is not described as cryptographically secure.
- The frontend derives keys through `POST /teaching/keys` (debounced, with stale responses discarded) instead of `/submit-keys`. The message output and trace show sample data until live teaching-mode encryption and decryption are connected.
- The Encrypt and Decrypt inputs are kept separately and survive mode switches, along with the key pair.
- Node.js 22.22+ or 24.15+ is now required for frontend development (Vitest and jsdom).
- Production builds call the API on the same origin (Flask serves the built app); only `VITE_LOCAL_API_BASE_URL` is needed, for the dev server.

### Removed
- The modal-first frontend: `KeysModal`, `TextModal`, `TextOutput`, the custom SVG icons, the `useModals`/`useRSAKeys`/`useTextProcessing`/`useUI` hooks, the legacy `rsaAPI` client and its types, and the prime-generation controls. The legacy backend endpoints remain available.
- The `VITE_PROD_API_BASE_URL` environment variable and the hard-coded Heroku URL in the setup docs.

## [2.1.0] - 2026-11-10

### Added
- TypeScript tooling for the frontend: `tsconfig.json` project references (`tsconfig.app.json`, `tsconfig.node.json`), `typescript-eslint`, and a `typecheck` script.
- Shared types in `frontend/src/types/rsa.ts` (`TextType` and API response shapes) and typed Vite env variables in `frontend/src/vite-env.d.ts`.
- `CHANGELOG.md` and an MIT `LICENSE` file.

### Changed
- Migrated the frontend from JavaScript/JSX to TypeScript/TSX: components have typed props, and the `rsaAPI` service returns typed responses.
- Key parameters (`publicExp`, `pBits`, `qBits`) are now stored as strings, matching how the inputs update them.
- `npm run build` now type-checks before bundling.
- README: replaced emoji icons with shields, added a Built With badge row, fixed table-of-contents anchors, and documented the TypeScript architecture and scripts.
- Replaced the boilerplate `frontend/README.md` with project-specific documentation.

### Removed
- Unused `CombinedOutput` and `SingleOutput` components (replaced by `TextOutput` in 2.0.0) and the unused `phrases` data module.
- `react/prop-types` lint suppressions, now covered by TypeScript.

## [2.0.0] - 2025-09-13

### Added
- Custom hooks for state management: `useRSAKeys`, `useTextProcessing`, `useModals`, and `useUI`.
- `rsaAPI` service that centralizes all backend requests.
- Unified `TextOutput` component for encrypted and decrypted output.

### Changed
- Rebranded the project as **RSA Learning Lab**, with student-focused documentation and a roadmap.

### Fixed
- Environment configuration for production and local API base URLs.
- The `generate-primes` endpoint.
- Clear buttons now reset the correct text.

## [1.0.0] - 2025-04-28

### Added
- Flask backend with RSA encryption and decryption routes, built on SymPy.
- Prime validation and prime generation endpoints.
- React + Vite + Tailwind frontend with modals for key entry and for encrypting/decrypting text.
- p/q input validation, a reset/clear feature, and copy-to-clipboard.
- Key, close, and copy icons, with key icons that show whether keys are active.
- Configurable public exponent and bit lengths for p and q.
- Mobile styling for the main view and modals.
- Heroku deployment (Procfile, gunicorn) with Flask serving the built frontend.
- README with a table of contents and setup instructions.
