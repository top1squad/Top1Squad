const express = require("express");

const {
  getAllUsers,
  getAdminUserById,
  terminateUser,
} = require("../controllers/adminUserController");

const router = express.Router();


// ======================================================
// GET ALL USERS
// GET /api/admin/users
// ======================================================

router.get(
  "/",
  getAllUsers
);


// ======================================================
// GET SINGLE USER
// GET /api/admin/users/:id
// ======================================================

router.get(
  "/:id",
  getAdminUserById
);


// ======================================================
// TERMINATE USER
// DELETE /api/admin/users/:id
// ======================================================

router.delete(
  "/:id",
  terminateUser
);


module.exports = router;