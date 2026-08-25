const mongoose = require("mongoose");

const tournamentWinnerSchema =
  new mongoose.Schema(
    {
      tournament: {
        type:
          mongoose.Schema.Types.ObjectId,

        ref: "Tournament",

        required: true,

        unique: true,
      },

      winners: [
        {
          position: {
            type: Number,

            required: true,

            min: 1,

            max: 3,
          },

          user: {
            type:
              mongoose.Schema.Types.ObjectId,

            ref: "User",

            required: true,
          },
        },
      ],
    },

    {
      timestamps: true,
    }
  );


module.exports =
  mongoose.model(
    "TournamentWinner",
    tournamentWinnerSchema
  );