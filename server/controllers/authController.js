const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/User");

const SALT_ROUNDS = 12;

// Centralized cookie options
const getCookieOptions = (rememberMe = false) => {
  const isProduction = process.env.NODE_ENV === "production";
  const maxAge = rememberMe
    ? 7 * 24 * 60 * 60 * 1000 // 7 days
    : 24 * 60 * 60 * 1000; // 24 hours

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge,
  };
};

const signToken = (userId, rememberMe = false) => {
  const expiresIn = rememberMe ? "7d" : "24h";
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn });
};

const register = async (req, res) => {
  try {
    const { name, email, password, role, companyName } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        errors: [{ field: "email", message: "Email is already registered" }],
      });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const newUser = {
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role || "student",
    };

    if (role === 'recruiter') {
      newUser.companyName = companyName;
    }

    const user = await User.create(newUser);

    // Do not automatically log in upon registration
    const safeUser = await User.findById(user._id).select("-password");
    return res.status(201).json({
      message: "Registration successful. Please log in.",
      user: safeUser,
    });
  } catch (error) {
    console.error("[auth] register:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+password"
    );

    if (!user || !user.isActive) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = signToken(user._id, rememberMe);
    const cookieOptions = getCookieOptions(rememberMe);
    res.cookie("token", token, cookieOptions);

    const safeUser = await User.findById(user._id).select("-password");
    return res.status(200).json({
      message: "Login successful",
      user: safeUser,
    });
  } catch (error) {
    console.error("[auth] login:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

const logout = async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });

  return res.status(200).json({ message: "Logged out successfully" });
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+resetPasswordToken +resetPasswordExpires"
    );

    // Return generic response to avoid user enumeration.
    if (!user) {
      return res.status(200).json({
        message: "If the email exists, a password reset link has been sent.",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();

    if (process.env.NODE_ENV !== "production" && process.env.DEBUG_PASSWORD_RESET === "true") {
      console.log(
        "[auth] Password reset token issued (enable only locally):",
        `${process.env.CLIENT_URL || "http://localhost:5173"}/reset-password/${resetToken}`
      );
    }

    return res.status(200).json({
      message: "If the email exists, a password reset link has been sent.",
    });
  } catch (error) {
    console.error("[auth] forgotPassword:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const incomingTokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const candidateUsers = await User.find({
      resetPasswordExpires: { $gt: new Date() },
      resetPasswordToken: { $exists: true, $ne: null },
    }).select("+resetPasswordToken +resetPasswordExpires");

    let matchedUser = null;
    const incomingBuffer = Buffer.from(incomingTokenHash, "hex");

    for (const user of candidateUsers) {
      const storedToken = user.resetPasswordToken;
      if (!storedToken) {
        continue;
      }

      const storedBuffer = Buffer.from(storedToken, "hex");
      if (storedBuffer.length !== incomingBuffer.length) {
        continue;
      }

      if (crypto.timingSafeEqual(storedBuffer, incomingBuffer)) {
        matchedUser = user;
        break;
      }
    }

    if (!matchedUser || matchedUser.resetPasswordExpires < new Date()) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    matchedUser.password = hashedPassword;
    matchedUser.resetPasswordToken = undefined;
    matchedUser.resetPasswordExpires = undefined;
    await matchedUser.save();

    return res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error("[auth] resetPassword:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
};
