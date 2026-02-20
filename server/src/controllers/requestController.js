const Request = require('../models/Request');
const { calculatePrice } = require('../services/pricingService'); // Assuming you have this helper

// @desc    Create new service request
// @route   POST /api/requests
// @access  Private
const createRequest = async (req, res) => {
  try {
    const { wasteType, quantity, urgency, location } = req.body;

    // 1. Calculate Price dynamically
    const estimatedPrice = calculatePrice(wasteType, quantity, urgency);

    // 2. Create the request in DB
    const newRequest = await Request.create({
      user: req.user._id, // Assumes auth middleware adds user to req
      wasteType,
      quantity,
      urgency,
      location,
      estimatedPrice
    });

    res.status(201).json({
      success: true,
      data: newRequest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

module.exports = { createRequest };