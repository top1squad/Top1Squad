require("dotenv").config();

// ======================================================
// HANUOTP CONFIGURATION
// ======================================================

const HANUOTP_API_KEY =
  process.env.HANUOTP_API_KEY || "";

const HANUOTP_BASE_URL =
  "https://api.hanuotp.in";

// ======================================================
// SEND SMS OTP
// ======================================================
//
// HanuOTP expects:
// apikey
// number
// OTP
//
// Example:
// https://api.hanuotp.in/sms-otp.php
//   ?apikey=YOUR_API_KEY
//   &number=919876543210
//   &OTP=123456
//
// Official HanuOTP API documentation:
// https://api.hanuotp.in/
// ======================================================

async function sendHanuOtp(
  mobile,
  otp
) {
  if (!HANUOTP_API_KEY) {
    throw new Error(
      "HANUOTP_API_KEY is not configured in the backend .env file."
    );
  }

  // ----------------------------------------------------
  // Remove anything except digits
  // ----------------------------------------------------

  const cleanMobile =
    String(mobile || "").replace(
      /\D/g,
      ""
    );

  // ----------------------------------------------------
  // India mobile number
  // ----------------------------------------------------

  let hanuNumber = cleanMobile;

  if (hanuNumber.length === 10) {
    hanuNumber = `91${hanuNumber}`;
  }

  // ----------------------------------------------------
  // Validate
  // ----------------------------------------------------

  if (!/^91\d{10}$/.test(hanuNumber)) {
    throw new Error(
      "Invalid Indian mobile number."
    );
  }

  // ----------------------------------------------------
  // Validate OTP
  // ----------------------------------------------------

  if (!/^\d{6}$/.test(String(otp))) {
    throw new Error(
      "OTP must contain exactly 6 digits."
    );
  }

  // ----------------------------------------------------
  // Build URL
  // ----------------------------------------------------

  const url =
    new URL(
      `${HANUOTP_BASE_URL}/sms-otp.php`
    );

  url.searchParams.set(
    "apikey",
    HANUOTP_API_KEY
  );

  url.searchParams.set(
    "number",
    hanuNumber
  );

  url.searchParams.set(
    "OTP",
    String(otp)
  );

  console.log(
    "========================================"
  );

  console.log(
    "HANUOTP SMS REQUEST"
  );

  console.log(
    "Number:",
    hanuNumber
  );

  console.log(
    "OTP:",
    "******"
  );

  console.log(
    "========================================"
  );

  // ----------------------------------------------------
  // Request
  // ----------------------------------------------------

  const response =
    await fetch(
      url.toString(),
      {
        method: "GET",

        headers: {
          Accept:
            "application/json",
        },
      }
    );

  // ----------------------------------------------------
  // Read response
  // ----------------------------------------------------

  const responseText =
    await response.text();

  let data = null;

  try {
    data =
      JSON.parse(
        responseText
      );
  } catch {
    data = {
      raw: responseText,
    };
  }

  console.log(
    "HANUOTP RESPONSE STATUS:",
    response.status
  );

  console.log(
    "HANUOTP RESPONSE:",
    data
  );

  // ----------------------------------------------------
  // HTTP ERROR
  // ----------------------------------------------------

  if (!response.ok) {
    throw new Error(
      data?.message ||
        data?.error ||
        `HanuOTP returned HTTP ${response.status}.`
    );
  }

  // ----------------------------------------------------
  // HANUOTP FAILURE
  // ----------------------------------------------------
  //
  // Successful HanuOTP response contains:
  //
  // {
  //   "return": true,
  //   ...
  // }
  //
  // ----------------------------------------------------

  if (
    data &&
    Object.prototype.hasOwnProperty.call(
      data,
      "return"
    ) &&
    data.return !== true
  ) {
    let message =
      "HanuOTP failed to send the OTP.";

    if (
      Array.isArray(
        data.message
      )
    ) {
      message =
        data.message.join(
          " "
        );
    } else if (
      typeof data.message ===
      "string"
    ) {
      message =
        data.message;
    }

    throw new Error(
      message
    );
  }

  // ----------------------------------------------------
  // SUCCESS
  // ----------------------------------------------------

  return {
    success: true,
    provider: "HanuOTP",
    data,
  };
}

// ======================================================
// EXPORT
// ======================================================

module.exports = {
  sendHanuOtp,
};