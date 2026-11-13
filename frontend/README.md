# RSA Learning Lab - Frontend

The React + TypeScript single-page app for RSA Learning Lab. It talks to the Flask API in the repository root. In production, Flask serves the built files from `frontend/dist`.

See the [root README](../README.md) for the full project overview and backend setup.

Learners should begin with [RSA Foundations for Learners](../docs/RSA-FOUNDATIONS.md), which explains why asymmetric encryption matters, how the interface maps to the RSA equations, and where the demonstration differs from production cryptography.

> **Educational-use warning:** this frontend drives a textbook-RSA demonstration. It does not provide OAEP/PSS padding, production key generation, secure private-key storage, or an authenticated protocol. Do not use it to protect real data.

## Stack

- [React 18](https://react.dev/) with [TypeScript](https://www.typescriptlang.org/) in strict mode
- [Vite](https://vite.dev/) with [`@vitejs/plugin-react-swc`](https://github.com/vitejs/vite-plugin-react-swc)
- [Tailwind CSS](https://tailwindcss.com/)
- [Axios](https://axios-http.com/) for API requests
- ESLint with [`typescript-eslint`](https://typescript-eslint.io/)
- [Vitest](https://vitest.dev/) with [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) and jsdom for component tests

## Getting Started

```sh
cd frontend
npm install
npm run dev
```

The dev server runs at http://localhost:5173. Start the Flask backend first (`python app.py` from the repo root) so the key pair can be derived; without it, the key panel shows a "couldn't reach the key service" message with a Try again button.

The app talks to the teaching-mode endpoints described in [Teaching-Mode RSA API](../docs/TEACHING-API.md). Key derivation (`POST /teaching/keys`) is live; the message output, worked example, and trace table currently render the shared sample fixture until live encryption and decryption are connected.

## Environment Variables

Create a `.env` file in this directory so the dev server can reach the local Flask backend:

```sh
VITE_LOCAL_API_BASE_URL=http://127.0.0.1:5000
```

`npm run dev` sends API requests to `VITE_LOCAL_API_BASE_URL` (typed in `src/vite-env.d.ts`). Production builds always call the same origin, because Flask serves the built app from `frontend/dist`, so no production variable is needed.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server with hot reload |
| `npm run typecheck` | Type-check the project with `tsc -b` |
| `npm run lint` | Lint the TypeScript sources with ESLint |
| `npm run build` | Type-check, then build to `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm test` | Run the tests once with Vitest |
| `npm run test:watch` | Run Vitest in watch mode |

## Project Structure

```
src/
├── components/workspace/
│   ├── AppHeader.tsx       # Title, learner promise, mode switch (sticky)
│   ├── ModeSwitch.tsx      # Encrypt/Decrypt segmented control on native radios
│   ├── StepCard.tsx        # Numbered card shell ("Step 1: ...")
│   ├── KeyPairPanel.tsx    # Step 1: presets, p/q/e fields, derived values, key cards, status
│   ├── PresetPicker.tsx, KeyFieldInput.tsx, DerivedValues.tsx, KeyCard.tsx
│   ├── MessagePanel.tsx    # Step 2: plaintext or ciphertext input
│   ├── OutputPanel.tsx     # Step 3: ciphertext or recovered message (sample for now)
│   ├── HowItWorks.tsx      # Concept steps, worked example, trace table, teaching notice
│   ├── ConceptStep.tsx, WorkedExample.tsx, TraceTable.tsx, TeachingModeNotice.tsx
│   └── styles.ts           # Shared focus ring and mode colors
├── fixtures/teaching.ts    # Typed sample responses (p = 1009, q = 1013, e = 65537, "test")
├── hooks/useKeyPair.ts     # Presets, debounced POST /teaching/keys, stale-response guard
├── services/teachingAPI.ts # Typed client; 400s become TeachingValidationFailure
├── test/                   # Vitest setup and fake API helpers
├── types/teaching.ts       # Teaching-mode API types (RSA values as decimal strings)
├── App.tsx                 # Mode, per-mode inputs, and layout; accepts an injected API for tests
├── main.tsx
└── vite-env.d.ts           # Vite client types and env variable typings
```

## Testing

Tests live next to the code they cover (`*.test.ts` / `*.test.tsx`) and run in jsdom:

- `services/teachingAPI.test.ts`: request shape and error mapping.
- `hooks/useKeyPair.test.ts`: presets, debouncing, stale responses, validation and network failures.
- `Workspace.test.tsx`: the rendered workspace, including presets, custom values, inline validation, loading and error states, the mode switch, input preservation, keyboard use, and layout classes.

`App` accepts an optional `api` prop, so tests pass a fake instead of making HTTP requests.

## TypeScript Configuration

- `tsconfig.json` only holds project references.
- `tsconfig.app.json` covers `src/`, with `strict` mode and `noEmit` (Vite handles transpiling).
- `tsconfig.node.json` covers `vite.config.ts`, which also holds the Vitest `test` settings.
