const { validationResult } = require("express-validator");
const User = require("../models/User");
const { putPublicFile } = require("../utils/blobUpload");
const {
  buildResumeStoredName,
  buildProfilePictureStoredName,
} = require("../middleware/studentUploads");

const storedUrlFromFile = async (req, kind) => {
  if (req.file.buffer && Buffer.isBuffer(req.file.buffer)) {
    const pathname =
      kind === "resume"
        ? `resumes/${buildResumeStoredName(req, req.file)}`
        : `profile-pictures/${buildProfilePictureStoredName(req, req.file)}`;
    const blob = await putPublicFile(pathname, req.file.buffer, {
      contentType: req.file.mimetype,
    });
    return blob.url;
  }
  const subdir = kind === "resume" ? "resumes" : "profile-pictures";
  return `/uploads/${subdir}/${req.file.filename}`;
};

const isLikelyBlobError = (e) => {
  if (!e) return false;
  if (typeof e.name === "string" && e.name.includes("Blob")) return true;
  return /blob|vercel-storage|BLOB_/i.test(String(e.message || ""));
};

const mapUploadError = (res, e, action) => {
  const fallbackMessage =
    action === "resume" ? "Failed to upload resume" : "Failed to upload profile picture";

  if (e.code === "NO_BLOB_TOKEN") {
    return res.status(503).json({ message: e.message });
  }
  if (isLikelyBlobError(e)) {
    return res.status(502).json({
      message:
        e.message ||
        "File storage rejected the upload. Check BLOB_READ_WRITE_TOKEN and that a Blob store is linked to this Vercel project.",
    });
  }
  console.error(`[user] upload ${action}:`, e);
  const expose =
    process.env.NODE_ENV !== "production" || process.env.SHOW_UPLOAD_ERRORS === "true";
  return res.status(500).json({
    message: fallbackMessage,
    ...(expose && e.message ? { detail: e.message } : {}),
  });
};

const sendValidationError = (res, errors) =>
  res.status(400).json({
    message: "Validation failed",
    errors: errors.array(),
  });

const normalizeEducation = (entries) =>
  (entries || []).map((e) => ({
    institution: (e.institution || e.school || "").trim(),
    degree: (e.degree || "").trim(),
    grade: e.year != null && e.year !== "" ? String(e.year).trim() : (e.grade || "").trim(),
    fieldOfStudy: (e.fieldOfStudy || "").trim(),
    description: (e.description || "").trim(),
  }));

const updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendValidationError(res, errors);
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { name, bio, skills, education } = req.body;

    if (name !== undefined) {
      user.name = name.trim();
    }
    if (bio !== undefined) {
      user.bio = bio?.trim() || "";
    }
    if (skills !== undefined) {
      user.skills = Array.isArray(skills)
        ? [...new Set(skills.map((s) => String(s).trim()).filter(Boolean))].slice(0, 50)
        : [];
    }
    if (education !== undefined) {
      user.education = normalizeEducation(education);
    }

    await user.save();

    const safeUser = await User.findById(user._id).select("-password");
    return res.status(200).json({
      message: "Profile updated successfully",
      user: safeUser,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update profile" });
  }
};

const uploadResumeHandler = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Resume file is required" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let resumeUrl;
    try {
      resumeUrl = await storedUrlFromFile(req, "resume");
    } catch (e) {
      return mapUploadError(res, e, "resume");
    }
    user.resumeUrl = resumeUrl;
    await user.save();

    const safeUser = await User.findById(user._id).select("-password");
    return res.status(200).json({
      message: "Resume uploaded successfully",
      resumeUrl,
      user: safeUser,
    });
  } catch (error) {
    console.error("[user] upload resume (unexpected):", error);
    return res.status(500).json({ message: "Failed to upload resume" });
  }
};

const uploadProfilePictureHandler = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Profile picture file is required" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let profilePicture;
    try {
      profilePicture = await storedUrlFromFile(req, "profile");
    } catch (e) {
      return mapUploadError(res, e, "profile");
    }
    user.profilePicture = profilePicture;
    await user.save();

    const safeUser = await User.findById(user._id).select("-password");
    return res.status(200).json({
      message: "Profile picture uploaded successfully",
      profilePicture,
      user: safeUser,
    });
  } catch (error) {
    console.error("[user] upload profile picture (unexpected):", error);
    return res.status(500).json({ message: "Failed to upload profile picture" });
  }
};

module.exports = {
  updateProfile,
  uploadResumeHandler,
  uploadProfilePictureHandler,
};
