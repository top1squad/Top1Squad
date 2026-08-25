const express = require("express");
const mongoose = require("mongoose");

const Registration =
  require("../models/Registration");

const User =
  require("../models/User");

const Tournament =
  require("../models/Tournament");

const router = express.Router();

// ======================================================
// HELPERS
// ======================================================

const PAYMENT_STATUSES = [
  "Pending",
  "Paid",
  "Failed",
];

const REGISTRATION_STATUSES = [
  "Pending",
  "Confirmed",
  "Cancelled",
];

// ======================================================
// GET ALL REGISTRATIONS
//
// GET /api/admin/registrations
// ======================================================

router.get(
  "/",
  async (req, res, next) => {
    try {
      const registrations =
        await Registration.find({})
          .populate(
            "tournament",
            "name game prize entryFee date time mode map status"
          )
          .sort({
            createdAt: -1,
          })
          .lean();

      const userIds =
        registrations
          .map((registration) =>
            registration.user
              ? registration.user.toString()
              : null
          )
          .filter(Boolean);

      const users =
        await User.find({
          _id: {
            $in: userIds,
          },
        })
          .select(
            "_id username fullName email mobile game gameUid bgmiUid freeFireUid"
          )
          .lean();

      const userMap =
        new Map();

      users.forEach((user) => {
        userMap.set(
          user._id.toString(),
          user
        );
      });

      const formattedRegistrations =
        registrations.map(
          (registration) => {
            const userId =
              registration.user
                ? registration.user.toString()
                : null;

            return {
              ...registration,

              userId,

              user: userId
                ? userMap.get(userId) ||
                  null
                : null,
            };
          }
        );

      console.log(
        "ADMIN: Total registrations:",
        formattedRegistrations.length
      );

      return res.status(200).json({
        success: true,

        count:
          formattedRegistrations.length,

        registrations:
          formattedRegistrations,
      });
    } catch (error) {
      console.error(
        "GET ADMIN REGISTRATIONS ERROR:",
        error
      );

      next(error);
    }
  }
);

// ======================================================
// GET REGISTRATIONS OF ONE TOURNAMENT
//
// GET /api/admin/registrations/tournament/:tournamentId
// ======================================================

router.get(
  "/tournament/:tournamentId",
  async (req, res, next) => {
    try {
      const {
        tournamentId,
      } = req.params;

      if (
        !mongoose.Types.ObjectId.isValid(
          tournamentId
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid tournament ID.",
        });
      }

      const registrations =
        await Registration.find({
          tournament: tournamentId,
        })
          .populate(
            "tournament",
            "name game prize entryFee date time mode map status"
          )
          .sort({
            createdAt: -1,
          })
          .lean();

      const userIds =
        registrations
          .map((registration) =>
            registration.user
              ? registration.user.toString()
              : null
          )
          .filter(Boolean);

      const users =
        await User.find({
          _id: {
            $in: userIds,
          },
        })
          .select(
            "_id username fullName email mobile game gameUid bgmiUid freeFireUid"
          )
          .lean();

      const userMap =
        new Map();

      users.forEach((user) => {
        userMap.set(
          user._id.toString(),
          user
        );
      });

      const formattedRegistrations =
        registrations.map(
          (registration) => {
            const userId =
              registration.user
                ? registration.user.toString()
                : null;

            return {
              ...registration,

              userId,

              user: userId
                ? userMap.get(userId) ||
                  null
                : null,
            };
          }
        );

      console.log(
        "\n========== ADMIN REGISTRATIONS =========="
      );

      console.log(
        "Tournament ID:",
        tournamentId
      );

      console.log(
        "Registration count:",
        formattedRegistrations.length
      );

      console.log(
        "=========================================\n"
      );

      return res.status(200).json({
        success: true,

        count:
          formattedRegistrations.length,

        registrations:
          formattedRegistrations,
      });
    } catch (error) {
      console.error(
        "GET TOURNAMENT REGISTRATIONS ERROR:",
        error
      );

      next(error);
    }
  }
);

// ======================================================
// GET SINGLE REGISTRATION
//
// GET /api/admin/registrations/:registrationId
// ======================================================

router.get(
  "/:registrationId",
  async (req, res, next) => {
    try {
      const {
        registrationId,
      } = req.params;

      if (
        !mongoose.Types.ObjectId.isValid(
          registrationId
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid registration ID.",
        });
      }

      const registration =
        await Registration.findById(
          registrationId
        )
          .populate(
            "tournament",
            "name game prize entryFee date time mode map status"
          )
          .lean();

      if (!registration) {
        return res.status(404).json({
          success: false,
          message:
            "Registration not found.",
        });
      }

      let user = null;

      if (registration.user) {
        user =
          await User.findById(
            registration.user
          )
            .select(
              "_id username fullName email mobile game gameUid bgmiUid freeFireUid"
            )
            .lean();
      }

      return res.status(200).json({
        success: true,

        registration: {
          ...registration,

          userId:
            registration.user
              ? registration.user.toString()
              : null,

          user,
        },
      });
    } catch (error) {
      console.error(
        "GET SINGLE ADMIN REGISTRATION ERROR:",
        error
      );

      next(error);
    }
  }
);

// ======================================================
// VERIFY PAYMENT
//
// PATCH
// /api/admin/registrations/:registrationId/verify-payment
//
// Pending
//     ↓
// Paid + Confirmed
// ======================================================

router.patch(
  "/:registrationId/verify-payment",
  async (req, res, next) => {
    try {
      const {
        registrationId,
      } = req.params;

      console.log(
        "VERIFY PAYMENT REQUEST:",
        registrationId
      );

      if (
        !mongoose.Types.ObjectId.isValid(
          registrationId
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid registration ID.",
        });
      }

      const registration =
        await Registration.findById(
          registrationId
        );

      if (!registration) {
        return res.status(404).json({
          success: false,
          message:
            "Registration not found.",
        });
      }

      const previousStatus =
        registration.registrationStatus;

      registration.paymentStatus =
        "Paid";

      registration.registrationStatus =
        "Confirmed";

      registration.rejectionReason =
        "";

      registration.verifiedAt =
        new Date();

      registration.verifiedBy =
        null;

      await registration.save();

      // If the registration was previously cancelled,
      // add the team back to tournament count.
      if (
        previousStatus ===
          "Cancelled" &&
        registration.tournament
      ) {
        await Tournament.findOneAndUpdate(
          {
            _id:
              registration.tournament,

            registeredTeams: {
              $gte: 0,
            },
          },
          {
            $inc: {
              registeredTeams: 1,
            },
          }
        );
      }

      console.log(
        "PAYMENT VERIFIED:",
        registration._id
      );

      return res.status(200).json({
        success: true,

        message:
          "Payment verified successfully. Registration confirmed.",

        registration,
      });
    } catch (error) {
      console.error(
        "VERIFY PAYMENT ERROR:",
        error
      );

      next(error);
    }
  }
);

// ======================================================
// REJECT PAYMENT
//
// PATCH
// /api/admin/registrations/:registrationId/reject-payment
//
// Pending
//     ↓
// Failed + Cancelled
// ======================================================

router.patch(
  "/:registrationId/reject-payment",
  async (req, res, next) => {
    try {
      const {
        registrationId,
      } = req.params;

      console.log(
        "REJECT PAYMENT REQUEST:",
        registrationId
      );

      if (
        !mongoose.Types.ObjectId.isValid(
          registrationId
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid registration ID.",
        });
      }

      const registration =
        await Registration.findById(
          registrationId
        );

      if (!registration) {
        return res.status(404).json({
          success: false,
          message:
            "Registration not found.",
        });
      }

      const previousStatus =
        registration.registrationStatus;

      registration.paymentStatus =
        "Failed";

      registration.registrationStatus =
        "Cancelled";

      registration.rejectionReason =
        req.body?.reason ||
        "Payment rejected by admin.";

      registration.verifiedAt =
        new Date();

      registration.verifiedBy =
        null;

      await registration.save();

      // Decrease only if the registration was
      // previously active.
      if (
        previousStatus !==
          "Cancelled" &&
        registration.tournament
      ) {
        await Tournament.findOneAndUpdate(
          {
            _id:
              registration.tournament,

            registeredTeams: {
              $gt: 0,
            },
          },
          {
            $inc: {
              registeredTeams: -1,
            },
          }
        );
      }

      console.log(
        "PAYMENT REJECTED:",
        registration._id
      );

      return res.status(200).json({
        success: true,

        message:
          "Payment rejected and registration cancelled.",

        registration,
      });
    } catch (error) {
      console.error(
        "REJECT PAYMENT ERROR:",
        error
      );

      next(error);
    }
  }
);

// ======================================================
// CHANGE STATUS
//
// THIS IS THE IMPORTANT NEW FEATURE.
//
// PATCH
// /api/admin/registrations/:registrationId/status
//
// Body:
//
// {
//   "paymentStatus": "Paid",
//   "registrationStatus": "Confirmed"
// }
//
// Possible paymentStatus:
//
// Pending
// Paid
// Failed
//
// Possible registrationStatus:
//
// Pending
// Confirmed
// Cancelled
// ======================================================

router.patch(
  "/:registrationId/status",
  async (req, res, next) => {
    try {
      const {
        registrationId,
      } = req.params;

      const {
        paymentStatus,
        registrationStatus,
      } = req.body || {};

      console.log(
        "\n========== ADMIN STATUS CHANGE =========="
      );

      console.log(
        "Registration ID:",
        registrationId
      );

      console.log(
        "Payment Status:",
        paymentStatus
      );

      console.log(
        "Registration Status:",
        registrationStatus
      );

      // --------------------------------------------------
      // VALIDATE REGISTRATION ID
      // --------------------------------------------------

      if (
        !mongoose.Types.ObjectId.isValid(
          registrationId
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid registration ID.",
        });
      }

      // --------------------------------------------------
      // VALIDATE STATUS
      // --------------------------------------------------

      if (
        paymentStatus &&
        !PAYMENT_STATUSES.includes(
          paymentStatus
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid payment status.",
        });
      }

      if (
        registrationStatus &&
        !REGISTRATION_STATUSES.includes(
          registrationStatus
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid registration status.",
        });
      }

      if (
        !paymentStatus &&
        !registrationStatus
      ) {
        return res.status(400).json({
          success: false,
          message:
            "At least one status is required.",
        });
      }

      // --------------------------------------------------
      // FIND REGISTRATION
      // --------------------------------------------------

      const registration =
        await Registration.findById(
          registrationId
        );

      if (!registration) {
        return res.status(404).json({
          success: false,
          message:
            "Registration not found.",
        });
      }

      // --------------------------------------------------
      // SAVE OLD STATUS
      // --------------------------------------------------

      const oldRegistrationStatus =
        registration.registrationStatus;

      // --------------------------------------------------
      // UPDATE PAYMENT STATUS
      // --------------------------------------------------

      if (paymentStatus) {
        registration.paymentStatus =
          paymentStatus;
      }

      // --------------------------------------------------
      // UPDATE REGISTRATION STATUS
      // --------------------------------------------------

      if (registrationStatus) {
        registration.registrationStatus =
          registrationStatus;
      }

      // --------------------------------------------------
      // AUTOMATIC CONSISTENCY
      //
      // Confirmed => Paid
      // Cancelled => Failed
      // Pending => Pending
      //
      // Only when admin did not explicitly
      // provide paymentStatus.
      // --------------------------------------------------

      if (
        !paymentStatus &&
        registrationStatus
      ) {
        if (
          registrationStatus ===
          "Confirmed"
        ) {
          registration.paymentStatus =
            "Paid";
        }

        if (
          registrationStatus ===
          "Cancelled"
        ) {
          registration.paymentStatus =
            "Failed";
        }

        if (
          registrationStatus ===
          "Pending"
        ) {
          registration.paymentStatus =
            "Pending";
        }
      }

      // --------------------------------------------------
      // VERIFIED TIME
      // --------------------------------------------------

      if (
        registrationStatus ===
          "Confirmed" ||
        paymentStatus === "Paid"
      ) {
        registration.verifiedAt =
          new Date();

        registration.verifiedBy =
          null;

        registration.rejectionReason =
          "";
      }

      // --------------------------------------------------
      // REJECTION REASON
      // --------------------------------------------------

      if (
        registrationStatus ===
          "Cancelled" ||
        paymentStatus === "Failed"
      ) {
        registration.verifiedAt =
          new Date();

        registration.verifiedBy =
          null;

        registration.rejectionReason =
          req.body?.reason ||
          "Registration/payment changed by admin.";
      }

      await registration.save();

      // --------------------------------------------------
      // TOURNAMENT TEAM COUNT
      // --------------------------------------------------

      const becameActive =
        oldRegistrationStatus ===
          "Cancelled" &&
        registration.registrationStatus !==
          "Cancelled";

      const becameCancelled =
        oldRegistrationStatus !==
          "Cancelled" &&
        registration.registrationStatus ===
          "Cancelled";

      if (
        registration.tournament &&
        becameActive
      ) {
        await Tournament.findByIdAndUpdate(
          registration.tournament,
          {
            $inc: {
              registeredTeams: 1,
            },
          }
        );
      }

      if (
        registration.tournament &&
        becameCancelled
      ) {
        await Tournament.findOneAndUpdate(
          {
            _id:
              registration.tournament,

            registeredTeams: {
              $gt: 0,
            },
          },
          {
            $inc: {
              registeredTeams: -1,
            },
          }
        );
      }

      console.log(
        "STATUS UPDATED:",
        registration._id
      );

      console.log(
        "New payment status:",
        registration.paymentStatus
      );

      console.log(
        "New registration status:",
        registration.registrationStatus
      );

      console.log(
        "=========================================\n"
      );

      return res.status(200).json({
        success: true,

        message:
          "Registration status updated successfully.",

        registration,
      });
    } catch (error) {
      console.error(
        "ADMIN STATUS UPDATE ERROR:",
        error
      );

      next(error);
    }
  }
);

module.exports = router;