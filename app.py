from flask import Flask, request, jsonify
from rsa_utils import rsa_encrypt, rsa_decrypt, validate_isprime, find_mod_inverse
from flask_cors import CORS

app = Flask(__name__)
CORS(app)


@app.route('/', methods=['GET'])
def hello_world():
   return 'Hello, World!'


@app.route('/validate-prime', methods=['POST'])
def validate_prime():
   data = request.json

   if not data:
      return jsonify({'error': 'Missing JSON body'}), 400

   val = data.get('val')
   is_valid = validate_isprime(int(val))

   if not is_valid:
      return jsonify({'error': 'Invalid prime number'}), 400

   return jsonify({'message': 'Valid prime number', 'valid': True})

@app.route('/submit-keys', methods=['POST', 'OPTIONS'])
def submit_keys():
   if request.method == 'OPTIONS':
      return jsonify({'message': 'Options request received'}), 200

   data = request.json

   if not data:
      return jsonify({'error': 'Missing JSON body'}), 400

   p = int(data.get('p'))
   q = int(data.get('q'))
   # calculate modulus (n)
   n = p * q
   # calculate totient (phi)
   phi = (p - 1) * (q - 1)
   # public exponent (e) constant
   e = int(data.get('publicExp'))
   # private exponent (d) calculation
   d = find_mod_inverse(e, phi)
   print(d)

   public_key = {'e': e, 'n': str(n)}
   private_key = {'d': str(d), 'n': str(n)}

   return jsonify({
      'publicKey': public_key, 
      'privateKey': private_key
   })


@app.route('/encrypt', methods=['POST'])
def encrypt_message():
   data = request.json

   if not data:
      return jsonify({'error': 'Missing JSON body'}), 400

   message = data.get('phrase')
   public_key = data.get('publicKey')

   if not public_key:
      return jsonify({'error': 'Missing public key'}), 400

   e = public_key.get('e')
   n = public_key.get('n')

   print(e, n)

   if not message or not e or not n:
      return jsonify({'error': 'Missing required parameters'}), 400

   try:
      encrypted_message = rsa_encrypt(message, int(e), int(n))
      return jsonify({'encrypted_message': encrypted_message})
   except ValueError as ve:
      return jsonify({'error': str(ve)}), 400


@app.route('/decrypt', methods=['POST'])
def decrypt_message():
   data = request.json

   if not data:
      return jsonify({'error': 'Missing JSON body'}), 400

   encrypted_message = data.get('encryptedPhrase')
   private_key = data.get('privateKey')

   if not private_key:
      return jsonify({'error': 'Missing private key'}), 400

   d = private_key.get('d')
   n = private_key.get('n')

   if not d:
      return jsonify({'error': 'Missing private exponent'}),
   if not n:
      return jsonify({'error': 'Missing modulus'}),
   if not encrypted_message:
      return jsonify({'error': 'Missing encrypted message'}),

   if not encrypted_message or not d or not n:
      return jsonify({'error': 'Missing required parameters'}), 400
   try:
      decrypted_message = rsa_decrypt(
          int(encrypted_message), int(d), int(n))
      return jsonify({'decrypted_message': decrypted_message})
   except ValueError as ve:
      return jsonify({'error': str(ve)}), 400


if __name__ == '__main__':
   app.run(debug=True)
