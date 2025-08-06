const express = require("express");
const router = express.Router();
const {
  registerAdmin,
  registerEmployee,
  login,
  getMe,
  logout,
} = require("../controllers/authController.js");
const { protect } = require("../middlewares/auth.js");

router
  .post("/register/admin", registerAdmin)
  .post("/register/employee", registerEmployee)
  .post("/login", login);
router.get("/me", protect, getMe);
router.get("/logout", logout);

module.exports = router;
