export const bytesToBase64 = (bytes: Uint8Array) => {
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s);
};

export const base64ToBytes = (b64: string) => Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));

export const base64Url = (bytes: Uint8Array) => bytesToBase64(bytes).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

export const base64DecodedLength = (b64: string) => Math.floor((b64.replace(/=+$/, '').length * 3) / 4);

export const randomId = (bytes = 16) => base64Url(crypto.getRandomValues(new Uint8Array(bytes)));
