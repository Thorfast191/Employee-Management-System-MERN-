const asyncHandler = require("../middlewares/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");
const Employee = require("../models/employeeModel");
const Work = require("../models/workModel");
const User = require("../models/userModel");
const logger = require("../utils/logger");

// @desc      Get all employees
// @route     GET /api/v1/admin/employees
// @access    Private/Admin
exports.getAllEmployees = asyncHandler(async (req, res, next) => {
  const employees = await Employee.find()
    .populate("user", "name email role")
    .populate("workAssignments");

  res.status(200).json({
    success: true,
    count: employees.length,
    data: employees,
  });
});

// @desc      Complete employee setup (workHours, payment, status)
// @route     PUT /api/v1/admin/employees/:id/setup
// @access    Private/Admin
exports.completeEmployeeSetup = asyncHandler(async (req, res, next) => {
  const { workHours, paymentType, amount, status } = req.body;

  // Validate required fields
  if (!workHours || !paymentType || !amount) {
    return next(
      new ErrorResponse(
        "Please provide workHours, paymentType, and amount",
        400
      )
    );
  }

  if (isNaN(workHours) || workHours <= 0 || workHours > 24) {
    return next(
      new ErrorResponse("Work hours must be a number between 1 and 24", 400)
    );
  }

  if (isNaN(amount) || amount <= 0) {
    return next(
      new ErrorResponse("Payment amount must be a positive number", 400)
    );
  }

  const employee = await Employee.findById(req.params.id).populate("user");
  if (!employee) {
    return next(new ErrorResponse("Employee not found", 404));
  }

  // Update employee details
  employee.workHours = workHours;
  employee.payment = {
    type: paymentType,
    amount: amount,
  };
  employee.status = status || "active";

  // If activating employee, update user role if needed
  if (status === "active" && employee.user.role === "employee") {
    employee.user.role = "employee"; // This is redundant but shows the logic
    await employee.user.save();
  }

  await employee.save();

  logger.info(
    `Admin ${req.user.id} completed setup for employee ${employee._id}`
  );

  res.status(200).json({
    success: true,
    data: employee,
  });
});

// @desc      Assign default work schedule
// @route     POST /api/v1/admin/employees/:id/schedule
// @access    Private/Admin
exports.assignDefaultSchedule = asyncHandler(async (req, res, next) => {
  const { startDate, days = 7 } = req.body;
  const employee = await Employee.findById(req.params.id);

  if (!employee) {
    return next(new ErrorResponse("Employee not found", 404));
  }

  if (!employee.workHours) {
    return next(new ErrorResponse("Employee work hours not configured", 400));
  }

  if (employee.status !== "active") {
    return next(
      new ErrorResponse("Cannot assign work to inactive employee", 400)
    );
  }

  const workAssignments = [];
  const baseDate = startDate ? new Date(startDate) : new Date();

  for (let i = 0; i < days; i++) {
    const currentDate = new Date(baseDate);
    currentDate.setDate(baseDate.getDate() + i);

    // Skip weekends (optional)
    if (currentDate.getDay() === 0 || currentDate.getDay() === 6) {
      continue;
    }

    const startTime = new Date(currentDate);
    startTime.setHours(8, 0, 0, 0); // Start at 8am

    const endTime = new Date(currentDate);
    endTime.setHours(8 + employee.workHours, 0, 0, 0);

    const work = await Work.create({
      employee: employee._id,
      title: "Scheduled Work",
      description: `Regular ${employee.workHours}-hour shift`,
      startTime,
      endTime,
      duration: employee.workHours,
      status: "pending",
      assignedBy: req.user.id,
    });

    workAssignments.push(work);
  }

  logger.info(
    `Admin ${req.user.id} assigned ${workAssignments.length} work days to employee ${employee._id}`
  );

  res.status(201).json({
    success: true,
    count: workAssignments.length,
    data: workAssignments,
  });
});

// @desc      Update employee status
// @route     PUT /api/v1/admin/employees/:id/status
// @access    Private/Admin
exports.updateEmployeeStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;

  if (!status) {
    return next(new ErrorResponse("Please provide a status", 400));
  }

  const employee = await Employee.findById(req.params.id).populate("user");
  if (!employee) {
    return next(new ErrorResponse("Employee not found", 404));
  }

  employee.status = status;

  // If terminating employee, you might want to update user role
  if (status === "terminated") {
    // Optionally revoke employee access or change user role
    // employee.user.role = "basic";
    // await employee.user.save();
  }

  await employee.save();

  logger.info(
    `Admin ${req.user.id} updated status for employee ${employee._id} to ${status}`
  );

  res.status(200).json({
    success: true,
    data: employee,
  });
});

// @desc      Update employee payment
// @route     PUT /api/v1/admin/employees/:id/payment
// @access    Private/Admin
exports.updateEmployeePayment = asyncHandler(async (req, res, next) => {
  const { paymentType, amount } = req.body;

  if (!paymentType || !amount) {
    return next(
      new ErrorResponse("Please provide paymentType and amount", 400)
    );
  }

  if (isNaN(amount) || amount <= 0) {
    return next(new ErrorResponse("Amount must be a positive number", 400));
  }

  const employee = await Employee.findById(req.params.id);
  if (!employee) {
    return next(new ErrorResponse("Employee not found", 404));
  }

  employee.payment = {
    type: paymentType,
    amount: amount,
  };

  await employee.save();

  logger.info(
    `Admin ${req.user.id} updated payment for employee ${employee._id}`
  );

  res.status(200).json({
    success: true,
    data: employee,
  });
});

// @desc      Get all pending employees (needing setup)
// @route     GET /api/v1/admin/employees/pending
// @access    Private/Admin
exports.getPendingEmployees = asyncHandler(async (req, res, next) => {
  const employees = await Employee.find({ status: "pending" }).populate(
    "user",
    "name email"
  );

  res.status(200).json({
    success: true,
    count: employees.length,
    data: employees,
  });
});

// @desc      Get employee details
// @route     GET /api/v1/admin/employees/:id
// @access    Private/Admin
exports.getEmployeeDetails = asyncHandler(async (req, res, next) => {
  const employee = await Employee.findById(req.params.id)
    .populate("user", "name email role")
    .populate({
      path: "workAssignments",
      options: { sort: { startTime: -1 } }, // Sort work assignments by startTime
    });

  if (!employee) {
    return next(new ErrorResponse("Employee not found", 404));
  }

  res.status(200).json({
    success: true,
    data: employee,
  });
});
