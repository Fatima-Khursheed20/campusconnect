const mongoose = require("mongoose");

const educationSchema = new mongoose.Schema(
  {
    institution: { type: String, trim: true },
    degree: { type: String, trim: true },
    fieldOfStudy: { type: String, trim: true },
    startDate: Date,
    endDate: Date,
    grade: { type: String, trim: true },
    description: { type: String, trim: true },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },

    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },

    role: {
      type: String,
      enum: ["student", "recruiter", "admin"],
      default: "student",
      required: true,
    },

    isActive: { type: Boolean, default: true },

    profilePicture: { type: String, trim: true },

    bio: { type: String, trim: true, maxlength: 1000 },

    skills: [{ type: String, trim: true }],

    education: [educationSchema],

    resumeUrl: { type: String, trim: true },

    companyName: { type: String, trim: true },

    companyWebsite: { type: String, trim: true },

    companyDescription: { type: String, trim: true, maxlength: 2000 },

    resetPasswordToken: { type: String, select: false },

    resetPasswordExpires: { type: Date, select: false },
  },
  { timestamps: true }
);

// indexes (removed duplicate email index)

module.exports = mongoose.model("User", userSchema);