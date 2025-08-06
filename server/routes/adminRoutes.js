const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { protect, authorize } = require("../middlewares/auth");

// Employee management routes
router.get(
  "/employees",
  protect,
  authorize("admin"),
  adminController.getAllEmployees
);
router.put(
  "/employees/:id/setup",
  protect,
  authorize("admin"),
  adminController.completeEmployeeSetup
);
router.post(
  "/employees/:id/schedule",
  protect,
  authorize("admin"),
  adminController.assignDefaultSchedule
);
router.put(
  "/employees/:id/status",
  protect,
  authorize("admin"),
  adminController.updateEmployeeStatus
);
router.put(
  "/employees/:id/payment",
  protect,
  authorize("admin"),
  adminController.updateEmployeePayment
);
router.get(
  "/employees/pending",
  protect,
  authorize("admin"),
  adminController.getPendingEmployees
);
router.get(
  "/employees/:id",
  protect,
  authorize("admin"),
  adminController.getEmployeeDetails
);

module.exports = router;
