require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");

// ======================================================
// ENVIRONMENT
// ======================================================

const NODE_ENV =
  process.env.NODE_ENV || "development";

const isProduction =
  NODE_ENV === "production";

// ======================================================
// ENV CONFIG
// ======================================================

const PORT =
  Number(process.env.PORT) || 5001;

const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb://127.0.0.1:27017/tournamentDB";

const SESSION_SECRET =
  process.env.SESSION_SECRET ||
  "tournament-arena-secret";

const COOKIE_DOMAIN =
  process.env.COOKIE_DOMAIN?.trim() || undefined;

const FRONTEND_URL =
  process.env.FRONTEND_URL?.trim() || "";

const EXTRA_CORS_ORIGINS =
  process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean)
    : [];

// ======================================================
// ENV LOG
// ======================================================

console.log(
  "========================================"
);

console.log(
  "Environment:",
  NODE_ENV
);

console.log(
  "Port:",
  PORT
);

console.log(
  "Frontend URL:",
  FRONTEND_URL || "Not configured"
);

console.log(
  "Cookie Domain:",
  COOKIE_DOMAIN || "Not configured"
);

console.log(
  "HANUOTP_API_KEY loaded:",
  !!process.env.HANUOTP_API_KEY
);

console.log(
  "========================================"
);

// ======================================================
// PASSPORT
// ======================================================

// IMPORTANT:
// Use the configured Passport instance.
// This loads config/passport.js and registers
// the "local" authentication strategy.

const passport =
  require("./config/passport");

// ======================================================
// MODELS
// ======================================================

const User =
  require("./models/User");

// ======================================================
// ROUTES
// ======================================================

const authRoutes =
  require("./routes/authRoutes");

const tournamentRoutes =
  require("./routes/tournamentRoutes");

const tournamentRoomRoutes =
  require("./routes/tournamentRoomRoutes");

const userRegistrationRoutes =
  require("./routes/registrations");

const adminRegistrationRoutes =
  require("./routes/adminRegistrationRoutes");

const profileRoutes =
  require("./routes/profileRoutes");

const leaderboardRoutes =
  require("./routes/leaderboardRoutes");

const adminUserRoutes =
  require("./routes/adminUserRoutes");

// ======================================================
// TDM / SQUAD CLASH ROUTES
// ======================================================

const squadClashTdmRoutes =
  require("./routes/squadClashTdmRoutes");

const squadClashTdmRegistrationRoutes =
  require(
    "./routes/squadClashTdmRegistrationRoutes"
  );

// ======================================================
// ADMIN TDM / SQUAD CLASH
// ======================================================

const adminSquadClashTdmRegistrationRoutes =
  require(
    "./routes/adminSquadClashTdmRegistrationRoutes"
  );

// ======================================================
// MIDDLEWARE
// ======================================================

const requireAuth =
  require("./middleware/requireAuth");

const unknownRoute =
  require("./middleware/unknownRoute");

const errorHandler =
  require("./middleware/errorHandler");

// ======================================================
// APP
// ======================================================

const app = express();

// ======================================================
// TRUST PROXY
// ======================================================
//
// Important when deployed behind Render, Railway,
// Fly.io, etc.
//
// This allows Express to correctly understand
// HTTPS requests coming through a reverse proxy.
//

if (isProduction) {
  app.set("trust proxy", 1);
}

// ======================================================
// CORS ORIGINS
// ======================================================
//
// FRONTEND_URL is the primary frontend.
// CORS_ORIGINS can contain multiple URLs.
//
// Example:
//
// FRONTEND_URL=https://myapp.vercel.app
//
// CORS_ORIGINS=https://admin.example.com,https://myapp.vercel.app
//
// Local development can use:
//
// FRONTEND_URL=http://localhost:3000
//
// ======================================================

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:5173",
  "http://localhost:5174",
  FRONTEND_URL,
  ...EXTRA_CORS_ORIGINS,
]
  .map((origin) =>
    origin?.trim()
  )
  .filter(Boolean)
  .filter(
    (origin, index, array) =>
      array.indexOf(origin) === index
  );

console.log(
  "Allowed CORS origins:",
  allowedOrigins
);

// ======================================================
// CORS
// ======================================================

app.use(
  cors({
    origin: function (
      origin,
      callback
    ) {
      // Allow requests without Origin.
      //
      // Examples:
      // Postman
      // curl
      // server-to-server requests

      if (!origin) {
        return callback(
          null,
          true
        );
      }

      if (
        allowedOrigins.includes(
          origin
        )
      ) {
        return callback(
          null,
          true
        );
      }

      console.warn(
        `CORS blocked origin: ${origin}`
      );

      return callback(
        new Error(
          "Not allowed by CORS."
        )
      );
    },

    credentials: true,

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Accept",
    ],
  })
);

// ======================================================
// BODY PARSER
// ======================================================

app.use(
  express.json({
    limit: "2mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "2mb",
  })
);

// ======================================================
// REQUEST LOGGER
// ======================================================

app.use(
  (req, res, next) => {
    console.log(
      `[API] ${req.method} ${req.originalUrl}`
    );

    next();
  }
);

// ======================================================
// SESSION
// ======================================================
//
// Cookie configuration comes from .env.
//
// COOKIE_DOMAIN:
// Development:
// COOKIE_DOMAIN=
//
// Production with same parent domain:
// COOKIE_DOMAIN=.example.com
//
// If frontend/backend are on completely different
// domains, leave COOKIE_DOMAIN empty.
//

const sessionCookie = {
  httpOnly: true,

  secure: isProduction,

  sameSite: isProduction
    ? "none"
    : "lax",

  maxAge:
    1000 *
    60 *
    60 *
    24 *
    7,
};

// Only add domain when it is actually configured.
//
// This is important because:
//
// domain: undefined
//
// is safer for localhost than:
//
// domain: "localhost"
//

if (COOKIE_DOMAIN) {
  sessionCookie.domain =
    COOKIE_DOMAIN;
}

console.log(
  "Session cookie configuration:",
  {
    httpOnly:
      sessionCookie.httpOnly,

    secure:
      sessionCookie.secure,

    sameSite:
      sessionCookie.sameSite,

    domain:
      sessionCookie.domain ||
      "browser default",

    maxAge:
      sessionCookie.maxAge,
  }
);

app.use(
  session({
    secret: SESSION_SECRET,

    resave: false,

    saveUninitialized: false,

    cookie: sessionCookie,
  })
);

// ======================================================
// PASSPORT
// ======================================================
//
// IMPORTANT ORDER:
//
// session()
// passport.initialize()
// passport.session()
//
// passport.session() must come after
// express-session.
//

app.use(
  passport.initialize()
);

app.use(
  passport.session()
);

// ======================================================
// DATABASE
// ======================================================

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log(
      "========================================"
    );

    console.log(
      "MongoDB connected successfully"
    );

    console.log(
      `Database: ${mongoose.connection.name}`
    );

    console.log(
      "========================================"
    );
  })
  .catch((error) => {
    console.error(
      "MongoDB connection error:",
      error.message
    );
  });

// ======================================================
// DATABASE EVENTS
// ======================================================

mongoose.connection.on(
  "error",
  (error) => {
    console.error(
      "MongoDB runtime error:",
      error
    );
  }
);

mongoose.connection.on(
  "disconnected",
  () => {
    console.warn(
      "MongoDB disconnected."
    );
  }
);

// ======================================================
// API ROOT
// ======================================================

app.get(
  "/",
  (req, res) => {
    return res.status(200).json({
      success: true,

      message:
        "Tournament Arena API is running",

      server:
        "Backend",

      port: PORT,

      environment:
        NODE_ENV,
    });
  }
);

// ======================================================
// HEALTH CHECK
// ======================================================

app.get(
  "/api/health",
  (req, res) => {
    const dbState =
      mongoose.connection.readyState;

    return res.status(200).json({
      success: true,

      server:
        "Tournament Arena API",

      database:
        dbState === 1
          ? "connected"
          : "disconnected",

      databaseState:
        dbState,

      timestamp:
        new Date().toISOString(),
    });
  }
);

// ======================================================
// AUTH
// ======================================================

app.use(
  "/api/auth",
  authRoutes
);

// ======================================================
// NORMAL TOURNAMENTS
// ======================================================

app.use(
  "/api/tournaments",
  tournamentRoutes
);

// ======================================================
// TOURNAMENT ROOMS
// ======================================================

app.use(
  "/api/tournaments",
  requireAuth,
  tournamentRoomRoutes
);

// ======================================================
// ADMIN USERS
// ======================================================

app.use(
  "/api/admin/users",
  adminUserRoutes
);

// ======================================================
// ADMIN NORMAL REGISTRATIONS
// ======================================================

app.use(
  "/api/admin/registrations",
  adminRegistrationRoutes
);

// ======================================================
// USER NORMAL REGISTRATIONS
// ======================================================

app.use(
  "/api/registrations",
  requireAuth,
  userRegistrationRoutes
);

// ======================================================
// TDM / SQUAD CLASH MATCHES
// ======================================================
//
// SAME MODEL
// SAME COLLECTION
//
// type = "TDM"
// type = "Squad Clash"
//

app.use(
  "/api/squad-clash-tdm",
  squadClashTdmRoutes
);

// ======================================================
// TDM / SQUAD CLASH USER REGISTRATIONS
// ======================================================
//
// POST
// /api/squad-clash-tdm/registrations
//
// GET
// /api/squad-clash-tdm/registrations/my
//
// GET
// /api/squad-clash-tdm/registrations/validate-player-uid
//
// GET
// /api/squad-clash-tdm/registrations/:tournamentId/slots
//
// GET
// /api/squad-clash-tdm/registrations/registration/:id
//
// PATCH
// /api/squad-clash-tdm/registrations/:id/cancel
//

app.use(
  "/api/squad-clash-tdm/registrations",
  squadClashTdmRegistrationRoutes
);

// ======================================================
// MATCH REGISTRATION COMPATIBILITY
// ======================================================
//
// GET
// /api/squad-clash-tdm/:matchId/registrations
//

app.use(
  "/api/squad-clash-tdm/:matchId/registrations",
  squadClashTdmRegistrationRoutes
);

// ======================================================
// ADMIN TDM / SQUAD CLASH REGISTRATIONS
// ======================================================
//
// GET
// /api/admin/squad-clash-tdm/registrations/:tournamentId
//
// PATCH
// /api/admin/squad-clash-tdm/registrations/:registrationId
//
// DELETE
// /api/admin/squad-clash-tdm/registrations/:registrationId
//

app.use(
  "/api/admin/squad-clash-tdm",
  adminSquadClashTdmRegistrationRoutes
);

// ======================================================
// PROFILE ROUTES
// ======================================================

app.use(
  "/api/profile",
  requireAuth,
  profileRoutes
);

// ======================================================
// PROFILE COMPATIBILITY ENDPOINT
// ======================================================
//
// GET /api/profile
//

app.get(
  "/api/profile",
  requireAuth,
  async (req, res) => {
    try {
      const userId =
        req.user?._id ||
        req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,

          authenticated:
            false,

          user: null,

          message:
            "You must be logged in.",
        });
      }

      const user =
        await User.findById(
          userId
        )
          .select(
            "-hash -salt -password"
          )
          .lean();

      if (!user) {
        return res.status(404).json({
          success: false,

          authenticated:
            false,

          user: null,

          message:
            "User not found.",
        });
      }

      return res.status(200).json({
        success: true,

        authenticated:
          true,

        user: {
          id:
            user._id,

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
    } catch (error) {
      console.error(
        "GET /api/profile ERROR:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          error.message ||
          "Failed to load profile.",
      });
    }
  }
);

// ======================================================
// LEADERBOARD
// ======================================================

app.use(
  "/api/leaderboard",
  leaderboardRoutes
);

// ======================================================
// 404
// ======================================================

app.use(
  unknownRoute
);

// ======================================================
// GLOBAL ERROR HANDLER
// ======================================================

app.use(
  errorHandler
);

// ======================================================
// SERVER
// ======================================================

const server =
  app.listen(
    PORT,
    () => {
      console.log(
        "========================================"
      );

      console.log(
        "       TOURNAMENT ARENA BACKEND"
      );

      console.log(
        "========================================"
      );

      console.log(
        `Server running on port: ${PORT}`
      );

      console.log(
        `API health: /api/health`
      );

      console.log(
        `Environment: ${NODE_ENV}`
      );

      console.log(
        "----------------------------------------"
      );

      console.log(
        "AUTH"
      );

      console.log(
        "POST   /api/auth/login"
      );

      console.log(
        "GET    /api/auth/me"
      );

      console.log(
        "GET    /api/auth/current-user"
      );

      console.log(
        "GET    /api/auth/profile"
      );

      console.log(
        "PATCH  /api/auth/profile"
      );

      console.log(
        "PATCH  /api/auth/game-uid"
      );

      console.log(
        "----------------------------------------"
      );

      console.log(
        "PROFILE"
      );

      console.log(
        "GET    /api/profile"
      );

      console.log(
        "----------------------------------------"
      );

      console.log(
        "NORMAL TOURNAMENTS"
      );

      console.log(
        "Mounted: /api/tournaments"
      );

      console.log(
        "----------------------------------------"
      );

      console.log(
        "TDM / SQUAD CLASH"
      );

      console.log(
        "Mounted: /api/squad-clash-tdm"
      );

      console.log(
        "----------------------------------------"
      );

      console.log(
        "USER REGISTRATION ROUTES"
      );

      console.log(
        "POST   /api/squad-clash-tdm/registrations"
      );

      console.log(
        "GET    /api/squad-clash-tdm/registrations/my"
      );

      console.log(
        "GET    /api/squad-clash-tdm/registrations/validate-player-uid"
      );

      console.log(
        "GET    /api/squad-clash-tdm/registrations/:tournamentId/slots"
      );

      console.log(
        "GET    /api/squad-clash-tdm/registrations/registration/:id"
      );

      console.log(
        "PATCH  /api/squad-clash-tdm/registrations/:id/cancel"
      );

      console.log(
        "----------------------------------------"
      );

      console.log(
        "MATCH REGISTRATION COMPATIBILITY"
      );

      console.log(
        "GET    /api/squad-clash-tdm/:matchId/registrations"
      );

      console.log(
        "----------------------------------------"
      );

      console.log(
        "ADMIN TDM / SQUAD CLASH"
      );

      console.log(
        "GET    /api/admin/squad-clash-tdm/registrations/:tournamentId"
      );

      console.log(
        "PATCH  /api/admin/squad-clash-tdm/registrations/:registrationId"
      );

      console.log(
        "DELETE /api/admin/squad-clash-tdm/registrations/:registrationId"
      );

      console.log(
        "----------------------------------------"
      );

      console.log(
        "Passport local strategy:"
      );

      console.log(
        "REGISTERED"
      );

      console.log(
        "----------------------------------------"
      );

      console.log(
        "Server started successfully."
      );

      console.log(
        "========================================"
      );
    }
  );

// ======================================================
// GRACEFUL SHUTDOWN
// ======================================================

const gracefulShutdown =
  async (signal) => {
    try {
      console.log(
        `${signal} received. Shutting down...`
      );

      await mongoose.connection.close();

      console.log(
        "MongoDB connection closed."
      );

      server.close(
        () => {
          process.exit(0);
        }
      );
    } catch (error) {
      console.error(
        "Shutdown error:",
        error
      );

      process.exit(1);
    }
  };

process.on(
  "SIGINT",
  () =>
    gracefulShutdown(
      "SIGINT"
    )
);

process.on(
  "SIGTERM",
  () =>
    gracefulShutdown(
      "SIGTERM"
    )
);

// ======================================================
// EXPORT
// ======================================================

module.exports = app;