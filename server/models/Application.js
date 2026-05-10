const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "reviewed", "shortlisted", "rejected"],
      default: "pending",
      required: true,
    },
    coverLetter: {
      type: String,
      trim: true,
      maxlength: 5000,
    },
    resumeUrl: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// Indexes for performance
applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });
applicationSchema.index({ applicant: 1, status: 1 });

const Application = mongoose.model("Application", applicationSchema);

module.exports = Application;
