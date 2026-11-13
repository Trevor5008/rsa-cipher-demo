import pytest

from app import app as flask_app

FIXTURE_KEY = {
    "p": "1009",
    "q": "1013",
    "e": "65537",
    "n": "1022117",
    "phi": "1020096",
    "d": "832193",
}
FIXTURE_PLAINTEXT = "test"
FIXTURE_CIPHERTEXT = ["924799", "621270", "2637", "924799"]


@pytest.fixture
def client():
    flask_app.config.update(TESTING=True)
    with flask_app.test_client() as client:
        yield client
