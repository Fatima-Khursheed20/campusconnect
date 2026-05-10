const { validationResult } = require("express-validator");
const Job = require("../models/Job");

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const sendValidationError = (res, errors) =>
  res.status(400).json({
    message: "Validation failed",
    errors: errors.array(),
  });

const createJob = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendValidationError(res, errors);
    }

    if (req.user.role !== "recruiter") {
      return res.status(403).json({ message: "Only recruiters can create jobs" });
    }

    const job = await Job.create({
      ...req.body,
      postedBy: req.user._id,
    });

    return res.status(201).json({
      message: "Job created successfully",
      job,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to create job" });
  }
};

const getAllJobs = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendValidationError(res, errors);
    }

    const {
      search = "",
      type,
      location,
      page = 1,
      limit = 10,
    } = req.query;

    const pageNumber = Math.max(1, Number(page) || 1);
    const pageSize = Math.max(1, Number(limit) || 10);

    const query = { isActive: true };

    if (search.trim()) {
      const term = escapeRegex(search.trim().slice(0, 200));
      query.$or = [
        { title: { $regex: term, $options: "i" } },
        { description: { $regex: term, $options: "i" } },
      ];
    }

    if (type) {
      query.type = type;
    }

    if (location) {
      query.location = {
        $regex: escapeRegex(location.trim().slice(0, 120)),
        $options: "i",
      };
    }

    const [jobs, total] = await Promise.all([
      Job.find(query)
        .populate("postedBy", "name companyName")
        .sort({ createdAt: -1 })
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize),
      Job.countDocuments(query),
    ]);

    return res.status(200).json({
      jobs,
      pagination: {
        total,
        page: pageNumber,
        limit: pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch jobs" });
  }
};

const getJobById = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendValidationError(res, errors);
    }

    const job = await Job.findById(req.params.id).populate(
      "postedBy",
      "name companyName companyWebsite"
    );

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    return res.status(200).json({ job });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch job" });
  }
};

const updateJob = async (req, res) => {
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
      return res.status(403).json({ message: "Not authorized to update this job" });
    }

    const allowed = ["title", "description", "requirements", "type", "location", "salary", "deadline", "isActive"];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) job[field] = req.body[field];
    });
    await job.save();

    return res.status(200).json({
      message: "Job updated successfully",
      job,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update job" });
  }
};

const deleteJob = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendValidationError(res, errors);
    }

    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    const isOwner = job.postedBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Not authorized to delete this job" });
    }

    await job.deleteOne();
    return res.status(200).json({ message: "Job deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete job" });
  }
};

const getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ postedBy: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json({ jobs });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch your jobs" });
  }
};

const toggleJobStatus = async (req, res) => {
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
      return res.status(403).json({ message: "Not authorized to modify this job" });
    }

    job.isActive = !job.isActive;
    await job.save();

    return res.status(200).json({
      message: `Job listing ${job.isActive ? "opened" : "closed"} successfully`,
      job,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to toggle job status" });
  }
};

module.exports = {
  createJob,
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob,
  getMyJobs,
  toggleJobStatus,
};
