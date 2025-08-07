const asyncHandler = require("../middlewares/asyncHandler.js");
const ErrorResponse = require("../utils/errorResponse.js");
const Employee = require("../models/employeeModel.js");
const Work = require("../models/workModel.js");
const logger = require("../utils/logger.js");

// @desc      Get all work assignments
// @route     GET /api/v1/work
// @access    Private
exports.getWorkAssignments = asyncHandler(async (req, res, next) => {
  let query;

  // Admin can see all, employees see only their assignments
  if (req.user.role === "admin") {
    query = Work.find().populate({
      path: "employee",
      select: "name position",
    });
  } else {
    // Find employee associated with logged in user
    const employee = await Employee.findOne({ user: req.user.id });

    if (!employee) {
      return next(new ErrorResponse("Employee profile not found", 404));
    }

    query = Work.find({ employee: employee._id }).populate({
      path: "employee",
      select: "name position",
    });
  }

  const workAssignments = await query.sort("-createdAt");

  res.status(200).json({
    success: true,
    count: workAssignments.length,
    data: workAssignments,
  });
});

// @desc      Create work assignment
// @route     POST /api/v1/work
// @access    Private (Admin)
exports.createWorkAssignment = asyncHandler(async (req, res, next) => {
  // Add admin who assigned the work
  req.body.assignedBy = req.user.id;

  const employee = await Employee.findById(req.body.employee);

  if (!employee) {
    return next(
      new ErrorResponse(
        `Employee not found with id of ${req.body.employee}`,
        404
      )
    );
  }

  // Check if work duration exceeds employee's daily work hours
  if (req.body.duration > employee.workHours) {
    return next(
      new ErrorResponse(
        `Work duration exceeds employee's daily work hours (${employee.workHours} hours)`,
        400
      )
    );
  }

  const workAssignment = await Work.create(req.body);

  logger.info(
    `Work assignment created for ${employee.name} by admin ${req.user.email}`
  );

  res.status(201).json({
    success: true,
    data: workAssignment,
  });
});

// @desc      Update work assignment status
// @route     PUT /api/v1/work/:id/status
// @access    Private
exports.updateWorkStatus = asyncHandler(async (req, res, next) => {
  const workAssignment = await Work.findById(req.params.id);

  if (!workAssignment) {
    return next(
      new ErrorResponse(
        `Work assignment not found with id of ${req.params.id}`,
        404
      )
    );
  }

  // Check if the employee is updating their own assignment
  if (req.user.role === "employee") {
    const employee = await Employee.findOne({ user: req.user.id });

    if (!employee) {
      return next(new ErrorResponse("Employee profile not found", 404));
    }

    if (workAssignment.employee.toString() !== employee._id.toString()) {
      return next(
        new ErrorResponse("Not authorized to update this work assignment", 401)
      );
    }
  }

  // Update only the status field
  workAssignment.status = req.body.status;
  await workAssignment.save();

  logger.info(
    `Work assignment status updated to ${req.body.status} for ID ${req.params.id}`
  );

  res.status(200).json({
    success: true,
    data: workAssignment,
  });
});
