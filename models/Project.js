const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a milestone title'],
    trim: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  dueDate: {
    type: Date,
  },
});

const projectSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please add a project title'],
      trim: true,
    },
    clientName: {
      type: String,
      required: [true, 'Please add a client name'],
      trim: true,
    },
    clientEmail: {
      type: String,
      required: [true, 'Please add a client email'],
      trim: true,
      lowercase: true,
    },
    budget: {
      type: Number,
    },
    status: {
      type: String,
      enum: ['planning', 'in_progress', 'review', 'completed'],
      default: 'planning',
    },
    milestones: [milestoneSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Project', projectSchema);
