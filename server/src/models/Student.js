const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { DEFAULT_STUDENT_PASSWORD } = require('../utils/constants');

const studentSchema = new mongoose.Schema(
  {
    rollNo: {
      type: String,
      required: [true, 'Roll number is required'],
      unique: true,
      uppercase: true,
      trim: true
    },
    name: {
      type: String,
      required: [true, 'Student name is required'],
      trim: true
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      default: ''
    },
    phone: {
      type: String,
      trim: true,
      default: ''
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true
    },
    year: {
      type: String,
      required: [true, 'Year is required'],
      trim: true
    },
    className: {
      type: String,
      required: [true, 'Class name is required'],
      trim: true
    },
    houseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'House',
      required: [true, 'House assignment is required']
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ['STUDENT'],
      default: 'STUDENT'
    },
    isActive: {
      type: Boolean,
      default: true
    },
    mustChangePassword: {
      type: Boolean,
      default: true
    },
    passwordResetRequested: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Hash password before saving if modified (prevent double hashing if already bcrypt hash)
studentSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  if (/^\$2[ayb]\$.{56}$/.test(this.password)) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

studentSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Exclude password from toJSON transformations
studentSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('Student', studentSchema);
