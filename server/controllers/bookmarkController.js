const { validationResult } = require("express-validator");
const Bookmark = require("../models/Bookmark");
const Job = require("../models/Job");

const sendValidationError = (res, errors) =>
  res.status(400).json({
    message: "Validation failed",
    errors: errors.array(),
  });

const toggleBookmark = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendValidationError(res, errors);
    }

    const job = await Job.findById(req.params.jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    const existing = await Bookmark.findOne({
      job: req.params.jobId,
      user: req.user._id,
    });

    if (existing) {
      await existing.deleteOne();
      return res.status(200).json({
        message: "Bookmark removed",
        bookmarked: false,
      });
    }

    try {
      await Bookmark.create({
        job: req.params.jobId,
        user: req.user._id,
      });
    } catch (err) {
      if (err.code === 11000) {
        await Bookmark.deleteOne({ job: req.params.jobId, user: req.user._id });
        return res.status(200).json({
          message: "Bookmark removed",
          bookmarked: false,
        });
      }
      throw err;
    }

    return res.status(201).json({
      message: "Job bookmarked",
      bookmarked: true,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update bookmark" });
  }
};

module.exports = {
  toggleBookmark,
};
