const express = require("express");
const router = express.Router();
const {
  registerEmployee,
  getAllEmployees,
  getEmployeeDetails,
  completeEmployeeSetup,
  getPendingEmployees,
  deleteEmployee,
} = require("../controllers/adminController");
const { protect, authorize } = require("../middlewares/auth");

// Employee management routes
router.post(
  "/register/employees",
  protect,
  authorize("admin"),
  registerEmployee
);
router.get("/get-all/employees", protect, authorize("admin"), getAllEmployees);
router.get(
  "/employees/pending",
  protect,
  authorize("admin"),
  getPendingEmployees
);
router.get(
  "/get/employees/:id",
  protect,
  authorize("admin"),
  getEmployeeDetails
);
router.put(
  "/employees/setup/:id",
  protect,
  authorize("admin"),
  completeEmployeeSetup
);
router.delete(
  "/delete/employees/:id",
  protect,
  authorize("admin"),
  deleteEmployee
);

module.exports = router;
