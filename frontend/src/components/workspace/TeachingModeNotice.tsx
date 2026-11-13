export default function TeachingModeNotice() {
  return (
    <aside aria-label="Teaching mode" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
      <strong>Teaching mode.</strong> This lab encrypts one character at a time with textbook RSA so you can follow the
      math. Real RSA never encrypts text character by character: it protects a short secret (usually a symmetric key)
      with randomized OAEP padding and keys of at least 2048 bits, using reviewed cryptographic libraries. Do not use
      this lab to protect real data.
    </aside>
  );
}
