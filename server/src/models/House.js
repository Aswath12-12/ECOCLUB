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
      enum: ['GREEN', 'BLUE', 'RED', 'YELLOW', 'OFFICE_BEARERS']
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

// Pre-save validation limit
houseSchema.pre('save', async function (next) {
  if (this.isNew) {
    const count = await mongoose.model('House').countDocuments();
    if (count >= 10) {
      return next(new Error('Maximum house count limit reached.'));
    }
  }
  next();
});

module.exports = mongoose.model('House', houseSchema);
