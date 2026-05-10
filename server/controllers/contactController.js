const { validationResult } = require("express-validator");

const sendValidationError = (res, errors) =>
  res.status(400).json({
    message: "Validation failed",
    errors: errors.array(),
  });

const submitContactMessage = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendValidationError(res, errors);
    }

    const payload = {
      receivedAt: new Date().toISOString(),
      ip: req.ip,
      ...req.body,
    };

    console.log("[CampusConnect] Contact form submission:", payload);

    return res.status(200).json({
      message: "Thank you! Your message has been received and we will get back to you soon.",
    });
  } catch (error) {
    console.error("[CampusConnect] Contact form error:", error);
    return res.status(500).json({ message: "Unable to deliver your message right now." });
  }
};

module.exports = {
  submitContactMessage,
};
