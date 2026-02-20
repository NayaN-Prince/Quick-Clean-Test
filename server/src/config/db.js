const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Ensure MONGO_URI is in your .env file
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Failed: ${error.message}. (Server will continue running)`);
    // process.exit(1); 
  }
};

module.exports = connectDB;