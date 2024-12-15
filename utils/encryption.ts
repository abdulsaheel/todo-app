export function encrypt(text: string, password: string): string {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i) ^ password.charCodeAt(i % password.length);
    result += String.fromCharCode(charCode);
  }
  return btoa(result); // Base64 encode for safe storage
}

export function decrypt(encryptedText: string, password: string): string {
  const text = atob(encryptedText); // Base64 decode
  let result = '';
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i) ^ password.charCodeAt(i % password.length);
    result += String.fromCharCode(charCode);
  }
  return result;
}

