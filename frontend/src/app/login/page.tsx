"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const RAW_API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

const API_URL = RAW_API_URL
  .replace(/\/+$/, "")
  .replace(/\/api$/, "");

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

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const username = formData.username.trim().toLowerCase();
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
          data.message || "Invalid username or password."
        );
        return;
      }

      const meUrl = `${API_URL}/api/auth/me`;

      console.log("VERIFYING SESSION:", meUrl);

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

      console.log("REDIRECTING TO:", destination);

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

  return (
    <main className="min-h-screen bg-[#f5f7fb] text-[#172033]">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="border-b border-[#e6e9f0] bg-white">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8">

          <Link
            href="/"
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#4f46e5] text-lg shadow-sm">
              🎮
            </div>

            <div>
              <p className="text-[15px] font-extrabold tracking-tight text-[#172033]">
                Tournament Arena
              </p>

              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#6366f1]">
                Competitive Gaming
              </p>
            </div>
          </Link>

          <Link
            href="/register"
            className="rounded-lg border border-[#dce1ea] px-3.5 py-2 text-xs font-semibold text-[#4b5568] transition hover:border-[#6366f1] hover:text-[#4f46e5]"
          >
            Create account
          </Link>

        </div>
      </header>

      {/* =====================================================
          MAIN
      ====================================================== */}

      <div className="mx-auto flex min-h-[calc(100vh-72px)] max-w-7xl items-center justify-center px-4 py-8 sm:px-6 sm:py-12">

        <div className="grid w-full max-w-5xl overflow-hidden rounded-2xl border border-[#e2e6ee] bg-white shadow-[0_12px_40px_rgba(25,35,55,0.07)] lg:grid-cols-[0.8fr_1.2fr]">

          {/* =================================================
              LEFT INFORMATION PANEL
          ================================================== */}

          <section className="hidden bg-[#20264a] p-8 text-white lg:flex xl:p-10">

            <div className="flex w-full flex-col">

              {/* Brand */}

              <div>

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#6366f1] text-lg">
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

              </div>

              {/* Main message */}

              <div className="mt-20">

                <div className="mb-4 flex items-center gap-2">

                  <span className="h-1.5 w-1.5 rounded-full bg-[#818cf8]" />

                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a5b4fc]">
                    Welcome back
                  </span>

                </div>

                <h1 className="text-4xl font-extrabold leading-tight xl:text-5xl">
                  Ready to
                  <span className="block text-[#818cf8]">
                    compete?
                  </span>
                </h1>

                <p className="mt-5 max-w-[330px] text-sm leading-6 text-[#b9c0d4]">
                  Sign in to manage your profile,
                  join tournaments and continue
                  your competitive journey.
                </p>

              </div>

              {/* Features */}

              <div className="mt-auto space-y-3">

                <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.05] p-3">

                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                    🏆
                  </div>

                  <div>
                    <p className="text-xs font-semibold">
                      Join tournaments
                    </p>

                    <p className="text-[10px] text-[#9fa8bf]">
                      Find your next challenge
                    </p>
                  </div>

                </div>

                <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.05] p-3">

                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                    👤
                  </div>

                  <div>
                    <p className="text-xs font-semibold">
                      Manage your profile
                    </p>

                    <p className="text-[10px] text-[#9fa8bf]">
                      Keep your player details updated
                    </p>
                  </div>

                </div>

                <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.05] p-3">

                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                    ⚡
                  </div>

                  <div>
                    <p className="text-xs font-semibold">
                      Play & compete
                    </p>

                    <p className="text-[10px] text-[#9fa8bf]">
                      Get into the action quickly
                    </p>
                  </div>

                </div>

              </div>

            </div>

          </section>

          {/* =================================================
              LOGIN FORM
          ================================================== */}

          <section className="flex items-center bg-white">

            <div className="w-full p-6 sm:p-9 lg:p-10 xl:p-12">

              <div className="mx-auto w-full max-w-[400px]">

                {/* Mobile heading */}

                <div className="mb-8 lg:hidden">

                  <div className="mb-2 flex items-center gap-2">

                    <span className="h-1.5 w-1.5 rounded-full bg-[#6366f1]" />

                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#6366f1]">
                      Account access
                    </span>

                  </div>

                  <h1 className="text-2xl font-extrabold text-[#172033]">
                    Welcome back
                  </h1>

                  <p className="mt-2 text-sm text-[#7a8498]">
                    Sign in to continue to your account.
                  </p>

                </div>

                {/* Desktop heading */}

                <div className="hidden lg:block">

                  <div className="mb-3 flex items-center gap-2">

                    <span className="h-1.5 w-1.5 rounded-full bg-[#6366f1]" />

                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#6366f1]">
                      Account access
                    </span>

                  </div>

                  <h2 className="text-3xl font-extrabold tracking-tight text-[#172033]">
                    Welcome back
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-[#7a8498]">
                    Sign in to continue to your
                    Tournament Arena account.
                  </p>

                </div>

                {/* =================================================
                    FORM
                ================================================== */}

                <form
                  onSubmit={handleSubmit}
                  className="mt-8 space-y-5"
                >

                  {/* Username */}

                  <div>

                    <label
                      htmlFor="username"
                      className="mb-1.5 block text-xs font-semibold text-[#465168]"
                    >
                      Username
                    </label>

                    <div className="relative">

                      <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9aa2b2]">
                        <svg
                          width="17"
                          height="17"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                        >
                          <circle
                            cx="12"
                            cy="8"
                            r="3.5"
                          />

                          <path
                            d="M5 20c.8-3.6 3.1-5.5 7-5.5s6.2 1.9 7 5.5"
                            strokeLinecap="round"
                          />
                        </svg>
                      </div>

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
                        className="h-12 w-full rounded-lg border border-[#dce1ea] bg-[#fafbfc] pl-11 pr-4 text-sm text-[#172033] outline-none transition placeholder:text-[#a3aaba] hover:border-[#c8cedb] focus:border-[#6366f1] focus:bg-white focus:ring-4 focus:ring-[#6366f1]/10 disabled:cursor-not-allowed disabled:opacity-60"
                      />

                    </div>

                  </div>

                  {/* Password */}

                  <div>

                    <div className="mb-1.5 flex items-center justify-between">

                      <label
                        htmlFor="password"
                        className="text-xs font-semibold text-[#465168]"
                      >
                        Password
                      </label>

                      <Link
                        href="/forgot-password"
                        className="text-[11px] font-semibold text-[#7c8699] transition hover:text-[#4f46e5]"
                      >
                        Forgot password?
                      </Link>

                    </div>

                    <div className="relative">

                      <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9aa2b2]">
                        <svg
                          width="17"
                          height="17"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                        >
                          <rect
                            x="5"
                            y="10"
                            width="14"
                            height="10"
                            rx="2"
                          />

                          <path
                            d="M8 10V7a4 4 0 0 1 8 0v3"
                            strokeLinecap="round"
                          />
                        </svg>
                      </div>

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
                        className="h-12 w-full rounded-lg border border-[#dce1ea] bg-[#fafbfc] pl-11 pr-16 text-sm text-[#172033] outline-none transition placeholder:text-[#a3aaba] hover:border-[#c8cedb] focus:border-[#6366f1] focus:bg-white focus:ring-4 focus:ring-[#6366f1]/10 disabled:cursor-not-allowed disabled:opacity-60"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword(
                            (previous) => !previous
                          )
                        }
                        disabled={loading}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#8d96a7] transition hover:bg-[#eef0f5] hover:text-[#4f46e5] disabled:opacity-50"
                      >
                        {showPassword
                          ? "Hide"
                          : "Show"}
                      </button>

                    </div>

                  </div>

                  {/* Remember Me */}

                  <label
                    htmlFor="rememberMe"
                    className="flex cursor-pointer items-center gap-2.5 text-xs text-[#7d8799]"
                  >

                    <input
                      id="rememberMe"
                      name="rememberMe"
                      type="checkbox"
                      checked={formData.rememberMe}
                      onChange={handleChange}
                      disabled={loading}
                      className="h-4 w-4 rounded border-[#d5dae3] accent-[#4f46e5]"
                    />

                    Remember me

                  </label>

                  {/* Error */}

                  {error && (
                    <div
                      role="alert"
                      className="flex items-start gap-3 rounded-lg border border-[#fecaca] bg-[#fff5f5] px-3.5 py-3"
                    >

                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#fee2e2] text-xs font-bold text-[#dc2626]">
                        !
                      </div>

                      <p className="text-xs leading-5 text-[#dc2626]">
                        {error}
                      </p>

                    </div>
                  )}

                  {/* Success */}

                  {success && (
                    <div
                      role="status"
                      className="flex items-start gap-3 rounded-lg border border-[#bbf7d0] bg-[#f0fdf4] px-3.5 py-3"
                    >

                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#dcfce7] text-xs font-bold text-[#16a34a]">
                        ✓
                      </div>

                      <p className="text-xs leading-5 text-[#15803d]">
                        {success}
                      </p>

                    </div>
                  )}

                  {/* Submit */}

                  <button
                    type="submit"
                    disabled={loading}
                    className="group flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#4f46e5] px-5 text-sm font-bold text-white shadow-[0_6px_18px_rgba(79,70,229,0.20)] transition hover:bg-[#4338ca] hover:shadow-[0_8px_22px_rgba(79,70,229,0.26)] focus:outline-none focus:ring-4 focus:ring-[#6366f1]/20 disabled:cursor-not-allowed disabled:opacity-60"
                  >

                    {loading ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                        Signing in...
                      </>
                    ) : (
                      <>
                        Sign in

                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          className="transition-transform group-hover:translate-x-0.5"
                        >
                          <path d="M5 12h14" />
                          <path d="m13 6 6 6-6 6" />
                        </svg>
                      </>
                    )}

                  </button>

                </form>

                {/* =================================================
                    BOTTOM
                ================================================== */}

                <div className="mt-7 border-t border-[#edf0f4] pt-5 text-center">

                  <p className="text-xs text-[#929bad]">

                    New to Tournament Arena?

                    <Link
                      href="/register"
                      className="ml-1.5 font-bold text-[#4f46e5] transition hover:text-[#4338ca]"
                    >
                      Create an account
                    </Link>

                  </p>

                </div>

                <div className="mt-5 flex items-center justify-between">

                  <Link
                    href="/"
                    className="text-[11px] font-medium text-[#9aa2b2] transition hover:text-[#4f46e5]"
                  >
                    ← Back to home
                  </Link>

                  <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.14em] text-[#b0b6c2]">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
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