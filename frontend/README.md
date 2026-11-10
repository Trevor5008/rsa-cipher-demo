# RSA Learning Lab - Frontend

The React + TypeScript single-page app for RSA Learning Lab. It talks to the Flask API in the repository root. In production, Flask serves the built files from `frontend/dist`.

See the [root README](../README.md) for the full project overview and backend setup.

## Stack

- [React 18](https://react.dev/) with [TypeScript](https://www.typescriptlang.org/) in strict mode
- [Vite](https://vite.dev/) with [`@vitejs/plugin-react-swc`](https://github.com/vitejs/vite-plugin-react-swc)
- [Tailwind CSS](https://tailwindcss.com/)
- [Axios](https://axios-http.com/) for API requests
- ESLint with [`typescript-eslint`](https://typescript-eslint.io/)

## Getting Started

```sh
npm install
npm run dev
```

The dev server runs at http://localhost:5173. Start the Flask backend first (`python app.py` from the repo root) so API calls succeed.

## Environment Variables

Create a `.env` file in this directory:

```sh
VITE_PROD_API_BASE_URL=https://rsa-cipher-demo-72f57f0cf894.herokuapp.com
VITE_LOCAL_API_BASE_URL=http://127.0.0.1:5000
```

`npm run dev` uses `VITE_LOCAL_API_BASE_URL`, and production builds use `VITE_PROD_API_BASE_URL`. Both are typed in `src/vite-env.d.ts`.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server with hot reload |
| `npm run typecheck` | Type-check the project with `tsc -b` |
| `npm run lint` | Lint the TypeScript sources with ESLint |
| `npm run build` | Type-check, then build to `dist/` |
| `npm run preview` | Preview the production build locally |

## Project Structure

```
src/
├── components/
│   ├── Icons/          # Close, Key, Paperclip SVG icons
│   ├── KeysModal.tsx   # Public exponent, p/q entry, prime generation
│   ├── TextModal.tsx   # Encrypt/decrypt input
│   └── TextOutput.tsx  # Encrypted/decrypted output with copy + clear
├── hooks/
│   ├── useModals.ts          # Modal visibility and type
│   ├── useRSAKeys.ts         # Key parameters and derived key state
│   ├── useTextProcessing.ts  # Encrypt/decrypt input and output text
│   └── useUI.ts              # Clipboard feedback and responsive layout
├── services/
│   └── rsaAPI.ts       # Typed client for the Flask API
├── types/
│   └── rsa.ts          # TextType and API response types
├── App.tsx
├── main.tsx
└── vite-env.d.ts       # Vite client types and env variable typings
```

## TypeScript Configuration

- `tsconfig.json` only holds project references.
- `tsconfig.app.json` covers `src/`, with `strict` mode and `noEmit` (Vite handles transpiling).
- `tsconfig.node.json` covers `vite.config.ts`.
