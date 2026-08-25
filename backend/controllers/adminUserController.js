const mongoose = require("mongoose");

const User = require("../models/User");
const Registration = require("../models/Registration");

// ======================================================
// GET ALL USERS
// GET /api/admin/users
// ======================================================

const getAllUsers = async (req, res, next) => {
  try {
    const {
      search = "",
      page = 1,
      limit = 20,
    } = req.query;

    const currentPage = Math.max(
      Number(page) || 1,
      1
    );

    const perPage = Math.max(
      Number(limit) || 20,
      1
    );

    // ==================================================
    // SEARCH
    // ==================================================

    const searchText = String(search).trim();

    const userQuery = {
      role: { $ne: "admin" },
    };

    if (searchText) {
      const regex = new RegExp(
        searchText.replace(
          /[.*+?^${}()|[\]\\]/g,
          "\\$&"
        ),
        "i"
      );

      userQuery.$or = [
        { fullName: regex },
        { username: regex },
        { email: regex },
        { mobile: regex },
        { gameUid: regex },
        { bgmiUid: regex },
        { freeFireUid: regex },
      ];
    }

    // ==================================================
    // TOTAL USERS
    // ==================================================

    const totalUsers =
      await User.countDocuments(
        userQuery
      );

    // ==================================================
    // GET USERS
    // ==================================================

    const users =
      await User.find(userQuery)
        .select(
          "fullName username email mobile game gameUid bgmiUid freeFireUid role createdAt"
        )
        .sort({
          createdAt: -1,
        })
        .skip(
          (currentPage - 1) * perPage
        )
        .limit(perPage)
        .lean();

    // ==================================================
    // REGISTRATION COUNT
    // ==================================================
    //
    // Registration collection contains:
    //
    // user: User ObjectId
    //
    // Count registrations for every user.
    //
    // ==================================================

    const userIds = users.map(
      (user) => user._id
    );

    const registrationCounts =
      await Registration.aggregate([
        {
          $match: {
            user: {
              $in: userIds,
            },
          },
        },

        {
          $group: {
            _id: "$user",

            registrations: {
              $sum: 1,
            },
          },
        },
      ]);

    // ==================================================
    // CREATE COUNT MAP
    // ==================================================

    const registrationMap =
      new Map();

    registrationCounts.forEach(
      (item) => {
        registrationMap.set(
          String(item._id),
          item.registrations
        );
      }
    );

    // ==================================================
    // ADD REGISTRATION COUNT TO USER
    // ==================================================

    const usersWithStats =
      users.map((user) => ({
        ...user,

        registrationCount:
          registrationMap.get(
            String(user._id)
          ) || 0,
      }));

    // ==================================================
    // RESPONSE
    // ==================================================

    return res.status(200).json({
      success: true,

      users: usersWithStats,

      pagination: {
        page: currentPage,

        limit: perPage,

        totalUsers,

        totalPages:
          Math.ceil(
            totalUsers / perPage
          ),
      },
    });
  } catch (error) {
    console.error(
      "GET ADMIN USERS ERROR:",
      error
    );

    next(error);
  }
};


// ======================================================
// GET SINGLE USER
// GET /api/admin/users/:id
// ======================================================

const getAdminUserById = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID.",
      });
    }

    const user =
      await User.findOne({
        _id: id,
        role: { $ne: "admin" },
      })
        .select(
          "fullName username email mobile game gameUid bgmiUid freeFireUid role createdAt"
        )
        .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // ==================================================
    // REGISTRATION COUNT
    // ==================================================

    const registrationCount =
      await Registration.countDocuments({
        user: id,
      });

    return res.status(200).json({
      success: true,

      user: {
        ...user,

        registrationCount,
      },
    });
  } catch (error) {
    console.error(
      "GET ADMIN USER ERROR:",
      error
    );

    next(error);
  }
};


// ======================================================
// DELETE / TERMINATE USER
// DELETE /api/admin/users/:id
// ======================================================

const terminateUser = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;

    // ==================================================
    // CHECK ID
    // ==================================================

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID.",
      });
    }

    // ==================================================
    // NEVER DELETE ADMIN
    // ==================================================

    const user =
      await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (user.role === "admin") {
      return res.status(403).json({
        success: false,
        message:
          "Admin users cannot be terminated.",
      });
    }

    // ==================================================
    // DELETE USER
    // ==================================================

    await User.findByIdAndDelete(id);

    // ==================================================
    // RESPONSE
    // ==================================================

    return res.status(200).json({
      success: true,

      message:
        "User terminated successfully.",

      userId: id,
    });
  } catch (error) {
    console.error(
      "TERMINATE USER ERROR:",
      error
    );

    next(error);
  }
};


// ======================================================
// EXPORT
// ======================================================

module.exports = {
  getAllUsers,
  getAdminUserById,
  terminateUser,
};