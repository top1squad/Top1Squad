const express = require("express");
const passport = require("passport");

const router = express.Router();

// ======================================================
// LOGIN
// POST /api/auth/login
// ======================================================

router.post("/login", (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: "Username and password are required.",
    });
  }

  passport.authenticate("local", (error, user, info) => {
    if (error) {
      console.error("LOGIN ERROR:", error);

      return res.status(500).json({
        success: false,
        message: "Internal server error.",
      });
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message:
          info?.message ||
          "Invalid username or password.",
      });
    }

    req.logIn(user, (loginError) => {
      if (loginError) {
        console.error("REQ.LOGIN ERROR:", loginError);

        return res.status(500).json({
          success: false,
          message: "Could not create login session.",
        });
      }

      // IMPORTANT:
      // Save session before sending response
      req.session.save((sessionError) => {
        if (sessionError) {
          console.error(
            "SESSION SAVE ERROR:",
            sessionError
          );

          return res.status(500).json({
            success: false,
            message: "Could not save login session.",
          });
        }

        return res.status(200).json({
          success: true,
          message: "Login successful.",

          user: {
            _id: user._id,
            id: user._id,

            username:
              user.username || "",

            fullName:
              user.fullName || "",

            email:
              user.email || "",

            mobile:
              user.mobile || "",

            game:
              user.game || "",

            gameUid:
              user.gameUid || "",

            bgmiUid:
              user.bgmiUid || "",

            freeFireUid:
              user.freeFireUid || "",

            role:
              user.role || "user",
          },
        });
      });
    });
  })(req, res, next);
});

// ======================================================
// CURRENT USER
// GET /api/auth/me
// ======================================================

router.get("/me", (req, res) => {
  const authenticated =
    req.isAuthenticated &&
    req.isAuthenticated();

  if (!authenticated || !req.user) {
    return res.status(401).json({
      success: false,
      authenticated: false,
      user: null,
      message: "Not authenticated.",
    });
  }

  return res.status(200).json({
    success: true,
    authenticated: true,

    user: {
      _id: req.user._id,
      id: req.user._id,

      username:
        req.user.username || "",

      fullName:
        req.user.fullName || "",

      email:
        req.user.email || "",

      mobile:
        req.user.mobile || "",

      game:
        req.user.game || "",

      gameUid:
        req.user.gameUid || "",

      bgmiUid:
        req.user.bgmiUid || "",

      freeFireUid:
        req.user.freeFireUid || "",

      role:
        req.user.role || "user",
    },
  });
});

// ======================================================
// CURRENT USER COMPATIBILITY
// GET /api/auth/current-user
// ======================================================

router.get("/current-user", (req, res) => {
  const authenticated =
    req.isAuthenticated &&
    req.isAuthenticated();

  if (!authenticated || !req.user) {
    return res.status(401).json({
      success: false,
      authenticated: false,
      user: null,
      message: "Not authenticated.",
    });
  }

  return res.status(200).json({
    success: true,
    authenticated: true,
    user: req.user,
  });
});

// ======================================================
// LOGOUT
// POST /api/auth/logout
// ======================================================

router.post("/logout", (req, res, next) => {
  req.logout((error) => {
    if (error) {
      return next(error);
    }

    req.session.destroy((sessionError) => {
      if (sessionError) {
        console.error(
          "SESSION DESTROY ERROR:",
          sessionError
        );

        return res.status(500).json({
          success: false,
          message: "Logout failed.",
        });
      }

      res.clearCookie("connect.sid", {
        path: "/",
      });

      return res.status(200).json({
        success: true,
        message: "Logged out successfully.",
      });
    });
  });
});

module.exports = router;