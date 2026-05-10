const jwt = require("jsonwebtoken");

const signToken = (userId, rememberMe = false) => {
  const expiresIn = rememberMe ? "7d" : "24h";
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn });
};

const getCookieOptions = (rememberMe = false) => {
  const isProduction = process.env.NODE_ENV === "production";
  const maxAge = rememberMe
    ? 7 * 24 * 60 * 60 * 1000
    : 24 * 60 * 60 * 1000;

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge,
  };
};

const clearAuthCookie = (res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });
};

/**
 * Sliding refresh: only when JWT signature is valid AND not yet expired,
 * and exp is within 5 minutes. Expired or malformed tokens clear the cookie.
 */
const sessionCheck = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const now = Date.now() / 1000;
    const fiveMinutes = 5 * 60;

    if (decoded.exp - now < fiveMinutes) {
      const rememberMe =
        decoded.exp - decoded.iat > 24 * 60 * 60;
      const newToken = signToken(decoded.id, rememberMe);
      const cookieOptions = getCookieOptions(rememberMe);
      res.cookie("token", newToken, cookieOptions);
      req.cookies.token = newToken;
    }
  } catch (error) {
    clearAuthCookie(res);
    req.cookies.token = undefined;
  }

  next();
};

module.exports = sessionCheck;
