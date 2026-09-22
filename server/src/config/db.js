const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI environment variable is not configured');
    }

    if (mongoose.connection.readyState === 1) {
      return;
    }

    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(
      `[EcoClub Database] MongoDB Connected: ${conn.connection.host}`
    );
  } catch (error) {
    console.error(
      `[EcoClub Database] Connection Error: ${error.message}`
    );

    throw error;
  }
};

module.exports = connectDB;