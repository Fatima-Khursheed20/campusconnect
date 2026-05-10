const express = require("express");
const authRoutes = require("./authRoutes");
const adminRoutes = require("./adminRoutes");
const jobRoutes = require("./jobRoutes");
const applicationRoutes = require("./applicationRoutes");
const userRoutes = require("./userRoutes");
const bookmarkRoutes = require("./bookmarkRoutes");
const contactRoutes = require("./contactRoutes");
const sessionCheck = require("../middleware/sessionCheck");
const { csrfProtection, csrfTokenMiddleware, getCsrfToken } = require("../middleware/csrf");

const router = express.Router();

// Apply session check middleware to all routes
router.use(sessionCheck);

router.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "CampusConnect API healthy" });
});

// CSRF token endpoint
router.get("/csrf-token", csrfTokenMiddleware, getCsrfToken);

// Apply CSRF protection to state-changing routes
router.use("/auth", authRoutes);
router.use("/admin", csrfProtection, adminRoutes);
router.use("/jobs", csrfProtection, jobRoutes);
router.use("/applications", csrfProtection, applicationRoutes);
router.use("/users", csrfProtection, userRoutes);
router.use("/bookmarks", csrfProtection, bookmarkRoutes);
router.use("/contact", csrfProtection, contactRoutes);

module.exports = router;
