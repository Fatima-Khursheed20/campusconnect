const { validationResult } = require("express-validator");
const Application = require("../models/Application");
const Job = require("../models/Job");
const User = require("../models/User");
const Bookmark = require("../models/Bookmark");

const sendValidationError = (res, errors) =>
  res.status(400).json({
    message: "Validation failed",
    errors: errors.array(),
  });

const applyForJob = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendValidationError(res, errors);
    }

    if (req.user.role !== "student") {
      return res.status(403).json({ message: "Only students can apply for jobs" });
    }

    const jobId = req.params.jobId || req.params.id;
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (!job.isActive) {
      return res.status(400).json({ message: "This job is no longer accepting applications" });
    }

    if (job.deadline && new Date() > new Date(job.deadline)) {
      return res.status(400).json({ message: "Application deadline has passed" });
    }

    // Check if already applied
    const existingApplication = await Application.findOne({
      job: jobId,
      applicant: req.user._id,
    });

    if (existingApplication) {
      return res.status(400).json({ message: "You have already applied for this job" });
    }

    const application = await Application.create({
      job: jobId,
      applicant: req.user._id,
      coverLetter: req.body.coverLetter,
      resumeUrl: req.body.resumeUrl,
    });

    // Add application to job's applicants array
    job.applicants.push(application._id);
    await job.save();

    return res.status(201).json({
      message: "Application submitted successfully",
      application,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "You have already applied for this job" });
    }
    return res.status(500).json({ message: "Failed to submit application" });
  }
};

const getJobApplicants = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendValidationError(res, errors);
    }

    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to view applicants for this job" });
    }

    const applications = await Application.find({ job: req.params.id })
      .populate("applicant", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({ applications });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch applicants" });
  }
};

const updateApplicationStatus = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendValidationError(res, errors);
    }

    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    const job = await Job.findById(application.job);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this application" });
    }

    application.status = req.body.status;
    await application.save();

    return res.status(200).json({
      message: "Application status updated successfully",
      application,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update application status" });
  }
};

const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ applicant: req.user._id })
      .populate({
        path: "job",
        select: "title location type salary deadline isActive",
        populate: {
          path: "postedBy",
          select: "name companyName",
        },
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({ applications });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch your applications" });
  }
};

const bookmarkJob = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendValidationError(res, errors);
    }

    if (req.user.role !== "student") {
      return res.status(403).json({ message: "Only students can bookmark jobs" });
    }

    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Check if already bookmarked
    const existingBookmark = await Bookmark.findOne({
      job: req.params.id,
      user: req.user._id,
    });

    if (existingBookmark) {
      return res.status(400).json({ message: "Job already bookmarked" });
    }

    const bookmark = await Bookmark.create({
      job: req.params.id,
      user: req.user._id,
    });

    return res.status(201).json({
      message: "Job bookmarked successfully",
      bookmark,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Job already bookmarked" });
    }
    return res.status(500).json({ message: "Failed to bookmark job" });
  }
};

const unbookmarkJob = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendValidationError(res, errors);
    }

    const bookmark = await Bookmark.findOne({
      job: req.params.id,
      user: req.user._id,
    });

    if (!bookmark) {
      return res.status(404).json({ message: "Bookmark not found" });
    }

    await bookmark.deleteOne();

    return res.status(200).json({ message: "Job unbookmarked successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to unbookmark job" });
  }
};

const getMyBookmarks = async (req, res) => {
  try {
    const bookmarks = await Bookmark.find({ user: req.user._id })
      .populate({
        path: "job",
        select: "title location type salary deadline isActive",
        populate: {
          path: "postedBy",
          select: "name companyName",
        },
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({ bookmarks });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch bookmarks" });
  }
};

module.exports = {
  applyForJob,
  getJobApplicants,
  updateApplicationStatus,
  getMyApplications,
  bookmarkJob,
  unbookmarkJob,
  getMyBookmarks,
};