const express = require("express");
const { verifyToken, checkRole } = require("../middleware/auth");
const {
  getStats,
  getUsers,
  toggleUserStatus,
  updateUserRole,
  deleteUser,
  getJobs,
  toggleJobStatus,
  deleteJob,
} = require("../controllers/adminController");

const router = express.Router();

router.use(verifyToken, checkRole(["admin"]));

router.get("/stats", getStats);
router.get("/users", getUsers);
router.patch("/users/:id/toggle-status", toggleUserStatus);
router.patch("/users/:id/role", updateUserRole);
router.delete("/users/:id", deleteUser);
router.get("/jobs", getJobs);
router.patch("/jobs/:id/toggle", toggleJobStatus);
router.delete("/jobs/:id", deleteJob);

module.exports = router;
