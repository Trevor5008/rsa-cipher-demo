import pytest

from conftest import FIXTURE_CIPHERTEXT, FIXTURE_KEY, FIXTURE_PLAINTEXT
from teaching_rsa import (
    MAX_CIPHERTEXT_TOKENS,
    MAX_INTEGER_BITS,
    MAX_TEXT_LENGTH,
    TeachingValidationErrors,
    decrypt_values,
    derive_key,
    encrypt_text,
    parse_ciphertext,
    parse_decimal,
)


def errors_of(call, *args):
    with pytest.raises(TeachingValidationErrors) as failure:
        call(*args)
    return [error.to_dict() for error in failure.value.errors]


class TestParseDecimal:
    @pytest.mark.parametrize("value, expected", [("42", 42), (" 7 ", 7), ("0", 0), (65537, 65537)])
    def test_accepts_decimal_strings_and_json_integers(self, value, expected):
        assert parse_decimal(value, "x") == expected

    @pytest.mark.parametrize("value", ["-5", "+5", "1.0", "1e3", "0x1F", "12a", "١٢", "²", 1.5, True, [], {}, -1])
    def test_rejects_non_integers(self, value):
        [error] = errors_of(parse_decimal, value, "x")
        assert (error["field"], error["code"]) == ("x", "not_integer")

    @pytest.mark.parametrize("value", [None, "", "   "])
    def test_missing_values(self, value):
        assert errors_of(parse_decimal, value, "x")[0]["code"] == "missing"

    def test_rejects_values_over_the_bit_limit(self):
        assert parse_decimal(str(2**MAX_INTEGER_BITS - 1), "x") == 2**MAX_INTEGER_BITS - 1
        assert errors_of(parse_decimal, str(2**MAX_INTEGER_BITS), "x")[0]["code"] == "too_large"
        assert errors_of(parse_decimal, "9" * 5000, "x")[0]["code"] == "too_large"


class TestDeriveKey:
    def test_fixture_key(self):
        key = derive_key(FIXTURE_KEY["p"], FIXTURE_KEY["q"], FIXTURE_KEY["e"])
        assert key == {
            **FIXTURE_KEY,
            "publicKey": {"e": "65537", "n": "1022117"},
            "privateKey": {"d": "832193", "n": "1022117"},
        }

    def test_textbook_key(self):
        key = derive_key("61", "53", "17")
        assert (key["n"], key["phi"], key["d"]) == ("3233", "3120", "2753")

    def test_reports_each_invalid_field(self):
        errors = errors_of(derive_key, "abc", "15", "")
        assert [(e["field"], e["code"]) for e in errors] == [
            ("p", "not_integer"),
            ("q", "not_prime"),
            ("e", "missing"),
        ]

    def test_equal_primes(self):
        assert [(e["field"], e["code"]) for e in errors_of(derive_key, "61", "61", "17")] == [("q", "same_as_p")]

    @pytest.mark.parametrize("e", ["1", "0", "3120", "65537"])
    def test_e_out_of_range(self, e):
        assert [(x["field"], x["code"]) for x in errors_of(derive_key, "61", "53", e)] == [("e", "out_of_range")]

    def test_e_not_coprime_with_phi(self):
        errors = errors_of(derive_key, "61", "53", "15")
        assert [(e["field"], e["code"]) for e in errors] == [("e", "not_coprime")]
        assert "3120" in errors[0]["message"]

    def test_e_range_is_not_checked_when_primes_are_invalid(self):
        assert [(e["field"], e["code"]) for e in errors_of(derive_key, "60", "53", "1")] == [("p", "not_prime")]


class TestEncryptText:
    def test_fixture_encryption(self):
        result = encrypt_text(FIXTURE_PLAINTEXT, FIXTURE_KEY["e"], FIXTURE_KEY["n"])
        assert result["ciphertext"] == FIXTURE_CIPHERTEXT
        assert result["display"] == "924799 621270 2637 924799"
        assert result["trace"] == [
            {"index": 1, "character": "t", "codePoint": "116", "ciphertext": "924799"},
            {"index": 2, "character": "e", "codePoint": "101", "ciphertext": "621270"},
            {"index": 3, "character": "s", "codePoint": "115", "ciphertext": "2637"},
            {"index": 4, "character": "t", "codePoint": "116", "ciphertext": "924799"},
        ]

    def test_empty_text(self):
        assert encrypt_text("", "17", "3233") == {"ciphertext": [], "display": "", "trace": []}

    def test_iterates_by_code_point(self):
        result = encrypt_text("a😀", FIXTURE_KEY["e"], FIXTURE_KEY["n"])
        assert [row["codePoint"] for row in result["trace"]] == ["97", str(0x1F600)]
        assert result["trace"][1]["character"] == "😀"

    def test_rejects_first_code_point_not_smaller_than_n(self):
        # n = 3233: "ఀ" (U+0C00 = 3072) fits, "ൿ" (U+0D7F = 3455) does not.
        [error] = errors_of(encrypt_text, "aఀൿ😀", "17", "3233")
        assert (error["field"], error["code"], error["index"]) == ("text", "unsupported_character", 3)
        assert "3455" in error["message"] and "3233" in error["message"]

    def test_code_point_boundary(self):
        assert encrypt_text(chr(3232), "17", "3233")["trace"][0]["codePoint"] == "3232"
        assert errors_of(encrypt_text, chr(3233), "17", "3233")[0]["code"] == "unsupported_character"

    def test_validates_key_values(self):
        errors = errors_of(encrypt_text, "hi", "0", "x")
        assert [(e["field"], e["code"]) for e in errors] == [("e", "out_of_range"), ("n", "not_integer")]

    @pytest.mark.parametrize("text, code", [(None, "missing"), (123, "not_text")])
    def test_text_must_be_a_string(self, text, code):
        [error] = errors_of(encrypt_text, text, "17", "3233")
        assert (error["field"], error["code"]) == ("text", code)
        assert "index" not in error

    def test_text_length_limit(self):
        assert len(encrypt_text("a" * MAX_TEXT_LENGTH, "17", "3233")["trace"]) == MAX_TEXT_LENGTH
        assert errors_of(encrypt_text, "a" * (MAX_TEXT_LENGTH + 1), "17", "3233")[0]["code"] == "too_long"


class TestParseCiphertext:
    def test_splits_on_any_whitespace(self):
        assert parse_ciphertext("  924799\t621270\n2637   924799 ", 1022117) == [924799, 621270, 2637, 924799]

    @pytest.mark.parametrize("text", ["", "   \n\t "])
    def test_empty_input_has_no_values(self, text):
        assert parse_ciphertext(text, 3233) == []

    @pytest.mark.parametrize("token", ["-5", "1.5", "abc", "1,2", "+3", "١"])
    def test_rejects_non_integer_tokens(self, token):
        errors = errors_of(parse_ciphertext, f"10 {token} 20", 3233)
        assert [(e["code"], e["index"]) for e in errors] == [("not_integer", 2)]

    @pytest.mark.parametrize("token", ["3233", "99999", "9" * 5000])
    def test_rejects_values_outside_the_rsa_range(self, token):
        errors = errors_of(parse_ciphertext, f"10 {token}", 3233)
        assert [(e["code"], e["index"]) for e in errors] == [("out_of_range", 2)]

    def test_token_limit(self):
        assert len(parse_ciphertext("1 " * MAX_CIPHERTEXT_TOKENS, 3233)) == MAX_CIPHERTEXT_TOKENS
        assert errors_of(parse_ciphertext, "1 " * (MAX_CIPHERTEXT_TOKENS + 1), 3233)[0]["code"] == "too_long"


class TestDecryptValues:
    def test_fixture_decryption(self):
        result = decrypt_values(" ".join(FIXTURE_CIPHERTEXT), FIXTURE_KEY["d"], FIXTURE_KEY["n"])
        assert result == {
            "message": "test",
            "trace": [
                {"index": 1, "ciphertext": "924799", "codePoint": "116", "character": "t"},
                {"index": 2, "ciphertext": "621270", "codePoint": "101", "character": "e"},
                {"index": 3, "ciphertext": "2637", "codePoint": "115", "character": "s"},
                {"index": 4, "ciphertext": "924799", "codePoint": "116", "character": "t"},
            ],
        }

    def test_empty_ciphertext(self):
        assert decrypt_values("", "2753", "3233") == {"message": "", "trace": []}

    def test_rejects_surrogate_code_points(self):
        # Encrypt a surrogate value directly so decryption recovers it.
        c = pow(0xD800, 65537, 1022117)
        errors = errors_of(decrypt_values, f"924799 {c}", FIXTURE_KEY["d"], FIXTURE_KEY["n"])
        assert [(e["code"], e["index"]) for e in errors] == [("invalid_code_point", 2)]

    def test_rejects_values_above_the_unicode_range(self):
        # p = 1103, q = 1109 gives n = 1223227 > 0x10FFFF, so m = 0x110000 is representable.
        key = derive_key("1103", "1109", "65537")
        c = pow(0x110000, 65537, int(key["n"]))
        errors = errors_of(decrypt_values, str(c), key["d"], key["n"])
        assert [(e["code"], e["index"]) for e in errors] == [("invalid_code_point", 1)]

    def test_round_trip_with_non_ascii_text(self):
        key = derive_key("1009", "1013", "65537")
        text = "Héllo, wörld 😀"
        encrypted = encrypt_text(text, key["e"], key["n"])
        assert decrypt_values(encrypted["display"], key["d"], key["n"])["message"] == text
