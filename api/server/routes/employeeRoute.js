const express = require("express");
const router = express.Router();
const {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} = require("../controllers/empoyeeController.js");
const { protect, authorize } = require("../middlewares/auth.js");

// Protect all routes and authorize only admins
router.use(protect, authorize("admin"));

router.route("/").get(getEmployees).post(createEmployee);

router
  .route("/:id")
  .get(getEmployee)
  .put(updateEmployee)
  .delete(deleteEmployee);

module.exports = router;
