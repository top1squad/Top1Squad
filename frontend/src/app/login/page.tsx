"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// ======================================================
// PRODUCTION API CONFIG
// ======================================================
//
// IMPORTANT:
// Replace this with your DEPLOYED EXPRESS BACKEND URL.
//
// Example:
// https://top1squad-backend.onrender.com
//
// Do NOT use:
// http://localhost:5001
//
// in production.
//
// ======================================================

const API_URL =
  process.env.NEXT_PUBLIC_API_URL;

// ======================================================
// TYPES
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

// ======================================================
// PAGE
// ======================================================

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ====================================================
  // FORM
  // ====================================================

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    rememberMe: false,
  });

  // ====================================================
  // UI STATE
  // ====================================================

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ====================================================
  // INPUT CHANGE
  // ====================================================

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

  // ====================================================
  // SAFE REDIRECT
  // ====================================================

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

  // ====================================================
  // LOGIN
  // ====================================================

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    // ==================================================
    // VALIDATION
    // ==================================================

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

    // ==================================================
    // CHECK API CONFIG
    // ==================================================

    if (
      !API_URL ||
      API_URL.includes("YOUR-BACKEND-DOMAIN")
    ) {
      setError(
        "Backend URL is not configured. Please update API_URL in this file."
      );

      return;
    }

    setLoading(true);

    try {
      // =================================================
      // LOGIN URL
      // =================================================

      const loginUrl =
        `${API_URL}/api/auth/login`;

      console.log("LOGIN REQUEST:", {
        url: loginUrl,
        username,
      });

      // =================================================
      // LOGIN REQUEST
      // =================================================

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

      // =================================================
      // READ RESPONSE
      // =================================================

      const responseText =
        await response.text();

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
        ok: response.ok,
        data,
      });

      // =================================================
      // LOGIN FAILED
      // =================================================

      if (
        !response.ok ||
        data.success === false
      ) {
        setError(
          data.message ||
            "Invalid username or password."
        );

        return;
      }

      // =================================================
      // VERIFY SESSION
      // =================================================

      const meUrl =
        `${API_URL}/api/auth/me`;

      console.log(
        "VERIFYING SESSION:",
        meUrl
      );

      const meResponse = await fetch(
        meUrl,
        {
          method: "GET",

          credentials: "include",

          headers: {
            Accept: "application/json",
          },

          cache: "no-store",
        }
      );

      const meText =
        await meResponse.text();

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
        ok: meResponse.ok,
        data: meData,
      });

      // =================================================
      // SESSION VERIFICATION FAILED
      // =================================================

      if (
        !meResponse.ok ||
        !meData.user
      ) {
        setError(
          meData.message ||
            "Login succeeded, but the session could not be verified. Please try again."
        );

        return;
      }

      // =================================================
      // SUCCESS
      // =================================================

      console.log(
        "LOGIN + SESSION SUCCESS"
      );

      console.log(
        "USER:",
        meData.user
      );

      setSuccess(
        `Welcome back${
          meData.user.username
            ? `, ${meData.user.username}`
            : ""
        }!`
      );

      // =================================================
      // REDIRECT
      // =================================================

      const destination =
        getDestination();

      console.log(
        "REDIRECTING TO:",
        destination
      );

      setTimeout(() => {
        router.replace(destination);
        router.refresh();
      }, 300);
    } catch (err) {
      console.error(
        "LOGIN ERROR:",
        err
      );

      setError(
        "Cannot connect to the backend server. Please check your backend URL and CORS configuration."
      );
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
              Welcome back, gamer!
            </p>
          </div>

          {/* LOGIN CARD */}

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 sm:p-8">

            <h1 className="text-2xl font-black">
              Login
            </h1>

            <p className="mt-2 text-sm text-zinc-500">
              Login to manage your tournaments
              and matches.
            </p>

            {/* FORM */}

            <form
              onSubmit={handleSubmit}
              className="mt-8 space-y-5"
            >

              {/* USERNAME */}

              <div>
                <label
                  htmlFor="username"
                  className="text-sm font-semibold text-zinc-300"
                >
                  Username
                </label>

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
                  className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              {/* PASSWORD */}

              <div>
                <div className="flex items-center justify-between">

                  <label
                    htmlFor="password"
                    className="text-sm font-semibold text-zinc-300"
                  >
                    Password
                  </label>

                  <Link
                    href="/forgot-password"
                    className="text-xs font-semibold text-orange-500 transition hover:text-orange-400"
                  >
                    Forgot password?
                  </Link>
                </div>

                <div className="relative">

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
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-500 hover:text-white disabled:opacity-50"
                  >
                    {showPassword
                      ? "Hide"
                      : "Show"}
                  </button>
                </div>
              </div>

              {/* REMEMBER ME */}

              <div className="flex items-center gap-2">

                <input
                  id="rememberMe"
                  name="rememberMe"
                  type="checkbox"
                  checked={
                    formData.rememberMe
                  }
                  onChange={handleChange}
                  disabled={loading}
                  className="h-4 w-4 accent-orange-500"
                />

                <label
                  htmlFor="rememberMe"
                  className="cursor-pointer text-sm text-zinc-500"
                >
                  Remember me
                </label>

              </div>

              {/* ERROR */}

              {error && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
                  <p className="text-sm font-medium text-red-400">
                    {error}
                  </p>
                </div>
              )}

              {/* SUCCESS */}

              {success && (
                <div className="rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3">
                  <p className="text-sm font-medium text-green-400">
                    {success}
                  </p>
                </div>
              )}

              {/* LOGIN BUTTON */}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-orange-500 px-5 py-3 font-bold text-black transition hover:bg-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-zinc-900 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading
                  ? "Logging in..."
                  : "Login"}
              </button>

            </form>

            {/* REGISTER */}

            <div className="mt-7 border-t border-zinc-800 pt-6 text-center">

              <p className="text-sm text-zinc-500">
                Don't have an account?
              </p>

              <Link
                href="/register"
                className="mt-2 inline-block font-bold text-orange-500 hover:text-orange-400"
              >
                Create an account
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