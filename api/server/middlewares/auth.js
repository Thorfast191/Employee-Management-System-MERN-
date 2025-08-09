const jwt = require("jsonwebtoken");
const User = require("../models/userModel.js");
const ErrorResponse = require("../utils/errorResponse.js");
const asyncHandler = require("./asyncHandler.js");

// exports.protect = asyncHandler(async (req, res, next) => {
//   let token;

//   console.log("Headers:", req.headers.authorization); // Debug
//   console.log("Cookies:", req.cookies); // Debug

//   // Get token from header or cookie
//   if (req.headers.authorization?.startsWith("Bearer")) {
//     token = req.headers.authorization.split(" ")[1];
//     console.log("Token from header:", token); // Debug
//   } else if (req.cookies?.token) {
//     token = req.cookies.token;
//     console.log("Token from cookie:", token); // Debug
//   }

//   if (!token) {
//     console.log("No token found"); // Debug
//     return next(new ErrorResponse("Not authorized", 401));
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = await User.findById(decoded.id).select("-password");

//     if (!req.user) {
//       console.log("User not found in DB"); // Debug
//       return next(new ErrorResponse("No user found", 401));
//     }

//     next();
//   } catch (err) {
//     console.log("Token verification failed:", err.message); // Debug
//     return next(new ErrorResponse("Not authorized", 401));
//   }
// });

// Grant access to specific roles

exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  // 1. Check authorization header
  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }
  // 2. Check cookies
  else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: "Not authorized",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: "Not authorized - invalid token",
    });
  }
});

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `User role ${req.user.role} is not authorized to access this route`,
          403
        )
      );
    }
    next();
  };
};
