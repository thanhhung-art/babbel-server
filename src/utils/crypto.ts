import * as crypto from 'crypto';

export function generateSalt(length) {
  return crypto.randomBytes(length).toString('hex');
}

export function hashPassword(password, salt) {
  const hash = crypto.createHmac('sha512', salt);
  hash.update(password);
  const hashedPassword = hash.digest('hex');
  return {
    salt: salt,
    hashedPassword: hashedPassword,
  };
}

export function verifyPassword(
  password: string,
  salt: string,
  hashedPassword: string,
): boolean {
  const hash = crypto.createHmac('sha512', salt);
  hash.update(password);
  const hashToCompare = hash.digest('hex');
  return hashToCompare === hashedPassword;
}
