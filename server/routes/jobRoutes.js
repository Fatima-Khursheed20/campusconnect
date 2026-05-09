const express = require("express");
const { body, param, query } = require("express-validator");
const { verifyToken, checkRole } = require("../middleware/auth");
const {
  createJob,
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob,
  getMyJobs,
  toggleJobStatus,
} = require("../controllers/jobController");

const router = express.Router();

const jobTypeValues = ["internship", "full-time", "part-time"];

const createJobValidation = [
  body("title")
    .trim()
    .isLength({ min: 3 })
    .withMessage("Title is required and must be at least 3 characters"),
  body("description")
    .trim()
    .isLength({ min: 50 })
    .withMessage("Description is required and must be at least 50 characters"),
  body("type")
    .isIn(jobTypeValues)
    .withMessage("Type must be one of internship/full-time/part-time"),
  body("location").trim().notEmpty().withMessage("Location is required"),
  body("deadline")
    .notEmpty()
    .withMessage("Deadline is required")
    .bail()
    .isISO8601()
    .withMessage("Deadline must be a valid date")
    .bail()
    .custom((value) => new Date(value) > new Date())
    .withMessage("Deadline must be a future date"),
];

const updateJobValidation = [
  body("title")
    .optional()
    .trim()
    .isLength({ min: 3 })
    .withMessage("Title must be at least 3 characters"),
  body("description")
    .optional()
    .trim()
    .isLength({ min: 50 })
    .withMessage("Description must be at least 50 characters"),
  body("type")
    .optional()
    .isIn(jobTypeValues)
    .withMessage("Type must be one of internship/full-time/part-time"),
  body("deadline")
    .optional()
    .isISO8601()
    .withMessage("Deadline must be a valid date")
    .bail()
    .custom((value) => new Date(value) > new Date())
    .withMessage("Deadline must be a future date"),
];

router.get(
  "/",
  [
    query("type")
      .optional()
      .isIn(jobTypeValues)
      .withMessage("Invalid type filter"),
    query("page").optional().isInt({ min: 1 }).withMessage("Page must be >= 1"),
    query("limit")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Limit must be >= 1"),
  ],
  getAllJobs
);
router.get("/my-jobs", verifyToken, checkRole(["recruiter"]), getMyJobs);
router.get("/:id", [param("id").isMongoId().withMessage("Invalid job ID")], getJobById);
router.post(
  "/",
  verifyToken,
  checkRole(["recruiter"]),
  createJobValidation,
  createJob
);
router.put(
  "/:id",
  verifyToken,
  checkRole(["recruiter"]),
  [param("id").isMongoId().withMessage("Invalid job ID"), ...updateJobValidation],
  updateJob
);
router.delete(
  "/:id",
  verifyToken,
  checkRole(["recruiter", "admin"]),
  [param("id").isMongoId().withMessage("Invalid job ID")],
  deleteJob
);
router.patch(
  "/:id/toggle",
  verifyToken,
  checkRole(["recruiter"]),
  [param("id").isMongoId().withMessage("Invalid job ID")],
  toggleJobStatus
);

module.exports = router;
