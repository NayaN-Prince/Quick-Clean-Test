const express = require('express');
const router = express.Router();
const { getAvailableJobs, acceptJob } = require('../controllers/workerController');
const { protect, workerOnly } = require('../middleware/auth.middleware');

// Protect ensures user is logged in
// WorkerOnly checks if role === 'worker'
router.get('/available-jobs', protect, workerOnly, getAvailableJobs);
router.put('/accept-job/:id', protect, workerOnly, acceptJob);

module.exports = router;