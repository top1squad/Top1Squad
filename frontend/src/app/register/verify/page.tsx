"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function VerifyPage() {
  const router = useRouter();

  const [registrationId, setRegistrationId] = useState("");
  const [mobile, setMobile] = useState("");
  const [username, setUsername] = useState("");
  const [game, setGame] = useState("");

  const [otp, setOtp] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:5001";

  useEffect(() => {
    const storedRegistrationId =
      sessionStorage.getItem("registrationId");

    const storedMobile =
      sessionStorage.getItem("registrationMobile");

    const storedUsername =
      sessionStorage.getItem("registrationUsername");

    const storedGame =
      sessionStorage.getItem("registrationGame");

    if (!storedRegistrationId) {
      router.replace("/register");
      return;
    }

    setRegistrationId(storedRegistrationId);
    setMobile(storedMobile || "");
    setUsername(storedUsername || "");
    setGame(storedGame || "");
  }, [router]);

  const handleOtpChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value
      .replace(/\D/g, "")
      .slice(0, 6);

    setOtp(value);
  };

  const handleVerify = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!registrationId) {
      setError(
        "Registration session is missing. Please register again."
      );
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      setError("Please enter the 6-digit OTP.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/api/auth/verify`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          credentials: "include",

          body: JSON.stringify({
            registrationId,
            mobileOtp: otp,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "OTP verification failed."
        );
      }

      setSuccess(
        "Mobile verified successfully! Redirecting..."
      );

      sessionStorage.removeItem(
        "registrationId"
      );

      sessionStorage.removeItem(
        "registrationMobile"
      );

      sessionStorage.removeItem(
        "registrationEmail"
      );

      sessionStorage.removeItem(
        "registrationUsername"
      );

      sessionStorage.removeItem(
        "registrationGame"
      );

      setTimeout(() => {
        router.push("/profile");
      }, 800);

    } catch (error) {
      console.error(
        "OTP verification error:",
        error
      );

      if (error instanceof TypeError) {
        setError(
          "Cannot connect to backend. Make sure your backend is running."
        );
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError(
          "Something went wrong. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f5f7fb] text-[#172033]">

      {/* HEADER */}

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
            href="/"
            className="text-sm font-medium text-[#7a8498] transition hover:text-[#4f46e5]"
          >
            Home
          </Link>

        </div>

      </header>

      {/* MAIN */}

      <div className="mx-auto flex min-h-[calc(100vh-72px)] max-w-7xl items-center justify-center px-4 py-8 sm:px-6 sm:py-12">

        <div className="grid w-full max-w-5xl overflow-hidden rounded-2xl border border-[#e2e6ee] bg-white shadow-[0_12px_40px_rgba(25,35,55,0.07)] lg:grid-cols-[280px_1fr]">

          {/* SIDEBAR */}

          <aside className="hidden bg-[#20264a] p-7 text-white lg:block">

            <div className="flex h-full flex-col">

              <div>

                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a5b4fc]">
                  Almost there
                </p>

                <h1 className="mt-3 text-3xl font-extrabold leading-tight">
                  Verify your
                  <span className="block text-[#818cf8]">
                    account
                  </span>
                </h1>

                <p className="mt-4 text-sm leading-6 text-[#b9c0d4]">
                  Confirm your mobile number to complete
                  your registration.
                </p>

              </div>

              <div className="mt-10 space-y-4">

                <div className="flex gap-3">

                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500 text-sm font-bold text-white">
                    ✓
                  </div>

                  <div>
                    <p className="text-sm font-semibold">
                      Registration
                    </p>

                    <p className="mt-1 text-xs text-[#9fa8bf]">
                      Details submitted
                    </p>
                  </div>

                </div>

                <div className="ml-4 h-5 w-px bg-white/10" />

                <div className="flex gap-3">

                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#6366f1] text-sm font-bold">
                    2
                  </div>

                  <div>
                    <p className="text-sm font-semibold">
                      Verification
                    </p>

                    <p className="mt-1 text-xs text-[#9fa8bf]">
                      Confirm your OTP
                    </p>
                  </div>

                </div>

                <div className="ml-4 h-5 w-px bg-white/10" />

                <div className="flex gap-3">

                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-sm font-bold text-[#9fa8bf]">
                    3
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-[#b9c0d4]">
                      Account ready
                    </p>

                    <p className="mt-1 text-xs text-[#747d94]">
                      Start playing
                    </p>
                  </div>

                </div>

              </div>

              <div className="mt-auto rounded-xl border border-white/10 bg-white/[0.05] p-4">

                <p className="text-xs font-semibold">
                  🔒 Secure verification
                </p>

                <p className="mt-1 text-[11px] leading-5 text-[#9fa8bf]">
                  Your OTP is used only to verify your
                  mobile number.
                </p>

              </div>

            </div>

          </aside>

          {/* FORM */}

          <section className="p-5 sm:p-8 lg:p-10">

            {/* MOBILE HEADING */}

            <div className="mb-7 lg:hidden">

              <div className="mb-2 flex items-center gap-2">

                <span className="h-2 w-2 rounded-full bg-[#6366f1]" />

                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#6366f1]">
                  Step 2 of 3
                </span>

              </div>

              <h1 className="text-2xl font-extrabold text-[#172033]">
                Verify your account
              </h1>

              <p className="mt-2 text-sm text-[#7a8498]">
                Enter the OTP sent to your mobile number.
              </p>

            </div>

            {/* DESKTOP HEADING */}

            <div className="mb-7 hidden lg:block">

              <div className="mb-3 flex items-center gap-2">

                <span className="h-2 w-2 rounded-full bg-[#6366f1]" />

                <span className="text-xs font-bold uppercase tracking-wider text-[#6366f1]">
                  Step 2 of 3
                </span>

              </div>

              <h2 className="text-2xl font-extrabold text-[#172033]">
                Verify your mobile number
              </h2>

              <p className="mt-1.5 text-sm text-[#7a8498]">
                Enter the OTP sent to complete your
                registration.
              </p>

            </div>

            {/* ACCOUNT SUMMARY */}

            <div className="mb-6 rounded-xl border border-[#e1e5ef] bg-[#f8f9fc] p-4">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#e8eaff] text-lg">
                  📱
                </div>

                <div className="min-w-0">

                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#929bad]">
                    Verification number
                  </p>

                  <p className="mt-0.5 text-sm font-bold text-[#293247]">
                    {mobile
                      ? `+91 ${mobile}`
                      : "Mobile number"}
                  </p>

                </div>

                <div className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  ✓
                </div>

              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 border-t border-[#e5e8ef] pt-4">

                <div>

                  <p className="text-[10px] text-[#929bad]">
                    Username
                  </p>

                  <p className="mt-1 truncate text-xs font-semibold text-[#39445a]">
                    {username || "—"}
                  </p>

                </div>

                <div>

                  <p className="text-[10px] text-[#929bad]">
                    Game
                  </p>

                  <p className="mt-1 truncate text-xs font-semibold text-[#4f46e5]">
                    {game || "—"}
                  </p>

                </div>

              </div>

            </div>

            {/* OTP FORM */}

            <form
              onSubmit={handleVerify}
              className="space-y-6"
            >

              <div>

                <div className="mb-4 flex items-center gap-3">

                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#eef2ff] text-xs font-bold text-[#4f46e5]">
                    1
                  </div>

                  <div>

                    <h3 className="text-sm font-bold text-[#293247]">
                      Mobile verification
                    </h3>

                    <p className="text-[11px] text-[#929bad]">
                      Enter the 6-digit code you received
                    </p>

                  </div>

                </div>

                <label
                  htmlFor="otp"
                  className="mb-1.5 block text-xs font-semibold text-[#465168]"
                >
                  Verification code
                </label>

                <input
                  id="otp"
                  name="otp"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={otp}
                  onChange={handleOtpChange}
                  placeholder="000000"
                  className="h-14 w-full rounded-lg border border-[#dce1ea] bg-[#fafbfc] px-4 text-center text-2xl font-bold tracking-[0.45em] text-[#172033] outline-none transition placeholder:text-[#c5cad4] hover:border-[#c8cedb] focus:border-[#6366f1] focus:bg-white focus:ring-4 focus:ring-[#6366f1]/10"
                />

                <p className="mt-2 text-[11px] text-[#929bad]">
                  Enter the OTP sent to your registered
                  mobile number.
                </p>

              </div>

              {/* ERROR */}

              {error && (
                <div className="flex items-start gap-3 rounded-lg border border-[#fecaca] bg-[#fff5f5] px-3.5 py-3">

                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#fee2e2] text-xs font-bold text-[#dc2626]">
                    !
                  </div>

                  <p className="text-xs leading-5 text-[#dc2626]">
                    {error}
                  </p>

                </div>
              )}

              {/* SUCCESS */}

              {success && (
                <div className="flex items-start gap-3 rounded-lg border border-[#bbf7d0] bg-[#f0fdf4] px-3.5 py-3">

                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#dcfce7] text-xs font-bold text-[#16a34a]">
                    ✓
                  </div>

                  <p className="text-xs leading-5 text-[#15803d]">
                    {success}
                  </p>

                </div>
              )}

              {/* SUBMIT */}

              <button
                type="submit"
                disabled={loading}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#4f46e5] px-5 text-sm font-bold text-white shadow-[0_6px_18px_rgba(79,70,229,0.22)] transition hover:bg-[#4338ca] hover:shadow-[0_8px_22px_rgba(79,70,229,0.28)] focus:outline-none focus:ring-4 focus:ring-[#6366f1]/20 disabled:cursor-not-allowed disabled:opacity-60"
              >

                {loading ? (
                  <>
                    <svg
                      className="h-4 w-4 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="9"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeDasharray="30 20"
                      />
                    </svg>

                    Verifying...
                  </>
                ) : (
                  <>
                    Verify OTP

                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path d="M5 12h14" />
                      <path d="m13 6 6 6-6 6" />
                    </svg>
                  </>
                )}

              </button>

            </form>

            <div className="mt-7 border-t border-[#edf0f4] pt-5 text-center">

              <Link
                href="/register"
                className="text-xs font-semibold text-[#7c8699] transition hover:text-[#4f46e5]"
              >
                ← Back to registration
              </Link>

            </div>

          </section>

        </div>

      </div>

    </main>
  );
}