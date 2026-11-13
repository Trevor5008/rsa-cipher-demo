import pytest

from conftest import FIXTURE_CIPHERTEXT, FIXTURE_KEY, FIXTURE_PLAINTEXT


def post(client, path, body):
    return client.post(f"/teaching/{path}", json=body)


def error_pairs(response):
    return [(error["field"], error["code"]) for error in response.get_json()["errors"]]


class TestKeys:
    def test_fixture_key(self, client):
        response = post(client, "keys", {"p": "1009", "q": "1013", "e": "65537"})
        assert response.status_code == 200
        assert response.get_json() == {
            **FIXTURE_KEY,
            "publicKey": {"e": "65537", "n": "1022117"},
            "privateKey": {"d": "832193", "n": "1022117"},
        }

    def test_accepts_json_integers_but_returns_strings(self, client):
        body = post(client, "keys", {"p": 61, "q": 53, "e": 17}).get_json()
        assert body["n"] == "3233" and body["d"] == "2753"
        assert all(isinstance(value, str) for key, value in body.items() if key not in ("publicKey", "privateKey"))

    def test_large_values_survive_as_strings(self, client):
        p, q = "170141183460469231731687303715884105727", "618970019642690137449562111"
        body = post(client, "keys", {"p": p, "q": q, "e": "65537"}).get_json()
        assert body["n"] == str(int(p) * int(q))

    def test_reports_all_field_errors(self, client):
        response = post(client, "keys", {"p": "12", "q": "-3", "e": True})
        assert response.status_code == 400
        assert error_pairs(response) == [("p", "not_prime"), ("q", "not_integer"), ("e", "not_integer")]

    def test_missing_fields(self, client):
        response = post(client, "keys", {})
        assert error_pairs(response) == [("p", "missing"), ("q", "missing"), ("e", "missing")]

    def test_not_coprime(self, client):
        response = post(client, "keys", {"p": "61", "q": "53", "e": "15"})
        assert response.status_code == 400
        assert error_pairs(response) == [("e", "not_coprime")]


class TestEncrypt:
    def test_fixture_encryption(self, client):
        response = post(client, "encrypt", {"text": FIXTURE_PLAINTEXT, "e": "65537", "n": "1022117"})
        assert response.status_code == 200
        body = response.get_json()
        assert body["ciphertext"] == FIXTURE_CIPHERTEXT
        assert body["display"] == " ".join(FIXTURE_CIPHERTEXT)
        assert body["trace"][0] == {"index": 1, "character": "t", "codePoint": "116", "ciphertext": "924799"}

    def test_unsupported_character_reports_index(self, client):
        response = post(client, "encrypt", {"text": "hi😀", "e": "17", "n": "3233"})
        assert response.status_code == 400
        [error] = response.get_json()["errors"]
        assert (error["field"], error["code"], error["index"]) == ("text", "unsupported_character", 3)


class TestDecrypt:
    def test_fixture_decryption(self, client):
        response = post(client, "decrypt", {"ciphertext": "924799\n621270\t2637  924799", "d": "832193", "n": "1022117"})
        assert response.status_code == 200
        body = response.get_json()
        assert body["message"] == FIXTURE_PLAINTEXT
        assert body["trace"][2] == {"index": 3, "ciphertext": "2637", "codePoint": "115", "character": "s"}

    @pytest.mark.parametrize("ciphertext, code, index", [
        ("924799 abc", "not_integer", 2),
        ("924799 621270 1022117", "out_of_range", 3),
    ])
    def test_ciphertext_errors_report_index(self, client, ciphertext, code, index):
        response = post(client, "decrypt", {"ciphertext": ciphertext, "d": "832193", "n": "1022117"})
        assert response.status_code == 400
        [error] = response.get_json()["errors"]
        assert (error["field"], error["code"], error["index"]) == ("ciphertext", code, index)


class TestRoundTrip:
    @pytest.mark.parametrize("p, q, e, text", [
        ("61", "53", "17", "Hello, RSA!"),
        ("1009", "1013", "65537", "Grüße 😀 ✓"),
    ])
    def test_keys_encrypt_decrypt(self, client, p, q, e, text):
        key = post(client, "keys", {"p": p, "q": q, "e": e}).get_json()
        encrypted = post(client, "encrypt", {"text": text, **key["publicKey"]}).get_json()
        decrypted = post(client, "decrypt", {"ciphertext": encrypted["display"], **key["privateKey"]}).get_json()
        assert decrypted["message"] == text
        assert [row["codePoint"] for row in decrypted["trace"]] == [row["codePoint"] for row in encrypted["trace"]]


class TestRequestBody:
    @pytest.mark.parametrize("path", ["keys", "encrypt", "decrypt"])
    def test_missing_body(self, client, path):
        response = client.post(f"/teaching/{path}")
        assert response.status_code == 400
        assert error_pairs(response) == [("body", "invalid_body")]

    @pytest.mark.parametrize("payload", ["[1, 2]", '"text"', "42", "null", "{not json"])
    def test_non_object_body(self, client, payload):
        response = client.post("/teaching/keys", data=payload, content_type="application/json")
        assert response.status_code == 400
        assert error_pairs(response) == [("body", "invalid_body")]
