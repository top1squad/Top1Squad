"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// ======================================================
// API CONFIG
// ======================================================

const RAW_API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

const API_URL = RAW_API_URL
  .replace(/\/+$/, "")
  .replace(/\/api$/, "");

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
  role?: string;
};

type LoginResponse = {
  success?: boolean;
  message?: string;
  user?: LoggedInUser;
};

type MeResponse = {
  success?: boolean;
  authenticated?: boolean;
  message?: string;
  user?: LoggedInUser | null;
};

// ======================================================
// LOGIN FORM
// ======================================================

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ======================================================
  // GET REDIRECT DESTINATION
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
  // LOGIN
  // ======================================================

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");

    const cleanUsername = username.trim();

    if (!cleanUsername) {
      setError("Please enter your username.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);

    try {
      // ==================================================
      // LOGIN REQUEST
      // ==================================================

      const loginResponse = await fetch(
        `${API_URL}/api/auth/login`,
        {
          method: "POST",

          credentials: "include",

          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },

          body: JSON.stringify({
            username: cleanUsername,
            password,
            rememberMe,
          }),
        }
      );

      let loginData: LoginResponse;

      try {
        loginData = await loginResponse.json();
      } catch {
        throw new Error("Invalid response from server.");
      }

      console.log("LOGIN RESPONSE:", loginData);

      if (!loginResponse.ok || !loginData.success) {
        setError(
          loginData.message ||
            "Invalid username or password."
        );

        return;
      }

      // ==================================================
      // VERIFY AUTHENTICATION
      // ==================================================

      const meResponse = await fetch(
        `${API_URL}/api/auth/me`,
        {
          method: "GET",

          credentials: "include",

          headers: {
            Accept: "application/json",
          },

          cache: "no-store",
        }
      );

      let meData: MeResponse;

      try {
        meData = await meResponse.json();
      } catch {
        throw new Error("Invalid authentication response.");
      }

      console.log("AUTH CHECK:", meData);

      // ==================================================
      // CHECK SESSION
      // ==================================================

      if (
        !meResponse.ok ||
        !meData.success ||
        !meData.authenticated ||
        !meData.user
      ) {
        setError(
          meData.message ||
            "Login succeeded but your session could not be verified."
        );

        return;
      }

      // ==================================================
      // LOGIN SUCCESS
      // ==================================================

      console.log("LOGIN SUCCESS:", meData.user);

      const destination = getDestination();

      router.replace(destination);
      router.refresh();

    } catch (error) {
      console.error("LOGIN ERROR:", error);

      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError(
          "Cannot connect to the server. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // UI
  // ======================================================

  return (
    <main className="min-h-screen bg-[#090a10] text-white">

      {/* HEADER */}

      <header className="border-b border-white/10 bg-[#0d0e15]">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5">

          <Link
            href="/"
            className="text-xl font-extrabold tracking-wide"
          >
            TOP
            <span className="text-[#7da9d8]">
              1SQUAD
            </span>
          </Link>

          <Link
            href="/register"
            className="rounded-lg bg-[#5865d8] px-5 py-2.5 text-sm font-semibold transition hover:bg-[#6875e8]"
          >
            Create Account
          </Link>

        </div>
      </header>

      {/* MAIN */}

      <div className="flex min-h-[calc(100vh-72px)] items-center justify-center px-4 py-10">

        <div className="w-full max-w-[490px]">

          {/* BRAND */}

          <div className="mb-9 text-center">

            <h1 className="text-3xl font-extrabold">
              🎮 TOURNAMENT
              <span className="text-orange-500">
                ARENA
              </span>
            </h1>

            <p className="mt-3 text-sm text-gray-400">
              Welcome back, gamer!
            </p>

          </div>

          {/* LOGIN CARD */}

          <div className="rounded-2xl border border-white/10 bg-[#1c1d23] p-8 shadow-2xl">

            <h2 className="text-3xl font-bold">
              Login
            </h2>

            <p className="mt-2 text-gray-400">
              Login to manage your tournaments and matches.
            </p>

            <form
              onSubmit={handleSubmit}
              className="mt-8 space-y-6"
            >

              {/* USERNAME */}

              <div>

                <label
                  htmlFor="username"
                  className="mb-2 block font-semibold text-gray-300"
                >
                  Username
                </label>

                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(event) => {
                    setUsername(event.target.value);
                    setError("");
                  }}
                  placeholder="Enter username"
                  autoComplete="username"
                  disabled={loading}
                  className="w-full rounded-xl border border-white/10 bg-[#ffffc7] px-4 py-3 text-black outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 disabled:opacity-60"
                />

              </div>

              {/* PASSWORD */}

              <div>

                <div className="mb-2 flex items-center justify-between">

                  <label
                    htmlFor="password"
                    className="font-semibold text-gray-300"
                  >
                    Password
                  </label>

                  <Link
                    href="/forgot-password"
                    className="text-sm font-semibold text-orange-400 hover:text-orange-300"
                  >
                    Forgot password?
                  </Link>

                </div>

                <div className="relative">

                  <input
                    id="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      setError("");
                    }}
                    placeholder="Enter password"
                    autoComplete="current-password"
                    disabled={loading}
                    className="w-full rounded-xl border border-white/10 bg-[#ffffc7] px-4 py-3 pr-20 text-black outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 disabled:opacity-60"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((previous) => !previous)
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 font-semibold text-gray-600"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>

                </div>

              </div>

              {/* REMEMBER ME */}

              <label className="flex cursor-pointer items-center gap-3 text-gray-400">

                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) =>
                    setRememberMe(event.target.checked)
                  }
                  className="h-4 w-4 accent-orange-500"
                />

                Remember me

              </label>

              {/* ERROR */}

              {error && (
                <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-red-400">
                  {error}
                </div>
              )}

              {/* LOGIN BUTTON */}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-orange-500 px-4 py-4 text-lg font-bold text-black transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Logging in..."
                  : "Login"}
              </button>

            </form>

            {/* REGISTER */}

            <div className="mt-8 border-t border-white/10 pt-6 text-center">

              <p className="text-gray-400">
                Don't have an account?
              </p>

              <Link
                href="/register"
                className="mt-2 inline-block font-bold text-orange-400 hover:text-orange-300"
              >
                Create an account
              </Link>

            </div>

          </div>

        </div>

      </div>

    </main>
  );
}

// ======================================================
// PAGE WRAPPER
// ======================================================

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#090a10] text-white">
          Loading...
        </main>
      }
    >
      <LoginForm />
    </Suspense>
  );
}