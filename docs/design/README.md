# RSA Learning Lab UI/UX Target

These mockups are the visual and interaction target for the student-focused redesign.

Implementation planning: [Redesign Implementation Stories](IMPLEMENTATION-STORIES.md)

## Reference Screens

The visual mockups are maintained in the project owner's Obsidian workspace:

```text
Projects/RSA-Demo/Design/RSA-Learning-Lab-Mockups.md
Projects/RSA-Demo/Design/RSA-Learning-Lab-Encrypt-Target.png
Projects/RSA-Demo/Design/RSA-Learning-Lab-Decrypt-Target.png
```

The behavioral and implementation contract below remains repository-visible so contributors can implement the approved experience without depending on private planning notes.

## Core Experience

The redesign replaces the current modal-driven interface with one visible, progressive workspace:

1. Build or select a key pair.
2. Enter plaintext or ciphertext.
3. See the corresponding result.
4. Follow the arithmetic for every character in a live explanation and table.

The Encrypt/Decrypt switch changes the direction of the lesson without changing the overall page structure. Public-key state is emphasized in Encrypt mode; private-key state is emphasized in Decrypt mode.

## Primary UI Regions

- Compact application header with title, learner promise, and Encrypt/Decrypt segmented control.
- Three numbered cards for key construction, input, and output.
- Key-pair presets plus editable `p`, `q`, and `e` values.
- Derived values for `n`, `φ(n)`, and `d`.
- Public/private key summary cards with an active-key indicator.
- Live “How it works” section with three conceptual steps.
- Worked modular-exponentiation example for the first character/value.
- Row-by-row conversion table for the complete message.
- Persistent teaching-mode warning that distinguishes the demonstration from production RSA.

## Behavioral Contract Implied by the Mockups

- The page updates as the learner types rather than waiting for a modal submission.
- Encrypt mode converts each character to a code point and encrypts each value separately.
- Ciphertext is represented as space-separated integers.
- Decrypt mode validates and parses those integers, decrypts each one, and converts the recovered values back to characters.
- The same key pair persists when switching between Encrypt and Decrypt.
- The first row drives the expanded worked example; the table explains the remaining rows.
- Copy, Clear, “Decrypt this,” and “Encrypt again” actions preserve the learning flow.
- The selected preset and editable values must produce immediate, explainable validation feedback.

## Important Difference From the Current Application

The current backend encodes an entire ASCII message as one large integer before applying RSA. The mockups intentionally use one RSA operation per character so learners can inspect each transformation. Reaching this design therefore requires a teaching-mode data-contract and algorithm change, not only a CSS/component redesign.

For the textbook preset shown in the mockups:

```text
p = 1009
q = 1013
e = 65537
n = 1022117
φ(n) = 1020096
d = 832193
```

Encrypting `test` one character at a time produces:

```text
924799 621270 2637 924799
```

## Responsive Priorities

- Desktop/tablet: retain the three-column learning sequence.
- Narrow screens: stack the cards in numbered order and keep the mode switch and active-key state visible.
- Allow long key values and ciphertext to wrap or scroll without expanding the entire layout horizontally.
- Keep tap targets, labels, focus order, validation messages, and table alternatives accessible.

## Scope Boundary

This design remains an educational textbook-RSA mode. It must continue to state that production RSA uses secure encodings such as OAEP/PSS, larger approved keys, secure randomness, and reviewed cryptographic libraries.
