const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["hourly", "daily"],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
});

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
      required: false, // Will be set by admin later
    },
    payment: {
      type: PaymentSchema,
      required: false, // Will be set by admin later
    },
    status: {
      type: String,
      enum: ["pending", "active", "on-leave", "terminated"],
      default: "pending", // Default to pending until admin activates
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
