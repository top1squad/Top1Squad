"use client";

import Link from "next/link";
import React, {
  ChangeEvent,
  FormEvent,
  Suspense,
  useState,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const cleanUsername = username.trim().toLowerCase();

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

      const loginText = await loginResponse.text();

      let loginData: {
        success?: boolean;
        message?: string;
        user?: {
          username?: string;
        };
      } = {};

      try {
        loginData = JSON.parse(loginText);
      } catch {
        loginData = {};
      }

      if (!loginResponse.ok || loginData.success === false) {
        setError(
          loginData.message ||
            "Invalid username or password."
        );
        return;
      }

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

      const meText = await meResponse.text();

      let meData: {
        success?: boolean;
        message?: string;
        user?: {
          username?: string;
        };
      } = {};

      try {
        meData = JSON.parse(meText);
      } catch {
        meData = {};
      }

      if (!meResponse.ok || !meData.user) {
        setError(
          meData.message ||
            "Login succeeded, but the session could not be verified."
        );
        return;
      }

      setSuccess(
        meData.user.username
          ? `Welcome back, ${meData.user.username}!`
          : "Welcome back!"
      );

      const redirect = searchParams.get("redirect");

      const destination =
        redirect &&
        redirect.startsWith("/") &&
        !redirect.startsWith("//")
          ? redirect
          : "/";

      setTimeout(() => {
        router.replace(destination);
        router.refresh();
      }, 300);
    } catch (error) {
      console.error("LOGIN ERROR:", error);

      setError(
        "Cannot connect to the server. Make sure the backend is running on port 5001."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUsernameChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    setUsername(event.target.value);

    if (error) {
      setError("");
    }
  };

  const handlePasswordChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    setPassword(event.target.value);

    if (error) {
      setError("");
    }
  };

  return (
    <main className="min-h-screen bg-[#f5f7fb] text-[#172033]">
      <header className="border-b border-[#e6e9f0] bg-white">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link
            href="/"
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#4f46e5] text-lg">
              🎮
            </div>

            <div>
              <p className="text-[15px] font-extrabold">
                Tournament Arena
              </p>

              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#6366f1]">
                Competitive Gaming
              </p>
            </div>
          </Link>

          <Link
            href="/register"
            className="rounded-lg border border-[#dce1ea] px-3.5 py-2 text-xs font-semibold text-[#4b5568] hover:border-[#6366f1] hover:text-[#4f46e5]"
          >
            Create account
          </Link>
        </div>
      </header>

      <div className="mx-auto flex min-h-[calc(100vh-72px)] max-w-7xl items-center justify-center px-4 py-8 sm:px-6 sm:py-12">
        <div className="grid w-full max-w-5xl overflow-hidden rounded-2xl border border-[#e2e6ee] bg-white shadow-lg lg:grid-cols-[0.8fr_1.2fr]">
          <section className="hidden bg-[#20264a] p-10 text-white lg:flex">
            <div className="flex w-full flex-col">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#6366f1]">
                  🎮
                </div>

                <div>
                  <p className="text-sm font-extrabold">
                    Tournament Arena
                  </p>

                  <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#a5b4fc]">
                    Player platform
                  </p>
                </div>
              </div>

              <div className="mt-20">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a5b4fc]">
                  Welcome back
                </p>

                <h1 className="mt-4 text-4xl font-extrabold">
                  Ready to
                  <span className="block text-[#818cf8]">
                    compete?
                  </span>
                </h1>

                <p className="mt-5 max-w-[330px] text-sm leading-6 text-[#b9c0d4]">
                  Sign in to manage your profile, join
                  tournaments and continue your competitive
                  journey.
                </p>
              </div>

              <div className="mt-auto space-y-3">
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  🏆 Join tournaments
                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  👤 Manage your profile
                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  ⚡ Play & compete
                </div>
              </div>
            </div>
          </section>

          <section className="flex items-center bg-white">
            <div className="w-full p-6 sm:p-9 lg:p-12">
              <div className="mx-auto w-full max-w-[400px]">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#6366f1]">
                  Account access
                </p>

                <h1 className="mt-3 text-3xl font-extrabold">
                  Welcome back
                </h1>

                <p className="mt-2 text-sm text-[#7a8498]">
                  Sign in to continue to your Tournament Arena
                  account.
                </p>

                <form
                  onSubmit={handleSubmit}
                  className="mt-8 space-y-5"
                >
                  <div>
                    <label
                      htmlFor="username"
                      className="mb-2 block text-xs font-semibold"
                    >
                      Username
                    </label>

                    <input
                      id="username"
                      name="username"
                      type="text"
                      value={username}
                      onChange={handleUsernameChange}
                      placeholder="Enter your username"
                      autoComplete="username"
                      disabled={loading}
                      className="h-12 w-full rounded-lg border border-[#dce1ea] bg-[#fafbfc] px-4 text-sm outline-none focus:border-[#6366f1] focus:bg-white"
                    />
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <label
                        htmlFor="password"
                        className="text-xs font-semibold"
                      >
                        Password
                      </label>

                      <Link
                        href="/forgot-password"
                        className="text-[11px] font-semibold text-[#7c8699] hover:text-[#4f46e5]"
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
                        value={password}
                        onChange={handlePasswordChange}
                        placeholder="Enter your password"
                        autoComplete="current-password"
                        disabled={loading}
                        className="h-12 w-full rounded-lg border border-[#dce1ea] bg-[#fafbfc] px-4 pr-16 text-sm outline-none focus:border-[#6366f1] focus:bg-white"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword(
                            (value) => !value
                          )
                        }
                        disabled={loading}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#7c8699]"
                      >
                        {showPassword ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 text-xs text-[#7d8799]">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(event) =>
                        setRememberMe(event.target.checked)
                      }
                      disabled={loading}
                    />

                    Remember me
                  </label>

                  {error && (
                    <div
                      role="alert"
                      className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-600"
                    >
                      {error}
                    </div>
                  )}

                  {success && (
                    <div
                      role="status"
                      className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-xs text-green-600"
                    >
                      {success}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex h-12 w-full items-center justify-center rounded-lg bg-[#4f46e5] text-sm font-bold text-white hover:bg-[#4338ca] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? "Signing in..." : "Sign in"}
                  </button>
                </form>

                <div className="mt-7 border-t border-[#edf0f4] pt-5 text-center">
                  <p className="text-xs text-[#929bad]">
                    New to Tournament Arena?

                    <Link
                      href="/register"
                      className="ml-1.5 font-bold text-[#4f46e5]"
                    >
                      Create an account
                    </Link>
                  </p>
                </div>

                <div className="mt-5 flex items-center justify-between">
                  <Link
                    href="/"
                    className="text-[11px] text-[#9aa2b2] hover:text-[#4f46e5]"
                  >
                    ← Back to home
                  </Link>

                  <span className="text-[9px] font-bold uppercase tracking-wider text-[#b0b6c2]">
                    Secure access
                  </span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#f5f7fb]">
          <p className="text-sm text-[#4f46e5]">
            Loading login...
          </p>
        </main>
      }
    >
      <LoginForm />
    </Suspense>
  );
}