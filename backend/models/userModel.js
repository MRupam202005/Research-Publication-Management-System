const { query } = require('../config/db');

/**
 * USER MODEL
 * 
 * Handles database persistence for the 'users' table.
 * Uses Parameterized Queries for all transactions.
 */

const createUser = async ({ name, email, passwordHash, role }) => {
  const result = await query(
    `INSERT INTO users (name, email, password, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, email, role, created_at`,
    [name, email, passwordHash, role],
  );
  return result.rows[0];
};

/**
 * DATA RETRIEVAL (DB -> Controller)
 * Fetches user metadata based on email (for login) or ID (for profile).
 * Returns only necessary schema-defined fields.
 */
const findUserByEmail = async (email) => {
  const result = await query(
    'SELECT id, name, email, password, role, created_at FROM users WHERE email = $1',
    [email],
  );
  return result.rows[0];
};

/**
 * DATA RETRIEVAL (DB -> Controller)
 * Fetches user profile data by ID.
 * Returns only safe fields (no passwords).
 */
const findUserById = async (id) => {
  const result = await query(
    'SELECT id, name, email, role, created_at FROM users WHERE id = $1',
    [id],
  );
  return result.rows[0];
};

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
};

