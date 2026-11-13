"""Guard the existing whole-message endpoints the current UI depends on."""


def test_submit_keys_derives_the_fixture_key(client):
    response = client.post("/submit-keys", json={"p": "1009", "q": "1013", "publicExp": "65537"})
    assert response.status_code == 200
    assert response.get_json() == {
        "publicKey": {"e": 65537, "n": "1022117"},
        "privateKey": {"d": "832193", "n": "1022117"},
    }


def test_validate_prime(client):
    assert client.post("/validate-prime", json={"val": "1009"}).get_json()["valid"] is True
    assert client.post("/validate-prime", json={"val": "1010"}).status_code == 400


def test_encrypt_decrypt_round_trip(client):
    encrypted = client.post("/encrypt", json={"text": "Hi", "publicExp": "65537", "mod": "1022117"})
    assert encrypted.status_code == 200
    ciphertext = encrypted.get_json()["encrypted_message"]

    decrypted = client.post("/decrypt", json={"text": ciphertext, "privateExp": "832193", "mod": "1022117"})
    assert decrypted.status_code == 200
    assert decrypted.get_json()["decrypted_message"] == "Hi"


def test_encrypt_rejects_message_larger_than_modulus(client):
    response = client.post("/encrypt", json={"text": "test", "publicExp": "65537", "mod": "1022117"})
    assert response.status_code == 400
    assert "too large" in response.get_json()["error"]
