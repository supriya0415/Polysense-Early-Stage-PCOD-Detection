const express = require('express');
const router = express.Router();
const PeriodDate = require('../models/PeriodDate');
const jwt = require('jsonwebtoken');

// Middleware to authenticate user
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token.' });
  }
};

// Get period dates for a user
router.get('/dates', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const periodDates = await PeriodDate.findOne({ userId });
    
    if (!periodDates) {
      return res.status(200).json({ dates: [] });
    }
    
    res.status(200).json({ dates: periodDates.dates });
  } catch (error) {
    console.error('Error fetching period dates:', error);
    res.status(500).json({ message: 'Error fetching period dates', error: error.message });
  }
});

// Save period dates for a user
router.post('/dates', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { dates } = req.body;
    
    if (!dates || !Array.isArray(dates)) {
      return res.status(400).json({ message: 'Invalid data format. Dates array is required.' });
    }
    
    // Format dates to proper Date objects
    const formattedDates = dates.map(date => new Date(date));
    
    // Find and update or create new document
    const periodDates = await PeriodDate.findOneAndUpdate(
      { userId },
      { 
        userId,
        dates: formattedDates,
        updatedAt: new Date()
      },
      { upsert: true, new: true }
    );
    
    res.status(200).json({ 
      message: 'Period dates saved successfully',
      dates: periodDates.dates
    });
  } catch (error) {
    console.error('Error saving period dates:', error);
    res.status(500).json({ message: 'Error saving period dates', error: error.message });
  }
});

module.exports = router;
