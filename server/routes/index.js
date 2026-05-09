const express = require("express");
const authRoutes = require("./authRoutes");

const router = express.Router();

router.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "CampusConnect API healthy" });
});
router.use("/auth", authRoutes);

module.exports = router;
