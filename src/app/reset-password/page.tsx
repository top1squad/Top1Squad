"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// ======================================================
// YOUR EXISTING ResetPasswordForm
// ======================================================

function ResetPasswordForm() {
  const router = useRouter();

  // IMPORTANT:
  // useSearchParams is ONLY inside this component.
  const searchParams = useSearchParams();

  const resetId =
    searchParams.get("resetId") || "";

  // ====================================================
  // KEEP ALL YOUR EXISTING STATES HERE
  // ====================================================

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  // ====================================================
  // KEEP YOUR EXISTING RESET FUNCTION
  // ====================================================

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!resetId) {
      setError(
        "Invalid or expired password reset session."
      );
      return;
    }

    if (!newPassword) {
      setError("Please enter your new password.");
      return;
    }

    if (newPassword.length < 6) {
      setError(
        "Password must be at least 6 characters."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const RAW_API_URL =
        process.env.NEXT_PUBLIC_API_URL ||
        "http://localhost:5001";

      const API_URL = RAW_API_URL
        .replace(/\/+$/, "")
        .replace(/\/api$/, "");

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

      const text = await response.text();

      let data: {
        success?: boolean;
        message?: string;
      } = {};

      try {
        data = JSON.parse(text);
      } catch {
        console.error(
          "Reset API returned non-JSON:",
          text
        );
      }

      if (
        !response.ok ||
        data.success === false
      ) {
        setError(
          data.message ||
            "Unable to reset password."
        );
        return;
      }

      setSuccess(
        data.message ||
          "Password reset successfully."
      );

      setTimeout(() => {
        router.replace("/login");
      }, 1500);
    } catch (err) {
      console.error(
        "Reset password error:",
        err
      );

      setError(
        "Cannot connect to server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ====================================================
  // YOUR EXISTING UI
  // ====================================================

  return (
    <main className="min-h-screen bg-[#f5f7fb] text-[#172033]">
      <div className="mx-auto flex min-h-screen max-w-md items-center justify-center px-5">
        <div className="w-full rounded-2xl border border-[#e2e6ee] bg-white p-8 shadow-lg">
          <h1 className="text-2xl font-extrabold">
            Reset Password
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Enter your new password.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-6 space-y-5"
          >
            <div>
              <label
                htmlFor="newPassword"
                className="mb-2 block text-sm font-semibold"
              >
                New Password
              </label>

              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) =>
                  setNewPassword(e.target.value)
                }
                disabled={loading}
                className="h-12 w-full rounded-lg border px-4 outline-none focus:border-indigo-500"
                placeholder="Enter new password"
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-semibold"
              >
                Confirm Password
              </label>

              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(e.target.value)
                }
                disabled={loading}
                className="h-12 w-full rounded-lg border px-4 outline-none focus:border-indigo-500"
                placeholder="Confirm new password"
              />
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-600">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="h-12 w-full rounded-lg bg-indigo-600 font-bold text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {loading
                ? "Resetting..."
                : "Reset Password"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

// ======================================================
// PAGE
// ======================================================
//
// DO NOT put useSearchParams() here.
// DO NOT call ResetPasswordForm outside Suspense.
// ======================================================

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#f5f7fb]">
          <div className="text-sm font-semibold text-[#4f46e5]">
            Loading...
          </div>
        </main>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}