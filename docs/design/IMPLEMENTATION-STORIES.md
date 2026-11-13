# RSA Learning Lab Redesign — Implementation Stories

Status: Groomed draft, ready for owner/estimate confirmation before GitHub issue loading.

Design source of truth: [UI/UX Target](README.md)

## Milestone Outcome

Replace the current modal-driven utility with a responsive teaching workspace where learners can build a key pair, encrypt or decrypt one code point at a time, and inspect every RSA transformation.

The redesign must remain explicitly educational. It demonstrates textbook RSA and must not imply that its raw operations, small presets, or key generation are suitable for production security.

## Entry Decisions

1. Teaching mode operates on one Unicode code point at a time rather than encoding the entire message as one integer.
2. A character is accepted only when its code point satisfies `0 <= m < n`; unsupported characters receive a precise validation error.
3. Ciphertext is represented in the UI as whitespace-separated non-negative decimal integers.
4. RSA integers cross the API boundary as decimal strings so JavaScript number precision cannot corrupt larger values.
5. The teaching API is additive during the redesign. Existing endpoints remain available until the replacement UI is verified.
6. Key state persists while switching between Encrypt and Decrypt, but it does not need to persist across a browser restart in this milestone.
7. The page may debounce live API requests, but stale responses must never overwrite results for newer input or key values.
8. Accessibility and responsive behavior are acceptance criteria in each implementation story. The final acceptance story verifies them; it does not become a repair catch-all.

## Story 1 — Teaching-Mode RSA Trace API

Suggested title: `Add teaching-mode RSA key and per-character trace API`

Type: Backend/API enabler  
Tentative estimate: 8–12 hours  
Dependencies: None  
Suggested labels: `enhancement`

### User outcome

As a learner, I receive an explainable RSA result for every input character or ciphertext value so the interface can show both the answer and the arithmetic that produced it.

### Scope

- Add a typed, additive teaching-mode contract for key derivation, per-code-point encryption, and per-value decryption.
- Keep RSA integers serialized as decimal strings.
- Return ordered trace rows suitable for the worked example and table in the mockups.
- Add structured validation errors rather than relying on console output or Python conversion exceptions.
- Preserve the existing endpoints until the redesigned UI has passed acceptance.

### Proposed contract

#### Derive key

```text
POST /teaching/keys
{ p, q, e }
```

Returns `p`, `q`, `e`, `n`, `phi`, `d`, and public/private key summaries as decimal strings.

#### Encrypt teaching message

```text
POST /teaching/encrypt
{ text, e, n }
```

Returns:

- the ciphertext values in order;
- a space-separated display value;
- one trace row per Unicode code point with `index`, `character`, `codePoint`, and `ciphertext`.

#### Decrypt teaching ciphertext

```text
POST /teaching/decrypt
{ ciphertext, d, n }
```

Returns:

- the recovered message;
- one trace row per ciphertext value with `index`, `ciphertext`, `codePoint`, and `character`.

### Acceptance criteria

- [ ] Key derivation rejects non-integer inputs, non-primes, equal `p`/`q`, invalid `e`, and values where `gcd(e, phi) != 1` with field-specific `400` responses.
- [ ] Encryption iterates by Unicode code point and rejects the first character whose code point is not smaller than `n`.
- [ ] Decryption accepts whitespace-separated decimal integers and rejects empty tokens, negatives, non-integers, values outside the RSA range, and recovered values that are not valid Unicode scalar values.
- [ ] Every response preserves RSA integers as decimal strings.
- [ ] The fixture `p=1009`, `q=1013`, `e=65537`, plaintext `test` returns `n=1022117`, `phi=1020096`, `d=832193`, and ciphertext `924799 621270 2637 924799`.
- [ ] Decrypting that fixture returns `test` with four correctly ordered trace rows.
- [ ] Existing `/submit-keys`, `/encrypt`, and `/decrypt` behavior remains available during migration.
- [ ] Unit tests cover the RSA helpers, and Flask endpoint tests cover valid requests, validation failures, ordering, and round trips.
- [ ] API documentation states that this is textbook RSA for teaching, not production cryptography.

### Out of scope

- OAEP, PSS, certificates, signatures, hybrid encryption, or production key storage.
- Replacing the demonstration's prime-generation strategy with a production cryptographic implementation.
- Removing legacy endpoints before final redesign acceptance.

## Story 2 — Guided Workspace and Key-Pair Panel

Suggested title: `Build the responsive guided workspace and key-pair experience`

Type: Frontend foundation  
Tentative estimate: 8–12 hours  
Dependencies: Story 1 contract agreed; implementation may begin with typed fixtures  
Suggested labels: `enhancement`, `ux`, `a11y`

### User outcome

As a learner, I can see the entire RSA workflow, build or select a valid key pair, and understand which key is active without opening modal dialogs.

### Scope

- Replace the modal-first root layout with the header, mode switch, three numbered cards, and lower explanation region shown in the design references.
- Add reusable typed components for the key panel, input/output panels, conceptual step cards, worked example, and trace table.
- Add clearly selected presets for `Textbook (61, 53)` and `Bigger primes (1009, 1013)` plus editable custom values.
- Display `n`, `phi`, and `d`, public/private key summaries, and the mode-specific active-key indicator.
- Preserve one key pair while switching modes.
- Introduce loading, invalid, and API-failure states without clearing the learner's inputs.

### Acceptance criteria

- [ ] The default page presents one visible workflow without requiring a modal to enter keys, plaintext, or ciphertext.
- [ ] Encrypt and Decrypt are exposed as an accessible segmented control with an unambiguous selected state.
- [ ] Selecting a preset updates `p`, `q`, and `e`, recalculates the derived values, and visibly identifies the selected preset.
- [ ] Editing any key field changes the state to custom and revalidates the key without retaining stale derived values.
- [ ] Invalid key fields show specific inline explanations and prevent encryption/decryption without disabling correction.
- [ ] Public and private key cards display their correct values and explain their role.
- [ ] The active-key indicator switches from public in Encrypt mode to private in Decrypt mode.
- [ ] Desktop/tablet preserves the three-column learning sequence; narrow viewports stack the cards in numbered order without horizontal page overflow.
- [ ] Long integers wrap or scroll inside their own regions without breaking the layout.
- [ ] The mode switch, fields, presets, cards, and status feedback are keyboard accessible and have programmatic names.
- [ ] Shared frontend types match Story 1's decimal-string API contract.
- [ ] Component tests cover preset selection, custom values, validation, mode switching, loading/error states, and responsive class/state behavior.

### Out of scope

- Encrypt/decrypt trace behavior beyond typed fixture rendering.
- Browser-restart persistence or user accounts.
- Visual animations, quizzes, progress tracking, or production cryptography.

## Story 3 — Live Encrypt Learning Flow

Suggested title: `Implement the live per-character encryption lesson`

Type: Frontend/API vertical story  
Tentative estimate: 6–10 hours  
Dependencies: Stories 1 and 2  
Suggested labels: `enhancement`, `ux`, `a11y`

### User outcome

As a learner, I can type a message and immediately see how every character becomes a code point and RSA ciphertext value.

### Scope

- Connect the Encrypt workspace to the teaching encryption API.
- Render the ciphertext as whitespace-separated integers.
- Populate the three conceptual steps, first-character worked example, and complete trace table from the response.
- Add Clear, Copy, and **Decrypt this** actions.
- Protect live updates from request races and stale key/input combinations.

### Acceptance criteria

- [ ] Typing plaintext triggers a debounced teaching-mode encryption request after a valid key exists.
- [ ] The output, character count, worked example, and trace table update from one consistent response.
- [ ] Each trace row shows its one-based position, character, code point `m`, and ciphertext `c`.
- [ ] The worked example substitutes the first row's actual `m`, `e`, `n`, and `c` values.
- [ ] Empty input produces an empty instructional state rather than an API error.
- [ ] Unsupported code points and backend failures display actionable inline feedback without erasing the plaintext or key.
- [ ] A late response for older input/key values cannot replace the current result.
- [ ] Copy copies only the ciphertext and announces success without changing focus unexpectedly.
- [ ] Clear removes the plaintext, ciphertext, and trace while preserving the key pair.
- [ ] **Decrypt this** switches to Decrypt mode and carries the current ciphertext into its input.
- [ ] The teaching-mode warning remains visible and accurately distinguishes per-character textbook RSA from real OAEP-based RSA.
- [ ] Tests cover the `test` fixture, empty input, unsupported characters, request races, copy, clear, and mode handoff.

### Out of scope

- Whole-message RSA encoding in the new teaching view.
- Signature demonstrations, file encryption, or downloadable lesson reports.

## Story 4 — Live Decrypt Learning Flow

Suggested title: `Implement the live per-value decryption lesson`

Type: Frontend/API vertical story  
Tentative estimate: 6–10 hours  
Dependencies: Stories 1 and 2; may proceed alongside Story 3 once shared components are stable  
Suggested labels: `enhancement`, `ux`, `a11y`

### User outcome

As a learner, I can paste teaching-mode ciphertext and see how each number is transformed back into a code point and character with the private key.

### Scope

- Connect the Decrypt workspace to the teaching decryption API.
- Parse and present whitespace-separated ciphertext values.
- Populate the decryption steps, first-value worked example, and complete trace table.
- Add Clear, Copy, and **Encrypt again** actions.
- Preserve valid ciphertext transferred from Encrypt mode.

### Acceptance criteria

- [ ] Pasting whitespace-separated ciphertext triggers a debounced teaching-mode decryption request after a valid key exists.
- [ ] Input validation distinguishes non-numeric tokens, negative values, out-of-range values, and values that do not recover to a supported character.
- [ ] Each trace row shows its one-based position, ciphertext `c`, recovered code point `m`, and character.
- [ ] The worked example substitutes the first row's actual `c`, `d`, `n`, `m`, and character.
- [ ] The recovered message and number count update from the same response as the trace.
- [ ] Empty input produces an empty instructional state rather than an API error.
- [ ] API failures and stale responses cannot erase or replace newer learner input.
- [ ] Copy copies only the recovered plaintext and announces success accessibly.
- [ ] Clear removes ciphertext, plaintext, and trace while preserving the key pair.
- [ ] **Encrypt again** switches to Encrypt mode and carries the recovered plaintext into its input.
- [ ] Decrypting `924799 621270 2637 924799` with the larger preset returns `test` and the expected four trace rows.
- [ ] Tests cover valid handoff, pasted whitespace variations, bad tokens, out-of-range values, request races, copy, clear, and mode handoff.

### Out of scope

- Decrypting ciphertext produced by external OAEP/PKCS#1 tools.
- Automatic detection of arbitrary ciphertext formats.

## Story 5 — Integrated Responsive and Accessibility Acceptance

Suggested title: `Verify the redesigned RSA learning workflow across responsive and accessible use`

Type: Acceptance/evidence story  
Tentative estimate: 4–6 hours  
Dependencies: Stories 1–4 merged  
Suggested labels: `ux`, `a11y`, `documentation`

### User outcome

As a learner using a laptop, phone-sized viewport, keyboard, or assistive technology, I can complete the same key → encrypt → decrypt lesson and understand every result.

### Scope

- Run the frozen end-to-end workflow against the production build.
- Verify responsive presentation, keyboard use, focus behavior, status announcements, color/contrast, and error recovery.
- Remove or formally deprecate the replaced modal-only path after acceptance.
- Update screenshots, architecture documentation, learner documentation, and changelog.
- Reconcile existing issues #17 and #20 without duplicating their intent.

### Canonical walkthrough

1. Load the larger-primes preset and confirm the derived key values.
2. Encrypt `test` and verify the four ciphertext values and trace rows.
3. Use **Decrypt this** and verify the original message is recovered.
4. Change one prime to an invalid value, observe specific feedback, and recover without losing the message unnecessarily.
5. Repeat the core flow at a narrow mobile viewport.
6. Repeat with keyboard-only navigation and verify focus/status behavior.

### Acceptance criteria

- [ ] The canonical walkthrough passes in the production build on the supported desktop browser and a 375–430 px viewport.
- [ ] The layout has no page-level horizontal overflow, overlapping controls, clipped validation, or unreadable long-number regions.
- [ ] The complete workflow is keyboard operable with visible focus and logical focus order.
- [ ] Mode, active key, loading, errors, copy success, and updated results are programmatically conveyed without relying only on color.
- [ ] Automated accessibility checks report no serious or critical violations on Encrypt and Decrypt states.
- [ ] Backend and frontend automated suites, typecheck, lint, and production build pass.
- [ ] Legacy endpoints are either retained with a documented reason or removed only after confirming the accepted UI no longer depends on them.
- [ ] Issue #17 is closed or rewritten to contain only behavior still missing after the redesign.
- [ ] Issue #20 links the completed audit evidence and any separately scoped findings.
- [ ] Design references, architecture documentation, README, and changelog match the delivered behavior.
- [ ] Defects discovered here return to Stories 1–4 or become separate follow-ups; this story does not silently absorb feature development.

## Dependency Order

```text
Story 1: teaching API contract
        ↓
Story 2: workspace and key foundation
       ↙ ↘
Story 3   Story 4
Encrypt   Decrypt
       ↘ ↙
Story 5: integrated acceptance
```

Stories 3 and 4 may run in parallel after the shared components and API contract are stable.

## Tentative Capacity

| Story | Estimate |
| --- | ---: |
| 1. Teaching-mode RSA trace API | 8–12 hours |
| 2. Guided workspace and key-pair panel | 8–12 hours |
| 3. Live Encrypt learning flow | 6–10 hours |
| 4. Live Decrypt learning flow | 6–10 hours |
| 5. Responsive/accessibility acceptance | 4–6 hours |
| **Total** | **32–50 hours** |

These are grooming estimates, not commitments. Confirm ownership, implementation approach, and whether tests/tooling must be introduced before loading the stories into the active iteration.

## Existing-Issue Reconciliation

- **#17 — Mobile vs Laptop functionality:** overlaps with Stories 2–5. Keep it open as a linked legacy finding until the redesigned workflow is accepted; then close it or narrow it to any remaining behavior.
- **#20 — UX & accessibility audit: issue card template:** retain as the audit umbrella. Link Story 5 evidence and create separate findings only for defects not already owned by Stories 2–4.
