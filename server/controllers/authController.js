const asyncHandler = require("../middlewares/asyncHandler.js");
const ErrorResponse = require("../utils/errorResponse.js");
const User = require("../models/userModel.js");
const Employee = require("../models/employeeModel.js");
const logger = require("../utils/logger.js");
const sendTokenResponse = require("../utils/tokenResponse.js");

// @desc      Register admin (no Employee record)
// @route     POST /api/v1/auth/register/admin
// @access    Public
exports.registerAdmin = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  // Check for existing admin
  const existingAdmin = await User.findOne({ email, role: "admin" });
  if (existingAdmin) {
    return next(new ErrorResponse("Admin already exists", 400));
  }

  // Create admin user (no Employee record)
  const admin = await User.create({
    name,
    email,
    password,
    role: "admin",
  });

  logger.info(`Admin created: ${admin.email}`);
  sendTokenResponse(admin, 201, res);
});

// @desc      Register employee (User + Employee record)
// @route     POST /api/v1/auth/register/employee
// @access    Public
exports.registerEmployee = asyncHandler(async (req, res, next) => {
  const { name, email, password, position, department } = req.body;

  // Validate required fields
  if (!name || !email || !password || !position || !department) {
    return next(
      new ErrorResponse(
        "Missing required fields (name, email, password, position, department)",
        400
      )
    );
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new ErrorResponse("User already exists", 400));
  }

  // Create the User (required for auth)
  const user = await User.create({
    name,
    email,
    password,
    role: "employee",
  });

  // Create the Employee (linked to User)
  const employee = await Employee.create({
    name,
    position,
    department,
    user: user._id,
    // hireDate is automatically set to now
    // workHours will be set by admin later
    // payment will be set by admin later
    // status defaults to "pending"
  });

  logger.info(`Employee registered (pending admin setup): ${user.email}`);
  sendTokenResponse(user, 201, res);
});

// @desc      Login user (works for both admins/employees)
// @route     POST /api/v1/auth/login
// @access    Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorResponse("Please provide an email and password", 400));
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.matchPassword(password))) {
    return next(new ErrorResponse("Invalid credentials", 401));
  }

  logger.info(`User logged in: ${user.email}`);
  sendTokenResponse(user, 200, res);
});

exports.getMe = asyncHandler(async (req, res, next) => {
  // First verify req.user exists
  if (!req.user || !req.user._id) {
    return next(new ErrorResponse("User not authenticated", 401));
  }

  const user = await User.findById(req.user._id).select("-password");

  if (!user) {
    return next(new ErrorResponse("User not found", 404));
  }

  const response = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  if (user.role === "employee") {
    const employee = await Employee.findOne({ user: user._id });
    if (employee) {
      response.position = employee.position;
      response.department = employee.department;
      response.status = employee.status;
    }
  }

  res.status(200).json({
    success: true,
    data: response,
  });
});

// @desc      Logout user
// @route     GET /api/v1/auth/logout
// @access    Public (should be accessible without auth)
exports.logout = asyncHandler(async (req, res, next) => {
  // Clear the token cookie regardless of authentication state
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000), // Expires in 10 seconds
    httpOnly: true,
  });

  // Optional: Log if user was authenticated
  if (req.user) {
    logger.info(`User logged out: ${req.user.email}`);
  } else {
    logger.info("Anonymous logout request processed");
  }

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});
