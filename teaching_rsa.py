"""Textbook RSA helpers for the teaching-mode API.

Teaching mode encrypts one Unicode code point at a time so a learner can follow
every transformation. This is deliberately insecure: there is no padding, and
encrypting characters individually leaks the structure of the message. Do not
use these helpers to protect real data.
"""

from __future__ import annotations

from dataclasses import dataclass
from math import gcd

from sympy import isprime

from rsa_utils import find_mod_inverse

MAX_INTEGER_BITS = 4096
# Upper bound on decimal digits for a MAX_INTEGER_BITS value; checked before int()
# so oversized strings never reach Python's integer parser.
MAX_INTEGER_DIGITS = 1234
MAX_TEXT_LENGTH = 1000
MAX_CIPHERTEXT_TOKENS = 1000
MAX_CODE_POINT = 0x10FFFF
SURROGATE_CODE_POINTS = range(0xD800, 0xE000)


@dataclass(frozen=True)
class TeachingValidationError:
    field: str
    code: str
    message: str
    index: int | None = None

    def to_dict(self) -> dict:
        error = {"field": self.field, "code": self.code, "message": self.message}
        if self.index is not None:
            error["index"] = self.index
        return error


class TeachingValidationErrors(Exception):
    def __init__(self, errors: list[TeachingValidationError]):
        super().__init__("; ".join(error.message for error in errors))
        self.errors = errors


def _fail(field: str, code: str, message: str, index: int | None = None):
    raise TeachingValidationErrors([TeachingValidationError(field, code, message, index)])


def parse_decimal(value, field: str) -> int:
    """Parse a non-negative integer sent as a decimal string (or a plain JSON integer)."""
    if value is None:
        _fail(field, "missing", f"{field} is required.")

    if isinstance(value, bool):
        _fail(field, "not_integer", f"{field} must be a whole number written with the digits 0-9.")

    if isinstance(value, int):
        if value < 0:
            _fail(field, "not_integer", f"{field} must be a non-negative whole number.")
        parsed = value
    elif isinstance(value, str):
        digits = value.strip()
        if not digits:
            _fail(field, "missing", f"{field} is required.")
        if not (digits.isascii() and digits.isdigit()):
            _fail(field, "not_integer", f"{field} must be a whole number written with the digits 0-9.")
        if len(digits) > MAX_INTEGER_DIGITS:
            _fail(field, "too_large", f"{field} must be at most {MAX_INTEGER_BITS} bits.")
        parsed = int(digits)
    else:
        _fail(field, "not_integer", f"{field} must be a whole number written with the digits 0-9.")

    if parsed.bit_length() > MAX_INTEGER_BITS:
        _fail(field, "too_large", f"{field} must be at most {MAX_INTEGER_BITS} bits.")

    return parsed


def _collect(errors: list[TeachingValidationError], parse, *args):
    try:
        return parse(*args)
    except TeachingValidationErrors as failure:
        errors.extend(failure.errors)
        return None


def _parse_text(value, field: str) -> str:
    if value is None:
        _fail(field, "missing", f"{field} is required.")
    if not isinstance(value, str):
        _fail(field, "not_text", f"{field} must be a string.")
    return value


def derive_key(p, q, e) -> dict:
    """Validate p, q, and e and derive the textbook RSA key pair.

    Reports every field error at once (at most one per field) so the UI can
    show inline feedback for each input.
    """
    errors: list[TeachingValidationError] = []

    p_val = _collect(errors, parse_decimal, p, "p")
    if p_val is not None and not isprime(p_val):
        errors.append(TeachingValidationError("p", "not_prime", f"p = {p_val} is not a prime number."))
        p_val = None

    q_val = _collect(errors, parse_decimal, q, "q")
    if q_val is not None and not isprime(q_val):
        errors.append(TeachingValidationError("q", "not_prime", f"q = {q_val} is not a prime number."))
        q_val = None
    elif q_val is not None and q_val == p_val:
        errors.append(TeachingValidationError("q", "same_as_p", "q must be a different prime from p."))
        q_val = None

    e_val = _collect(errors, parse_decimal, e, "e")
    if e_val is not None and p_val is not None and q_val is not None:
        phi = (p_val - 1) * (q_val - 1)
        if not 1 < e_val < phi:
            errors.append(TeachingValidationError(
                "e", "out_of_range", f"e must be greater than 1 and less than φ(n) = {phi}."
            ))
        elif gcd(e_val, phi) != 1:
            errors.append(TeachingValidationError(
                "e", "not_coprime",
                f"e = {e_val} shares a factor with φ(n) = {phi}, so no private exponent d exists. "
                "Choose an e with gcd(e, φ(n)) = 1.",
            ))

    if errors:
        raise TeachingValidationErrors(errors)

    n = p_val * q_val
    phi = (p_val - 1) * (q_val - 1)
    d = find_mod_inverse(e_val, phi)

    return {
        "p": str(p_val),
        "q": str(q_val),
        "e": str(e_val),
        "n": str(n),
        "phi": str(phi),
        "d": str(d),
        "publicKey": {"e": str(e_val), "n": str(n)},
        "privateKey": {"d": str(d), "n": str(n)},
    }


def _parse_exponent_and_modulus(exponent, exponent_field: str, n) -> tuple[int, int]:
    errors: list[TeachingValidationError] = []

    exponent_val = _collect(errors, parse_decimal, exponent, exponent_field)
    if exponent_val is not None and exponent_val < 1:
        errors.append(TeachingValidationError(exponent_field, "out_of_range", f"{exponent_field} must be at least 1."))

    n_val = _collect(errors, parse_decimal, n, "n")
    if n_val is not None and n_val < 2:
        errors.append(TeachingValidationError("n", "out_of_range", "n must be at least 2."))

    if errors:
        raise TeachingValidationErrors(errors)
    return exponent_val, n_val


def encrypt_text(text, e, n) -> dict:
    """Encrypt each Unicode code point of text separately: c = m^e mod n."""
    e_val, n_val = _parse_exponent_and_modulus(e, "e", n)
    text = _parse_text(text, "text")
    if len(text) > MAX_TEXT_LENGTH:
        _fail("text", "too_long", f"text must be at most {MAX_TEXT_LENGTH} characters.")

    ciphertext: list[str] = []
    trace: list[dict] = []
    for index, character in enumerate(text, start=1):
        m = ord(character)
        if m >= n_val:
            _fail(
                "text", "unsupported_character",
                f'Character {index} ("{character}", code point {m}) is too large for this key: '
                f"code points must be smaller than n = {n_val}.",
                index,
            )
        c = str(pow(m, e_val, n_val))
        ciphertext.append(c)
        trace.append({"index": index, "character": character, "codePoint": str(m), "ciphertext": c})

    return {"ciphertext": ciphertext, "display": " ".join(ciphertext), "trace": trace}


def parse_ciphertext(ciphertext, n: int) -> list[int]:
    """Split whitespace-separated ciphertext and validate each value as 0 <= c < n."""
    ciphertext = _parse_text(ciphertext, "ciphertext")
    tokens = ciphertext.split()
    if len(tokens) > MAX_CIPHERTEXT_TOKENS:
        _fail("ciphertext", "too_long", f"ciphertext must contain at most {MAX_CIPHERTEXT_TOKENS} values.")

    values: list[int] = []
    for index, token in enumerate(tokens, start=1):
        if not (token.isascii() and token.isdigit()):
            _fail(
                "ciphertext", "not_integer",
                f'Value {index} ("{token}") must be a non-negative whole number written with the digits 0-9.',
                index,
            )
        if len(token) > MAX_INTEGER_DIGITS or int(token) >= n:
            _fail(
                "ciphertext", "out_of_range",
                f"Value {index} must be smaller than n = {n}.",
                index,
            )
        values.append(int(token))
    return values


def decrypt_values(ciphertext, d, n) -> dict:
    """Decrypt each ciphertext value separately (m = c^d mod n) and decode it as a character."""
    d_val, n_val = _parse_exponent_and_modulus(d, "d", n)
    values = parse_ciphertext(ciphertext, n_val)

    characters: list[str] = []
    trace: list[dict] = []
    for index, c in enumerate(values, start=1):
        m = pow(c, d_val, n_val)
        if m > MAX_CODE_POINT or m in SURROGATE_CODE_POINTS:
            _fail(
                "ciphertext", "invalid_code_point",
                f"Value {index} decrypts to {m}, which is not a valid Unicode character. "
                "Check that the ciphertext was made with the matching public key.",
                index,
            )
        character = chr(m)
        characters.append(character)
        trace.append({"index": index, "ciphertext": str(c), "codePoint": str(m), "character": character})

    return {"message": "".join(characters), "trace": trace}
