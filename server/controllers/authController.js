const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const { validationResult } = require("express-validator");
const User = require("../models/User");

const SALT_ROUNDS = 12;
const JWT_EXPIRES_IN = "24h";
const COOKIE_MAX_AGE = 24 * 60 * 60 * 1000;

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  maxAge: COOKIE_MAX_AGE,
};

const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

const sendValidationError = (res, errors) =>
  res.status(400).json({
    message: "Validation failed",
    errors: errors.array(),
  });

const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendValidationError(res, errors);
    }

    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ message: "Email is already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await User.create({
      ...req.body,
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role || "student",
    });

    const token = signToken(user._id);
    res.cookie("token", token, cookieOptions);

    const safeUser = await User.findById(user._id).select("-password");
    return res.status(201).json({
      message: "Registration successful",
      user: safeUser,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendValidationError(res, errors);
    }

    const { email, password } = req.body;

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

    const token = signToken(user._id);
    res.cookie("token", token, cookieOptions);

    const safeUser = await User.findById(user._id).select("-password");
    return res.status(200).json({
      message: "Login successful",
      user: safeUser,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

const logout = async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return res.status(200).json({ message: "Logged out successfully" });
};

const forgotPassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendValidationError(res, errors);
    }

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

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER || "your_email@gmail.com",
        pass: process.env.GMAIL_APP_PASSWORD || "your_gmail_app_password",
      },
    });

    const mailOptions = {
      from: process.env.GMAIL_USER || "your_email@gmail.com",
      to: user.email,
      subject: "CampusConnect Password Reset",
      text: `Reset your password using this link: ${resetUrl}. It expires in 1 hour.`,
    };

    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      console.log("Email credentials not configured. Reset URL:", resetUrl);
      return res.status(200).json({
        message: "Reset token generated. Configure email credentials to send mail.",
      });
    }

    await transporter.sendMail(mailOptions);
    return res.status(200).json({
      message: "If the email exists, a password reset link has been sent.",
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendValidationError(res, errors);
    }

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
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
};
