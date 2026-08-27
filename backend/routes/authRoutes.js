const express = require("express");
const axios = require("axios");
const passport = require("passport");
const User = require("../models/User");

const router = express.Router();

// ======================================================
// HELPERS
// ======================================================

function getUserData(user) {
  if (!user) {
    return null;
  }

  return {
    id: user._id,
    username: user.username || "",
    fullName: user.fullName || "",
    mobile: user.mobile || "",
    email: user.email || "",
    game: user.game || "",
    gameUid: user.gameUid || "",
    upiId: user.upiId || "",
  };
}

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ======================================================
// GET REGISTRATION SESSION
// ======================================================

function getRegistrationSession(req, registrationId) {
  return new Promise((resolve, reject) => {
    if (!registrationId) {
      return resolve(null);
    }

    // --------------------------------------------------
    // Current session
    // --------------------------------------------------

    if (
      req.session &&
      req.sessionID === registrationId &&
      req.session.pendingRegistration
    ) {
      return resolve({
        session: req.session,
        sessionId: req.sessionID,
        currentSession: true,
      });
    }

    // --------------------------------------------------
    // Session store recovery
    // --------------------------------------------------

    if (
      !req.sessionStore ||
      typeof req.sessionStore.get !== "function"
    ) {
      return resolve(null);
    }

    req.sessionStore.get(
      registrationId,
      (error, storedSession) => {
        if (error) {
          console.error(
            "Registration session store error:",
            error
          );

          return reject(error);
        }

        if (
          !storedSession ||
          !storedSession.pendingRegistration
        ) {
          return resolve(null);
        }

        return resolve({
          session: storedSession,
          sessionId: registrationId,
          currentSession: false,
        });
      }
    );
  });
}

// ======================================================
// SAVE REGISTRATION SESSION
// ======================================================

function saveRegistrationSession(
  req,
  registrationSession
) {
  return new Promise((resolve, reject) => {
    if (!registrationSession) {
      return reject(
        new Error("Registration session missing.")
      );
    }

    // Current session
    if (registrationSession.currentSession) {
      return req.session.save((error) => {
        if (error) {
          return reject(error);
        }

        resolve();
      });
    }

    // Recovered session
    req.sessionStore.set(
      registrationSession.sessionId,
      registrationSession.session,
      (error) => {
        if (error) {
          return reject(error);
        }

        resolve();
      }
    );
  });
}

// ======================================================
// DESTROY REGISTRATION SESSION
// ======================================================

function destroyRegistrationSession(
  req,
  registrationSession
) {
  return new Promise((resolve, reject) => {
    if (!registrationSession) {
      return resolve();
    }

    if (registrationSession.currentSession) {
      return req.session.destroy((error) => {
        if (error) {
          return reject(error);
        }

        resolve();
      });
    }

    req.sessionStore.destroy(
      registrationSession.sessionId,
      (error) => {
        if (error) {
          return reject(error);
        }

        resolve();
      }
    );
  });
}

// ======================================================
// REGISTER
// POST /api/auth/register
// ======================================================

router.post("/register", async (req, res) => {
  try {
    const {
      fullName,
      username,
      mobile,
      email,
      password,
      game,
      gameUid,
      upiId,
      termsAccepted,
    } = req.body;

    console.log("");
    console.log("======================================");
    console.log("REGISTRATION REQUEST");
    console.log("======================================");

    // ==================================================
    // VALIDATION
    // ==================================================

    if (!fullName || !String(fullName).trim()) {
      return res.status(400).json({
        success: false,
        message: "Full name is required.",
      });
    }

    if (!username || !String(username).trim()) {
      return res.status(400).json({
        success: false,
        message: "Username is required.",
      });
    }

    if (
      !mobile ||
      !/^[6-9][0-9]{9}$/.test(String(mobile).trim())
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please enter a valid 10-digit mobile number.",
      });
    }

    if (!email || !String(email).trim()) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required.",
      });
    }

    if (String(password).length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 6 characters.",
      });
    }

    if (!game) {
      return res.status(400).json({
        success: false,
        message: "Game is required.",
      });
    }

    if (!["BGMI", "Free Fire"].includes(game)) {
      return res.status(400).json({
        success: false,
        message: "Game must be BGMI or Free Fire.",
      });
    }

    if (!gameUid || !String(gameUid).trim()) {
      return res.status(400).json({
        success: false,
        message: "Game UID is required.",
      });
    }

    if (!upiId || !String(upiId).trim()) {
      return res.status(400).json({
        success: false,
        message: "UPI ID is required.",
      });
    }

    if (
      !/^[\w.-]+@[\w.-]+$/.test(
        String(upiId).trim()
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid UPI ID.",
      });
    }

    if (!termsAccepted) {
      return res.status(400).json({
        success: false,
        message:
          "Please accept the Terms & Conditions.",
      });
    }

    // ==================================================
    // NORMALIZE
    // ==================================================

    const cleanFullName = String(fullName).trim();

    const cleanUsername = String(username)
      .trim()
      .toLowerCase();

    const cleanMobile = String(mobile).trim();

    const cleanEmail = String(email)
      .trim()
      .toLowerCase();

    const cleanGameUid = String(gameUid).trim();

    const cleanUpiId = String(upiId)
      .trim()
      .toLowerCase();

    // ==================================================
    // HANUOTP API KEY
    // ==================================================

    const hanuOtpApiKey =
      process.env.HANUOTP_API_KEY;

    if (!hanuOtpApiKey) {
      console.error(
        "HANUOTP_API_KEY is missing."
      );

      return res.status(500).json({
        success: false,
        message:
          "OTP service is not configured.",
      });
    }

    // ==================================================
    // CHECK USERNAME
    // ==================================================

    const existingUsername =
      await User.findOne({
        username: cleanUsername,
      });

    if (existingUsername) {
      return res.status(409).json({
        success: false,
        message:
          "Username is already registered.",
      });
    }

    // ==================================================
    // CHECK MOBILE
    // ==================================================

    const existingMobile =
      await User.findOne({
        mobile: cleanMobile,
      });

    if (existingMobile) {
      return res.status(409).json({
        success: false,
        message:
          "Mobile number is already registered.",
      });
    }

    // ==================================================
    // CHECK EMAIL
    // ==================================================

    const existingEmail =
      await User.findOne({
        email: cleanEmail,
      });

    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message:
          "Email address is already registered.",
      });
    }

    // ==================================================
    // CHECK GAME UID
    // ==================================================

    const gameUidQuery =
      game === "BGMI"
        ? {
            bgmiUid: cleanGameUid,
          }
        : {
            freeFireUid: cleanGameUid,
          };

    const existingGameUid =
      await User.findOne(gameUidQuery);

    if (existingGameUid) {
      return res.status(409).json({
        success: false,
        message:
          `${game} UID is already registered.`,
      });
    }

    // ==================================================
    // GENERATE OTP
    // ==================================================

    const otp = generateOtp();

    const otpExpiresAt =
      Date.now() + 10 * 60 * 1000;

    console.log("Generated OTP:", otp);
    console.log("Mobile:", cleanMobile);

    // ==================================================
    // STORE REGISTRATION DATA
    // ==================================================

    req.session.pendingRegistration = {
      fullName: cleanFullName,
      username: cleanUsername,
      mobile: cleanMobile,
      email: cleanEmail,
      password: String(password),
      game: game,
      gameUid: cleanGameUid,
      upiId: cleanUpiId,
      termsAccepted: true,

      // OTP
      mobileOtp: otp,
      mobileOtpExpiresAt: otpExpiresAt,
      mobileOtpAttempts: 0,
    };

    // ==================================================
    // SAVE SESSION BEFORE SENDING OTP
    // ==================================================

    await new Promise((resolve, reject) => {
      req.session.save((error) => {
        if (error) {
          return reject(error);
        }

        resolve();
      });
    });

    const registrationId = req.sessionID;

    console.log(
      "Registration session created:",
      registrationId
    );

    // ==================================================
    // SEND OTP
    // ==================================================

    console.log("");
    console.log("======================================");
    console.log("SENDING OTP THROUGH HANUOTP");
    console.log("======================================");

    try {
      const response = await axios.get(
        "https://api.hanuotp.in/sms-otp.php",
        {
          params: {
            number: cleanMobile,
            OTP: otp,
            apikey: hanuOtpApiKey,
            templatesid: "default",
          },
          timeout: 15000,
        }
      );

      console.log(
        "HanuOTP response:",
        response.data
      );

      // ==================================================
      // SUCCESS
      // ==================================================

      if (
        response.data &&
        response.data.status === "success"
      ) {
        console.log(
          "OTP SENT SUCCESSFULLY"
        );

        console.log(
          "Registration ID:",
          registrationId
        );

        console.log(
          "======================================"
        );

        return res.status(201).json({
          success: true,
          message:
            "OTP sent successfully to your mobile number.",
          registrationId: registrationId,
          mobile: cleanMobile,
          email: cleanEmail,
          username: cleanUsername,
          game: game,
        });
      }

      // ==================================================
      // HANUOTP FAILED
      // ==================================================

      console.error(
        "HanuOTP rejected request:",
        response.data
      );

      delete req.session.pendingRegistration;

      await new Promise((resolve) => {
        req.session.save(() => resolve());
      });

      return res.status(400).json({
        success: false,
        message:
          response.data?.message ||
          "Unable to send OTP. Please try again.",
      });
    } catch (otpError) {
      console.error(
        "HanuOTP request error:",
        otpError.response?.data ||
          otpError.message
      );

      delete req.session.pendingRegistration;

      await new Promise((resolve) => {
        req.session.save(() => resolve());
      });

      return res.status(502).json({
        success: false,
        message:
          "Unable to send OTP. Please try again.",
      });
    }
  } catch (error) {
    console.error(
      "Register error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Registration failed. Please try again.",
    });
  }
});

// ======================================================
// VERIFY REGISTRATION OTP
// POST /api/auth/verify
// ======================================================

router.post("/verify", async (req, res) => {
  try {
    const {
      registrationId,
      mobileOtp,
    } = req.body;

    console.log("");
    console.log("======================================");
    console.log("OTP VERIFICATION REQUEST");
    console.log("======================================");

    console.log(
      "Registration ID received:",
      registrationId
    );

    console.log(
      "Current request session:",
      req.sessionID
    );

    // ==================================================
    // VALIDATION
    // ==================================================

    if (!registrationId) {
      return res.status(400).json({
        success: false,
        message:
          "Registration ID is required.",
      });
    }

    if (!mobileOtp) {
      return res.status(400).json({
        success: false,
        message: "OTP is required.",
      });
    }

    const cleanOtp =
      String(mobileOtp).trim();

    if (!/^\d{6}$/.test(cleanOtp)) {
      return res.status(400).json({
        success: false,
        message:
          "Please enter a valid 6-digit OTP.",
      });
    }

    // ==================================================
    // RECOVER REGISTRATION SESSION
    // ==================================================

    const registrationSession =
      await getRegistrationSession(
        req,
        String(registrationId)
      );

    if (!registrationSession) {
      console.error(
        "Registration session NOT FOUND:",
        registrationId
      );

      return res.status(404).json({
        success: false,
        message:
          "Registration session not found or expired. Please register again.",
      });
    }

    console.log(
      "Registration session FOUND:",
      registrationSession.sessionId
    );

    console.log(
      "Using current session:",
      registrationSession.currentSession
    );

    const registration =
      registrationSession.session.pendingRegistration;

    if (!registration) {
      return res.status(404).json({
        success: false,
        message:
          "Registration data not found. Please register again.",
      });
    }

    // ==================================================
    // OTP EXPIRY
    // ==================================================

    if (
      !registration.mobileOtpExpiresAt ||
      registration.mobileOtpExpiresAt <
        Date.now()
    ) {
      try {
        await destroyRegistrationSession(
          req,
          registrationSession
        );
      } catch (destroyError) {
        console.error(
          "OTP expired session cleanup error:",
          destroyError
        );
      }

      return res.status(400).json({
        success: false,
        message:
          "OTP has expired. Please register again.",
      });
    }

    // ==================================================
    // OTP ATTEMPTS
    // ==================================================

    const attempts =
      Number(
        registration.mobileOtpAttempts || 0
      );

    if (attempts >= 5) {
      try {
        await destroyRegistrationSession(
          req,
          registrationSession
        );
      } catch (destroyError) {
        console.error(
          "OTP attempts cleanup error:",
          destroyError
        );
      }

      return res.status(429).json({
        success: false,
        message:
          "Maximum OTP attempts exceeded. Please register again.",
      });
    }

    // ==================================================
    // OTP CHECK
    // ==================================================

    console.log(
      "Stored OTP:",
      registration.mobileOtp
    );

    console.log(
      "Received OTP:",
      cleanOtp
    );

    if (
      String(registration.mobileOtp) !==
      cleanOtp
    ) {
      registration.mobileOtpAttempts =
        attempts + 1;

      registrationSession.session.pendingRegistration =
        registration;

      try {
        await saveRegistrationSession(
          req,
          registrationSession
        );
      } catch (saveError) {
        console.error(
          "OTP attempt save error:",
          saveError
        );

        return res.status(500).json({
          success: false,
          message:
            "Unable to save OTP attempt. Please try again.",
        });
      }

      return res.status(400).json({
        success: false,
        message: "Invalid OTP.",
      });
    }

    console.log(
      "OTP MATCHED SUCCESSFULLY"
    );

    // ==================================================
    // CHECK USERNAME AGAIN
    // ==================================================

    const existingUsername =
      await User.findOne({
        username: registration.username,
      });

    if (existingUsername) {
      return res.status(409).json({
        success: false,
        message:
          "Username is already registered.",
      });
    }

    // ==================================================
    // CHECK MOBILE AGAIN
    // ==================================================

    const existingMobile =
      await User.findOne({
        mobile: registration.mobile,
      });

    if (existingMobile) {
      return res.status(409).json({
        success: false,
        message:
          "Mobile number is already registered.",
      });
    }

    // ==================================================
    // CHECK EMAIL AGAIN
    // ==================================================

    const existingEmail =
      await User.findOne({
        email: registration.email,
      });

    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message:
          "Email address is already registered.",
      });
    }

    // ==================================================
    // CHECK GAME UID AGAIN
    // ==================================================

    const gameUidQuery =
      registration.game === "BGMI"
        ? {
            bgmiUid:
              registration.gameUid,
          }
        : {
            freeFireUid:
              registration.gameUid,
          };

    const existingGameUid =
      await User.findOne(
        gameUidQuery
      );

    if (existingGameUid) {
      return res.status(409).json({
        success: false,
        message:
          `${registration.game} UID is already registered.`,
      });
    }

    // ==================================================
    // CREATE USER
    // ==================================================

    const user = new User({
      fullName:
        registration.fullName,

      username:
        registration.username,

      mobile:
        registration.mobile,

      email:
        registration.email,

      game:
        registration.game,

      gameUid:
        registration.gameUid,

      upiId:
        registration.upiId,

      termsAccepted:
        registration.termsAccepted,

      role: "user",
    });

    // ==================================================
    // CREATE PASSWORD
    // ==================================================

    const registeredUser =
      await User.register(
        user,
        registration.password
      );

    console.log(
      "USER CREATED:",
      registeredUser.username
    );

    // ==================================================
    // REMOVE TEMP REGISTRATION DATA
    // ==================================================

    registrationSession.session.pendingRegistration =
      undefined;

    try {
      await saveRegistrationSession(
        req,
        registrationSession
      );
    } catch (cleanupError) {
      console.error(
        "Temporary registration cleanup error:",
        cleanupError
      );
    }

    // ==================================================
    // LOGIN USER
    // ==================================================

    req.login(
      registeredUser,
      async (loginError) => {
        if (loginError) {
          console.error(
            "Auto login error:",
            loginError
          );

          return res.status(500).json({
            success: false,
            message:
              "Account created but automatic login failed.",
          });
        }

        // ==================================================
        // SAVE LOGIN SESSION
        // ==================================================

        req.session.save(
          (sessionError) => {
            if (sessionError) {
              console.error(
                "Login session save error:",
                sessionError
              );

              return res.status(500).json({
                success: false,
                message:
                  "Account created but session could not be saved.",
              });
            }

            console.log(
              "======================================"
            );

            console.log(
              "USER CREATED SUCCESSFULLY"
            );

            console.log(
              "USERNAME:",
              registeredUser.username
            );

            console.log(
              "MOBILE VERIFIED"
            );

            console.log(
              "======================================"
            );

            return res.status(200).json({
              success: true,
              message:
                "Account created and mobile verified successfully.",
              user:
                getUserData(
                  registeredUser
                ),
            });
          }
        );
      }
    );
  } catch (error) {
    console.error(
      "OTP verification error:",
      error
    );

    if (
      error &&
      error.code === 11000
    ) {
      return res.status(409).json({
        success: false,
        message:
          "Username, email, mobile, or game UID already exists.",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "OTP verification failed. Please try again.",
    });
  }
});

// ======================================================
// LOGIN
// POST /api/auth/login
// ======================================================

router.post(
  "/login",
  (req, res, next) => {
    passport.authenticate(
      "local",
      (err, user, info) => {
        if (err) {
          return next(err);
        }

        if (!user) {
          return res.status(401).json({
            success: false,
            message:
              info?.message ||
              "Invalid username or password.",
          });
        }

        req.logIn(
          user,
          (loginError) => {
            if (loginError) {
              return next(loginError);
            }

            req.session.save(
              (sessionError) => {
                if (sessionError) {
                  return next(
                    sessionError
                  );
                }

                return res.status(200).json({
                  success: true,
                  message:
                    "Login successful",
                  user:
                    getUserData(user),
                });
              }
            );
          }
        );
      }
    )(req, res, next);
  }
);

// ======================================================
// CURRENT USER
// GET /api/auth/me
// ======================================================

router.get(
  "/me",
  (req, res) => {
    if (
      !req.isAuthenticated ||
      !req.isAuthenticated()
    ) {
      return res.status(401).json({
        success: false,
        authenticated: false,
        message:
          "Not authenticated.",
        user: null,
      });
    }

    return res.status(200).json({
      success: true,
      authenticated: true,
      user:
        getUserData(req.user),
    });
  }
);

// ======================================================
// CURRENT USER COMPATIBILITY
// GET /api/auth/current-user
// ======================================================

router.get(
  "/current-user",
  (req, res) => {
    if (
      !req.isAuthenticated ||
      !req.isAuthenticated()
    ) {
      return res.status(401).json({
        success: false,
        authenticated: false,
        user: null,
      });
    }

    return res.status(200).json({
      success: true,
      authenticated: true,
      user:
        getUserData(req.user),
    });
  }
);

// ======================================================
// PROFILE
// GET /api/auth/profile
// ======================================================

router.get(
  "/profile",
  (req, res) => {
    if (
      !req.isAuthenticated ||
      !req.isAuthenticated()
    ) {
      return res.status(401).json({
        success: false,
        message:
          "You must be logged in.",
        user: null,
      });
    }

    return res.status(200).json({
      success: true,
      user:
        getUserData(req.user),
    });
  }
);

// ======================================================
// UPDATE PROFILE
// PATCH /api/auth/profile
// ======================================================

router.patch(
  "/profile",
  async (req, res, next) => {
    try {
      if (
        !req.isAuthenticated ||
        !req.isAuthenticated()
      ) {
        return res.status(401).json({
          success: false,
          message:
            "You must be logged in.",
        });
      }

      const user = req.user;

      const {
        fullName,
        username,
        email,
        mobile,
        upiId,
      } = req.body;

      // FULL NAME
      if (fullName !== undefined) {
        const cleanFullName =
          String(fullName).trim();

        if (cleanFullName.length < 3) {
          return res.status(400).json({
            success: false,
            message:
              "Full name must contain at least 3 characters.",
          });
        }

        user.fullName =
          cleanFullName;
      }

      // USERNAME
      if (username !== undefined) {
        const cleanUsername =
          String(username)
            .trim()
            .toLowerCase();

        if (cleanUsername.length < 3) {
          return res.status(400).json({
            success: false,
            message:
              "Username must contain at least 3 characters.",
          });
        }

        const existingUsername =
          await User.findOne({
            username:
              cleanUsername,
            _id: {
              $ne: user._id,
            },
          });

        if (existingUsername) {
          return res.status(409).json({
            success: false,
            message:
              "Username already exists.",
          });
        }

        user.username =
          cleanUsername;
      }

      // EMAIL
      if (email !== undefined) {
        const cleanEmail =
          String(email)
            .trim()
            .toLowerCase();

        if (
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
            cleanEmail
          )
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Please enter a valid email address.",
          });
        }

        const existingEmail =
          await User.findOne({
            email:
              cleanEmail,
            _id: {
              $ne: user._id,
            },
          });

        if (existingEmail) {
          return res.status(409).json({
            success: false,
            message:
              "Email already exists.",
          });
        }

        user.email =
          cleanEmail;
      }

      // MOBILE
      if (mobile !== undefined) {
        const cleanMobile =
          String(mobile).trim();

        if (
          !/^[6-9][0-9]{9}$/.test(
            cleanMobile
          )
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Invalid mobile number.",
          });
        }

        const existingMobile =
          await User.findOne({
            mobile:
              cleanMobile,
            _id: {
              $ne: user._id,
            },
          });

        if (existingMobile) {
          return res.status(409).json({
            success: false,
            message:
              "Mobile number already exists.",
          });
        }

        user.mobile =
          cleanMobile;
      }

      // UPI ID
      if (upiId !== undefined) {
        const cleanUpiId =
          String(upiId)
            .trim()
            .toLowerCase();

        if (
          cleanUpiId &&
          !/^[\w.-]+@[\w.-]+$/.test(
            cleanUpiId
          )
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Please enter a valid UPI ID.",
          });
        }

        user.upiId =
          cleanUpiId;
      }

      await user.save();

      return res.status(200).json({
        success: true,
        message:
          "Profile updated successfully.",
        user:
          getUserData(user),
      });
    } catch (error) {
      console.error(
        "Profile update error:",
        error
      );

      return next(error);
    }
  }
);

// ======================================================
// UPDATE GAME UID
// PATCH /api/auth/game-uid
// ======================================================

router.patch(
  "/game-uid",
  async (req, res, next) => {
    try {
      if (
        !req.isAuthenticated ||
        !req.isAuthenticated()
      ) {
        return res.status(401).json({
          success: false,
          message:
            "You must be logged in.",
        });
      }

      const {
        game,
        gameUid,
      } = req.body;

      if (!game) {
        return res.status(400).json({
          success: false,
          message:
            "Game is required.",
        });
      }

      if (
        !["BGMI", "Free Fire"].includes(
          game
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Game must be BGMI or Free Fire.",
        });
      }

      if (
        gameUid === undefined ||
        gameUid === null
      ) {
        return res.status(400).json({
          success: false,
          message:
            `${game} UID is required.`,
        });
      }

      const cleanUid =
        String(gameUid).trim();

      if (!cleanUid) {
        return res.status(400).json({
          success: false,
          message:
            `${game} UID cannot be empty.`,
        });
      }

      const user = req.user;

      const uidQuery =
        game === "BGMI"
          ? {
              bgmiUid:
                cleanUid,
            }
          : {
              freeFireUid:
                cleanUid,
            };

      const existingUser =
        await User.findOne({
          ...uidQuery,
          _id: {
            $ne: user._id,
          },
        });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message:
            `${game} UID is already registered to another user.`,
        });
      }

      if (game === "BGMI") {
        user.bgmiUid =
          cleanUid;
      }

      if (game === "Free Fire") {
        user.freeFireUid =
          cleanUid;
      }

      if (user.game === game) {
        user.gameUid =
          cleanUid;
      }

      await user.save();

      return res.status(200).json({
        success: true,
        message:
          `${game} UID updated successfully.`,
        user:
          getUserData(user),
      });
    } catch (error) {
      console.error(
        "Game UID update error:",
        error
      );

      return next(error);
    }
  }
);

// ======================================================
// FORGOT PASSWORD - SEND OTP
// POST /api/auth/forgot-password/send-otp
// ======================================================

router.post(
  "/forgot-password/send-otp",
  async (req, res) => {
    try {
      const { mobile } = req.body;

      if (
        !mobile ||
        !/^[6-9][0-9]{9}$/.test(
          String(mobile).trim()
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Please enter a valid 10-digit mobile number.",
        });
      }

      const cleanMobile =
        String(mobile).trim();

      const user =
        await User.findOne({
          mobile: cleanMobile,
        });

      if (!user) {
        return res.status(404).json({
          success: false,
          message:
            "No account found with this mobile number.",
        });
      }

      const hanuOtpApiKey =
        process.env.HANUOTP_API_KEY;

      if (!hanuOtpApiKey) {
        return res.status(500).json({
          success: false,
          message:
            "OTP service is not configured.",
        });
      }

      const otp =
        generateOtp();

      // Create/reset forgot-password session
      req.session.forgotPassword = {
        userId: user._id.toString(),
        mobile: cleanMobile,
        otp: otp,
        otpExpiresAt:
          Date.now() + 10 * 60 * 1000,
        otpAttempts: 0,
        verified: false,
      };

      // IMPORTANT:
      // Save session before sending OTP.
      await new Promise((resolve, reject) => {
        req.session.save((error) => {
          if (error) {
            return reject(error);
          }

          resolve();
        });
      });

      console.log("");
      console.log("======================================");
      console.log("FORGOT PASSWORD OTP");
      console.log("======================================");
      console.log(
        "Mobile:",
        cleanMobile
      );
      console.log(
        "Session ID:",
        req.sessionID
      );
      console.log(
        "OTP:",
        otp
      );
      console.log(
        "======================================");

      try {
        const response =
          await axios.get(
            "https://api.hanuotp.in/sms-otp.php",
            {
              params: {
                number:
                  cleanMobile,
                OTP: otp,
                apikey:
                  hanuOtpApiKey,
                templatesid:
                  "default",
              },
              timeout: 15000,
            }
          );

        console.log(
          "Forgot password HanuOTP:",
          response.data
        );

        if (
          response.data &&
          response.data.status ===
            "success"
        ) {
          return res.status(200).json({
            success: true,
            message:
              "OTP sent successfully.",
          });
        }

        delete req.session
          .forgotPassword;

        await new Promise((resolve) => {
          req.session.save(() =>
            resolve()
          );
        });

        return res.status(400).json({
          success: false,
          message:
            response.data?.message ||
            "Unable to send OTP. Please try again.",
        });
      } catch (otpError) {
        console.error(
          "Forgot password OTP error:",
          otpError.response?.data ||
            otpError.message
        );

        delete req.session
          .forgotPassword;

        await new Promise((resolve) => {
          req.session.save(() =>
            resolve()
          );
        });

        return res.status(502).json({
          success: false,
          message:
            "Unable to send OTP. Please try again.",
        });
      }
    } catch (error) {
      console.error(
        "Forgot password send OTP error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to send OTP.",
      });
    }
  }
);

// ======================================================
// FORGOT PASSWORD - VERIFY OTP
// POST /api/auth/forgot-password/verify-otp
// ======================================================

router.post(
  "/forgot-password/verify-otp",
  async (req, res) => {
    try {
      // ------------------------------------------------
      // IMPORTANT:
      // Frontend sends "otp".
      // Also accept "mobileOtp" for compatibility.
      // ------------------------------------------------

      const mobileOtp =
        req.body.otp ||
        req.body.mobileOtp;

      if (!mobileOtp) {
        return res.status(400).json({
          success: false,
          message:
            "OTP is required.",
        });
      }

      const cleanOtp =
        String(mobileOtp).trim();

      if (!/^\d{6}$/.test(cleanOtp)) {
        return res.status(400).json({
          success: false,
          message:
            "Please enter a valid 6-digit OTP.",
        });
      }

      // ------------------------------------------------
      // GET FORGOT PASSWORD SESSION
      // ------------------------------------------------

      const resetData =
        req.session.forgotPassword;

      console.log("");
      console.log("======================================");
      console.log(
        "FORGOT PASSWORD OTP VERIFICATION"
      );
      console.log("======================================");
      console.log(
        "Current Session ID:",
        req.sessionID
      );
      console.log(
        "Reset Session Exists:",
        !!resetData
      );

      if (!resetData) {
        console.error(
          "Forgot password session NOT FOUND."
        );

        return res.status(404).json({
          success: false,
          message:
            "Password reset session expired. Please request a new OTP.",
        });
      }

      // ------------------------------------------------
      // CHECK EXPIRY
      // ------------------------------------------------

      if (
        !resetData.otpExpiresAt ||
        resetData.otpExpiresAt <
          Date.now()
      ) {
        console.error(
          "Forgot password OTP expired."
        );

        delete req.session
          .forgotPassword;

        return req.session.save(() => {
          return res.status(400).json({
            success: false,
            message:
              "OTP has expired. Please request a new OTP.",
          });
        });
      }

      // ------------------------------------------------
      // CHECK ATTEMPTS
      // ------------------------------------------------

      if (
        Number(
          resetData.otpAttempts || 0
        ) >= 5
      ) {
        delete req.session
          .forgotPassword;

        return req.session.save(() => {
          return res.status(429).json({
            success: false,
            message:
              "Maximum OTP attempts exceeded. Please request a new OTP.",
          });
        });
      }

      // ------------------------------------------------
      // CHECK OTP
      // ------------------------------------------------

      console.log(
        "Stored OTP:",
        resetData.otp
      );

      console.log(
        "Received OTP:",
        cleanOtp
      );

      if (
        String(resetData.otp) !==
        cleanOtp
      ) {
        resetData.otpAttempts =
          Number(
            resetData.otpAttempts || 0
          ) + 1;

        req.session.forgotPassword =
          resetData;

        return req.session.save(() => {
          return res.status(400).json({
            success: false,
            message:
              "Invalid OTP.",
          });
        });
      }

      // ------------------------------------------------
      // OTP VERIFIED
      // ------------------------------------------------

      req.session.forgotPassword.verified =
        true;

      // ------------------------------------------------
      // SAVE VERIFIED SESSION
      // ------------------------------------------------

      return req.session.save(
        (sessionError) => {
          if (sessionError) {
            console.error(
              "Forgot password verified session save error:",
              sessionError
            );

            return res.status(500).json({
              success: false,
              message:
                "Unable to create password reset session.",
            });
          }

          console.log(
            "OTP VERIFIED SUCCESSFULLY"
          );

          console.log(
            "Reset Session ID:",
            req.sessionID
          );

          console.log(
            "======================================"
          );

          // IMPORTANT:
          // Frontend expects resetToken.
          // We return the current session ID.
          return res.status(200).json({
            success: true,
            message:
              "OTP verified successfully.",
            resetToken:
              req.sessionID,
          });
        }
      );
    } catch (error) {
      console.error(
        "Forgot password verify OTP error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "OTP verification failed.",
      });
    }
  }
);

// ======================================================
// FORGOT PASSWORD - RESET PASSWORD
// POST /api/auth/forgot-password/reset
// ======================================================

router.post(
  "/forgot-password/reset",
  async (req, res) => {
    try {
      // ------------------------------------------------
      // IMPORTANT:
      // Frontend sends "newPassword".
      // Also accept "password" for compatibility.
      // ------------------------------------------------

      const password =
        req.body.newPassword ||
        req.body.password;

      const resetToken =
        req.body.resetToken;

      console.log("");
      console.log("======================================");
      console.log(
        "FORGOT PASSWORD RESET REQUEST"
      );
      console.log("======================================");

      // ------------------------------------------------
      // PASSWORD VALIDATION
      // ------------------------------------------------

      if (
        !password ||
        String(password).length < 6
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Password must be at least 6 characters.",
        });
      }

      // ------------------------------------------------
      // RESET TOKEN CHECK
      // ------------------------------------------------

      if (
        resetToken &&
        String(resetToken) !==
          String(req.sessionID)
      ) {
        console.error(
          "Invalid reset token."
        );

        return res.status(401).json({
          success: false,
          message:
            "Invalid password reset session. Please request a new OTP.",
        });
      }

      // ------------------------------------------------
      // GET RESET SESSION
      // ------------------------------------------------

      const resetData =
        req.session.forgotPassword;

      if (
        !resetData ||
        !resetData.verified
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Please verify OTP first.",
        });
      }

      // ------------------------------------------------
      // CHECK RESET SESSION EXPIRY
      // ------------------------------------------------

      if (
        !resetData.otpExpiresAt ||
        resetData.otpExpiresAt <
          Date.now()
      ) {
        delete req.session
          .forgotPassword;

        return req.session.save(() => {
          return res.status(400).json({
            success: false,
            message:
              "Password reset session expired. Please request a new OTP.",
          });
        });
      }

      // ------------------------------------------------
      // FIND USER
      // ------------------------------------------------

      const user =
        await User.findById(
          resetData.userId
        );

      if (!user) {
        return res.status(404).json({
          success: false,
          message:
            "User not found.",
        });
      }

      // ------------------------------------------------
      // SET NEW PASSWORD
      // ------------------------------------------------

      await user.setPassword(
        String(password)
      );

      await user.save();

      // ------------------------------------------------
      // REMOVE RESET DATA
      // ------------------------------------------------

      delete req.session
        .forgotPassword;

      // ------------------------------------------------
      // SAVE SESSION
      // ------------------------------------------------

      return req.session.save(
        (sessionError) => {
          if (sessionError) {
            console.error(
              "Forgot password session cleanup error:",
              sessionError
            );

            return res.status(500).json({
              success: false,
              message:
                "Password changed but reset session cleanup failed.",
            });
          }

          console.log(
            "PASSWORD RESET SUCCESSFULLY"
          );

          console.log(
            "User:",
            user.username
          );

          console.log(
            "======================================"
          );

          return res.status(200).json({
            success: true,
            message:
              "Password reset successfully.",
          });
        }
      );
    } catch (error) {
      console.error(
        "Forgot password reset error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to reset password.",
      });
    }
  }
);

// ======================================================
// LOGOUT
// POST /api/auth/logout
// ======================================================

router.post(
  "/logout",
  (req, res, next) => {
    req.logout(
      (logoutError) => {
        if (logoutError) {
          return next(logoutError);
        }

        if (!req.session) {
          return res.status(200).json({
            success: true,
            message:
              "Logged out successfully.",
          });
        }

        req.session.destroy(
          (sessionError) => {
            if (sessionError) {
              console.error(
                "Session destroy error:",
                sessionError
              );

              return next(
                sessionError
              );
            }

            res.clearCookie(
              "connect.sid"
            );

            return res.status(200).json({
              success: true,
              message:
                "Logged out successfully.",
            });
          }
        );
      }
    );
  }
);

// ======================================================
// EXPORT
// ======================================================

module.exports = router;