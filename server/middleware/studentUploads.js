const path = require("path");
const multer = require("multer");
const { resumeDir, profilePictureDir } = require("../utils/ensureUploadDirs");

const sanitizeFilename = (original) => {
  if (!original) return "file";
  
  // Check if filename is too long before processing
  if (original.length > 200) {
    throw new Error("Filename too long. Maximum 200 characters allowed.");
  }
  
  // Sanitize and limit to 180 characters
  return original.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 180);
};

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

const withResumeUpload = (req, res, next) => {
  resumeUpload.single("resume")(req, res, (err) => {
    if (err) {
      let message = "Resume upload failed";
      if (err.message) {
        message = err.message.includes("Filename too long") ? err.message : message;
      }
      return res.status(400).json({ message });
    }
    return next();
  });
};

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

const withProfilePictureUpload = (req, res, next) => {
  profilePictureUpload.single("profilePicture")(req, res, (err) => {
    if (err) {
      let message = "Profile picture upload failed";
      if (err.message) {
        message = err.message.includes("Filename too long") ? err.message : message;
      }
      return res.status(400).json({ message });
    }
    return next();
  });
};

module.exports = {
  resumeUpload,
  profilePictureUpload,
  withResumeUpload,
  withProfilePictureUpload,
};
