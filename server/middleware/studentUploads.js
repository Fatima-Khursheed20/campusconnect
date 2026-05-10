const path = require("path");
const multer = require("multer");
const { resumeDir, profilePictureDir } = require("../utils/ensureUploadDirs");
const { usesServerlessFileStorage } = require("../utils/serverlessFiles");

const sanitizeFilename = (original) => {
  if (!original) return "file";

  if (original.length > 200) {
    throw new Error("Filename too long. Maximum 200 characters allowed.");
  }

  return original.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 180);
};

const buildResumeStoredName = (req, file) => {
  const base = sanitizeFilename(file.originalname || "resume.pdf");
  return `${req.user._id}-${Date.now()}-${base}`;
};

const buildProfilePictureStoredName = (req, file) => {
  const ext = path.extname(file.originalname || "") || ".jpg";
  return `${req.user._id}-${Date.now()}${ext}`;
};

const resumeStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, resumeDir);
  },
  filename: (req, file, cb) => {
    try {
      cb(null, buildResumeStoredName(req, file));
    } catch (e) {
      cb(e);
    }
  },
});

const profilePictureStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, profilePictureDir);
  },
  filename: (req, file, cb) => {
    try {
      cb(null, buildProfilePictureStoredName(req, file));
    } catch (e) {
      cb(e);
    }
  },
});

const memoryStorage = multer.memoryStorage();

const resumeFileFilter = (_req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    return cb(null, true);
  }
  return cb(new Error("Only PDF resumes are allowed"));
};

const profilePictureFileFilter = (_req, file, cb) => {
  if (["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.mimetype)) {
    return cb(null, true);
  }
  return cb(new Error("Only JPEG, PNG, WebP, or GIF images are allowed"));
};

/** Vercel serverless request body is capped (~4.5 MB); leave margin for multipart overhead */
const resumeMaxBytesDisk = 5 * 1024 * 1024;
const resumeMaxBytesServerless = 4 * 1024 * 1024;

const resumeUploadDisk = multer({
  storage: resumeStorage,
  limits: { fileSize: resumeMaxBytesDisk },
  fileFilter: resumeFileFilter,
});

const resumeUploadMemory = multer({
  storage: memoryStorage,
  limits: { fileSize: resumeMaxBytesServerless },
  fileFilter: resumeFileFilter,
});

const profilePictureUploadDisk = multer({
  storage: profilePictureStorage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: profilePictureFileFilter,
});

const profilePictureUploadMemory = multer({
  storage: memoryStorage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: profilePictureFileFilter,
});

const serverless = usesServerlessFileStorage();
const resumeUpload = serverless ? resumeUploadMemory : resumeUploadDisk;
const profilePictureUpload = serverless ? profilePictureUploadMemory : profilePictureUploadDisk;

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
  buildResumeStoredName,
  buildProfilePictureStoredName,
};
