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
    .custom((value) => {
      if (!value) return true;
      if (value.startsWith("/uploads/")) return true;
      try {
        // eslint-disable-next-line no-new
        new URL(value);
        return true;
      } catch {
        throw new Error("Resume must be a valid URL or an uploaded file path");
      }
    }),
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

router.post(
  "/:jobId",
  verifyToken,
  checkRole(["student"]),
  [param("jobId").isMongoId().withMessage("Invalid job ID"), ...applyValidation],
  applyForJob
);

module.exports = router;