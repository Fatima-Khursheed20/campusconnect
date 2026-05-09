const express = require("express");
const authRoutes = require("./authRoutes");
const adminRoutes = require("./adminRoutes");
const jobRoutes = require("./jobRoutes");
const applicationRoutes = require("./applicationRoutes");
const userRoutes = require("./userRoutes");
const bookmarkRoutes = require("./bookmarkRoutes");

const router = express.Router();

router.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "CampusConnect API healthy" });
});
router.use("/auth", authRoutes);
router.use("/admin", adminRoutes);
router.use("/jobs", jobRoutes);
router.use("/applications", applicationRoutes);
router.use("/users", userRoutes);
router.use("/bookmarks", bookmarkRoutes);

module.exports = router;
