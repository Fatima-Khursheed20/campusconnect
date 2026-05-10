const jwt = require('jsonwebtoken');

const signToken = (userId, rememberMe = false) => {
  const expiresIn = rememberMe ? '7d' : '24h';
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn });
};

const getCookieOptions = (rememberMe = false) => {
    const maxAge = rememberMe
      ? 7 * 24 * 60 * 60 * 1000 // 7 days
      : 24 * 60 * 60 * 1000; // 24 hours
  
    return {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge,
    };
  };

const sessionCheck = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, { ignoreExpiration: true });
    const now = Date.now() / 1000;
    const fiveMinutes = 5 * 60;

    // If token is within 5 minutes of expiring, refresh it
    if (decoded.exp - now < fiveMinutes) {
      const rememberMe = (decoded.exp - decoded.iat) > (24 * 60 * 60); // Check if it was a "remember me" token
      const newToken = signToken(decoded.id, rememberMe);
      const cookieOptions = getCookieOptions(rememberMe);
      res.cookie('token', newToken, cookieOptions);
      req.cookies.token = newToken;
    }
  } catch (error) {
    // If token is invalid, just proceed. The verifyToken middleware will catch it.
  }

  next();
};

module.exports = sessionCheck;
