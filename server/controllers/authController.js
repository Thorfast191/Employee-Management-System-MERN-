const asyncHandler = require("../middlewares/asyncHandler.js");
const ErrorResponse = require("../utils/errorResponse.js");
const User = require("../models/userModel.js");
const Employee = require("../models/employeeModel.js");
const logger = require("../utils/logger.js");
const sendTokenResponse = require("../utils/tokenResponse.js");

// @desc      Register admin
// @route     POST /api/v1/auth/register/admin
// @access    Public
exports.registerAdmin = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  // Check for existing admin
  const existingAdmin = await User.findOne({ email, role: "admin" });
  if (existingAdmin) {
    return next(new ErrorResponse("Admin already exists", 400));
  }

  // Create admin user
  const admin = await User.create({
    name,
    email,
    password,
    role: "admin",
  });

  logger.info(`Admin created: ${admin.email}`);

  // Create admin employee profile
  await Employee.create({
    name: admin.name,
    position: "Administrator",
    department: "Management",
    user: admin._id,
  });

  sendTokenResponse(admin, 201, res);
});

// @desc      Login user
// @route     POST /api/v1/auth/login
// @access    Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate email & password
  if (!email || !password) {
    return next(new ErrorResponse("Please provide an email and password", 400));
  }

  // Check for user
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new ErrorResponse("Invalid credentials", 401));
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse("Invalid credentials", 401));
  }

  logger.info(`User logged in: ${user.email}`);

  sendTokenResponse(user, 200, res);
});

// @desc      Get current logged in user
// @route     GET /api/v1/auth/me
// @access    Private
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  const employee = await Employee.findOne({ user: req.user.id });

  res.status(200).json({
    success: true,
    data: {
      user,
      employee,
    },
  });
});

// @desc      Log user out / clear cookie
// @route     GET /api/v1/auth/logout
// @access    Private
exports.logout = asyncHandler(async (req, res, next) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  logger.info(`User logged out: ${req.user.email}`);

  res.status(200).json({
    success: true,
    data: {},
  });
});
