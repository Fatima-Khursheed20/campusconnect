const express = require("express");
const { body } = require("express-validator");
const { submitContactMessage } = require("../controllers/contactController");

const router = express.Router();

router.post(
  "/",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").trim().isEmail().withMessage("A valid email is required"),
    body("subject").trim().notEmpty().withMessage("Subject is required"),
    body("message")
      .trim()
      .notEmpty()
      .withMessage("Message is required")
      .isLength({ max: 8000 })
      .withMessage("Message is too long"),
  ],
  submitContactMessage
);

module.exports = router;
