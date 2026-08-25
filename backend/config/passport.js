const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

const User = require("../models/User");

// ======================================================
// LOCAL LOGIN STRATEGY
// ======================================================

passport.use(
  new LocalStrategy(
    {
      usernameField: "username",
      passwordField: "password",
      session: true,
    },

    async (username, password, done) => {
      try {
        const cleanUsername = String(
          username || ""
        )
          .trim()
          .toLowerCase();

        const cleanPassword = String(
          password || ""
        );

        if (!cleanUsername || !cleanPassword) {
          return done(null, false, {
            message:
              "Username and password are required.",
          });
        }

        // ==============================================
        // FIND USER
        // ==============================================

        const user = await User.findOne({
          username: cleanUsername,
        });

        if (!user) {
          return done(null, false, {
            message:
              "Invalid username or password.",
          });
        }

        // ==============================================
        // CHECK PASSWORD
        //
        // passport-local-mongoose
        // ==============================================

        if (
          typeof user.authenticate !==
          "function"
        ) {
          console.error(
            "User model does not have authenticate()."
          );

          return done(null, false, {
            message:
              "Authentication configuration error.",
          });
        }

        const authenticated =
          await user.authenticate(
            cleanPassword
          );

        if (
          !authenticated ||
          !authenticated.user
        ) {
          return done(null, false, {
            message:
              "Invalid username or password.",
          });
        }

        // ==============================================
        // SUCCESS
        // ==============================================

        return done(
          null,
          authenticated.user
        );
      } catch (error) {
        console.error(
          "PASSPORT LOCAL STRATEGY ERROR:",
          error
        );

        return done(error);
      }
    }
  )
);

// ======================================================
// SERIALIZE USER
// ======================================================

passport.serializeUser(
  (user, done) => {
    try {
      if (!user || !user._id) {
        return done(
          new Error(
            "Unable to serialize user."
          )
        );
      }

      return done(
        null,
        user._id.toString()
      );
    } catch (error) {
      return done(error);
    }
  }
);

// ======================================================
// DESERIALIZE USER
// ======================================================

passport.deserializeUser(
  async (id, done) => {
    try {
      if (!id) {
        return done(null, false);
      }

      const user =
        await User.findById(id);

      if (!user) {
        return done(null, false);
      }

      return done(null, user);
    } catch (error) {
      console.error(
        "PASSPORT DESERIALIZE ERROR:",
        error
      );

      return done(error);
    }
  }
);

module.exports = passport;