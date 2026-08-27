require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");

// ======================================================
// ENVIRONMENT
// ======================================================

const NODE_ENV = process.env.NODE_ENV || "development";

const isProduction = NODE_ENV === "production";

// ======================================================
// ENV CONFIG
// ======================================================

const PORT = Number(process.env.PORT) || 5001;

const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb://127.0.0.1:27017/tournamentDB";

const SESSION_SECRET =
  process.env.SESSION_SECRET ||
  "change-this-secret-in-production";

const FRONTEND_URL =
  process.env.FRONTEND_URL?.trim() ||
  "http://localhost:3000";

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

console.log("========================================");
console.log("Environment:", NODE_ENV);
console.log("Port:", PORT);
console.log("Frontend URL:", FRONTEND_URL);
console.log("MONGO_URI loaded:", !!process.env.MONGO_URI);
console.log(
  "SESSION_SECRET loaded:",
  !!process.env.SESSION_SECRET
);
console.log("========================================");

// ======================================================
// PASSPORT
// ======================================================

const passport = require("./config/passport");

// ======================================================
// MODELS
// ======================================================

const User = require("./models/User");

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
// IMPORTANT FOR RENDER / RAILWAY / HTTPS
// ======================================================

if (isProduction) {
  app.set("trust proxy", 1);
}

// ======================================================
// ALLOWED CORS ORIGINS
// ======================================================

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:5173",
  "http://localhost:5174",

  FRONTEND_URL,

  ...EXTRA_CORS_ORIGINS,
]
  .map((origin) => origin?.trim())
  .filter(Boolean)
  .filter(
    (origin, index, array) =>
      array.indexOf(origin) === index
  );

console.log("Allowed CORS origins:");
console.log(allowedOrigins);

// ======================================================
// CORS
// ======================================================

const corsOptions = {
  origin: function (origin, callback) {
    // Allow Postman, curl, server requests
    if (!origin) {
      return callback(null, true);
    }

    // Allow configured origins
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.warn("CORS BLOCKED:", origin);

    return callback(
      new Error(`CORS blocked for origin: ${origin}`)
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

  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

// ======================================================
// BODY PARSERS
// ======================================================

app.use(
  express.json({
    limit: "5mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "5mb",
  })
);

// ======================================================
// REQUEST LOGGER
// ======================================================

app.use((req, res, next) => {
  console.log(
    `[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`
  );

  next();
});

// ======================================================
// SESSION COOKIE
// ======================================================

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

  path: "/",
};

// ======================================================
// SESSION
// NO CONNECT-MONGO
// ======================================================

app.use(
  session({
    name: "top1squad.sid",

    secret: SESSION_SECRET,

    resave: false,

    saveUninitialized: false,

    rolling: true,

    cookie: sessionCookie,
  })
);

// ======================================================
// PASSPORT
// ======================================================

app.use(passport.initialize());

app.use(passport.session());

// ======================================================
// SESSION DEBUG
// ======================================================

app.use((req, res, next) => {
  console.log("Session ID:", req.sessionID);

  console.log(
    "Authenticated:",
    req.isAuthenticated
      ? req.isAuthenticated()
      : false
  );

  next();
});

// ======================================================
// DATABASE CONNECTION
// ======================================================

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("========================================");
    console.log("MongoDB connected successfully");
    console.log(
      "Database:",
      mongoose.connection.name
    );
    console.log(
      "Host:",
      mongoose.connection.host
    );
    console.log("========================================");
  })
  .catch((error) => {
    console.error("========================================");
    console.error(
      "MongoDB connection error:",
      error.message
    );
    console.error("========================================");

    process.exit(1);
  });

// ======================================================
// DATABASE EVENTS
// ======================================================

mongoose.connection.on("connected", () => {
  console.log("MongoDB connection established.");
});

mongoose.connection.on("error", (error) => {
  console.error(
    "MongoDB runtime error:",
    error.message
  );
});

mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB disconnected.");
});

// ======================================================
// API ROOT
// ======================================================

app.get("/", (req, res) => {
  return res.status(200).json({
    success: true,

    message: "Tournament Arena API is running",

    server: "Backend",

    port: PORT,

    environment: NODE_ENV,

    authenticated:
      req.isAuthenticated &&
      req.isAuthenticated(),

    database:
      mongoose.connection.readyState === 1
        ? "connected"
        : "disconnected",
  });
});

// ======================================================
// HEALTH CHECK
// ======================================================

app.get("/api/health", (req, res) => {
  const dbState =
    mongoose.connection.readyState;

  return res.status(200).json({
    success: true,

    server: "Tournament Arena API",

    database:
      dbState === 1
        ? "connected"
        : "disconnected",

    databaseState: dbState,

    databaseName:
      mongoose.connection.name || null,

    databaseHost:
      mongoose.connection.host || null,

    environment: NODE_ENV,

    timestamp: new Date().toISOString(),
  });
});

// ======================================================
// FAVICON
// ======================================================

app.get("/favicon.ico", (req, res) => {
  return res.status(204).end();
});

// ======================================================
// SESSION TEST
// ======================================================

app.get("/api/test-session", (req, res) => {
  return res.status(200).json({
    success: true,

    sessionID: req.sessionID,

    authenticated:
      req.isAuthenticated &&
      req.isAuthenticated(),

    user: req.user
      ? {
          id: req.user._id,
          username: req.user.username,
          role: req.user.role,
        }
      : null,
  });
});

// ======================================================
// AUTH ROUTES
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

app.use(
  "/api/squad-clash-tdm",
  squadClashTdmRoutes
);

// ======================================================
// TDM USER REGISTRATIONS
// ======================================================

app.use(
  "/api/squad-clash-tdm/registrations",
  squadClashTdmRegistrationRoutes
);

// ======================================================
// MATCH REGISTRATION COMPATIBILITY
// ======================================================

app.use(
  "/api/squad-clash-tdm/:matchId/registrations",
  squadClashTdmRegistrationRoutes
);

// ======================================================
// ADMIN TDM / SQUAD CLASH
// ======================================================

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
// PROFILE COMPATIBILITY
// ======================================================

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
          authenticated: false,
          user: null,
          message: "You must be logged in.",
        });
      }

      const user =
        await User.findById(userId)
          .select("-hash -salt -password")
          .lean();

      if (!user) {
        return res.status(404).json({
          success: false,
          user: null,
          message: "User not found.",
        });
      }

      return res.status(200).json({
        success: true,
        authenticated: true,

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

app.use(unknownRoute);

// ======================================================
// GLOBAL ERROR HANDLER
// ======================================================

app.use(errorHandler);

// ======================================================
// START SERVER
// ======================================================

const server = app.listen(PORT, () => {
  console.log("");
  console.log("========================================");
  console.log("     TOURNAMENT ARENA BACKEND");
  console.log("========================================");

  console.log(
    `Server running on port: ${PORT}`
  );

  console.log(
    `Environment: ${NODE_ENV}`
  );

  console.log(
    `Frontend: ${FRONTEND_URL}`
  );

  console.log(
    `Health: /api/health`
  );

  console.log("");
  console.log("AUTH ROUTES:");

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
    "POST   /api/auth/logout"
  );

  console.log("");
  console.log("NORMAL TOURNAMENTS:");

  console.log(
    "Mounted: /api/tournaments"
  );

  console.log("");
  console.log("TDM / SQUAD CLASH:");

  console.log(
    "Mounted: /api/squad-clash-tdm"
  );

  console.log("");
  console.log("Server started successfully.");

  console.log("========================================");
});

// ======================================================
// GRACEFUL SHUTDOWN
// ======================================================

const gracefulShutdown = async (signal) => {
  try {
    console.log("");

    console.log(
      `${signal} received. Shutting down...`
    );

    server.close(async () => {
      try {
        await mongoose.connection.close();

        console.log(
          "MongoDB connection closed."
        );

        console.log(
          "Server stopped successfully."
        );

        process.exit(0);
      } catch (error) {
        console.error(
          "Shutdown error:",
          error
        );

        process.exit(1);
      }
    });
  } catch (error) {
    console.error(
      "Graceful shutdown error:",
      error
    );

    process.exit(1);
  }
};

process.on("SIGINT", () => {
  gracefulShutdown("SIGINT");
});

process.on("SIGTERM", () => {
  gracefulShutdown("SIGTERM");
});

// ======================================================
// UNHANDLED ERRORS
// ======================================================

process.on(
  "unhandledRejection",
  (reason) => {
    console.error(
      "Unhandled Promise Rejection:",
      reason
    );
  }
);

process.on(
  "uncaughtException",
  (error) => {
    console.error(
      "Uncaught Exception:",
      error
    );

    process.exit(1);
  }
);