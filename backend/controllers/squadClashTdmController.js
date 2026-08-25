const mongoose = require("mongoose");

const SquadClashTdm =
  require("../models/SquadClashTdm");

const SquadClashTdmRegistration =
  require("../models/SquadClashTdmRegistration");

const User =
  require("../models/User");

// ======================================================
// CONSTANTS
// ======================================================

const ALLOWED_GAMES = [
  "BGMI",
  "Free Fire",
];

const ALLOWED_TYPES = [
  "TDM",
  "Squad Clash",
];

const ACTIVE_REGISTRATION_STATUSES = [
  "Pending",
  "Confirmed",
];

const CLOSED_REGISTRATION_STATUSES = [
  "Cancelled",
  "Rejected",
];

const ALLOWED_PAYMENT_STATUSES = [
  "Pending",
  "Verified",
  "Rejected",
];

const ALLOWED_REGISTRATION_STATUSES = [
  "Pending",
  "Confirmed",
  "Cancelled",
  "Rejected",
];

// ======================================================
// HELPERS
// ======================================================

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(
    String(id || "")
  );
};

const getUserId = (req) => {
  return (
    req.user?._id ||
    req.user?.id ||
    null
  );
};

const getTournamentId = (req) => {
  return (
    req.params.tournamentId ||
    req.params.id ||
    req.body?.tournamentId ||
    req.body?.tournament ||
    req.query?.tournamentId ||
    req.query?.tournament ||
    ""
  );
};

const getErrorMessage = (error) => {
  if (
    error?.name === "ValidationError"
  ) {
    return Object.values(
      error.errors || {}
    )
      .map(
        (item) => item.message
      )
      .join(", ");
  }

  return (
    error?.message ||
    "Something went wrong."
  );
};

// ======================================================
// NORMALIZE GAME UID
// ======================================================

const normalizeUid = (uid) => {
  return String(uid || "").trim();
};

// ======================================================
// CHECK PLAYER UID BELONGS TO USER
// ======================================================

const doesUidBelongToUser = (
  user,
  game,
  uid
) => {
  const normalizedUid =
    normalizeUid(uid);

  if (!user || !normalizedUid) {
    return false;
  }

  // ----------------------------------------------
  // PRIMARY GAME UID
  // ----------------------------------------------

  if (
    user.game === game &&
    normalizeUid(user.gameUid) ===
      normalizedUid
  ) {
    return true;
  }

  // ----------------------------------------------
  // GAME-SPECIFIC UID
  // ----------------------------------------------

  if (
    game === "BGMI" &&
    normalizeUid(user.bgmiUid) ===
      normalizedUid
  ) {
    return true;
  }

  if (
    game === "Free Fire" &&
    normalizeUid(user.freeFireUid) ===
      normalizedUid
  ) {
    return true;
  }

  // ----------------------------------------------
  // ADDITIONAL REGISTERED GAME IDS
  // ----------------------------------------------

  if (
    Array.isArray(
      user.registeredGameIds
    )
  ) {
    return user.registeredGameIds.some(
      (item) =>
        item?.game === game &&
        normalizeUid(item?.uid) ===
          normalizedUid
    );
  }

  return false;
};

// ======================================================
// GET REGISTERED TEAM COUNT
// ======================================================

const getRegisteredTeamCount =
  async (tournamentId) => {
    return SquadClashTdmRegistration.countDocuments(
      {
        tournament: tournamentId,

        registrationStatus: {
          $in:
            ACTIVE_REGISTRATION_STATUSES,
        },
      }
    );
  };

// ======================================================
// SYNC REGISTERED TEAM COUNT
// ======================================================

const syncRegisteredTeamCount =
  async (tournamentId) => {
    const count =
      await getRegisteredTeamCount(
        tournamentId
      );

    await SquadClashTdm.findByIdAndUpdate(
      tournamentId,
      {
        $set: {
          registeredTeams: Math.min(
            count,
            2
          ),
          maxTeams: 2,
        },
      }
    );

    return Math.min(count, 2);
  };

// ======================================================
// CREATE TOURNAMENT
// POST /api/squad-clash-tdm
// ======================================================

const createSquadClashTdm =
  async (req, res) => {
    try {
      const body = {
        ...(req.body || {}),
      };

      // ----------------------------------------------
      // NEVER TRUST THESE FROM CLIENT
      // ----------------------------------------------

      delete body._id;
      delete body.createdAt;
      delete body.updatedAt;
      delete body.registeredTeams;
      delete body.maxTeams;

      // ----------------------------------------------
      // NORMALIZE TYPE
      // ----------------------------------------------

      if (body.type) {
        body.type = String(
          body.type
        ).trim();
      }

      // ----------------------------------------------
      // NORMALIZE GAME
      // ----------------------------------------------

      if (body.game) {
        body.game = String(
          body.game
        ).trim();
      }

      // ----------------------------------------------
      // VALIDATE TYPE
      // ----------------------------------------------

      if (
        body.type &&
        !ALLOWED_TYPES.includes(
          body.type
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Type must be TDM or Squad Clash.",
        });
      }

      // ----------------------------------------------
      // VALIDATE GAME
      // ----------------------------------------------

      if (
        body.game &&
        !ALLOWED_GAMES.includes(
          body.game
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Game must be BGMI or Free Fire.",
        });
      }

      // ----------------------------------------------
      // FIXED VALUES
      // ----------------------------------------------

      body.maxTeams = 2;
      body.registeredTeams = 0;

      // ----------------------------------------------
      // CREATE
      // ----------------------------------------------

      const tournament =
        await SquadClashTdm.create(
          body
        );

      return res.status(201).json({
        success: true,
        message:
          "Tournament created successfully.",
        tournament,
      });
    } catch (error) {
      console.error(
        "CREATE TDM TOURNAMENT ERROR:",
        error
      );

      if (
        error?.code === 11000
      ) {
        return res.status(409).json({
          success: false,
          message:
            "Tournament already exists.",
        });
      }

      return res.status(400).json({
        success: false,
        message:
          getErrorMessage(error),
      });
    }
  };

// ======================================================
// GET ALL TOURNAMENTS
// GET /api/squad-clash-tdm
// ======================================================

const getSquadClashTdm =
  async (req, res) => {
    try {
      const filter = {};

      // ----------------------------------------------
      // GAME FILTER
      // ----------------------------------------------

      if (req.query.game) {
        const game =
          String(
            req.query.game
          ).trim();

        if (
          !ALLOWED_GAMES.includes(
            game
          )
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Invalid game.",
          });
        }

        filter.game = game;
      }

      // ----------------------------------------------
      // TYPE FILTER
      // ----------------------------------------------

      if (req.query.type) {
        const type =
          String(
            req.query.type
          ).trim();

        if (
          !ALLOWED_TYPES.includes(
            type
          )
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Invalid tournament type.",
          });
        }

        filter.type = type;
      }

      // ----------------------------------------------
      // STATUS FILTER
      // ----------------------------------------------

      if (req.query.status) {
        const allowedStatuses = [
          "Upcoming",
          "Live",
          "Completed",
          "Cancelled",
        ];

        const status =
          String(
            req.query.status
          ).trim();

        if (
          !allowedStatuses.includes(
            status
          )
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Invalid tournament status.",
          });
        }

        filter.status = status;
      }

      // ----------------------------------------------
      // FIND
      // ----------------------------------------------

      const tournaments =
        await SquadClashTdm.find(
          filter
        )
          .sort({
            createdAt: -1,
          })
          .lean();

      // ----------------------------------------------
      // SYNC COUNTS
      // ----------------------------------------------

      const tournamentIds =
        tournaments.map(
          (item) => item._id
        );

      const counts =
        tournamentIds.length
          ? await SquadClashTdmRegistration.aggregate(
              [
                {
                  $match: {
                    tournament: {
                      $in: tournamentIds,
                    },

                    registrationStatus: {
                      $in:
                        ACTIVE_REGISTRATION_STATUSES,
                    },
                  },
                },

                {
                  $group: {
                    _id: "$tournament",
                    count: {
                      $sum: 1,
                    },
                  },
                },
              ]
            )
          : [];

      const countMap =
        new Map(
          counts.map(
            (item) => [
              String(item._id),
              Math.min(
                item.count,
                2
              ),
            ]
          )
        );

      const result =
        tournaments.map(
          (tournament) => ({
            ...tournament,

            maxTeams: 2,

            registeredTeams:
              countMap.get(
                String(
                  tournament._id
                )
              ) || 0,
          })
        );

      return res.status(200).json({
        success: true,
        count: result.length,
        tournaments: result,
      });
    } catch (error) {
      console.error(
        "GET TDM TOURNAMENTS ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to load tournaments.",
      });
    }
  };

// ======================================================
// GET SINGLE TOURNAMENT
// GET /api/squad-clash-tdm/:tournamentId
// ======================================================

const getSquadClashTdmById =
  async (req, res) => {
    try {
      const tournamentId =
        String(
          getTournamentId(req)
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

      const tournament =
        await SquadClashTdm.findById(
          tournamentId
        ).lean();

      if (!tournament) {
        return res.status(404).json({
          success: false,
          message:
            "Tournament not found.",
        });
      }

      const registeredTeams =
        await getRegisteredTeamCount(
          tournamentId
        );

      return res.status(200).json({
        success: true,

        tournament: {
          ...tournament,

          maxTeams: 2,

          registeredTeams,
        },
      });
    } catch (error) {
      console.error(
        "GET SINGLE TDM TOURNAMENT ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to load tournament.",
      });
    }
  };

// ======================================================
// UPDATE TOURNAMENT
// PATCH /api/squad-clash-tdm/:tournamentId
// ======================================================

const updateSquadClashTdm =
  async (req, res) => {
    try {
      const tournamentId =
        String(
          getTournamentId(req)
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

      // ----------------------------------------------
      // FIND EXISTING
      // ----------------------------------------------

      const existing =
        await SquadClashTdm.findById(
          tournamentId
        );

      if (!existing) {
        return res.status(404).json({
          success: false,
          message:
            "Tournament not found.",
        });
      }

      // ----------------------------------------------
      // DO NOT UPDATE CLOSED TOURNAMENT
      // ----------------------------------------------

      if (
        existing.status ===
          "Completed" ||
        existing.status ===
          "Cancelled"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Completed or cancelled tournaments cannot be updated.",
        });
      }

      const updateData = {
        ...(req.body || {}),
      };

      // ----------------------------------------------
      // NEVER ACCEPT THESE
      // ----------------------------------------------

      delete updateData._id;
      delete updateData.createdAt;
      delete updateData.updatedAt;
      delete updateData.maxTeams;
      delete updateData.registeredTeams;

      // ----------------------------------------------
      // TYPE
      // ----------------------------------------------

      if (
        updateData.type !==
        undefined
      ) {
        updateData.type =
          String(
            updateData.type
          ).trim();

        if (
          !ALLOWED_TYPES.includes(
            updateData.type
          )
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Invalid tournament type.",
          });
        }
      }

      // ----------------------------------------------
      // GAME
      // ----------------------------------------------

      if (
        updateData.game !==
        undefined
      ) {
        updateData.game =
          String(
            updateData.game
          ).trim();

        if (
          !ALLOWED_GAMES.includes(
            updateData.game
          )
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Invalid game.",
          });
        }
      }

      if (
        Object.keys(
          updateData
        ).length === 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "No data provided for update.",
        });
      }

      // ----------------------------------------------
      // UPDATE
      // ----------------------------------------------

      const tournament =
        await SquadClashTdm.findByIdAndUpdate(
          tournamentId,
          {
            $set: updateData,

            // Always fixed
            $setOnInsert: {
              maxTeams: 2,
            },
          },
          {
            new: true,
            runValidators: true,
          }
        ).lean();

      if (!tournament) {
        return res.status(404).json({
          success: false,
          message:
            "Tournament not found.",
        });
      }

      const registeredTeams =
        await getRegisteredTeamCount(
          tournamentId
        );

      return res.status(200).json({
        success: true,
        message:
          "Tournament updated successfully.",

        tournament: {
          ...tournament,

          maxTeams: 2,

          registeredTeams,
        },
      });
    } catch (error) {
      console.error(
        "UPDATE TDM TOURNAMENT ERROR:",
        error
      );

      return res.status(400).json({
        success: false,
        message:
          getErrorMessage(error),
      });
    }
  };

// ======================================================
// DELETE TOURNAMENT
// DELETE /api/squad-clash-tdm/:tournamentId
// ======================================================

const deleteSquadClashTdm =
  async (req, res) => {
    try {
      const tournamentId =
        String(
          getTournamentId(req)
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

      const tournament =
        await SquadClashTdm.findById(
          tournamentId
        );

      if (!tournament) {
        return res.status(404).json({
          success: false,
          message:
            "Tournament not found.",
        });
      }

      // ----------------------------------------------
      // DO NOT DELETE LIVE/COMPLETED TOURNAMENT
      // ----------------------------------------------

      if (
        tournament.status ===
          "Live" ||
        tournament.status ===
          "Completed"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Live or completed tournaments cannot be deleted.",
        });
      }

      // ----------------------------------------------
      // DELETE REGISTRATIONS FIRST
      // ----------------------------------------------

      await SquadClashTdmRegistration.deleteMany(
        {
          tournament:
            tournamentId,
        }
      );

      // ----------------------------------------------
      // DELETE TOURNAMENT
      // ----------------------------------------------

      await SquadClashTdm.findByIdAndDelete(
        tournamentId
      );

      return res.status(200).json({
        success: true,
        message:
          "Tournament deleted successfully.",
        tournamentId,
      });
    } catch (error) {
      console.error(
        "DELETE TDM TOURNAMENT ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to delete tournament.",
      });
    }
  };

// ======================================================
// VALIDATE PLAYER GAME UID
// GET /validate-player?uid=XXX&game=BGMI
// ======================================================

const validatePlayerUid =
  async (req, res) => {
    try {
      const uid =
        normalizeUid(
          req.query.uid
        );

      const game =
        String(
          req.query.game || ""
        ).trim();

      if (!uid) {
        return res.status(400).json({
          success: false,
          valid: false,
          message:
            "Player Game ID is required.",
        });
      }

      if (
        !ALLOWED_GAMES.includes(
          game
        )
      ) {
        return res.status(400).json({
          success: false,
          valid: false,
          message:
            "Invalid game.",
        });
      }

      // ----------------------------------------------
      // FIND PLAYER
      // ----------------------------------------------

      const users =
        await User.find({
          $or: [
            {
              game,
              gameUid: uid,
            },

            ...(game === "BGMI"
              ? [
                  {
                    bgmiUid: uid,
                  },
                ]
              : [
                  {
                    freeFireUid: uid,
                  },
                ]),

            {
              registeredGameIds: {
                $elemMatch: {
                  game,
                  uid,
                },
              },
            },
          ],
        })
          .select(
            "_id fullName username game gameUid bgmiUid freeFireUid registeredGameIds"
          )
          .lean();

      if (!users.length) {
        return res.status(404).json({
          success: false,
          valid: false,
          message:
            `${game} ID is not registered.`,
        });
      }

      // ----------------------------------------------
      // FIND EXACT MATCH
      // ----------------------------------------------

      const user =
        users.find(
          (item) =>
            doesUidBelongToUser(
              item,
              game,
              uid
            )
        );

      if (!user) {
        return res.status(404).json({
          success: false,
          valid: false,
          message:
            `${game} ID is not registered.`,
        });
      }

      const playerName =
        user.fullName ||
        user.username ||
        "Player";

      return res.status(200).json({
        success: true,
        valid: true,

        player: {
          userId: String(
            user._id
          ),

          _id: String(
            user._id
          ),

          user: String(
            user._id
          ),

          uid,

          gameUid: uid,

          name: playerName,

          playerName,

          username:
            user.username ||
            "",

          fullName:
            user.fullName ||
            "",
        },
      });
    } catch (error) {
      console.error(
        "VALIDATE PLAYER UID ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        valid: false,
        message:
          "Unable to validate player ID.",
      });
    }
  };

// ======================================================
// GET TEAM SLOTS
// GET /:tournamentId/team-slots
// ======================================================

const getTeamSlots =
  async (req, res) => {
    try {
      const tournamentId =
        String(
          req.params.tournamentId ||
            ""
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

      const tournament =
        await SquadClashTdm.findById(
          tournamentId
        ).lean();

      if (!tournament) {
        return res.status(404).json({
          success: false,
          message:
            "Tournament not found.",
        });
      }

      const registrations =
        await SquadClashTdmRegistration.find(
          {
            tournament:
              tournamentId,

            registrationStatus: {
              $in:
                ACTIVE_REGISTRATION_STATUSES,
            },
          }
        )
          .select(
            "teamSlot teamName registrationStatus leader"
          )
          .lean();

      const teamA =
        registrations.find(
          (item) =>
            String(
              item.teamSlot
            ).toUpperCase() ===
            "A"
        ) || null;

      const teamB =
        registrations.find(
          (item) =>
            String(
              item.teamSlot
            ).toUpperCase() ===
            "B"
        ) || null;

      return res.status(200).json({
        success: true,

        tournamentId,

        maxTeams: 2,

        registeredTeams:
          registrations.length,

        slots: {
          A: {
            available:
              !teamA,

            occupied:
              Boolean(teamA),

            teamName:
              teamA?.teamName ||
              null,

            registrationStatus:
              teamA?.registrationStatus ||
              null,

            registrationId:
              teamA?._id ||
              null,
          },

          B: {
            available:
              !teamB,

            occupied:
              Boolean(teamB),

            teamName:
              teamB?.teamName ||
              null,

            registrationStatus:
              teamB?.registrationStatus ||
              null,

            registrationId:
              teamB?._id ||
              null,
          },
        },
      });
    } catch (error) {
      console.error(
        "GET TEAM SLOTS ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to load team slots.",
      });
    }
  };

// ======================================================
// GET ALL REGISTRATIONS
// GET /registrations/:tournamentId
// ======================================================

const getSquadClashTdmRegistrations =
  async (req, res) => {
    try {
      const tournamentId =
        String(
          req.params.tournamentId ||
            req.query.tournamentId ||
            req.query.tournament ||
            ""
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

      const tournament =
        await SquadClashTdm.findById(
          tournamentId
        ).lean();

      if (!tournament) {
        return res.status(404).json({
          success: false,
          message:
            "Tournament not found.",
        });
      }

      const registrations =
        await SquadClashTdmRegistration.find(
          {
            tournament:
              tournamentId,
          }
        )
          .populate(
            "leader",
            "username fullName email mobile"
          )
          .populate(
            "players.user",
            "username fullName email mobile game gameUid bgmiUid freeFireUid"
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
          "Unable to load registrations.",
      });
    }
  };

// ======================================================
// CREATE REGISTRATION
// POST /registrations
// ======================================================

const createSquadClashTdmRegistration =
  async (req, res) => {
    try {
      // ==================================================
      // AUTHENTICATION
      // ==================================================

      const userId =
        getUserId(req);

      if (!userId) {
        return res.status(401).json({
          success: false,
          message:
            "You must be logged in.",
        });
      }

      if (
        !isValidObjectId(
          userId
        )
      ) {
        return res.status(401).json({
          success: false,
          message:
            "Invalid authenticated user.",
        });
      }

      // ==================================================
      // BODY
      // ==================================================

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
      // FIND TOURNAMENT
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
      // TOURNAMENT STATUS
      // ==================================================

      if (
        tournamentDoc.status !==
        "Upcoming"
      ) {
        return res.status(400).json({
          success: false,
          message:
            `Registration is closed because tournament status is ${tournamentDoc.status}.`,
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
        !Array.isArray(
          players
        ) ||
        players.length !== 4
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Exactly 4 players are required.",
        });
      }

      // ==================================================
      // NORMALIZE PLAYERS
      // ==================================================

      const normalizedPlayers =
        players.map(
          (player, index) => ({
            slot:
              Number(
                player?.slot
              ) ||
              index + 1,

            user:
              player?.userId ||
              player?.user ||
              player?._id,

            uid:
              normalizeUid(
                player?.uid ||
                  player?.gameUid
              ),

            name:
              String(
                player?.name ||
                  player?.playerName ||
                  ""
              ).trim(),

            // Backend verifies this.
            verified: false,
          })
        );

      // ==================================================
      // VALIDATE PLAYER SLOTS
      // ==================================================

      const slots =
        normalizedPlayers.map(
          (player) =>
            Number(
              player.slot
            )
        );

      const uniqueSlots =
        new Set(slots);

      if (
        uniqueSlots.size !== 4 ||
        !slots.every(
          (slot) =>
            Number.isInteger(
              slot
            ) &&
            slot >= 1 &&
            slot <= 4
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Players must have unique slots from 1 to 4.",
        });
      }

      // ==================================================
      // VALIDATE PLAYER USER IDS
      // ==================================================

      for (
        const player
        of normalizedPlayers
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
      }

      // ==================================================
      // DUPLICATE PLAYERS
      // ==================================================

      const playerUserIds =
        normalizedPlayers.map(
          (player) =>
            String(
              player.user
            )
        );

      if (
        new Set(
          playerUserIds
        ).size !== 4
      ) {
        return res.status(400).json({
          success: false,
          message:
            "A team cannot contain duplicate players.",
        });
      }

      // ==================================================
      // DUPLICATE GAME IDS
      // ==================================================

      const playerUids =
        normalizedPlayers.map(
          (player) =>
            player.uid
        );

      if (
        new Set(
          playerUids
        ).size !==
        playerUids.length
      ) {
        return res.status(400).json({
          success: false,
          message:
            "A Game ID cannot be used by multiple players.",
        });
      }

      // ==================================================
      // FIND USERS
      // ==================================================

      const users =
        await User.find({
          _id: {
            $in: playerUserIds,
          },
        })
          .select(
            "_id fullName username game gameUid bgmiUid freeFireUid registeredGameIds"
          )
          .lean();

      if (
        users.length !== 4
      ) {
        return res.status(400).json({
          success: false,
          message:
            "One or more players are not registered users.",
        });
      }

      // ==================================================
      // VERIFY GAME IDS BELONG TO USERS
      // ==================================================

      for (
        const player
        of normalizedPlayers
      ) {
        const user =
          users.find(
            (item) =>
              String(
                item._id
              ) ===
              String(
                player.user
              )
          );

        if (!user) {
          return res.status(400).json({
            success: false,
            message:
              "Player account not found.",
          });
        }

        const validUid =
          doesUidBelongToUser(
            user,
            tournamentDoc.game,
            player.uid
          );

        if (!validUid) {
          const playerName =
            user.fullName ||
            user.username ||
            "Player";

          return res.status(400).json({
            success: false,
            message:
              `${playerName} does not have this ${tournamentDoc.game} ID registered.`,
          });
        }

        // Backend verified
        player.verified =
          true;

        // Use actual account name
        player.name =
          user.fullName ||
          user.username ||
          player.name ||
          "Player";
      }

      // ==================================================
      // CHECK EXISTING LEADER
      // ==================================================

      const existingLeader =
        await SquadClashTdmRegistration.findOne(
          {
            tournament:
              selectedTournament,

            leader: userId,

            registrationStatus: {
              $in:
                ACTIVE_REGISTRATION_STATUSES,
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
      // CHECK SLOT
      // ==================================================

      const existingSlot =
        await SquadClashTdmRegistration.findOne(
          {
            tournament:
              selectedTournament,

            teamSlot:
              normalizedSlot,

            registrationStatus: {
              $in:
                ACTIVE_REGISTRATION_STATUSES,
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
      // CHECK TEAM LIMIT
      // ==================================================

      const currentCount =
        await getRegisteredTeamCount(
          selectedTournament
        );

      if (
        currentCount >= 2
      ) {
        return res.status(409).json({
          success: false,
          message:
            "This tournament already has 2 registered teams.",
        });
      }

      // ==================================================
      // CREATE REGISTRATION
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

      // ==================================================
      // SYNC COUNT
      // ==================================================

      await syncRegisteredTeamCount(
        selectedTournament
      );

      // ==================================================
      // RETURN
      // ==================================================

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
        error?.code === 11000
      ) {
        return res.status(409).json({
          success: false,
          message:
            "This leader or team slot is already registered.",
        });
      }

      return res.status(400).json({
        success: false,
        message:
          getErrorMessage(error),
      });
    }
  };

// ======================================================
// UPDATE REGISTRATION
// PATCH /registrations/:registrationId
// ======================================================

const updateSquadClashTdmRegistration =
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

      // ==================================================
      // FIND REGISTRATION
      // ==================================================

      const existing =
        await SquadClashTdmRegistration.findById(
          registrationId
        );

      if (!existing) {
        return res.status(404).json({
          success: false,
          message:
            "Registration not found.",
        });
      }

      // ==================================================
      // ALLOWED FIELDS
      // ==================================================

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
        const field
        of allowedFields
      ) {
        if (
          Object.prototype.hasOwnProperty.call(
            req.body || {},
            field
          )
        ) {
          update[field] =
            req.body[field];
        }
      }

      // ==================================================
      // STATUS
      // ==================================================

      if (
        update.registrationStatus !==
        undefined
      ) {
        const status =
          String(
            update.registrationStatus
          ).trim();

        if (
          !ALLOWED_REGISTRATION_STATUSES.includes(
            status
          )
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Invalid registration status.",
          });
        }

        update.registrationStatus =
          status;
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

        if (
          !ALLOWED_PAYMENT_STATUSES.includes(
            paymentStatus
          )
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Invalid payment status.",
          });
        }

        update.paymentStatus =
          paymentStatus;
      }

      // ==================================================
      // TEAM SLOT
      // ==================================================

      if (
        update.teamSlot !==
        undefined
      ) {
        const slot =
          String(
            update.teamSlot
          )
            .trim()
            .toUpperCase();

        if (
          !["A", "B"].includes(
            slot
          )
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Team slot must be A or B.",
          });
        }

        // ----------------------------------------------
        // CHECK SLOT CONFLICT
        // ----------------------------------------------

        const existingSlot =
          await SquadClashTdmRegistration.findOne(
            {
              _id: {
                $ne:
                  registrationId,
              },

              tournament:
                existing.tournament,

              teamSlot: slot,

              registrationStatus: {
                $in:
                  ACTIVE_REGISTRATION_STATUSES,
              },
            }
          );

        if (existingSlot) {
          return res.status(409).json({
            success: false,
            message:
              `Team ${slot} is already occupied.`,
          });
        }

        update.teamSlot =
          slot;
      }

      // ==================================================
      // TEAM NAME
      // ==================================================

      if (
        update.teamName !==
        undefined
      ) {
        const teamName =
          String(
            update.teamName
          ).trim();

        if (
          teamName.length < 2
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Team name must contain at least 2 characters.",
          });
        }

        update.teamName =
          teamName;
      }

      // ==================================================
      // UTR
      // ==================================================

      if (
        update.utr !==
        undefined
      ) {
        update.utr =
          String(
            update.utr || ""
          ).trim();
      }

      // ==================================================
      // PAYMENT QR
      // ==================================================

      if (
        update.paymentQr !==
        undefined
      ) {
        update.paymentQr =
          String(
            update.paymentQr ||
              ""
          ).trim();
      }

      // ==================================================
      // ADMIN NOTE
      // ==================================================

      if (
        update.adminNote !==
        undefined
      ) {
        update.adminNote =
          String(
            update.adminNote ||
              ""
          ).trim();
      }

      // ==================================================
      // NOTHING TO UPDATE
      // ==================================================

      if (
        Object.keys(
          update
        ).length === 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "No valid fields provided for update.",
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
            "username fullName email mobile"
          )
          .populate(
            "players.user",
            "username fullName email mobile"
          )
          .lean();

      if (!registration) {
        return res.status(404).json({
          success: false,
          message:
            "Registration not found.",
        });
      }

      // ==================================================
      // SYNC TOURNAMENT COUNT
      // ==================================================

      await syncRegisteredTeamCount(
        existing.tournament
      );

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

      if (
        error?.code === 11000
      ) {
        return res.status(409).json({
          success: false,
          message:
            "Duplicate registration or team slot.",
        });
      }

      return res.status(400).json({
        success: false,
        message:
          getErrorMessage(error),
      });
    }
  };

// ======================================================
// DELETE REGISTRATION
// DELETE /registrations/:registrationId
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
        await SquadClashTdmRegistration.findById(
          registrationId
        );

      if (!registration) {
        return res.status(404).json({
          success: false,
          message:
            "Registration not found.",
        });
      }

      const tournamentId =
        registration.tournament;

      await SquadClashTdmRegistration.findByIdAndDelete(
        registrationId
      );

      // ----------------------------------------------
      // SYNC COUNT
      // ----------------------------------------------

      await syncRegisteredTeamCount(
        tournamentId
      );

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
          "Unable to delete registration.",
      });
    }
  };

// ======================================================
// GET MY REGISTRATIONS
// GET /registrations/my
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
            "username fullName email mobile"
          )
          .populate(
            "players.user",
            "username fullName email mobile"
          )
          .sort({
            createdAt: -1,
          })
          .lean();

      return res.status(200).json({
        success: true,

        count:
          registrations.length,

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
          "Unable to load your registrations.",
      });
    }
  };

// ======================================================
// EXPORTS
// ======================================================

module.exports = {
  // Tournament
  createSquadClashTdm,
  getSquadClashTdm,
  getSquadClashTdmById,
  updateSquadClashTdm,
  deleteSquadClashTdm,

  // Player
  validatePlayerUid,

  // Team
  getTeamSlots,

  // Registration
  createSquadClashTdmRegistration,
  getMySquadClashTdmRegistrations,
  getSquadClashTdmRegistrations,
  updateSquadClashTdmRegistration,
  deleteSquadClashTdmRegistration,
};