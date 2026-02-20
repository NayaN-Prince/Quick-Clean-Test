const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(cors()); // Allows frontend to talk to backend
app.use(express.json()); // Allows backend to read JSON data

// Define Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/requests', require('./routes/request.routes'));
app.use('/api/worker', require('./routes/worker.routes'));

// Default Route (to check if server is running)
app.get('/', (req, res) => {
  res.send('QuickClean API is running...');
});

// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});