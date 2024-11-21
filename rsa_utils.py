def rsa_encrypt(message, e, n):
   message_as_number = int.from_bytes(message.encode('utf-8'), 'big')

   if message_as_number >= n:
      raise ValueError("Message is too large for the key size.")
   
   cipher_text = str(pow(message_as_number, e, n))

   return cipher_text

# public exponent (e) constant
e = 65537

def rsa_decrypt(cipher_text, d, n):
   decrypted = pow(cipher_text, d, n)

   decrypted_message = decrypted.to_bytes((decrypted.bit_length() + 7) // 8, 'big').decode('utf-8')

   return decrypted_message