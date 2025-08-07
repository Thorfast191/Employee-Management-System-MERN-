const asyncHandler = require("../middlewares/asyncHandler.js");
const ErrorResponse = require("../utils/errorResponse.js");
const User = require("../models/userModel.js");
const Employee = require("../models/employeeModel.js");
const logger = require("../utils/logger.js");

// @desc      Get all employees
// @route     GET /api/v1/employees
// @access    Private (Admin)
exports.getEmployees = asyncHandler(async (req, res, next) => {
  const employees = await Employee.find()
    .populate({
      path: "user",
      select: "email role createdAt",
    })
    .populate({
      path: "workAssignments",
      select: "title status startTime endTime duration",
    });

  res.status(200).json({
    success: true,
    count: employees.length,
    data: employees,
  });
});

// @desc      Get single employee
// @route     GET /api/v1/employees/:id
// @access    Private (Admin)
exports.getEmployee = asyncHandler(async (req, res, next) => {
  const employee = await Employee.findById(req.params.id)
    .populate({
      path: "user",
      select: "email role createdAt",
    })
    .populate({
      path: "workAssignments",
      select: "title status startTime endTime duration",
    });

  if (!employee) {
    return next(
      new ErrorResponse(`Employee not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: employee,
  });
});

// @desc      Create employee
// @route     POST /api/v1/employees
// @access    Private (Admin)
exports.createEmployee = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.user = req.user.id;

  const employee = await Employee.create(req.body);

  logger.info(`Employee created: ${employee.name} by admin ${req.user.email}`);

  res.status(201).json({
    success: true,
    data: employee,
  });
});

// @desc      Update employee
// @route     PUT /api/v1/employees/:id
// @access    Private (Admin)
exports.updateEmployee = asyncHandler(async (req, res, next) => {
  let employee = await Employee.findById(req.params.id);

  if (!employee) {
    return next(
      new ErrorResponse(`Employee not found with id of ${req.params.id}`, 404)
    );
  }

  employee = await Employee.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  logger.info(`Employee updated: ${employee.name} by admin ${req.user.email}`);

  res.status(200).json({
    success: true,
    data: employee,
  });
});

// @desc      Delete employee
// @route     DELETE /api/v1/employees/:id
// @access    Private (Admin)
exports.deleteEmployee = asyncHandler(async (req, res, next) => {
  const employee = await Employee.findById(req.params.id);

  if (!employee) {
    return next(
      new ErrorResponse(`Employee not found with id of ${req.params.id}`, 404)
    );
  }

  // Delete associated user
  await User.findByIdAndDelete(employee.user);

  await employee.deleteOne();

  logger.info(`Employee deleted: ${employee.name} by admin ${req.user.email}`);

  res.status(200).json({
    success: true,
    data: {},
  });
});
