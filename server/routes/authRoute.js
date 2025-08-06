const express = require("express");
const router = express.Router();
const {
  registerAdmin,
  login,
  getMe,
  logout,
} = require("../controllers/authController.js");
const { protect } = require("../middlewares/auth.js");

router.post("/register/admin", registerAdmin);
router.post("/login", login);
router.get("/me", protect, getMe);
router.get("/logout", protect, logout);

module.exports = router;
