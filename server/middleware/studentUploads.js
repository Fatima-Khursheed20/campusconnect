const path = require("path");
const multer = require("multer");
const { resumeDir, profilePictureDir } = require("../utils/ensureUploadDirs");

const sanitizeFilename = (original) =>
  original.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 180);

const resumeStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, resumeDir);
  },
  filename: (req, file, cb) => {
    const base = sanitizeFilename(file.originalname || "resume.pdf");
    cb(null, `${req.user._id}-${Date.now()}-${base}`);
  },
});

const profilePictureStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, profilePictureDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || "") || ".jpg";
    cb(null, `${req.user._id}-${Date.now()}${ext}`);
  },
});

const resumeUpload = multer({
  storage: resumeStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      return cb(null, true);
    }
    return cb(new Error("Only PDF resumes are allowed"));
  },
});

const profilePictureUpload = multer({
  storage: profilePictureStorage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.mimetype)) {
      return cb(null, true);
    }
    return cb(new Error("Only JPEG, PNG, WebP, or GIF images are allowed"));
  },
});

module.exports = {
  resumeUpload,
  profilePictureUpload,
};
