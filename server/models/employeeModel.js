const mongoose = require("mongoose");

const EmployeeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a name"],
    },
    position: {
      type: String,
      required: [true, "Please add a position"],
    },
    department: {
      type: String,
      required: [true, "Please add a department"],
    },
    hireDate: {
      type: Date,
      default: Date.now,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    workHours: {
      type: Number,
      default: 8,
    },
    status: {
      type: String,
      enum: ["active", "on-leave", "terminated"],
      default: "active",
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Reverse populate with virtuals
EmployeeSchema.virtual("workAssignments", {
  ref: "Work",
  localField: "_id",
  foreignField: "employee",
  justOne: false,
});

module.exports = mongoose.model("Employee", EmployeeSchema);
