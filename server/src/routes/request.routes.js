const express = require('express');
const router = express.Router();
const { createRequest } = require('../controllers/requestController');
const { protect } = require('../middleware/auth.middleware'); // Middleware to verify JWT

// POST /api/requests
router.post('/', protect, createRequest);

module.exports = router;