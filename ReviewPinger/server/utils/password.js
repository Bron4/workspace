const bcrypt = require('bcrypt');

const saltRounds = 10;

/**
 * Hashes the password using bcrypt algorithm
 * @param {string} password - The password to hash
 * @return {string} Password hash
 */
const hashPassword = async (password) => {
  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
  } catch (error) {
    throw new Error('Error hashing password');
  }
};

/**
 * Validates the password against the hash
 * @param {string} password - The password to verify
 * @param {string} hash - Password hash to verify against
 * @return {boolean} True if the password matches the hash, false otherwise
 */
const comparePassword = async (password, hashedPassword) => {
  try {
    const isMatch = await bcrypt.compare(password, hashedPassword);
    return isMatch;
  } catch (error) {
    throw new Error('Error comparing passwords');
  }
};

/**
 * Alias for comparePassword to maintain consistency
 */
const validatePassword = comparePassword;

/**
 * Alias for hashPassword to maintain consistency
 */
const generatePasswordHash = hashPassword;

/**
 * Checks that the hash has a valid format
 * @param {string} hash - Hash to check format for
 * @return {boolean} True if passed string seems like valid hash, false otherwise
 */
const isPasswordHash = (hash) => {
  // Check if the string looks like a bcrypt hash
  return hash && typeof hash === 'string' && hash.startsWith('$2');
};

module.exports = {
  hashPassword,
  comparePassword,
  validatePassword,
  generatePasswordHash,
  isPasswordHash
};