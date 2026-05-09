const User = require("../models/User");
const Job = require("../models/Job");
const Application = require("../models/Application");

const getStats = async (req, res) => {
  try {
    const [totalUsers, totalJobs, totalApplications, activeRecruiters] =
      await Promise.all([
        User.countDocuments(),
        Job.countDocuments(),
        Application.countDocuments(),
        User.countDocuments({ role: "recruiter", isActive: true }),
      ]);

    const [recentUsers, recentJobs] = await Promise.all([
      User.find()
        .select("name email role isActive createdAt")
        .sort({ createdAt: -1 })
        .limit(5),
      Job.find()
        .select("title type isActive createdAt")
        .populate("postedBy", "name companyName")
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    return res.status(200).json({
      stats: {
        totalUsers,
        totalJobs,
        totalApplications,
        activeRecruiters,
      },
      recentUsers,
      recentJobs,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch stats" });
  }
};

const getUsers = async (req, res) => {
  try {
    const { search = "" } = req.query;
    const query = {};

    if (search.trim()) {
      query.$or = [
        { name: { $regex: search.trim(), $options: "i" } },
        { email: { $regex: search.trim(), $options: "i" } },
      ];
    }

    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 });

    return res.status(200).json({ users });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch users" });
  }
};

const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.isActive = !user.isActive;
    await user.save();

    return res.status(200).json({
      message: "User status updated",
      user,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update user status" });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const allowedRoles = ["student", "recruiter", "admin"];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await User.findById(id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.role = role;
    await user.save();

    return res.status(200).json({
      message: "User role updated",
      user,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update user role" });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user._id.toString() === id) {
      return res.status(400).json({ message: "Admin cannot delete own account" });
    }

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete user" });
  }
};

const getJobs = async (req, res) => {
  try {
    const jobs = await Job.find()
      .populate("postedBy", "companyName name")
      .sort({ createdAt: -1 });

    return res.status(200).json({ jobs });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch jobs" });
  }
};

const toggleJobStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const job = await Job.findById(id).populate("postedBy", "companyName name");

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    job.isActive = !job.isActive;
    await job.save();

    return res.status(200).json({
      message: "Job status updated",
      job,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update job status" });
  }
};

const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;
    const job = await Job.findByIdAndDelete(id);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    return res.status(200).json({ message: "Job deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete job" });
  }
};

module.exports = {
  getStats,
  getUsers,
  toggleUserStatus,
  updateUserRole,
  deleteUser,
  getJobs,
  toggleJobStatus,
  deleteJob,
};
