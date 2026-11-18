# Story #26 — Responsive & Accessibility Acceptance Evidence

Evidence for [issue #26](https://github.com/Trevor5008/rsa-cipher-demo/issues/26) (design Story 5). This document records the production walkthrough and points at automated coverage. It does not replace the frontend/backend test suites.

## Environment

| Item | Value |
| --- | --- |
| Date | 2026-11-18 |
| Branch | `feat/26-responsive-a11y-acceptance` |
| Build | `frontend` production build served by Flask (`frontend/dist`) |
| Browser | Chromium (Cursor IDE browser) |
| Desktop viewport | ~955 px wide |
| Mobile viewport | 390 × 844 (`Emulation.setDeviceMetricsOverride`, mobile) |
| API | Local Flask `http://127.0.0.1:5000` |

## Canonical walkthrough

| Step | Result |
| --- | --- |
| 1. Bigger primes preset → `n` / `φ(n)` / `d` | Pass — `1022117` / `1020096` / `832193` |
| 2. Encrypt `test` → four ciphertext values + trace | Pass — `924799 621270 2637 924799`; status “Ciphertext updated” |
| 3. **Decrypt this** → recovered message | Pass — `test`; status “Message recovered”; count “4 numbers” |
| 4. Invalidate prime `p` → feedback; inputs preserved; restore preset | Pass — `aria-invalid` on `p`, “Fix the highlighted values…”; ciphertext kept; Bigger primes restores key + decrypt |
| 5. Core flow at ~390 px | Pass — no page-level horizontal overflow (`scrollWidth === clientWidth`); key fields single-column (`grid-cols-1`); long numbers remain in `break-all` / scroll regions |
| 6. Keyboard focus | Pass — Tab moves through mode switch / presets / fields; `focus-visible` rings from shared `focusRing` styles; mode radios remain native keyboard controls |

## Acceptance criteria map

| #26 criterion | Evidence |
| --- | --- |
| Walkthrough on production desktop + 375–430 px | This document (desktop ~955 px, mobile 390 px) |
| No page overflow / overlapping / clipped validation / unreadable long numbers | Overflow measurements above; layout classes covered in `Workspace.test.tsx` |
| Keyboard operable with visible focus | Walkthrough step 6; mode keyboard test in `Workspace.test.tsx` |
| Mode, active key, loading, errors, copy, updated results without color-only | Text “In use” / “Using the … key”; `role="status"` / `role="alert"`; “Ciphertext updated” / “Message recovered”; copy announcements |
| Automated a11y: no serious/critical on Encrypt & Decrypt | `frontend/src/a11y.test.tsx` + `frontend/src/test/axe.ts` (`axe-core`; color-contrast disabled in jsdom) |
| Backend + frontend suites, typecheck, lint, production build | Recorded on the PR / local verify for this branch |
| Legacy endpoints retained with reason **or** removed | Retained and **deprecated** for new clients; see [TEACHING-API.md](../TEACHING-API.md#relationship-to-the-legacy-endpoints) |
| #17 closed or narrowed | Closed after this acceptance (Clear/Copy + responsive covered by #23–#26) |
| Evidence attached / linked | This file; linked from #26 |
| Docs match delivered behavior | README, CHANGELOG, frontend README, TEACHING-API, IMPLEMENTATION-STORIES |
| No silent feature absorption | AC hardening only: responsive key fields, result live announcements, axe tooling |

## Automated accessibility

```bash
cd frontend && npm test -- src/a11y.test.tsx
```

`expectNoSeriousA11yViolations` fails the suite on axe `serious` / `critical` impacts for Encrypt-ready and Decrypt-ready states. Color contrast is left to the production walkthrough because jsdom cannot evaluate it reliably.

## Follow-ups

None filed from this acceptance pass. Future defects should open new issues rather than reopen #26.
