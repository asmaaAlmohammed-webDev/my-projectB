const mongoose = require('mongoose');
const conactSchema = new mongoose.Schema(
  {
    // <creating-property-schema />
    message: {
      type: String,
      required: [true, 'Please enter message'],
    },
    email: {
      type: String,
      required: [true, 'Please enter email'],
    },
    name: {
      type: String,
      required: [true, 'Please enter name'],
    },
  },
  { timestamps: true, versionKey: false },
);
// <creating-function-schema />

const Conact = mongoose.model('Conact', conactSchema);
module.exports = Conact;
