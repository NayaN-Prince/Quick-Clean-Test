const Request = require('../models/Request');

// @desc    Get all pending jobs available for pickup
// @route   GET /api/worker/available-jobs
// @access  Private (Worker only)
const getAvailableJobs = async (req, res) => {
  try {
    // Find all requests with status 'Pending'
    // Optional: Sort by createdAt (oldest first) or urgency
    const jobs = await Request.find({ status: 'Pending' })
      .populate('user', 'name') // Show the customer's name
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Worker accepts a job
// @route   PUT /api/worker/accept-job/:id
// @access  Private (Worker only)
const acceptJob = async (req, res) => {
  try {
    const jobId = req.params.id;
    const workerId = req.user._id; // Assumes auth middleware adds user

    // Find the request
    const job = await Request.findById(jobId);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.status !== 'Pending') {
      return res.status(400).json({ message: 'Job is no longer available' });
    }

    // Update the job
    job.status = 'Accepted';
    job.assignedWorker = workerId;
    await job.save();

    res.status(200).json({
      success: true,
      message: 'Job accepted successfully',
      data: job
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = { getAvailableJobs, acceptJob };