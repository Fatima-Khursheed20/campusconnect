const express = require("express");
const { param } = require("express-validator");
const { verifyToken, checkRole } = require("../middleware/auth");
const { toggleBookmark } = require("../controllers/bookmarkController");

const router = express.Router();

router.post(
  "/:jobId",
  verifyToken,
  checkRole(["student"]),
  [param("jobId").isMongoId().withMessage("Invalid job ID")],
  toggleBookmark
);

module.exports = router;
