"use client";

import { useState } from "react";

/*
|--------------------------------------------------------------------------
| TypeScript declaration for process.env
|--------------------------------------------------------------------------
| This prevents the "Cannot find name 'process'" error when
| @types/node is not available in the frontend project.
*/

declare const process: {
  env: {
    NEXT_PUBLIC_API_URL?: string;
  };
};

interface User {
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
}

interface ApiResponse {
  success?: boolean;
  authenticated?: boolean;
  message?: string;
  user?: User | null;
}

export default function LoginPage() {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [showPassword, setShowPassword] =
    useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  /*
  |--------------------------------------------------------------------------
  | API URL
  |--------------------------------------------------------------------------
  |
  | Local:
  | NEXT_PUBLIC_API_URL=http://localhost:5001
  |
  | Production:
  | NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
  |
  | Do NOT add /api here.
  |
  */

  const API_URL: string = (
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:5001"
  ).replace(/\/+$/, "");

  async function handleLogin(
    event: React.FormEvent<HTMLFormElement>
  ): Promise<void> {
    event.preventDefault();

    setError("");

    const cleanUsername: string =
      username.trim();

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
      /*
      |--------------------------------------------------------------------------
      | LOGIN
      |--------------------------------------------------------------------------
      */

      const loginResponse: Response =
        await fetch(
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
              password: password,
              rememberMe: rememberMe,
            }),
          }
        );

      let loginData: ApiResponse = {};

      try {
        loginData =
          await loginResponse.json();
      } catch {
        loginData = {};
      }

      if (!loginResponse.ok) {
        setError(
          loginData.message ||
            "Invalid username or password."
        );

        return;
      }

      if (loginData.success === false) {
        setError(
          loginData.message ||
            "Invalid username or password."
        );

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | CHECK SESSION
      |--------------------------------------------------------------------------
      */

      const sessionResponse: Response =
        await fetch(
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

      let sessionData: ApiResponse = {};

      try {
        sessionData =
          await sessionResponse.json();
      } catch {
        sessionData = {};
      }

      if (!sessionResponse.ok) {
        setError(
          sessionData.message ||
            "Unable to verify your login session."
        );

        return;
      }

      if (
        sessionData.authenticated === false
      ) {
        setError(
          "Your login session could not be verified."
        );

        return;
      }

      if (!sessionData.user) {
        setError(
          "Login succeeded, but no user session was found."
        );

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | SUCCESS
      |--------------------------------------------------------------------------
      */

      window.location.href = "/";
    } catch (err: unknown) {
      console.error(
        "LOGIN ERROR:",
        err
      );

      setError(
        "Unable to connect to the server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#090a10] text-white">

      {/* HEADER */}

      <header className="border-b border-white/10 bg-[#0d0e15]">

        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5">

          <a
            href="/"
            className="text-xl font-extrabold tracking-wide"
          >
            TOP
            <span className="text-[#7da9d8]">
              1SQUAD
            </span>
          </a>

          <a
            href="/register"
            className="rounded-lg bg-[#5865d8] px-5 py-2.5 text-sm font-semibold transition hover:bg-[#6875e8]"
          >
            Create Account
          </a>

        </div>

      </header>

      {/* LOGIN SECTION */}

      <section className="flex min-h-[calc(100vh-72px)] items-center justify-center px-4 py-10">

        <div className="w-full max-w-[490px]">

          {/* TITLE */}

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

          {/* CARD */}

          <div className="rounded-2xl border border-white/10 bg-[#1c1d23] p-8 shadow-2xl">

            <h2 className="text-3xl font-bold">
              Login
            </h2>

            <p className="mt-2 text-gray-400">
              Login to manage your tournaments
              and matches.
            </p>

            {/* FORM */}

            <form
              onSubmit={handleLogin}
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
                  name="username"
                  type="text"
                  value={username}
                  onChange={(
                    event
                  ) =>
                    setUsername(
                      event.target.value
                    )
                  }
                  placeholder="Enter username"
                  autoComplete="username"
                  disabled={loading}
                  required
                  className="w-full rounded-xl border border-white/10 bg-[#ffffc7] px-4 py-3 text-black outline-none placeholder:text-gray-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 disabled:cursor-not-allowed disabled:opacity-60"
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

                  <a
                    href="/forgot-password"
                    className="text-sm font-semibold text-orange-400 hover:text-orange-300"
                  >
                    Forgot password?
                  </a>

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
                    value={password}
                    onChange={(
                      event
                    ) =>
                      setPassword(
                        event.target.value
                      )
                    }
                    placeholder="Enter password"
                    autoComplete="current-password"
                    disabled={loading}
                    required
                    className="w-full rounded-xl border border-white/10 bg-[#ffffc7] px-4 py-3 pr-20 text-black outline-none placeholder:text-gray-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 disabled:cursor-not-allowed disabled:opacity-60"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (value) => !value
                      )
                    }
                    disabled={loading}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-600 hover:text-black"
                  >
                    {showPassword
                      ? "Hide"
                      : "Show"}
                  </button>

                </div>

              </div>

              {/* REMEMBER */}

              <label className="flex cursor-pointer items-center gap-3 text-gray-400">

                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(
                    event
                  ) =>
                    setRememberMe(
                      event.target.checked
                    )
                  }
                  disabled={loading}
                  className="h-4 w-4 accent-orange-500"
                />

                <span>
                  Remember me
                </span>

              </label>

              {/* ERROR */}

              {error && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-400"
                >
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

              <a
                href="/register"
                className="mt-2 inline-block font-bold text-orange-400 hover:text-orange-300"
              >
                Create an account
              </a>

            </div>

          </div>

        </div>

      </section>

    </main>
  );
}