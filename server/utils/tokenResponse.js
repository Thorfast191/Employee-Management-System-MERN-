const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();

  // Convert days to milliseconds safely
  const cookieExpireDays = parseInt(process.env.JWT_COOKIE_EXPIRE) || 30; // Default to 30 days
  const cookieExpireMs = cookieExpireDays * 24 * 60 * 60 * 1000;

  const options = {
    expires: new Date(Date.now() + cookieExpireMs),
    httpOnly: true,
    secure: false, // Disable in development (Postman can't handle secure cookies)
    sameSite: "none", // Allow cross-origin cookies
    domain: "localhost", // Explicitly set domain for local development
  };

  // Remove token from JSON response if you're using cookies
  res
    .status(statusCode)
    .cookie("token", token, options)
    .json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
};

module.exports = sendTokenResponse;
