"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// ======================================================
// API URL
// ======================================================

const RAW_API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5001";

const API_URL = RAW_API_URL
  .replace(/\/+$/, "")
  .replace(/\/api$/, "");

// ======================================================
// TYPES
// ======================================================

type ResetResponse = {
  success?: boolean;
  message?: string;
};

// ======================================================
// PAGE
// ======================================================

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ====================================================
  // RESET ID
  // ====================================================

  const queryResetId =
    searchParams.get("resetId") || "";

  // ====================================================
  // FORM
  // ====================================================

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  // ====================================================
  // UI
  // ====================================================

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  // ====================================================
  // PASSWORD VALIDATION
  // ====================================================

  const validatePassword = (
    password: string
  ) => {
    if (password.length < 6) {
      return "Password must be at least 6 characters.";
    }

    return "";
  };

  // ====================================================
  // SUBMIT
  // ====================================================

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    // ==================================================
    // GET RESET ID
    // ==================================================

    const storedResetId =
      typeof window !== "undefined"
        ? sessionStorage.getItem(
            "passwordResetId"
          ) || ""
        : "";

    const resetId =
      queryResetId || storedResetId;

    // ==================================================
    // RESET ID REQUIRED
    // ==================================================

    if (!resetId) {
      setError(
        "Password reset session is missing or expired. Please request a new OTP."
      );
      return;
    }

    // ==================================================
    // PASSWORD
    // ==================================================

    const passwordError =
      validatePassword(newPassword);

    if (passwordError) {
      setError(passwordError);
      return;
    }

    // ==================================================
    // CONFIRM PASSWORD
    // ==================================================

    if (!confirmPassword) {
      setError(
        "Please confirm your new password."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(
        "New password and confirm password do not match."
      );
      return;
    }

    setLoading(true);

    try {
      // =================================================
      // RESET PASSWORD
      // =================================================

      const response = await fetch(
        `${API_URL}/api/auth/reset-password`,
        {
          method: "POST",

          credentials: "include",

          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },

          cache: "no-store",

          body: JSON.stringify({
            resetId,
            newPassword,
            confirmPassword,
          }),
        }
      );

      const text =
        await response.text();

      let data: ResetResponse = {};

      try {
        data = JSON.parse(text);
      } catch {
        console.error(
          "RESET PASSWORD API NON-JSON:",
          text
        );
      }

      console.log(
        "RESET PASSWORD RESPONSE:",
        {
          status: response.status,
          data,
        }
      );

      if (
        !response.ok ||
        data.success === false
      ) {
        throw new Error(
          data.message ||
            "Unable to reset password."
        );
      }

      // =================================================
      // REMOVE RESET DATA
      // =================================================

      if (
        typeof window !== "undefined"
      ) {
        sessionStorage.removeItem(
          "passwordResetId"
        );

        sessionStorage.removeItem(
          "passwordResetMobile"
        );
      }

      // =================================================
      // SUCCESS
      // =================================================

      setSuccess(
        "Password changed successfully. Redirecting to login..."
      );

      // =================================================
      // CLEAR FORM
      // =================================================

      setNewPassword("");
      setConfirmPassword("");

      // =================================================
      // REDIRECT
      // =================================================

      setTimeout(() => {
        router.replace("/login");
      }, 1500);
    } catch (error) {
      console.error(
        "RESET PASSWORD ERROR:",
        error
      );

      if (error instanceof TypeError) {
        setError(
          "Cannot connect to backend. Please make sure the backend is running on port 5001."
        );
      } else if (
        error instanceof Error
      ) {
        setError(error.message);
      } else {
        setError(
          "Unable to reset password. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // ====================================================
  // RENDER
  // ====================================================

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="flex min-h-screen items-center justify-center px-5 py-10">
        <div className="w-full max-w-md">

          {/* LOGO */}

          <div className="mb-8 text-center">
            <Link
              href="/"
              className="text-2xl font-black"
            >
              🎮 TOURNAMENT
              <span className="text-orange-500">
                ARENA
              </span>
            </Link>

            <p className="mt-3 text-sm text-zinc-500">
              Create a new password
            </p>
          </div>

          {/* CARD */}

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 sm:p-8">

            <h1 className="text-2xl font-black">
              Reset Password
            </h1>

            <p className="mt-2 text-sm leading-6 text-zinc-500">
              Enter a new password for your
              Tournament Arena account.
            </p>

            <form
              onSubmit={handleSubmit}
              className="mt-8 space-y-5"
            >

              {/* ========================================
                  NEW PASSWORD
              ======================================== */}

              <div>
                <label
                  htmlFor="newPassword"
                  className="text-sm font-semibold text-zinc-300"
                >
                  New Password
                </label>

                <div className="relative">
                  <input
                    id="newPassword"
                    name="newPassword"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={newPassword}
                    onChange={(event) => {
                      setNewPassword(
                        event.target.value
                      );

                      if (error) {
                        setError("");
                      }
                    }}
                    placeholder="Enter new password"
                    autoComplete="new-password"
                    autoFocus
                    disabled={loading}
                    className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 pr-20 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 disabled:cursor-not-allowed disabled:opacity-50"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (previous) =>
                          !previous
                      )
                    }
                    disabled={loading}
                    className="absolute right-3 top-1/2 mt-1 -translate-y-1/2 text-xs font-bold text-zinc-500 hover:text-white"
                  >
                    {showPassword
                      ? "Hide"
                      : "Show"}
                  </button>
                </div>

                <p className="mt-2 text-xs text-zinc-600">
                  Minimum 6 characters.
                </p>
              </div>

              {/* ========================================
                  CONFIRM PASSWORD
              ======================================== */}

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="text-sm font-semibold text-zinc-300"
                >
                  Confirm New Password
                </label>

                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    value={confirmPassword}
                    onChange={(event) => {
                      setConfirmPassword(
                        event.target.value
                      );

                      if (error) {
                        setError("");
                      }
                    }}
                    placeholder="Re-enter new password"
                    autoComplete="new-password"
                    disabled={loading}
                    className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 pr-20 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 disabled:cursor-not-allowed disabled:opacity-50"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(
                        (previous) =>
                          !previous
                      )
                    }
                    disabled={loading}
                    className="absolute right-3 top-1/2 mt-1 -translate-y-1/2 text-xs font-bold text-zinc-500 hover:text-white"
                  >
                    {showConfirmPassword
                      ? "Hide"
                      : "Show"}
                  </button>
                </div>
              </div>

              {/* ========================================
                  ERROR
              ======================================== */}

              {error && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
                  <p className="text-sm font-medium text-red-400">
                    {error}
                  </p>
                </div>
              )}

              {/* ========================================
                  SUCCESS
              ======================================== */}

              {success && (
                <div className="rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3">
                  <p className="text-sm font-medium text-green-400">
                    {success}
                  </p>
                </div>
              )}

              {/* ========================================
                  SUBMIT
              ======================================== */}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-orange-500 px-5 py-3 font-bold text-black transition hover:bg-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-zinc-900 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading
                  ? "Changing Password..."
                  : "Change Password"}
              </button>
            </form>

            {/* LOGIN */}

            <div className="mt-7 border-t border-zinc-800 pt-6 text-center">
              <Link
                href="/login"
                className="font-bold text-orange-500 hover:text-orange-400"
              >
                ← Back to Login
              </Link>
            </div>
          </div>

          {/* BACK HOME */}

          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-sm text-zinc-600 transition hover:text-white"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}