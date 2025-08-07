const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["hourly", "daily", "monthly"],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: [0, "Amount cannot be negative"],
  },
  currency: {
    type: String,
    default: "USD",
  },
});

const WorkScheduleSchema = new mongoose.Schema({
  workType: {
    type: String,
    enum: {
      values: [
        "regular",
        "shift",
        "flexible",
        "development",
        "meeting",
        "support",
      ],
      message: "{VALUE} is not a valid work type",
    },
    required: [true, "Please specify work type"],
    default: "regular",
  },
  workDays: {
    type: [String],
    enum: [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ],
    required: [true, "Please specify work days"],
    validate: {
      validator: function (v) {
        return v && v.length > 0;
      },
      message: "At least one work day must be specified",
    },
  },
  dailyHours: {
    type: Number,
    required: [true, "Please specify daily hours"],
    min: [1, "Daily hours must be at least 1"],
    max: [12, "Daily hours cannot exceed 12"],
  },
  startDate: {
    type: Date,
    required: [true, "Please specify start date"],
    validate: {
      validator: function (v) {
        return v > new Date();
      },
      message: "Start date must be in the future",
    },
  },
  customStartHour: {
    type: Number,
    min: 0,
    max: 23,
    default: 8,
  },
});

const EmployeeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a name"],
      trim: true,
    },
    position: {
      type: String,
      required: [true, "Please add a position"],
      trim: true,
    },
    department: {
      type: String,
      required: [true, "Please add a department"],
      trim: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Employee must be linked to a user"],
      unique: true,
    },
    status: {
      type: String,
      enum: ["pending", "active", "on-leave", "terminated"],
      default: "pending",
    },
    workHours: {
      type: Number,
      min: [1, "Work hours must be at least 1"],
      max: [24, "Work hours cannot exceed 24"],
    },
    workSchedule: WorkScheduleSchema,
    payment: PaymentSchema,
    hireDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for work assignments
EmployeeSchema.virtual("workAssignments", {
  ref: "Work",
  localField: "_id",
  foreignField: "employee",
  justOne: false,
  options: { sort: { startTime: 1 } }, // Sort by start time ascending
});

// Indexes for better query performance
EmployeeSchema.index({ name: 1 });
EmployeeSchema.index({ department: 1 });
EmployeeSchema.index({ status: 1 });

module.exports = mongoose.model("Employee", EmployeeSchema);
