"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// ======================================================
// API URL — KEEPING EXISTING BACKEND CONTRACT UNCHANGED
// ======================================================

const RAW_API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5001";

const API_URL = RAW_API_URL
  .replace(/\/+$/, "")
  .replace(/\/api$/, "");

// ======================================================
// TYPES — UNCHANGED
// ======================================================

type LoggedInUser = {
  _id?: string;
  id?: string;
  username?: string;
  fullName?: string;
  email?: string;
  mobile?: string;
  game?: string;
  gameUid?: string;
  bgmiUid?: string;
  freeFireUid?: string;
};

type LoginResponse = {
  success?: boolean;
  message?: string;
  token?: string;
  accessToken?: string;
  user?: LoggedInUser;
};

type MeResponse = {
  success?: boolean;
  message?: string;
  user?: LoggedInUser;
};

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    rememberMe: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ======================================================
  // EXISTING FORM HANDLER — UNCHANGED
  // ======================================================

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value, type, checked } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (error) {
      setError("");
    }
  };

  // ======================================================
  // EXISTING SAFE REDIRECT — UNCHANGED
  // ======================================================

  const getDestination = () => {
    const redirect = searchParams.get("redirect");

    if (
      redirect &&
      redirect.startsWith("/") &&
      !redirect.startsWith("//")
    ) {
      return redirect;
    }

    return "/";
  };

  // ======================================================
  // EXISTING LOGIN FLOW — UNCHANGED
  // ======================================================

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const username =
      formData.username.trim().toLowerCase();

    const password = formData.password;

    if (!username) {
      setError("Please enter your username.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);

    try {
      const loginUrl = `${API_URL}/api/auth/login`;

      console.log("========================================");
      console.log("LOGIN REQUEST");
      console.log("API URL:", loginUrl);
      console.log("USERNAME:", username);
      console.log("========================================");

      const response = await fetch(loginUrl, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        cache: "no-store",
        body: JSON.stringify({
          username,
          password,
          rememberMe: formData.rememberMe,
        }),
      });

      const responseText = await response.text();

      let data: LoginResponse = {};

      try {
        data = JSON.parse(responseText);
      } catch {
        console.error(
          "LOGIN API RETURNED NON-JSON:",
          responseText
        );
      }

      console.log("LOGIN RESPONSE:", {
        status: response.status,
        data,
      });

      if (!response.ok || data.success === false) {
        setError(
          data.message ||
            "Invalid username or password."
        );
        return;
      }

      const meUrl = `${API_URL}/api/auth/me`;

      console.log(
        "VERIFYING SESSION:",
        meUrl
      );

      const meResponse = await fetch(meUrl, {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
        cache: "no-store",
      });

      const meText = await meResponse.text();

      let meData: MeResponse = {};

      try {
        meData = JSON.parse(meText);
      } catch {
        console.error(
          "AUTH ME API RETURNED NON-JSON:",
          meText
        );
      }

      console.log("AUTH ME RESPONSE:", {
        status: meResponse.status,
        data: meData,
      });

      if (!meResponse.ok || !meData.user) {
        setError(
          meData.message ||
            "Login succeeded, but the session could not be verified. Please try again."
        );
        return;
      }

      console.log("========================================");
      console.log("LOGIN + SESSION SUCCESS");
      console.log("USER:", meData.user);
      console.log("========================================");

      setSuccess(
        `Welcome back${
          meData.user.username
            ? `, ${meData.user.username}`
            : ""
        }!`
      );

      const destination = getDestination();

      console.log(
        "REDIRECTING TO:",
        destination
      );

      setTimeout(() => {
        router.replace(destination);
        router.refresh();
      }, 300);
    } catch (err) {
      console.error("LOGIN ERROR:", err);

      setError(
        "Cannot connect to server. Please make sure the backend is running on port 5001."
      );
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // UI ONLY — REDESIGNED
  // ======================================================

  return (
    <main className="min-h-screen bg-[#090a0c] text-white selection:bg-orange-500/30">
      <div className="relative min-h-screen overflow-hidden">
        {/* Subtle background treatment — no images, no distracting effects */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
        >
          <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-orange-500/[0.06] blur-3xl" />
          <div className="absolute -bottom-48 -right-32 h-[28rem] w-[28rem] rounded-full bg-amber-400/[0.04] blur-3xl" />

          <div
            className="absolute inset-0 opacity-[0.035]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.7) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />
        </div>

        <div className="relative mx-auto flex min-h-screen w-full max-w-7xl items-center px-5 py-8 sm:px-8 lg:px-10">
          <div className="grid w-full overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#0d0f12]/95 shadow-[0_30px_100px_rgba(0,0,0,0.45)] backdrop-blur-xl lg:grid-cols-[1.05fr_0.95fr]">
            {/* ==================================================
                BRAND PANEL
            ================================================== */}

            <section className="relative hidden min-h-[680px] overflow-hidden border-r border-white/[0.07] bg-[#101216] lg:flex">
              <div className="relative flex w-full flex-col justify-between p-12 xl:p-16">
                <div>
                  {/* Brand */}
                  <Link
                    href="/"
                    className="inline-flex items-center gap-3"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-orange-400/20 bg-orange-500/10">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        className="h-5 w-5 text-orange-400"
                        aria-hidden="true"
                      >
                        <path
                          d="M8.5 9.5h7M12 6v7M6.8 16.2l-1.7 1.7M17.2 16.2l1.7 1.7"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                        />
                        <path
                          d="M7.2 9.2 8.7 6h6.6l1.5 3.2 2.3 7.1a2 2 0 0 1-3.7 1.3l-1.1-2.1H9.7l-1.1 2.1a2 2 0 0 1-3.7-1.3l2.3-7.1Z"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>

                    <span className="text-[15px] font-extrabold tracking-[0.18em]">
                      TOURNAMENT
                      <span className="text-orange-400">
                        ARENA
                      </span>
                    </span>
                  </Link>

                  <div className="mt-28 max-w-xl">
                    <p className="mb-5 text-xs font-bold uppercase tracking-[0.24em] text-orange-400">
                      Competitive gaming platform
                    </p>

                    <h2 className="text-5xl font-semibold leading-[1.06] tracking-[-0.04em] text-white xl:text-6xl">
                      Your next
                      <br />
                      match starts
                      <br />
                      <span className="text-orange-400">
                        here.
                      </span>
                    </h2>

                    <p className="mt-7 max-w-md text-[15px] leading-7 text-zinc-400">
                      Join tournaments, manage your
                      matches and compete with players
                      across the arena.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-white/[0.07] pt-6">
                  <p className="text-xs text-zinc-600">
                    Built for competitive players
                  </p>

                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Platform online
                  </div>
                </div>
              </div>

              <div
                aria-hidden="true"
                className="pointer-events-none absolute bottom-24 right-10 h-44 w-44 rounded-full border border-orange-400/[0.08]"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute bottom-36 right-22 h-24 w-24 rounded-full border border-orange-400/[0.08]"
              />
            </section>

            {/* ==================================================
                LOGIN PANEL
            ================================================== */}

            <section className="flex min-h-[680px] items-center bg-[#0b0d10]">
              <div className="w-full px-6 py-10 sm:px-10 lg:px-12 xl:px-16">
                {/* Mobile brand */}
                <div className="mb-10 lg:hidden">
                  <Link
                    href="/"
                    className="inline-flex items-center gap-3"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-orange-400/20 bg-orange-500/10">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        className="h-5 w-5 text-orange-400"
                        aria-hidden="true"
                      >
                        <path
                          d="M8.5 9.5h7M12 6v7"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                        />
                        <path
                          d="M7.2 9.2 8.7 6h6.6l1.5 3.2 2.3 7.1a2 2 0 0 1-3.7 1.3l-1.1-2.1H9.7l-1.1 2.1a2 2 0 0 1-3.7-1.3l2.3-7.1Z"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>

                    <span className="text-[15px] font-extrabold tracking-[0.16em]">
                      TOURNAMENT
                      <span className="text-orange-400">
                        ARENA
                      </span>
                    </span>
                  </Link>
                </div>

                <div className="mx-auto w-full max-w-[430px]">
                  {/* Header */}
                  <div>
                    <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-orange-400">
                      Account access
                    </p>

                    <h1 className="text-3xl font-semibold tracking-[-0.03em] text-white sm:text-[34px]">
                      Welcome back
                    </h1>

                    <p className="mt-3 text-sm leading-6 text-zinc-500">
                      Sign in to continue to your
                      Tournament Arena account.
                    </p>
                  </div>

                  {/* Form */}
                  <form
                    onSubmit={handleSubmit}
                    className="mt-9 space-y-5"
                  >
                    {/* Username */}
                    <div>
                      <label
                        htmlFor="username"
                        className="mb-2.5 block text-[13px] font-semibold text-zinc-300"
                      >
                        Username
                      </label>

                      <div className="relative">
                        <span
                          aria-hidden="true"
                          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            className="h-[18px] w-[18px]"
                          >
                            <path
                              d="M20 21a8 8 0 0 0-16 0M12 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
                              stroke="currentColor"
                              strokeWidth="1.7"
                              strokeLinecap="round"
                            />
                          </svg>
                        </span>

                        <input
                          id="username"
                          name="username"
                          type="text"
                          value={formData.username}
                          onChange={handleChange}
                          placeholder="Enter your username"
                          autoComplete="username"
                          autoFocus
                          disabled={loading}
                          className="h-12 w-full rounded-xl border border-white/[0.09] bg-white/[0.035] pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-zinc-600 hover:border-white/[0.14] focus:border-orange-400/70 focus:bg-white/[0.045] focus:ring-4 focus:ring-orange-400/[0.08] disabled:cursor-not-allowed disabled:opacity-50"
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div>
                      <div className="mb-2.5 flex items-center justify-between">
                        <label
                          htmlFor="password"
                          className="text-[13px] font-semibold text-zinc-300"
                        >
                          Password
                        </label>

                        <Link
                          href="/forgot-password"
                          className="text-xs font-semibold text-zinc-500 transition hover:text-orange-400"
                        >
                          Forgot password?
                        </Link>
                      </div>

                      <div className="relative">
                        <span
                          aria-hidden="true"
                          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            className="h-[18px] w-[18px]"
                          >
                            <rect
                              x="5"
                              y="10"
                              width="14"
                              height="10"
                              rx="2"
                              stroke="currentColor"
                              strokeWidth="1.7"
                            />
                            <path
                              d="M8 10V7a4 4 0 0 1 8 0v3"
                              stroke="currentColor"
                              strokeWidth="1.7"
                              strokeLinecap="round"
                            />
                          </svg>
                        </span>

                        <input
                          id="password"
                          name="password"
                          type={
                            showPassword
                              ? "text"
                              : "password"
                          }
                          value={formData.password}
                          onChange={handleChange}
                          placeholder="Enter your password"
                          autoComplete="current-password"
                          disabled={loading}
                          className="h-12 w-full rounded-xl border border-white/[0.09] bg-white/[0.035] pl-11 pr-16 text-sm text-white outline-none transition placeholder:text-zinc-600 hover:border-white/[0.14] focus:border-orange-400/70 focus:bg-white/[0.045] focus:ring-4 focus:ring-orange-400/[0.08] disabled:cursor-not-allowed disabled:opacity-50"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowPassword(
                              (previous) => !previous
                            )
                          }
                          disabled={loading}
                          aria-label={
                            showPassword
                              ? "Hide password"
                              : "Show password"
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-semibold text-zinc-500 transition hover:bg-white/[0.05] hover:text-white disabled:opacity-50"
                        >
                          {showPassword
                            ? "Hide"
                            : "Show"}
                        </button>
                      </div>
                    </div>

                    {/* Remember me */}
                    <div className="flex items-center justify-between pt-0.5">
                      <label
                        htmlFor="rememberMe"
                        className="flex cursor-pointer items-center gap-2.5 text-[13px] text-zinc-500"
                      >
                        <input
                          id="rememberMe"
                          name="rememberMe"
                          type="checkbox"
                          checked={
                            formData.rememberMe
                          }
                          onChange={handleChange}
                          disabled={loading}
                          className="h-4 w-4 rounded border-white/10 bg-white/[0.04] accent-orange-500"
                        />
                        Remember me
                      </label>

                      <span className="text-[11px] text-zinc-700">
                        Secure sign-in
                      </span>
                    </div>

                    {/* Error */}
                    {error && (
                      <div
                        role="alert"
                        className="flex gap-3 rounded-xl border border-red-400/15 bg-red-400/[0.06] px-4 py-3.5"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          className="mt-0.5 h-4 w-4 shrink-0 text-red-400"
                          aria-hidden="true"
                        >
                          <circle
                            cx="12"
                            cy="12"
                            r="9"
                            stroke="currentColor"
                            strokeWidth="1.7"
                          />
                          <path
                            d="M12 8v4M12 15.5v.5"
                            stroke="currentColor"
                            strokeWidth="1.7"
                            strokeLinecap="round"
                          />
                        </svg>

                        <p className="text-xs font-medium leading-5 text-red-300">
                          {error}
                        </p>
                      </div>
                    )}

                    {/* Success */}
                    {success && (
                      <div
                        role="status"
                        className="flex gap-3 rounded-xl border border-emerald-400/15 bg-emerald-400/[0.06] px-4 py-3.5"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400"
                          aria-hidden="true"
                        >
                          <circle
                            cx="12"
                            cy="12"
                            r="9"
                            stroke="currentColor"
                            strokeWidth="1.7"
                          />
                          <path
                            d="m8.5 12 2.2 2.2 4.8-5"
                            stroke="currentColor"
                            strokeWidth="1.7"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>

                        <p className="text-xs font-medium leading-5 text-emerald-300">
                          {success}
                        </p>
                      </div>
                    )}

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="group relative flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-orange-500 px-5 text-sm font-bold text-[#111] shadow-[0_10px_30px_rgba(249,115,22,0.16)] transition hover:bg-orange-400 hover:shadow-[0_12px_34px_rgba(249,115,22,0.22)] focus:outline-none focus:ring-4 focus:ring-orange-400/20 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <span className="relative">
                        {loading
                          ? "Signing in..."
                          : "Sign in"}
                      </span>

                      {!loading && (
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                          aria-hidden="true"
                        >
                          <path
                            d="M5 12h13M13 6l6 6-6 6"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}

                      {loading && (
                        <span
                          aria-hidden="true"
                          className="h-4 w-4 animate-spin rounded-full border-2 border-black/20 border-t-black"
                        />
                      )}
                    </button>
                  </form>

                  {/* Register */}
                  <div className="mt-8 text-center">
                    <p className="text-sm text-zinc-600">
                      New to Tournament Arena?
                      <Link
                        href="/register"
                        className="ml-1.5 font-semibold text-zinc-300 transition hover:text-orange-400"
                      >
                        Create an account
                      </Link>
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="mt-9 flex items-center justify-between border-t border-white/[0.06] pt-5">
                    <Link
                      href="/"
                      className="text-xs font-medium text-zinc-600 transition hover:text-zinc-300"
                    >
                      ← Back to home
                    </Link>

                    <span className="text-[10px] uppercase tracking-[0.16em] text-zinc-700">
                      Tournament Arena
                    </span>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}