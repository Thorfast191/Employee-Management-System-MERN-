const mongoose = require("mongoose");

const WorkSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Please add a title"],
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      maxlength: [500, "Description cannot exceed 500 characters"],
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
      min: [1, "Duration must be at least 1 hour"],
      max: [24, "Duration cannot exceed 24 hours"],
    },
    status: {
      type: String,
      enum: {
        values: ["pending", "in-progress", "completed", "overdue"],
        message: "{VALUE} is not a valid status",
      },
      default: "pending",
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    workType: {
      type: String,
      enum: [
        "regular",
        "shift",
        "flexible",
        "development",
        "meeting",
        "support",
      ],
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index for better query performance
WorkSchema.index({ employee: 1, startTime: 1 });

module.exports = mongoose.model("Work", WorkSchema);
