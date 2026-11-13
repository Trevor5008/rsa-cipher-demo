# Teaching-Mode RSA API

The teaching-mode endpoints compute textbook RSA one Unicode character at a time and return every intermediate value, so the learning UI can show each step of key generation, encryption, and decryption.

> **For learning only.** Teaching mode is textbook RSA with no padding, and it encrypts each character separately. Identical characters produce identical ciphertext, so the output leaks the structure of the message. Never use these endpoints, or anything built on them, to protect real data. See the [Educational Security Boundary](../README.md#educational-security-boundary).

For the mathematics behind each value, see [RSA Foundations for Learners](RSA-FOUNDATIONS.md).

## Contents

- [Conventions](#conventions)
- [POST /teaching/keys](#post-teachingkeys)
- [POST /teaching/encrypt](#post-teachingencrypt)
- [POST /teaching/decrypt](#post-teachingdecrypt)
- [Errors](#errors)
- [Test fixture](#test-fixture)
- [Relationship to the legacy endpoints](#relationship-to-the-legacy-endpoints)

## Conventions

| Topic | Rule |
| --- | --- |
| Request body | A JSON object. Anything else (missing body, invalid JSON, an array, a string) returns `400` with field `body` and code `invalid_body`. |
| Integer inputs | Decimal strings such as `"65537"` are preferred. Plain JSON integers (`65537`) are also accepted; booleans are not. Surrounding whitespace is trimmed. Signs, decimal points, exponents, and non-ASCII digits are rejected. Each integer may be at most 4096 bits. |
| Integer outputs | Every RSA value (`p`, `q`, `e`, `n`, `phi`, `d`, `codePoint`, `ciphertext`) is returned as a decimal **string**, because RSA values quickly exceed the integers JavaScript can represent exactly. |
| Positions | `index` is the only JSON number in responses. It is **1-based** so it can be shown to learners as-is ("character 3"). |
| Characters | Text is processed per Unicode code point, so an emoji such as 😀 is one character with code point `128512`. |
| Ciphertext input | Whitespace-separated decimal integers. Spaces, tabs, and newlines can be mixed. Whitespace-only input decrypts to an empty message. |
| Limits | `text` may contain at most 1000 characters; `ciphertext` may contain at most 1000 values. |

## POST /teaching/keys

Validates $p$, $q$, and $e$, then derives $n = pq$, $\varphi(n) = (p - 1)(q - 1)$, and $d \equiv e^{-1} \pmod{\varphi(n)}$.

Validation rules:

- $p$ and $q$ must be prime, and $q$ must be different from $p$.
- $e$ must satisfy $1 < e < \varphi(n)$ and $\gcd(e, \varphi(n)) = 1$. These checks run only once $p$ and $q$ are valid, because $\varphi(n)$ depends on them.

All invalid fields are reported together (at most one error per field), so the UI can show inline feedback on every input at once.

**Request**

```json
{ "p": "1009", "q": "1013", "e": "65537" }
```

**Response `200`**

```json
{
  "p": "1009",
  "q": "1013",
  "e": "65537",
  "n": "1022117",
  "phi": "1020096",
  "d": "832193",
  "publicKey": { "e": "65537", "n": "1022117" },
  "privateKey": { "d": "832193", "n": "1022117" }
}
```

> The classic textbook primes $p = 61$, $q = 53$ give $\varphi(n) = 3120$, so $e = 65537$ is out of range for them. Use a small exponent such as $e = 17$ (which gives $d = 2753$).

## POST /teaching/encrypt

Encrypts each character separately: $c_i = m_i^e \bmod n$, where $m_i$ is the code point of character $i$.

Every code point must be smaller than $n$. If one is not, the request fails with `unsupported_character` and the `index` of the **first** offending character.

**Request**

```json
{ "text": "test", "e": "65537", "n": "1022117" }
```

**Response `200`**

```json
{
  "ciphertext": ["924799", "621270", "2637", "924799"],
  "display": "924799 621270 2637 924799",
  "trace": [
    { "index": 1, "character": "t", "codePoint": "116", "ciphertext": "924799" },
    { "index": 2, "character": "e", "codePoint": "101", "ciphertext": "621270" },
    { "index": 3, "character": "s", "codePoint": "115", "ciphertext": "2637" },
    { "index": 4, "character": "t", "codePoint": "116", "ciphertext": "924799" }
  ]
}
```

`display` is the ciphertext joined with single spaces, ready to paste into the decrypt endpoint. Notice that both `t` characters encrypt to `924799`; this is the structural leak described in the warning above.

## POST /teaching/decrypt

Decrypts each value separately: $m_i = c_i^d \bmod n$, then decodes $m_i$ as a Unicode character.

Each ciphertext value must be a non-negative integer smaller than $n$. Each decrypted value must be a valid Unicode scalar value (at most `0x10FFFF` and not a surrogate). The first failing value is reported with its `index`. A wrong key usually shows up as `invalid_code_point`, or as a message of unexpected characters.

**Request**

```json
{ "ciphertext": "924799 621270 2637 924799", "d": "832193", "n": "1022117" }
```

**Response `200`**

```json
{
  "message": "test",
  "trace": [
    { "index": 1, "ciphertext": "924799", "codePoint": "116", "character": "t" },
    { "index": 2, "ciphertext": "621270", "codePoint": "101", "character": "e" },
    { "index": 3, "ciphertext": "2637", "codePoint": "115", "character": "s" },
    { "index": 4, "ciphertext": "924799", "codePoint": "116", "character": "t" }
  ]
}
```

## Errors

Validation failures return HTTP `400` with a list of structured errors:

```json
{
  "errors": [
    {
      "field": "text",
      "code": "unsupported_character",
      "message": "Character 3 (\"😀\", code point 128512) is too large for this key: code points must be smaller than n = 3233.",
      "index": 3
    }
  ]
}
```

| Field | Meaning |
| --- | --- |
| `field` | The request field the error belongs to (`p`, `q`, `e`, `d`, `n`, `text`, `ciphertext`, or `body`). |
| `code` | A stable, machine-readable code. Match on this, not on `message`. |
| `message` | A learner-friendly explanation that can be shown directly in the UI. |
| `index` | Present only for per-character or per-value errors: the 1-based position in `text` or `ciphertext`. |

`/teaching/keys` reports every invalid field. `/teaching/encrypt` and `/teaching/decrypt` report invalid key fields together; otherwise they stop at the first failing character or value.

| Code | Fields | When |
| --- | --- | --- |
| `invalid_body` | `body` | The request body is not a JSON object. |
| `missing` | any | The field is absent, `null`, or blank. |
| `not_integer` | `p`, `q`, `e`, `d`, `n`, `ciphertext` | The value is not a non-negative whole number written with the digits 0-9. |
| `too_large` | `p`, `q`, `e`, `d`, `n` | The value exceeds 4096 bits. |
| `not_prime` | `p`, `q` | The value is not prime. |
| `same_as_p` | `q` | `q` equals `p`. |
| `out_of_range` | `e`, `d`, `n`, `ciphertext` | `e` is not in $1 < e < \varphi(n)$; `d` is below 1; `n` is below 2; or a ciphertext value is not smaller than `n`. |
| `not_coprime` | `e` | $\gcd(e, \varphi(n)) \ne 1$, so no private exponent exists. |
| `not_text` | `text`, `ciphertext` | The value is not a JSON string. |
| `too_long` | `text`, `ciphertext` | More than 1000 characters or values. |
| `unsupported_character` | `text` | A character's code point is not smaller than `n`. |
| `invalid_code_point` | `ciphertext` | A value decrypts to a number that is not a valid Unicode character. |

## Test fixture

The backend tests and these docs share one fixture, which is small enough to check by hand:

| Value | |
| --- | --- |
| $p, q, e$ | `1009`, `1013`, `65537` |
| $n, \varphi(n), d$ | `1022117`, `1020096`, `832193` |
| Plaintext | `test` |
| Ciphertext | `924799 621270 2637 924799` |

Run the tests from the repository root:

```sh
pip install -r requirements-dev.txt
pytest
```

## Relationship to the legacy endpoints

The original endpoints (`/submit-keys`, `/encrypt`, `/decrypt`, `/validate-prime`, `/generate-primes/...`) are unchanged and still power the current UI. They encode the **whole** ASCII message as a single integer, so they cannot produce a per-character trace and reject messages whose encoding is not smaller than $n$. The teaching endpoints are additive; `tests/test_legacy_endpoints.py` guards the legacy behavior so the two can coexist until the redesigned UI moves over.
