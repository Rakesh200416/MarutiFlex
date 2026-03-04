const mongoose = require('mongoose');

const connectDB = async () => {
  // connection string provided by user or environment variable
  // default to local MongoDB if nothing set
  const connString = process.env.MONGO_URI || 'mongodb://localhost:27017/marutiflex';
  
  try {
    console.log('Attempting to connect to:', connString.substring(0, 50) + '...');
    await mongoose.connect(connString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✓ MongoDB connected successfully');
  } catch (err) {
    console.error('✗ MongoDB connection failed:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
