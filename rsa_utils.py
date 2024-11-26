import math
from sympy import isprime

# Validate that val is a prime number and that it is 512 bits in length
def validate_isprime(val):
   is_prime = isprime(val)

   # validate whether val is 512 bits
   return is_prime and len(bin(val)[2:]) >= 511

# private exponent (d) calculation 
def find_mod_inverse(e, phi):
   # verify e and phi are coprime
   if math.gcd(e, phi) != 1:
      return None
   
   # u3: public exponent (e), v3 = totient (phi)
   u1, u2, u3 = 1, 0, e
   v1, v2, v3 = 0, 1, phi

   while v3 != 0:
      # quotient calculation
      q = u3 // v3
      u1,u2,u3,v1,v2,v3 = (v1,v2,v3,u1-q*v1,u2-q*v2,u3-q*v3)

   # return private exponent
   # u1 is the modular inverse of e modulo phi   
   return u1 % phi


# Format default is utf-8, also works with ascii
def rsa_encrypt(message, e, n):
   message_as_number = int.from_bytes(message.encode("ascii"), 'big')

   if message_as_number >= n:
      raise ValueError("Message is too large for the key size.")
   
   cipher_text = str(pow(message_as_number, e, n))

   return cipher_text

# public exponent (e) constant
e = 65537

# Format defaults to utf-8, also works with ascii
def rsa_decrypt(cipher_text, d, n):
   decrypted = pow(cipher_text, d, n)

   decrypted_message = decrypted.to_bytes((decrypted.bit_length() + 7) // 8, 'big').decode("ascii")

   return decrypted_message