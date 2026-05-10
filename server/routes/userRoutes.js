const express = require("express");
const { body } = require("express-validator");
const { verifyToken, checkRole } = require("../middleware/auth");
const {
  withResumeUpload,
  withProfilePictureUpload,
} = require("../middleware/studentUploads");
const {
  updateProfile,
  uploadResumeHandler,
  uploadProfilePictureHandler,
} = require("../controllers/userController");
const { getMyApplications, getMyBookmarks } = require("../controllers/applicationController");

const router = express.Router();

const studentOnly = [verifyToken, checkRole(["student"])];

const profileValidation = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters"),
  body("bio").optional().trim().isLength({ max: 1000 }).withMessage("Bio is too long"),
  body("skills").optional().isArray().withMessage("Skills must be an array"),
  body("skills.*").optional().trim().isLength({ max: 80 }).withMessage("Skill is too long"),
  body("education").optional().isArray().withMessage("Education must be an array"),
];

router.put("/profile", [...studentOnly, ...profileValidation], updateProfile);

router.post("/upload-resume", ...studentOnly, withResumeUpload, uploadResumeHandler);

router.post(
  "/upload-profile-picture",
  ...studentOnly,
  withProfilePictureUpload,
  uploadProfilePictureHandler
);

router.get("/applications", ...studentOnly, getMyApplications);
router.get("/bookmarks", ...studentOnly, getMyBookmarks);

module.exports = router;
