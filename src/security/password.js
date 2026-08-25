import crypto from 'node:crypto';

export const DEFAULT_ITERATIONS = 20000;
const SALT_BYTES = 16;
const HASH_BYTES = 32;
const ALGORITHM = 'sha256';

export function hashPassword(password, iterations = DEFAULT_ITERATIONS) {
  const salt = crypto.randomBytes(SALT_BYTES);
  const derivedKey = crypto.pbkdf2Sync(password, salt, iterations, HASH_BYTES, ALGORITHM);
  return {
    salt: salt.toString('base64'),
    hash: derivedKey.toString('base64'),
    iterations,
  };
}

export function verifyPassword(password, saltBase64, expectedHashBase64, iterations) {
  try {
    const salt = Buffer.from(saltBase64, 'base64');
    const expectedHash = Buffer.from(expectedHashBase64, 'base64');

    if (salt.length !== SALT_BYTES || expectedHash.length !== HASH_BYTES) {
      return false;
    }

    const actualHash = crypto.pbkdf2Sync(
      password,
      salt,
      iterations,
      expectedHash.length,
      ALGORITHM,
    );

    return crypto.timingSafeEqual(actualHash, expectedHash);
  } catch {
    return false;
  }
}

export function generateTemporaryPassword(length = 10) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
  let password = '';
  const randomBytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i += 1) {
    password += alphabet[randomBytes[i] % alphabet.length];
  }
  return password;
}
