const fs = require("fs");
const path = require("path");

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

const uploadsRoot = path.join(__dirname, "../uploads");
const resumeDir = path.join(uploadsRoot, "resumes");
const profilePictureDir = path.join(uploadsRoot, "profile-pictures");

function ensureUploadDirs() {
  ensureDir(resumeDir);
  ensureDir(profilePictureDir);
}

module.exports = {
  ensureUploadDirs,
  uploadsRoot,
  resumeDir,
  profilePictureDir,
};
