const { body, validationResult } = require("express-validator");

// Validation rules for employee creation
exports.validateEmployee = [
  body("name", "Name is required").not().isEmpty(),
  body("position", "Position is required").not().isEmpty(),
  body("department", "Department is required").not().isEmpty(),
  body("email", "Please include a valid email").isEmail(),
  body("password", "Password must be at least 6 characters").isLength({
    min: 6,
  }),
];

// Validation rules for work assignment
exports.validateWorkAssignment = [
  body("employeeId", "Employee ID is required").not().isEmpty(),
  body("title", "Title is required").not().isEmpty(),
  body("startTime", "Start time is required").not().isEmpty(),
  body("endTime", "End time is required").not().isEmpty(),
  body("duration", "Duration must be a number").isNumeric(),
];

// Middleware to handle validation errors
exports.handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
