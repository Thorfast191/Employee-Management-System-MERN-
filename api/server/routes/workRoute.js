const express = require("express");
const router = express.Router();
const {
  getWorkAssignments,
  createWorkAssignment,
  updateWorkStatus,
} = require("../controllers/workController.js");
const { protect, authorize } = require("../middlewares/auth.js");
const {
  validateWorkAssignment,
  handleValidationErrors,
} = require("../utils/vallidation.js");

// Protect all routes
router.use(protect);

router
  .route("/")
  .get(getWorkAssignments)
  .post(
    authorize("admin"),
    validateWorkAssignment,
    handleValidationErrors,
    createWorkAssignment
  );

router.route("/:id/status").put(updateWorkStatus);

module.exports = router;
