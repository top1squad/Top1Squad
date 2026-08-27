const express = require("express");
const passport = require("passport");

const router = express.Router();

// ======================================================
// SAFE USER OBJECT
// ======================================================

function getSafeUser(user) {
  if (!user) {
    return null;
  }

  return {
    _id: user._id,
    id: user._id,

    username: user.username || "",
    fullName: user.fullName || "",
    email: user.email || "",
    mobile: user.mobile || "",

    game: user.game || "",
    gameUid: user.gameUid || "",
    bgmiUid: user.bgmiUid || "",
    freeFireUid: user.freeFireUid || "",

    role: user.role || "user",
  };
}

// ======================================================
// LOGIN
// POST /api/auth/login
// ======================================================

router.post("/login", (req, res, next) => {
  const username =
    typeof req.body?.username === "string"
      ? req.body.username.trim()
      : "";

  const password =
    typeof req.body?.password === "string"
      ? req.body.password
      : "";

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      authenticated: false,
      user: null,
      message: "Username and password are required.",
    });
  }

  passport.authenticate(
    "local",
    (error, user, info) => {
      // ================================================
      // PASSPORT ERROR
      // ================================================

      if (error) {
        console.error("LOGIN ERROR:", error);

        return res.status(500).json({
          success: false,
          authenticated: false,
          user: null,
          message: "Internal server error.",
        });
      }

      // ================================================
      // INVALID LOGIN
      // ================================================

      if (!user) {
        return res.status(401).json({
          success: false,
          authenticated: false,
          user: null,
          message:
            info?.message ||
            "Invalid username or password.",
        });
      }

      // ================================================
      // CREATE PASSPORT SESSION
      // ================================================

      req.logIn(user, (loginError) => {
        if (loginError) {
          console.error(
            "REQ.LOGIN ERROR:",
            loginError
          );

          return res.status(500).json({
            success: false,
            authenticated: false,
            user: null,
            message:
              "Could not create login session.",
          });
        }

        // ==============================================
        // SAVE SESSION BEFORE RESPONSE
        // ==============================================

        req.session.save((sessionError) => {
          if (sessionError) {
            console.error(
              "SESSION SAVE ERROR:",
              sessionError
            );

            return res.status(500).json({
              success: false,
              authenticated: false,
              user: null,
              message:
                "Could not save login session.",
            });
          }

          console.log(
            "LOGIN SUCCESS:",
            user.username
          );

          return res.status(200).json({
            success: true,
            authenticated: true,
            message: "Login successful.",
            user: getSafeUser(user),
          });
        });
      });
    }
  )(req, res, next);
});

// ======================================================
// CURRENT USER
// GET /api/auth/me
// ======================================================

router.get("/me", (req, res) => {
  const authenticated =
    typeof req.isAuthenticated === "function" &&
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
    user: getSafeUser(req.user),
  });
});

// ======================================================
// CURRENT USER COMPATIBILITY
// GET /api/auth/current-user
// ======================================================

router.get("/current-user", (req, res) => {
  const authenticated =
    typeof req.isAuthenticated === "function" &&
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
    user: getSafeUser(req.user),
  });
});

// ======================================================
// LOGOUT
// POST /api/auth/logout
// ======================================================

router.post("/logout", (req, res, next) => {
  req.logout((logoutError) => {
    if (logoutError) {
      console.error(
        "LOGOUT ERROR:",
        logoutError
      );

      return next(logoutError);
    }

    // ================================================
    // DESTROY EXPRESS SESSION
    // ================================================

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

      const isProduction =
        process.env.NODE_ENV === "production";

      res.clearCookie("connect.sid", {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction
          ? "none"
          : "lax",
        path: "/",
      });

      console.log("LOGOUT SUCCESS");

      return res.status(200).json({
        success: true,
        authenticated: false,
        user: null,
        message: "Logged out successfully.",
      });
    });
  });
});

module.exports = router;