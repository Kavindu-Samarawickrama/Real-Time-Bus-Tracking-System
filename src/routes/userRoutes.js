const express = require("express");
const userController = require("../controllers/userController");
const {
  authenticate,
  authorize,
  ownerOrAdmin,
  canManageUsers,
  requireVerifiedAccount,
} = require("../middlewares/auth");
const {
  authLimiter,
  generalLimiter,
  strictLimiter,
} = require("../middlewares/security");
const { asyncHandler } = require("../middlewares/errorHandler");

const router = express.Router();

// Public routes (no authentication required)
router.post("/register", authLimiter, asyncHandler(userController.register));
router.post("/login", authLimiter, asyncHandler(userController.login));

// Protected routes (authentication required)
router.use(authenticate); // All routes below require authentication

// User profile routes
router.get("/profile", generalLimiter, asyncHandler(userController.getProfile));
router.put(
  "/profile",
  generalLimiter,
  asyncHandler(userController.updateProfile)
);
router.post(
  "/change-password",
  authLimiter,
  asyncHandler(userController.changePassword)
);
router.post("/logout", generalLimiter, asyncHandler(userController.logout));
router.get(
  "/permissions",
  generalLimiter,
  asyncHandler(userController.getMyPermissions)
);

// User management routes (Admin only)
router.get(
  "/",
  canManageUsers,
  generalLimiter,
  asyncHandler(userController.getUsers)
);

router.get(
  "/statistics",
  canManageUsers,
  generalLimiter,
  asyncHandler(userController.getUserStatistics)
);

router.post(
  "/search",
  canManageUsers,
  generalLimiter,
  asyncHandler(userController.advancedSearch)
);

router.get(
  "/role/:role",
  authorize("ntc_admin", "bus_operator"),
  generalLimiter,
  asyncHandler(userController.getUsersByRole)
);

router.get(
  "/:userId",
  canManageUsers,
  generalLimiter,
  asyncHandler(userController.getUserById)
);

router.put(
  "/:userId",
  canManageUsers,
  strictLimiter,
  asyncHandler(userController.updateUser)
);

router.delete(
  "/:userId",
  canManageUsers,
  strictLimiter,
  asyncHandler(userController.deleteUser)
);

router.put(
  "/bulk/status",
  canManageUsers,
  strictLimiter,
  asyncHandler(userController.bulkUpdateStatus)
);

module.exports = router;
