const mongoose = require('mongoose');
const dotenv = require('dotenv').config();
const User = require('./models/userModel');

// ENHANCED: Admin user configuration with environment variables for security
// Using process.env variables instead of hardcoded values for better security practices
const admin = {
  name: 'admin',
  email: process.env.ADMIN_EMAIL,
  password: process.env.ADMIN_PASSWORD,
  phone: '0956565656',
  role: 'ADMIN',
};

// ENHANCED: Added proper connection cleanup and error handling
// Original code didn't handle connection closure properly, which could cause hanging processes
if (process.env.NODE_ENV === 'development') {
  mongoose
    .connect(process.env.DATABASE_LOCAL)
    .then(async (result) => {
      await User.create(admin);
      console.log('create admin is success');
      // ADDED: Proper connection cleanup to prevent hanging processes
      mongoose.connection.close();
      process.exit(0);
    })
    .catch((err) => {
      console.log(err);
      // ADDED: Cleanup on error to prevent resource leaks
      mongoose.connection.close();
      process.exit(1);
    });
} else {
  mongoose
    .connect(process.env.DATABASE)
    .then(async (result) => {
      await User.create(admin);
      console.log('create admin is success');
      // ADDED: Proper connection cleanup to prevent hanging processes
      mongoose.connection.close();
      process.exit(0);
    })
    .catch((err) => {
      console.log(err);
      // ADDED: Cleanup on error to prevent resource leaks
      mongoose.connection.close();
      process.exit(1);
    });
}
