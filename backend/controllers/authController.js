/**
 * AUTHENTICATION CONTROLLER
 * 
 * Handles User Access Control (RBAC).
 * Data Flow: Frontend -> API (Hasing/JWT) -> DB.
 */
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { createUser, findUserByEmail } = require('../models/userModel');

/**
 * TOKEN GENERATION
 * Creates a signed JWT containing user metadata (ID, Role, Name).
 * This token is stored in the Frontend (localStorage) and sent in the 
 * Authorization header for all subsequent protected API calls.
 */
const generateToken = (user) =>
  jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    process.env.JWT_SECRET,
    { expiresIn: '8h' },
  );

/**
 * USER REGISTRATION FLOW
 * 1. Frontend sends Name, Email, Password, Role.
 * 2. API checks if Email already exists in DB (SELECT query).
 * 3. Password is salt-hashed using Bcrypt for security (never store raw passwords).
 * 4. User record is INSERTED specifically into the 'users' table.
 * 5. Success returns a JWT so the user is "logged in" immediately.
 */
const register = async (req, res, next) => {
  try {
    const {
      name, email, password, role,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(409).json({ message: 'User with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userRole = role || 'Researcher';

    const user = await createUser({
      name,
      email,
      passwordHash: hashedPassword,
      role: userRole,
    });

    const token = generateToken(user);

    return res.status(201).json({
      user,
      token,
    });
  } catch (err) {
    return next(err);
  }
};

/**
 * USER LOGIN FLOW
 * 1. Frontend sends Email and Password.
 * 2. API fetches the user by email (findUserByEmail).
 * 3. Password comparison: Bcrypt compares the input with the stored Hash.
 * 4. If match, a new JWT is generated and returned to the client.
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user);

    const { password: _, ...safeUser } = user;

    return res.json({
      user: safeUser,
      token,
    });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  register,
  login,
};

