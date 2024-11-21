from flask import Flask, request, jsonify
from rsa_utils import rsa_encrypt
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/', methods=['GET'])
def hello_world():
   return 'Hello, World!'

@app.route('/encrypt', methods=['POST'])
def encrypt_message():
   data = request.json

   if not data:
      return jsonify({ 'error': 'Missing JSON body' }), 400
   
   message = data.get('phrase')
   public_key = data.get('publicKey')

   if not public_key:
      return jsonify({ 'error': 'Missing public key' }), 400
   
   e = public_key.get('e')
   n = public_key.get('n')

   if not message or not e or not n:
      return jsonify({ 'error': 'Missing required parameters' }), 400
   
   try:
      encrypted_message = rsa_encrypt(message, int(e), int(n))
      return jsonify({'encrypted_message': encrypted_message})
   except ValueError as ve:
      return jsonify({'error': str(ve)}), 400
   
if __name__ == '__main__':
   app.run(debug=True)