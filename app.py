from flask import Flask, request, jsonify
from rsa_utils import rsa_encrypt
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/encrypt', methods=['POST'])
def encrypt_message():
   data = request.json
   message = data.get('message')
   e = data.get('e')
   n = data.get('n')

   if not message or not e or not n:
      return jsonify({ 'error': 'Missing required parameters' }), 400
   
   try:
      encrypted_message = rsa_encrypt(message, int(e), int(n))
      return jsonify({'encrypted_message': encrypted_message})
   except ValueError as ve:
      return jsonify({'error': str(ve)}), 400
   
if __name__ == '__main__':
   app.run(debug=True)