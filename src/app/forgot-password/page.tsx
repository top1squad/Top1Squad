"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

// ======================================================
// API URL
// ======================================================

const RAW_API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

const API_URL = RAW_API_URL.replace(/\/+$/, "");

// ======================================================
// STEP
// ======================================================

type Step = "mobile" | "otp" | "password" | "success";

// ======================================================
// PAGE
// ======================================================

export default function ForgotPasswordPage() {
  // ====================================================
  // CURRENT STEP
  // ====================================================

  const [step, setStep] = useState<Step>("mobile");

  // ====================================================
  // MOBILE
  // ====================================================

  const [mobile, setMobile] = useState("");

  // ====================================================
  // OTP
  // ====================================================

  const [otpDigits, setOtpDigits] = useState<string[]>([
    "",
    "",
    "",
    "",
    "",
    "",
  ]);

  // ====================================================
  // PASSWORD
  // ====================================================

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // ====================================================
  // RESET TOKEN
  // ====================================================

  const [resetToken, setResetToken] = useState("");

  // ====================================================
  // UI
  // ====================================================

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // ====================================================
  // PASSWORD VISIBILITY
  // ====================================================

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  // ====================================================
  // OTP TIMER
  // ====================================================

  const [otpTimer, setOtpTimer] = useState(60);

  // ====================================================
  // OTP COUNTDOWN
  // ====================================================

  useEffect(() => {
    if (step !== "otp" || otpTimer <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setOtpTimer((previous) => {
        if (previous <= 1) {
          return 0;
        }

        return previous - 1;
      });
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [step, otpTimer]);

  // ====================================================
  // VALIDATE MOBILE
  // ====================================================

  function isValidMobile(value: string) {
    return /^[6-9]\d{9}$/.test(value);
  }

  // ====================================================
  // EXTRACT RESET TOKEN
  // ====================================================

  function extractResetToken(data: any): string {
    return (
      data?.resetToken ||
      data?.data?.resetToken ||
      data?.result?.resetToken ||
      data?.token ||
      data?.data?.token ||
      data?.result?.token ||
      ""
    );
  }

  // ====================================================
  // SEND OTP
  // ====================================================

  async function handleSendOTP(event?: FormEvent) {
    event?.preventDefault();

    setError("");
    setMessage("");

    const cleanMobile = mobile.trim();

    if (!cleanMobile) {
      setError("Please enter your mobile number.");
      return;
    }

    if (!isValidMobile(cleanMobile)) {
      setError(
        "Enter a valid 10-digit Indian mobile number."
      );
      return;
    }

    setLoading(true);

    try {
      console.log(
        "======================================"
      );
      console.log("FORGOT PASSWORD SEND OTP");
      console.log(
        "======================================"
      );
      console.log("Mobile:", cleanMobile);

      const response = await fetch(
        `${API_URL}/api/auth/forgot-password/send-otp`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          credentials: "include",

          body: JSON.stringify({
            mobile: cleanMobile,
          }),
        }
      );

      let data: any = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      console.log(
        "Forgot password send OTP response:",
        data
      );

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Unable to send OTP."
        );
      }

      // ==================================================
      // GET RESET TOKEN
      // ==================================================

      const receivedResetToken =
        extractResetToken(data);

      console.log(
        "Reset Token received:",
        receivedResetToken
          ? "YES"
          : "NO"
      );

      // ==================================================
      // IMPORTANT
      // ==================================================
      //
      // The backend MUST return resetToken if the
      // verify-otp endpoint requires it in the body.
      //
      // ==================================================

      if (!receivedResetToken) {
        console.error(
          "Backend did not return resetToken.",
          data
        );

        throw new Error(
          "Password reset token was not received from the server. Please check the backend send-otp response."
        );
      }

      // ==================================================
      // SAVE MOBILE
      // ==================================================

      setMobile(cleanMobile);

      // ==================================================
      // SAVE RESET TOKEN
      // ==================================================

      setResetToken(receivedResetToken);

      // ==================================================
      // CLEAR OLD OTP
      // ==================================================

      setOtpDigits([
        "",
        "",
        "",
        "",
        "",
        "",
      ]);

      // ==================================================
      // RESET TIMER
      // ==================================================

      setOtpTimer(60);

      // ==================================================
      // MESSAGE
      // ==================================================

      setMessage(
        data?.message ||
          "OTP sent successfully."
      );

      // ==================================================
      // MOVE TO OTP
      // ==================================================

      setStep("otp");

      // ==================================================
      // FOCUS OTP
      // ==================================================

      window.setTimeout(() => {
        document
          .getElementById("otp-0")
          ?.focus();
      }, 100);
    } catch (error) {
      console.error(
        "Forgot password send OTP error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Unable to send OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  // ====================================================
  // OTP CHANGE
  // ====================================================

  function handleOtpChange(
    index: number,
    value: string
  ) {
    const numbersOnly = value.replace(
      /\D/g,
      ""
    );

    // ==================================================
    // PASTE 6 DIGIT OTP
    // ==================================================

    if (numbersOnly.length > 1) {
      const pastedDigits = numbersOnly
        .slice(0, 6)
        .split("");

      const updated = [
        "",
        "",
        "",
        "",
        "",
        "",
      ];

      pastedDigits.forEach((digit, i) => {
        updated[i] = digit;
      });

      setOtpDigits(updated);

      const focusIndex = Math.min(
        pastedDigits.length,
        5
      );

      document
        .getElementById(`otp-${focusIndex}`)
        ?.focus();

      return;
    }

    // ==================================================
    // SINGLE DIGIT
    // ==================================================

    const digit = numbersOnly.slice(-1);

    const updated = [...otpDigits];

    updated[index] = digit;

    setOtpDigits(updated);

    if (digit && index < 5) {
      document
        .getElementById(`otp-${index + 1}`)
        ?.focus();
    }
  }

  // ====================================================
  // OTP KEYBOARD
  // ====================================================

  function handleOtpKeyDown(
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>
  ) {
    if (
      event.key === "Backspace" &&
      !otpDigits[index] &&
      index > 0
    ) {
      document
        .getElementById(`otp-${index - 1}`)
        ?.focus();
    }

    if (
      event.key === "ArrowLeft" &&
      index > 0
    ) {
      document
        .getElementById(`otp-${index - 1}`)
        ?.focus();
    }

    if (
      event.key === "ArrowRight" &&
      index < 5
    ) {
      document
        .getElementById(`otp-${index + 1}`)
        ?.focus();
    }
  }

  // ====================================================
  // VERIFY OTP
  // ====================================================

  async function handleVerifyOTP(
    event: FormEvent
  ) {
    event.preventDefault();

    setError("");
    setMessage("");

    const otp = otpDigits.join("");

    if (!/^\d{6}$/.test(otp)) {
      setError(
        "Please enter the complete 6-digit OTP."
      );
      return;
    }

    // ==================================================
    // TOKEN REQUIRED
    // ==================================================

    if (!resetToken) {
      console.error(
        "VERIFY OTP: resetToken missing"
      );

      setError(
        "Your password reset session is missing. Please request a new OTP."
      );

      return;
    }

    setLoading(true);

    try {
      console.log(
        "======================================"
      );
      console.log(
        "FORGOT PASSWORD OTP VERIFICATION"
      );
      console.log(
        "======================================"
      );

      console.log(
        "Mobile:",
        mobile
      );

      console.log(
        "OTP:",
        otp
      );

      console.log(
        "Reset Token received:",
        resetToken
          ? "YES"
          : "NO"
      );

      const response = await fetch(
        `${API_URL}/api/auth/forgot-password/verify-otp`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          credentials: "include",

          body: JSON.stringify({
            mobile: mobile.trim(),
            otp,
            resetToken,
          }),
        }
      );

      let data: any = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      console.log(
        "Verify OTP response:",
        data
      );

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "OTP verification failed."
        );
      }

      // ==================================================
      // BACKEND MAY RETURN NEW RESET TOKEN
      // ==================================================

      const newResetToken =
        extractResetToken(data);

      if (newResetToken) {
        console.log(
          "New reset token received from verify OTP."
        );

        setResetToken(newResetToken);
      }

      // ==================================================
      // KEEP EXISTING TOKEN IF BACKEND DOES NOT RETURN
      // ONE
      // ==================================================

      if (!newResetToken) {
        console.log(
          "Verify OTP did not return a new token."
        );

        console.log(
          "Keeping existing reset token."
        );
      }

      setMessage(
        data?.message ||
          "OTP verified successfully."
      );

      setStep("password");
    } catch (error) {
      console.error(
        "OTP verification error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "OTP verification failed."
      );
    } finally {
      setLoading(false);
    }
  }

  // ====================================================
  // RESEND OTP
  // ====================================================

  async function handleResendOTP() {
    if (otpTimer > 0 || loading) {
      return;
    }

    setError("");
    setMessage("");

    await handleSendOTP();
  }

  // ====================================================
  // RESET PASSWORD
  // ====================================================

  async function handleResetPassword(
    event: FormEvent
  ) {
    event.preventDefault();

    setError("");
    setMessage("");

    // ==================================================
    // VALIDATION
    // ==================================================

    if (!newPassword) {
      setError(
        "Please enter a new password."
      );
      return;
    }

    if (newPassword.length < 6) {
      setError(
        "Password must be at least 6 characters."
      );
      return;
    }

    if (!confirmPassword) {
      setError(
        "Please confirm your password."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(
        "Passwords do not match."
      );
      return;
    }

    // ==================================================
    // TOKEN REQUIRED
    // ==================================================

    if (!resetToken) {
      setError(
        "Your password reset session is invalid. Please request a new OTP."
      );

      setStep("mobile");

      return;
    }

    setLoading(true);

    try {
      console.log(
        "======================================"
      );
      console.log(
        "FORGOT PASSWORD RESET"
      );
      console.log(
        "======================================"
      );

      console.log(
        "Reset Token received:",
        resetToken
          ? "YES"
          : "NO"
      );

      const response = await fetch(
        `${API_URL}/api/auth/forgot-password/reset`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          credentials: "include",

          body: JSON.stringify({
            resetToken,
            newPassword,
          }),
        }
      );

      let data: any = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      console.log(
        "Reset password response:",
        data
      );

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Unable to reset password."
        );
      }

      // ==================================================
      // CLEAR SENSITIVE DATA
      // ==================================================

      setNewPassword("");
      setConfirmPassword("");
      setResetToken("");

      setOtpDigits([
        "",
        "",
        "",
        "",
        "",
        "",
      ]);

      setMessage("");

      setStep("success");
    } catch (error) {
      console.error(
        "Password reset error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Unable to reset password."
      );
    } finally {
      setLoading(false);
    }
  }

  // ====================================================
  // CHANGE MOBILE
  // ====================================================

  function handleChangeMobile() {
    setError("");
    setMessage("");

    setOtpDigits([
      "",
      "",
      "",
      "",
      "",
      "",
    ]);

    setResetToken("");

    setOtpTimer(60);

    setStep("mobile");
  }

  // ====================================================
  // MASK MOBILE
  // ====================================================

  function maskedMobile() {
    if (mobile.length !== 10) {
      return mobile;
    }

    return `******${mobile.slice(-4)}`;
  }

  // ====================================================
  // STEP NUMBER
  // ====================================================

  function getStepNumber() {
    if (step === "mobile") {
      return 1;
    }

    if (step === "otp") {
      return 2;
    }

    if (step === "password") {
      return 3;
    }

    return 4;
  }

  // ====================================================
  // RESET EVERYTHING
  // ====================================================

  function startAgain() {
    setMobile("");

    setOtpDigits([
      "",
      "",
      "",
      "",
      "",
      "",
    ]);

    setNewPassword("");
    setConfirmPassword("");
    setResetToken("");

    setError("");
    setMessage("");

    setOtpTimer(60);

    setStep("mobile");
  }

  // ====================================================
  // RENDER
  // ====================================================

  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4 py-10">
      {/* Background */}

      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />

        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-purple-600/20 blur-3xl" />
      </div>

      {/* Card */}

      <div className="relative w-full max-w-md">
        <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-6 shadow-2xl backdrop-blur-xl sm:p-8">
          {/* Header */}

          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-600/30">
              {step === "success" ? (
                <svg
                  className="h-7 w-7"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path
                    d="M5 12l4 4L19 6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <svg
                  className="h-7 w-7"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <rect
                    x="3"
                    y="11"
                    width="18"
                    height="10"
                    rx="2"
                  />

                  <path
                    d="M7 11V8a5 5 0 0110 0v3"
                    strokeLinecap="round"
                  />
                </svg>
              )}
            </div>

            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {step === "mobile" &&
                "Forgot Password"}

              {step === "otp" &&
                "Verify OTP"}

              {step === "password" &&
                "Create New Password"}

              {step === "success" &&
                "Password Updated"}
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              {step === "mobile" &&
                "Enter your registered mobile number to reset your password."}

              {step === "otp" &&
                `We sent a 6-digit OTP to ${maskedMobile()}.`}

              {step === "password" &&
                "Your mobile number has been verified. Create a new password."}

              {step === "success" &&
                "Your password has been changed successfully."}
            </p>
          </div>

          {/* Progress */}

          {step !== "success" && (
            <div className="mb-8">
              <div className="flex items-center justify-between">
                {[1, 2, 3].map((number) => {
                  const active =
                    getStepNumber() >= number;

                  return (
                    <div
                      key={number}
                      className="flex flex-1 items-center last:flex-none"
                    >
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition ${
                          active
                            ? "bg-blue-600 text-white"
                            : "bg-white/10 text-slate-500"
                        }`}
                      >
                        {number}
                      </div>

                      {number < 3 && (
                        <div
                          className={`mx-2 h-px flex-1 transition ${
                            getStepNumber() >
                            number
                              ? "bg-blue-600"
                              : "bg-white/10"
                          }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ERROR */}

          {error && (
            <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              <div className="flex gap-2">
                <svg
                  className="mt-0.5 h-5 w-5 shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="9"
                  />

                  <path
                    d="M12 8v4"
                    strokeLinecap="round"
                  />

                  <path
                    d="M12 16h.01"
                    strokeLinecap="round"
                  />
                </svg>

                <span>{error}</span>
              </div>
            </div>
          )}

          {/* MESSAGE */}

          {message && step !== "success" && (
            <div className="mb-5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
              {message}
            </div>
          )}

          {/* ==================================================
              MOBILE
          ================================================== */}

          {step === "mobile" && (
            <form
              onSubmit={handleSendOTP}
              className="space-y-5"
            >
              <div>
                <label
                  htmlFor="mobile"
                  className="mb-2 block text-sm font-medium text-slate-200"
                >
                  Mobile Number
                </label>

                <div className="flex overflow-hidden rounded-xl border border-white/10 bg-black/20 transition focus-within:border-blue-500">
                  <div className="flex items-center border-r border-white/10 px-4 text-sm text-slate-400">
                    +91
                  </div>

                  <input
                    id="mobile"
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    autoComplete="tel"
                    placeholder="9876543210"
                    value={mobile}
                    onChange={(event) =>
                      setMobile(
                        event.target.value
                          .replace(/\D/g, "")
                          .slice(0, 10)
                      )
                    }
                    className="w-full bg-transparent px-4 py-3.5 text-white outline-none placeholder:text-slate-600"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center rounded-xl bg-blue-600 px-5 py-3.5 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <span className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                    Sending OTP...
                  </>
                ) : (
                  "Send OTP"
                )}
              </button>

              <div className="text-center">
                <Link
                  href="/login"
                  className="text-sm font-medium text-slate-400 transition hover:text-white"
                >
                  ← Back to Login
                </Link>
              </div>
            </form>
          )}

          {/* ==================================================
              OTP
          ================================================== */}

          {step === "otp" && (
            <form
              onSubmit={handleVerifyOTP}
              className="space-y-6"
            >
              <div>
                <label className="mb-3 block text-center text-sm font-medium text-slate-300">
                  Enter OTP
                </label>

                <div className="flex justify-center gap-2 sm:gap-3">
                  {otpDigits.map(
                    (digit, index) => (
                      <input
                        key={index}
                        id={`otp-${index}`}
                        type="text"
                        inputMode="numeric"
                        autoComplete={
                          index === 0
                            ? "one-time-code"
                            : "off"
                        }
                        maxLength={1}
                        value={digit}
                        onChange={(event) =>
                          handleOtpChange(
                            index,
                            event.target.value
                          )
                        }
                        onKeyDown={(event) =>
                          handleOtpKeyDown(
                            index,
                            event
                          )
                        }
                        className="h-12 w-10 rounded-xl border border-white/10 bg-black/20 text-center text-lg font-bold text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 sm:h-14 sm:w-12"
                      />
                    )
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={
                  loading ||
                  otpDigits.join("").length !== 6
                }
                className="flex w-full items-center justify-center rounded-xl bg-blue-600 px-5 py-3.5 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <span className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                    Verifying...
                  </>
                ) : (
                  "Verify OTP"
                )}
              </button>

              <div className="text-center text-sm">
                {otpTimer > 0 ? (
                  <p className="text-slate-500">
                    Resend OTP{" "}
                    <span className="font-semibold text-slate-300">
                      in {otpTimer}s
                    </span>
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={loading}
                    className="font-semibold text-blue-400 hover:text-blue-300 disabled:opacity-50"
                  >
                    Resend OTP
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={handleChangeMobile}
                className="w-full text-sm text-slate-500 transition hover:text-white"
              >
                ← Change mobile number
              </button>
            </form>
          )}

          {/* ==================================================
              PASSWORD
          ================================================== */}

          {step === "password" && (
            <form
              onSubmit={handleResetPassword}
              className="space-y-5"
            >
              {/* New Password */}

              <div>
                <label
                  htmlFor="newPassword"
                  className="mb-2 block text-sm font-medium text-slate-200"
                >
                  New Password
                </label>

                <div className="relative">
                  <input
                    id="newPassword"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    autoComplete="new-password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(event) =>
                      setNewPassword(
                        event.target.value
                      )
                    }
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3.5 pr-12 text-white outline-none placeholder:text-slate-600 transition focus:border-blue-500"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        !showPassword
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-500 hover:text-white"
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword
                      ? "🙈"
                      : "👁"}
                  </button>
                </div>

                <p className="mt-2 text-xs text-slate-500">
                  Password must contain at least 6 characters.
                </p>
              </div>

              {/* Confirm Password */}

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-sm font-medium text-slate-200"
                >
                  Confirm Password
                </label>

                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    autoComplete="new-password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(
                        event.target.value
                      )
                    }
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3.5 pr-12 text-white outline-none placeholder:text-slate-600 transition focus:border-blue-500"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(
                        !showConfirmPassword
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-500 hover:text-white"
                    aria-label={
                      showConfirmPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showConfirmPassword
                      ? "🙈"
                      : "👁"}
                  </button>
                </div>
              </div>

              {/* Match Indicator */}

              {confirmPassword &&
                newPassword && (
                  <div
                    className={`rounded-xl px-4 py-3 text-sm ${
                      newPassword ===
                      confirmPassword
                        ? "bg-emerald-500/10 text-emerald-300"
                        : "bg-red-500/10 text-red-300"
                    }`}
                  >
                    {newPassword ===
                    confirmPassword
                      ? "✓ Passwords match"
                      : "✕ Passwords do not match"}
                  </div>
                )}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center rounded-xl bg-blue-600 px-5 py-3.5 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <span className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                    Resetting Password...
                  </>
                ) : (
                  "Reset Password"
                )}
              </button>
            </form>
          )}

          {/* ==================================================
              SUCCESS
          ================================================== */}

          {step === "success" && (
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20">
                  <svg
                    className="h-8 w-8 text-emerald-400"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path
                      d="M5 12l4 4L19 6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>

              <h2 className="mb-3 text-xl font-bold">
                Password Updated
              </h2>

              <div className="mb-7 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
                Password reset successfully.
              </div>

              <Link
                href="/login"
                className="flex w-full items-center justify-center rounded-xl bg-blue-600 px-5 py-3.5 font-semibold text-white transition hover:bg-blue-500"
              >
                Go to Login
              </Link>

              <button
                type="button"
                onClick={startAgain}
                className="mt-4 w-full text-sm text-slate-500 transition hover:text-white"
              >
                Reset another account
              </button>
            </div>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-slate-600">
          Your account security is important to us.
        </p>
      </div>
    </main>
  );
}