const express = require("express");
const { body, param } = require("express-validator");
const { verifyToken, checkRole } = require("../middleware/auth");
const {
  applyForJob,
  getJobApplicants,
  updateApplicationStatus,
  getMyApplications,
  bookmarkJob,
  unbookmarkJob,
  getMyBookmarks,
} = require("../controllers/applicationController");

const router = express.Router();

const applicationStatusValues = ["pending", "reviewed", "shortlisted", "rejected"];

const applyValidation = [
  body("coverLetter")
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage("Cover letter must be less than 5000 characters"),
  body("resumeUrl")
    .optional()
    .trim()
    .isURL()
    .withMessage("Resume URL must be a valid URL"),
];

router.post(
  "/jobs/:id/apply",
  verifyToken,
  checkRole(["student"]),
  [param("id").isMongoId().withMessage("Invalid job ID"), ...applyValidation],
  applyForJob
);

router.get(
  "/jobs/:id/applicants",
  verifyToken,
  checkRole(["recruiter"]),
  [param("id").isMongoId().withMessage("Invalid job ID")],
  getJobApplicants
);

router.patch(
  "/applications/:id/status",
  verifyToken,
  checkRole(["recruiter"]),
  [
    param("id").isMongoId().withMessage("Invalid application ID"),
    body("status")
      .isIn(applicationStatusValues)
      .withMessage("Status must be one of pending/reviewed/shortlisted/rejected"),
  ],
  updateApplicationStatus
);

router.get("/my-applications", verifyToken, checkRole(["student"]), getMyApplications);

router.post(
  "/jobs/:id/bookmark",
  verifyToken,
  checkRole(["student"]),
  [param("id").isMongoId().withMessage("Invalid job ID")],
  bookmarkJob
);

router.delete(
  "/jobs/:id/bookmark",
  verifyToken,
  checkRole(["student"]),
  [param("id").isMongoId().withMessage("Invalid job ID")],
  unbookmarkJob
);

router.get("/my-bookmarks", verifyToken, checkRole(["student"]), getMyBookmarks);

module.exports = router;