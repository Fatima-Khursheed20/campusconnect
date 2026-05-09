const express = require("express");
const authRoutes = require("./authRoutes");
const adminRoutes = require("./adminRoutes");
const jobRoutes = require("./jobRoutes");
const applicationRoutes = require("./applicationRoutes");

const router = express.Router();

router.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "CampusConnect API healthy" });
});
router.use("/auth", authRoutes);
router.use("/admin", adminRoutes);
router.use("/jobs", jobRoutes);
router.use("/applications", applicationRoutes);

module.exports = router;
