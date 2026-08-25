const mongoose = require("mongoose");

const User = require("../models/User");
const SquadClashTdmRegistration = require("../models/SquadClashTdmRegistration");
const SquadClashTdm = require("../models/SquadClashTdm");

// ======================================================
// HELPERS
// ======================================================

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(String(id || "").trim());
};

const getUserId = (req) => {
  return req.user?._id || req.user?.id || null;
};

const normalizeGame = (game) => {
  const value = String(game || "").trim().toLowerCase();

  if (value === "bgmi") {
    return "BGMI";
  }

  if (
    value === "free fire" ||
    value === "freefire"
  ) {
    return "Free Fire";
  }

  return "";
};

// ======================================================
// VALIDATE PLAYER UID
//
// GET
// /api/squad-clash-tdm/registrations/validate-player-uid
//
// Example:
// ?tournamentId=xxxxx&uid=76543&game=BGMI
// ======================================================

const validatePlayerUid = async (req, res) => {
  try {
    const tournamentId = String(
      req.query.tournamentId || ""
    ).trim();

    const uid = String(
      req.query.uid || ""
    ).trim();

    const game = normalizeGame(
      req.query.game
    );

    console.log(
      "[TDM] VALIDATE PLAYER UID",
      {
        tournamentId,
        uid,
        game,
      }
    );

    // ==================================================
    // UID REQUIRED
    // ==================================================

    if (!uid) {
      return res.status(400).json({
        success: false,
        valid: false,
        message: "Player Game ID is required.",
      });
    }

    // ==================================================
    // GAME REQUIRED
    // ==================================================

    if (!game) {
      return res.status(400).json({
        success: false,
        valid: false,
        message: "Invalid game. Use BGMI or Free Fire.",
      });
    }

    // ==================================================
    // TOURNAMENT ID
    //
    // tournamentId is optional for backward compatibility,
    // but when frontend sends it, validate it.
    // ==================================================

    if (
      tournamentId &&
      !isValidObjectId(tournamentId)
    ) {
      console.error(
        "[TDM] INVALID TOURNAMENT ID:",
        tournamentId
      );

      return res.status(400).json({
        success: false,
        valid: false,
        message: "Invalid tournament ID.",
      });
    }

    // ==================================================
    // CHECK TOURNAMENT
    // ==================================================

    let tournament = null;

    if (tournamentId) {
      tournament =
        await SquadClashTdm.findById(
          tournamentId
        ).lean();

      if (!tournament) {
        return res.status(404).json({
          success: false,
          valid: false,
          message: "Tournament not found.",
        });
      }
    }

    // ==================================================
    // UID FIELDS
    // ==================================================

    const uidFields =
      game === "BGMI"
        ? [
            "bgmiUid",
            "pubgUid",
            "pubgLevelId",
            "gameUid",
          ]
        : [
            "freeFireUid",
            "freefireUid",
            "freefireLevelId",
            "gameUid",
          ];

    // ==================================================
    // SEARCH PLAYER
    // ==================================================

    const conditions = uidFields.map(
      (field) => ({
        [field]: uid,
      })
    );

    const user =
      await User.findOne({
        $or: conditions,
      }).lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        valid: false,
        message: `${game} ID is not registered.`,
      });
    }

    // ==================================================
    // PLAYER NAME
    // ==================================================

    const playerName =
      user.name ||
      user.username ||
      user.fullName ||
      user.displayName ||
      "Player";

    // ==================================================
    // SUCCESS
    // ==================================================

    return res.status(200).json({
      success: true,
      valid: true,

      tournamentId:
        tournamentId || null,

      player: {
        userId: String(user._id),
        _id: String(user._id),
        user: String(user._id),

        uid,
        gameUid: uid,

        name: playerName,
        playerName,

        username:
          user.username || "",

        fullName:
          user.fullName || "",
      },
    });
  } catch (error) {
    console.error(
      "[TDM] VALIDATE PLAYER UID ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      valid: false,
      message:
        error.message ||
        "Unable to validate player ID.",
    });
  }
};

// ======================================================
// GET TEAM SLOTS
//
// GET
// /api/squad-clash-tdm/registrations/:tournamentId/slots
// ======================================================

const getTeamSlots = async (req, res) => {
  try {
    const tournamentId = String(
      req.params.tournamentId || ""
    ).trim();

    console.log(
      "[TDM] GET TEAM SLOTS:",
      tournamentId
    );

    // ==================================================
    // VALIDATE ID
    // ==================================================

    if (!isValidObjectId(tournamentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid tournament ID.",
      });
    }

    // ==================================================
    // FIND TOURNAMENT
    // ==================================================

    const tournament =
      await SquadClashTdm.findById(
        tournamentId
      ).lean();

    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: "Tournament not found.",
      });
    }

    // ==================================================
    // FIND REGISTRATIONS
    // ==================================================

    const registrations =
      await SquadClashTdmRegistration.find({
        tournament: tournamentId,

        registrationStatus: {
          $ne: "Cancelled",
        },
      })
        .select(
          "teamSlot teamName registrationStatus paymentStatus"
        )
        .lean();

    // ==================================================
    // TEAM A
    // ==================================================

    const teamA =
      registrations.find(
        (item) =>
          String(
            item.teamSlot || ""
          ).toUpperCase() === "A"
      ) || null;

    // ==================================================
    // TEAM B
    // ==================================================

    const teamB =
      registrations.find(
        (item) =>
          String(
            item.teamSlot || ""
          ).toUpperCase() === "B"
      ) || null;

    // ==================================================
    // RESPONSE
    // ==================================================

    return res.status(200).json({
      success: true,

      tournamentId,

      slots: {
        A: {
          available: !teamA,
          teamName:
            teamA?.teamName || null,
          registrationStatus:
            teamA?.registrationStatus || null,
          paymentStatus:
            teamA?.paymentStatus || null,
        },

        B: {
          available: !teamB,
          teamName:
            teamB?.teamName || null,
          registrationStatus:
            teamB?.registrationStatus || null,
          paymentStatus:
            teamB?.paymentStatus || null,
        },
      },
    });
  } catch (error) {
    console.error(
      "[TDM] GET TEAM SLOTS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Unable to load team slots.",
    });
  }
};

// ======================================================
// GET REGISTRATIONS FOR TOURNAMENT
//
// GET
// /api/squad-clash-tdm/registrations/:tournamentId
// ======================================================

const getSquadClashTdmRegistrations =
  async (req, res) => {
    try {
      const tournamentId = String(
        req.params.tournamentId || ""
      ).trim();

      if (
        !isValidObjectId(
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
        await SquadClashTdmRegistration.find({
          tournament:
            tournamentId,
        })
          .populate(
            "leader",
            "username fullName email mobile"
          )
          .populate(
            "players.user",
            "username fullName email"
          )
          .sort({
            createdAt: -1,
          })
          .lean();

      return res.status(200).json({
        success: true,
        tournamentId,
        count:
          registrations.length,
        registrations,
      });
    } catch (error) {
      console.error(
        "GET TDM REGISTRATIONS ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Unable to load registrations.",
      });
    }
  };

// ======================================================
// UPDATE REGISTRATION
//
// PATCH
// /api/squad-clash-tdm/registrations/:registrationId
// ======================================================

const updateSquadClashTdmRegistration =
  async (req, res) => {
    try {
      const registrationId =
        String(
          req.params.registrationId || ""
        ).trim();

      if (
        !isValidObjectId(
          registrationId
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid registration ID.",
        });
      }

      const body = req.body || {};

      const allowedFields = [
        "teamName",
        "teamSlot",
        "paymentQr",
        "utr",
        "paymentStatus",
        "registrationStatus",
        "adminNote",
      ];

      const update = {};

      for (
        const field of allowedFields
      ) {
        if (
          Object.prototype.hasOwnProperty.call(
            body,
            field
          )
        ) {
          update[field] =
            body[field];
        }
      }

      // ==================================================
      // TEAM SLOT
      // ==================================================

      if (
        update.teamSlot !==
        undefined
      ) {
        const normalizedSlot =
          String(
            update.teamSlot
          )
            .trim()
            .toUpperCase();

        if (
          !["A", "B"].includes(
            normalizedSlot
          )
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Team slot must be A or B.",
          });
        }

        update.teamSlot =
          normalizedSlot;
      }

      // ==================================================
      // PAYMENT STATUS
      // ==================================================

      if (
        update.paymentStatus !==
        undefined
      ) {
        const paymentStatus =
          String(
            update.paymentStatus
          ).trim();

        const allowedPaymentStatuses =
          [
            "Pending",
            "Verified",
            "Rejected",
          ];

        if (
          !allowedPaymentStatuses.includes(
            paymentStatus
          )
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Payment status must be Pending, Verified or Rejected.",
          });
        }

        update.paymentStatus =
          paymentStatus;
      }

      // ==================================================
      // REGISTRATION STATUS
      // ==================================================

      if (
        update.registrationStatus !==
        undefined
      ) {
        const registrationStatus =
          String(
            update.registrationStatus
          ).trim();

        const allowedStatuses = [
          "Pending",
          "Confirmed",
          "Cancelled",
          "Rejected",
        ];

        if (
          !allowedStatuses.includes(
            registrationStatus
          )
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Invalid registration status.",
          });
        }

        update.registrationStatus =
          registrationStatus;
      }

      // ==================================================
      // STRING FIELDS
      // ==================================================

      if (
        update.teamName !==
        undefined
      ) {
        update.teamName =
          String(
            update.teamName || ""
          ).trim();
      }

      if (
        update.paymentQr !==
        undefined
      ) {
        update.paymentQr =
          String(
            update.paymentQr || ""
          ).trim();
      }

      if (
        update.utr !==
        undefined
      ) {
        update.utr =
          String(
            update.utr || ""
          ).trim();
      }

      if (
        update.adminNote !==
        undefined
      ) {
        update.adminNote =
          String(
            update.adminNote || ""
          ).trim();
      }

      // ==================================================
      // EMPTY UPDATE
      // ==================================================

      if (
        Object.keys(update).length ===
        0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "No valid fields were provided for update.",
        });
      }

      // ==================================================
      // UPDATE
      // ==================================================

      const registration =
        await SquadClashTdmRegistration.findByIdAndUpdate(
          registrationId,
          {
            $set: update,
          },
          {
            new: true,
            runValidators: true,
          }
        )
          .populate(
            "leader",
            "username fullName email"
          )
          .populate(
            "players.user",
            "username fullName email"
          );

      if (!registration) {
        return res.status(404).json({
          success: false,
          message:
            "Registration not found.",
        });
      }

      return res.status(200).json({
        success: true,
        message:
          "Registration updated successfully.",
        registration,
      });
    } catch (error) {
      console.error(
        "UPDATE TDM REGISTRATION ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Unable to update registration.",
      });
    }
  };

// ======================================================
// DELETE REGISTRATION
// ======================================================

const deleteSquadClashTdmRegistration =
  async (req, res) => {
    try {
      const registrationId =
        String(
          req.params.registrationId ||
            ""
        ).trim();

      if (
        !isValidObjectId(
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
        await SquadClashTdmRegistration.findByIdAndDelete(
          registrationId
        );

      if (!registration) {
        return res.status(404).json({
          success: false,
          message:
            "Registration not found.",
        });
      }

      return res.status(200).json({
        success: true,
        message:
          "Registration deleted successfully.",
        registrationId,
      });
    } catch (error) {
      console.error(
        "DELETE TDM REGISTRATION ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Unable to delete registration.",
      });
    }
  };

// ======================================================
// CREATE REGISTRATION
//
// POST
// /api/squad-clash-tdm/registrations
// ======================================================

const createSquadClashTdmRegistration =
  async (req, res) => {
    try {
      const userId =
        getUserId(req);

      if (!userId) {
        return res.status(401).json({
          success: false,
          message:
            "You must be logged in.",
        });
      }

      const {
        tournamentId,
        tournament,
        teamName,
        teamSlot,
        players,
        paymentQr,
        utr,
      } = req.body || {};

      const selectedTournament =
        tournamentId ||
        tournament;

      // ==================================================
      // TOURNAMENT ID
      // ==================================================

      if (
        !isValidObjectId(
          selectedTournament
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid tournament ID.",
        });
      }

      // ==================================================
      // TOURNAMENT
      // ==================================================

      const tournamentDoc =
        await SquadClashTdm.findById(
          selectedTournament
        );

      if (!tournamentDoc) {
        return res.status(404).json({
          success: false,
          message:
            "Tournament not found.",
        });
      }

      // ==================================================
      // TEAM NAME
      // ==================================================

      const cleanTeamName =
        String(
          teamName || ""
        ).trim();

      if (
        cleanTeamName.length < 2
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Team name is required.",
        });
      }

      // ==================================================
      // TEAM SLOT
      // ==================================================

      const normalizedSlot =
        String(
          teamSlot || ""
        )
          .trim()
          .toUpperCase();

      if (
        !["A", "B"].includes(
          normalizedSlot
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Please select Team A or Team B.",
        });
      }

      // ==================================================
      // PLAYERS
      // ==================================================

      if (
        !Array.isArray(players) ||
        players.length !== 4
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Exactly 4 players are required.",
        });
      }

      // ==================================================
      // CHECK LEADER
      // ==================================================

      const existingLeader =
        await SquadClashTdmRegistration.findOne(
          {
            tournament:
              selectedTournament,

            leader: userId,

            registrationStatus: {
              $ne: "Cancelled",
            },
          }
        );

      if (existingLeader) {
        return res.status(409).json({
          success: false,
          message:
            "You have already registered a team for this tournament.",
        });
      }

      // ==================================================
      // CHECK TEAM SLOT
      // ==================================================

      const existingSlot =
        await SquadClashTdmRegistration.findOne(
          {
            tournament:
              selectedTournament,

            teamSlot:
              normalizedSlot,

            registrationStatus: {
              $ne: "Cancelled",
            },
          }
        );

      if (existingSlot) {
        return res.status(409).json({
          success: false,
          message:
            `Team ${normalizedSlot} is already occupied.`,
        });
      }

      // ==================================================
      // NORMALIZE PLAYERS
      // ==================================================

      const normalizedPlayers =
        players.map(
          (player, index) => {
            const user =
              player?.userId ||
              player?.user ||
              player?._id ||
              null;

            const uid =
              String(
                player?.uid ||
                  player?.gameUid ||
                  ""
              ).trim();

            const name =
              String(
                player?.name ||
                  player?.playerName ||
                  ""
              ).trim();

            return {
              slot:
                Number(
                  player?.slot
                ) || index + 1,

              user,

              uid,

              name,

              verified:
                Boolean(
                  player?.verified
                ),
            };
          }
        );

      // ==================================================
      // VALIDATE PLAYERS
      // ==================================================

      const playerUserIds =
        new Set();

      for (
        const player of normalizedPlayers
      ) {
        if (
          !isValidObjectId(
            player.user
          )
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Every player must be a registered user.",
          });
        }

        if (!player.uid) {
          return res.status(400).json({
            success: false,
            message:
              "Every player must have a Game ID.",
          });
        }

        const userIdString =
          String(player.user);

        if (
          playerUserIds.has(
            userIdString
          )
        ) {
          return res.status(400).json({
            success: false,
            message:
              "The same player cannot be added twice.",
          });
        }

        playerUserIds.add(
          userIdString
        );
      }

      // ==================================================
      // CREATE
      // ==================================================

      const registration =
        await SquadClashTdmRegistration.create(
          {
            tournament:
              selectedTournament,

            leader: userId,

            teamName:
              cleanTeamName,

            teamSlot:
              normalizedSlot,

            players:
              normalizedPlayers,

            paymentQr:
              String(
                paymentQr || ""
              ).trim(),

            utr:
              String(
                utr || ""
              ).trim(),

            paymentStatus:
              "Pending",

            registrationStatus:
              "Pending",
          }
        );

      return res.status(201).json({
        success: true,
        message:
          "Tournament registration created successfully.",
        registration,
      });
    } catch (error) {
      console.error(
        "CREATE TDM REGISTRATION ERROR:",
        error
      );

      if (
        error.code === 11000
      ) {
        return res.status(409).json({
          success: false,
          message:
            "This team or leader is already registered.",
        });
      }

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Unable to create registration.",
      });
    }
  };

// ======================================================
// GET MY REGISTRATIONS
// ======================================================

const getMySquadClashTdmRegistrations =
  async (req, res) => {
    try {
      const userId =
        getUserId(req);

      if (!userId) {
        return res.status(401).json({
          success: false,
          message:
            "You must be logged in.",
        });
      }

      const registrations =
        await SquadClashTdmRegistration.find(
          {
            $or: [
              {
                leader: userId,
              },
              {
                "players.user":
                  userId,
              },
            ],
          }
        )
          .populate(
            "tournament"
          )
          .populate(
            "leader",
            "username fullName email"
          )
          .lean();

      return res.status(200).json({
        success: true,
        registrations,
      });
    } catch (error) {
      console.error(
        "GET MY TDM REGISTRATIONS ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Unable to load your registrations.",
      });
    }
  };

// ======================================================
// EXPORT
// ======================================================

module.exports = {
  validatePlayerUid,

  getTeamSlots,

  createSquadClashTdmRegistration,

  getMySquadClashTdmRegistrations,

  getSquadClashTdmRegistrations,

  updateSquadClashTdmRegistration,

  deleteSquadClashTdmRegistration,
};