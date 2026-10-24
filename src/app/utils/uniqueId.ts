const ID_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const ID_LENGTH = 20;
const UNBIASED_LIMIT = 256 - (256 % ID_CHARS.length);

export function uniqueId() {
  let id = '';
  while (id.length < ID_LENGTH) {
    for (const byte of crypto.getRandomValues(new Uint8Array(ID_LENGTH))) {
      if (byte < UNBIASED_LIMIT && id.length < ID_LENGTH) {
        id += ID_CHARS[byte % ID_CHARS.length];
      }
    }
  }
  return id;
}
