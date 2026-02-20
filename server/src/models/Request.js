const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  wasteType: {
    type: String,
    required: [true, 'Please select a waste type'],
    enum: ['Plastic', 'Organic', 'Metal', 'Electronic', 'Mixed']
  },
  quantity: {
    type: String,
    required: [true, 'Please estimate the quantity'],
    enum: ['Small (< 5kg)', 'Medium (5-15kg)', 'Large (15kg+)']
  },
  urgency: {
    type: String,
    required: true,
    enum: ['Standard', 'Urgent']
  },
  location: {
    address: { type: String, required: true },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number }
    }
  },
  status: {
    type: String,
    enum: ['Pending', 'Accepted', 'In Progress', 'Completed', 'Cancelled'],
    default: 'Pending'
  },
  estimatedPrice: {
    type: Number,
    required: true
  },
  assignedWorker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Worker',
    default: null
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt
});

module.exports = mongoose.model('Request', requestSchema);