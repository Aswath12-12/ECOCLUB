const mongoose = require('mongoose');

const houseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'House name is required'],
      trim: true
    },
    code: {
      type: String,
      required: [true, 'House code is required'],
      unique: true,
      uppercase: true,
      enum: ['GREEN', 'BLUE', 'RED', 'YELLOW']
    },
    description: {
      type: String,
      default: ''
    },
    colorCode: {
      type: String,
      default: '#10B981'
    },
    active: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Prevent creating more than 4 houses
houseSchema.pre('save', async function (next) {
  if (this.isNew) {
    const count = await mongoose.model('House').countDocuments();
    if (count >= 4) {
      return next(new Error('System allows exactly 4 houses (GREEN, BLUE, RED, YELLOW). You cannot add more houses.'));
    }
  }
  next();
});

module.exports = mongoose.model('House', houseSchema);
