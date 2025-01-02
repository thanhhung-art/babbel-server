import * as crypto from 'crypto';

/**
 * Generates a random salt of the specified length
 * @param {number} length - The length of the salt to generate
 * @returns {string} The generated salt
 * @example
 * const salt = generateSalt(16);
 */
export function generateSalt(length) {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Hashes a password using SHA-512 with the provided salt
 * @param {string} password - The plain text password to hash
 * @param {string} salt - The cryptographic salt to use
 * @returns {Object} Object containing both salt and hashed password
 * @example
 * const salt = generateSalt(16);
 * const { hashedPassword } = hashPassword('myPassword123', salt);
 */
export function hashPassword(password, salt) {
  const hash = crypto.createHmac('sha512', salt);
  hash.update(password);
  const hashedPassword = hash.digest('hex');
  return {
    salt: salt,
    hashedPassword: hashedPassword,
  };
}

/**
 * Verifies a password by comparing it to a hashed password
 * @param {string} password - The plain text password to verify
 * @param {string} salt - The cryptographic salt used to hash the password
 * @param {string} hashedPassword - The hashed password to compare against
 * @returns {boolean} True if the password is correct, false otherwise
 * @example
 * const salt = generateSalt(16);
 * const { hashedPassword } = hashPassword('myPassword123', salt);
 * const isCorrect = verifyPassword('myPassword123', salt, hashedPassword);
 */
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
