const express = require("express");
const authRoutes = require("./authRoutes");
const adminRoutes = require("./adminRoutes");
const jobRoutes = require("./jobRoutes");
const applicationRoutes = require("./applicationRoutes");
const userRoutes = require("./userRoutes");
const bookmarkRoutes = require("./bookmarkRoutes");
const contactRoutes = require("./contactRoutes");
const sessionCheck = require("../middleware/sessionCheck");

const router = express.Router();

// Apply session check middleware to all routes
router.use(sessionCheck);

router.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "CampusConnect API healthy" });
});
router.use("/auth", authRoutes);
router.use("/admin", adminRoutes);
router.use("/jobs", jobRoutes);
router.use("/applications", applicationRoutes);
router.use("/users", userRoutes);
router.use("/bookmarks", bookmarkRoutes);
router.use("/contact", contactRoutes);

module.exports = router;
