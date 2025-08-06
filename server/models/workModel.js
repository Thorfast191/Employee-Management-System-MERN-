const mongoose = require("mongoose");

const WorkSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true,
  },
  title: {
    type: String,
    required: [true, "Please add a title"],
  },
  description: {
    type: String,
  },
  startTime: {
    type: Date,
    required: [true, "Please add a start time"],
  },
  endTime: {
    type: Date,
    required: [true, "Please add an end time"],
  },
  duration: {
    type: Number,
    required: [true, "Please add duration in hours"],
  },
  status: {
    type: String,
    enum: ["pending", "in-progress", "completed", "overdue"],
    default: "pending",
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Work", WorkSchema);
