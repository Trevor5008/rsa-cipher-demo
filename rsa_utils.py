# Format default is utf-8, also works with ascii
def rsa_encrypt(message, e, n, format='utf-8'):
   message_as_number = int.from_bytes(message.encode(format), 'big')

   if message_as_number >= n:
      raise ValueError("Message is too large for the key size.")
   
   cipher_text = str(pow(message_as_number, e, n))

   return cipher_text

# public exponent (e) constant
e = 65537

# Format defaults to utf-8, also works with ascii
def rsa_decrypt(cipher_text, d, n, format='utf-8'):
   decrypted = pow(cipher_text, d, n)

   decrypted_message = decrypted.to_bytes((decrypted.bit_length() + 7) // 8, 'big').decode(format)

   return decrypted_message