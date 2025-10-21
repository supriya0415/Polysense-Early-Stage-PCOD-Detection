const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const User = require('../models/User');

// Add a specific debug endpoint for Priya04 user
router.get('/createtestuser-priya', async (req, res) => {
  try {
    // Check if test user already exists
    let user = await User.findOne({ name: 'Priya04' });
    
    if (user) {
      return res.json({ 
        msg: 'Priya04 user already exists',
        name: user.name,
        email: user.email
      });
    }
    
    // Create test user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('priya', salt);
    
    user = new User({
      name: 'Priya04',
      email: 'priya04@example.com',
      password: hashedPassword
    });
    
    await user.save();
    
    res.json({ 
      msg: 'Priya04 user created successfully',
      name: user.name,
      email: user.email
    });
  } catch (err) {
    console.error('Create test user error:', err.message);
    res.status(500).send('Server error');
  }
});

// Add enhanced logging to the login route
router.post('/', async (req, res) => {
  console.log('Login request received with body:', req.body);
  const { email, password } = req.body;

  // Basic validation
  if (!email || !password) {
    console.log('Missing email or password in request');
    return res.status(400).json({ msg: 'Please enter all fields' });
  }

  try {
    // Log all users in the database
    const allUsers = await User.find().select('name email');
    console.log('All users in database:', allUsers);
    
    // Check if user exists by exact match on email or username
    let user = await User.findOne({ 
      $or: [
        { email: email },
        { name: email }
      ]
    });
    
    console.log('User found for login attempt:', user ? {name: user.name, email: user.email} : 'No user found');
    
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match for user:', isMatch);
    
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Generate token and respond
    const token = await user.generateAuthToken();
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).send('Server error');
  }
});

// Add a direct login endpoint with hardcoded credentials for testing
router.post('/direct', (req, res) => {
  console.log('Direct login endpoint called');
  
  // Return a success response with test token and username
  res.json({
    token: 'test-token-123456',
    username: 'TestUser'
  });
});

module.exports = router;