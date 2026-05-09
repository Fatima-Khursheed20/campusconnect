const express = require("express");
const { body, cookie, param } = require("express-validator");
const {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");
const { verifyToken } = require("../middleware/auth");
const validate = require("../middleware/validate");
const User = require("../models/User");

const router = express.Router();

router.post(
  "/register",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Please enter a valid email address."),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long.")
      .matches(/(?=.*[A-Z])/)
      .withMessage("Password must contain at least one uppercase letter.")
      .matches(/(?=.*\d)/)
      .withMessage("Password must contain at least one number.")
      .matches(/(?=.*[!@#$%^&*])/)
      .withMessage("Password must contain at least one special character (!@#$%^&*)."),
    body("role")
      .isIn(["student", "recruiter"])
      .withMessage("Invalid role specified."),
    body('companyName').if(body('role').equals('recruiter')).notEmpty().withMessage('Company Name is required for recruiters.'),
  ],
  validate,
  register
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  validate,
  login
);

router.post(
  "/logout",
  [cookie("token").optional().isString().withMessage("Invalid token cookie")],
  logout
);

router.post(
  "/forgot-password",
  [body("email").isEmail().withMessage("Valid email is required")],
  validate,
  forgotPassword
);

router.post(
  "/reset-password/:token",
  [
    param("token").isString().notEmpty().withMessage("Reset token is required"),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long."),
  ],
  validate,
  resetPassword
);

router.get("/me", verifyToken, async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  return res.status(200).json({ user });
});

module.exports = router;
