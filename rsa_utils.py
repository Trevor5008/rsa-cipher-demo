def rsa_encrypt(message, e, n):
   message_as_number = int.from_bytes(message.encode('utf-8'), 'big')

   if message_as_number >= n:
      raise ValueError("Message is too large for the key size.")
   
   cipher_text = str(pow(message_as_number, e, n))

   return cipher_text