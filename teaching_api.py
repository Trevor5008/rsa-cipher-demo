"""Teaching-mode RSA endpoints: textbook RSA, one Unicode code point at a time.

For learning only; see docs/TEACHING-API.md.
"""

from flask import Blueprint, jsonify, request

from teaching_rsa import (
    TeachingValidationError,
    TeachingValidationErrors,
    decrypt_values,
    derive_key,
    encrypt_text,
)

teaching_bp = Blueprint("teaching", __name__, url_prefix="/teaching")


def _json_body() -> dict:
    body = request.get_json(silent=True)
    if not isinstance(body, dict):
        raise TeachingValidationErrors([
            TeachingValidationError("body", "invalid_body", "The request body must be a JSON object.")
        ])
    return body


@teaching_bp.errorhandler(TeachingValidationErrors)
def _validation_failed(failure: TeachingValidationErrors):
    return jsonify({"errors": [error.to_dict() for error in failure.errors]}), 400


@teaching_bp.post("/keys")
def keys():
    body = _json_body()
    return jsonify(derive_key(body.get("p"), body.get("q"), body.get("e")))


@teaching_bp.post("/encrypt")
def encrypt():
    body = _json_body()
    return jsonify(encrypt_text(body.get("text"), body.get("e"), body.get("n")))


@teaching_bp.post("/decrypt")
def decrypt():
    body = _json_body()
    return jsonify(decrypt_values(body.get("ciphertext"), body.get("d"), body.get("n")))
