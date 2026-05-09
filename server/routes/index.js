const express = require("express");
const authRoutes = require("./authRoutes");
const adminRoutes = require("./adminRoutes");

const router = express.Router();

router.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "CampusConnect API healthy" });
});
router.use("/auth", authRoutes);
router.use("/admin", adminRoutes);

module.exports = router;
