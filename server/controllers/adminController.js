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

// @desc      Register new employee
// @route     POST /api/v1/admin/employees
// @access    Private/Admin
exports.registerEmployee = asyncHandler(async (req, res, next) => {
  const { name, email, password, position, department } = req.body;

  // Validate required fields
  if (!name || !email || !password || !position || !department) {
    return next(new ErrorResponse("Please provide all required fields", 400));
  }

  // Create user account
  const user = await User.create({
    name,
    email,
    password,
    role: "employee",
  });

  // Create employee record
  const employee = await Employee.create({
    name,
    position,
    department,
    user: user._id,
  });

  res.status(201).json({
    success: true,
    data: {
      employee,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    },
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
      options: { sort: { startTime: -1 } },
    });

  if (!employee) {
    return next(new ErrorResponse("Employee not found", 404));
  }

  res.status(200).json({
    success: true,
    data: employee,
  });
});

// @desc      Complete employee setup or update fields
// @route     PUT /api/v1/admin/employees/:id/setup
// @access    Private/Admin
exports.completeEmployeeSetup = asyncHandler(async (req, res, next) => {
  const { workName, workDescription, ...rest } = req.body;

  const employee = await Employee.findById(req.params.id);
  if (!employee) return next(new ErrorResponse("Employee not found", 404));

  // Update core fields
  employee.status = rest.status || employee.status;
  employee.workHours = rest.workHours || employee.workHours;

  // Update payment if provided
  if (rest.payment) {
    employee.payment = {
      type: rest.payment.type,
      amount: rest.payment.amount,
      currency: rest.payment.currency || "USD",
    };
  }

  // Update work schedule - THIS IS THE CRITICAL FIX
  if (rest.workSchedule) {
    employee.workSchedule = {
      workType: rest.workSchedule.workType,
      workDays: rest.workSchedule.workDays,
      dailyHours: rest.workSchedule.dailyHours,
      startDate: new Date(rest.workSchedule.startDate),
    };

    // Create work assignments
    await createWorkAssignments(employee, {
      title: workName,
      description: workDescription,
      status: rest.workDetails?.status || "pending",
    });
  }

  await employee.save();

  // Force population of work assignments
  const populatedEmployee = await Employee.findById(employee._id).populate(
    "workAssignments"
  );

  res.status(200).json({
    success: true,
    data: populatedEmployee,
  });
});

const createWorkAssignments = async (employee, workDetails) => {
  const {
    workDays,
    dailyHours,
    startDate,
    workType,
    customStartHour = 8,
  } = employee.workSchedule;

  // Clear existing assignments
  await Work.deleteMany({ employee: employee._id });

  const assignments = [];
  const baseDate = new Date(startDate);
  baseDate.setHours(0, 0, 0, 0); // Normalize to start of day

  // Create assignments for next 30 days
  for (let i = 0; i < 30; i++) {
    const currentDate = new Date(baseDate);
    currentDate.setDate(baseDate.getDate() + i);

    const dayName = currentDate
      .toLocaleString("en-US", { weekday: "long" })
      .toLowerCase();

    if (workDays.includes(dayName)) {
      const startTime = new Date(currentDate);
      startTime.setHours(customStartHour, 0, 0, 0);

      const endTime = new Date(startTime);
      endTime.setHours(startTime.getHours() + dailyHours);

      const work = await Work.create({
        employee: employee._id,
        title: workDetails.title || `${workType} Work - ${dayName}`,
        description:
          workDetails.description ||
          `${dailyHours}-hour ${workType} shift on ${dayName}`,
        startTime,
        endTime,
        duration: dailyHours,
        status: workDetails.status || "pending",
        assignedBy: employee.user,
        workType,
      });

      assignments.push(work);
    }
  }

  return assignments;
};

// @desc      Get pending employees
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

// @desc      Delete employee
// @route     DELETE /api/v1/admin/employees/:id
// @access    Private/Admin
exports.deleteEmployee = asyncHandler(async (req, res, next) => {
  const employee = await Employee.findById(req.params.id);

  if (!employee) {
    return next(
      new ErrorResponse(`Employee not found with id ${req.params.id}`, 404)
    );
  }

  // Delete associated user account
  await User.findByIdAndDelete(employee.user);

  // Delete all work assignments
  await Work.deleteMany({ employee: employee._id });

  // Delete the employee
  await employee.deleteOne();

  logger.info(`Admin ${req.user.id} deleted employee ${employee._id}`);

  res.status(200).json({
    success: true,
  });
});
