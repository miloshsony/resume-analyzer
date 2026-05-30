const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Helper to generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    console.log(`Registration attempt for: ${email}`);

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email and password' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      console.warn(`Registration failed: User ${email} already exists`);
      return res.status(400).json({ message: 'User already exists' });
    }

    // Determine role - default is 'user'. 
    // First user could be admin, or we can check special emails, or just let role default to user.
    // For testing ease, we can check if there are no users, the first user is an admin.
    const userCount = await User.countDocuments({});
    const role = userCount === 0 ? 'admin' : 'user';

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role,
    });

    if (user) {
      console.log(`User created successfully: ${user.email} (Role: ${user.role})`);
      return res.status(201).json({
        token: generateToken(user._id),
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } else {
      return res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Server error during registration' });
  }
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(`Login attempt for: ${email}`);

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Check for user
    const user = await User.findOne({ email });
    if (!user) {
      console.warn(`Login failed: User ${email} not found`);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password match
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.warn(`Login failed: Incorrect password for ${email}`);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    console.log(`User authenticated: ${user.email} (Role: ${user.role})`);
    return res.json({
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error during login' });
  }
};

module.exports = {
  register,
  login,
};
