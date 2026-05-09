const { validationResult } = require("express-validator");
const User = require("../models/User");

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

    const resumeUrl = `/uploads/resumes/${req.file.filename}`;
    user.resumeUrl = resumeUrl;
    await user.save();

    const safeUser = await User.findById(user._id).select("-password");
    return res.status(200).json({
      message: "Resume uploaded successfully",
      resumeUrl,
      user: safeUser,
    });
  } catch (error) {
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

    const profilePicture = `/uploads/profile-pictures/${req.file.filename}`;
    user.profilePicture = profilePicture;
    await user.save();

    const safeUser = await User.findById(user._id).select("-password");
    return res.status(200).json({
      message: "Profile picture uploaded successfully",
      profilePicture,
      user: safeUser,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to upload profile picture" });
  }
};

module.exports = {
  updateProfile,
  uploadResumeHandler,
  uploadProfilePictureHandler,
};
