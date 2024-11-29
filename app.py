from flask import Flask, send_from_directory, request, jsonify
from rsa_utils import rsa_encrypt, rsa_decrypt, validate_isprime, find_mod_inverse, generate_prime_vals
from flask_cors import CORS   
import os

app = Flask(__name__, static_folder="frontend/dist")
CORS(app)

@app.route('/')
def serve_index():
   return send_from_directory(app.static_folder, 'index.html')

@app.route('/favicon.ico')
def serve_favicon():
   return send_from_directory(app.static_folder, 'favicon.ico')

@app.route('/<path:path>')
def serve_static(path):
   if os.path.exists(os.path.join(app.static_folder, path)):
      return send_from_directory(app.static_folder, path)
   else:
      return send_from_directory(app.static_folder, 'index.html')

@app.route('/generate-primes', methods=['GET'])
def generate_primes():
   p, q = generate_prime_vals()

   return jsonify({
      'p': str(p), 
      'q': str(q), 
      'mod': str(p * q),
      'd': str(find_mod_inverse(65537, (p - 1) * (q - 1)))
   })
   
@app.route('/validate-prime', methods=['POST'])
def validate_prime():
   data = request.json

   if not data:
      return jsonify({'error': 'Missing JSON body'}), 400

   val = data.get('val')
   is_valid = validate_isprime(int(val))
   print(is_valid)

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

   public_key = {'e': e, 'n': str(n)}
   private_key = {'d': str(d), 'n': str(n)}

   return jsonify({
      'publicKey': public_key, 
      'privateKey': private_key
   })

@app.route('/encrypt', methods=['POST'])
def encrypt_message():
   if request.method == 'OPTIONS':
      return jsonify({'message': 'Options request received'}), 200
   
   data = request.json

   if not data:
      return jsonify({'error': 'Missing JSON body'}), 400

   message = data.get('text')

   e = data.get('publicExp')
   n = data.get('mod')

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

   message = data.get('text')

   d = data.get('privateExp')
   n = data.get('mod')

   if not d:
      return jsonify({'error': 'Missing private exponent'}),
   if not n:
      return jsonify({'error': 'Missing modulus'}),
   if not message:
      return jsonify({'error': 'Missing encrypted message'}),

   if not message or not d or not n:
      return jsonify({'error': 'Missing required parameters'}), 400
   try:
      decrypted_message = rsa_decrypt(
          int(message), int(d), int(n))
      return jsonify({'decrypted_message': decrypted_message})
   except ValueError as ve:
      return jsonify({'error': str(ve)}), 400
   
# Handle 404 for React routing
def not_found(e):
   return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
   app.run(debug=True)