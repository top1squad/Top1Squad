"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

type Game = "BGMI" | "Free Fire";

export default function RegisterPage() {
  const router = useRouter();

  const [game, setGame] = useState<Game>("BGMI");

  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    mobile: "",
    email: "",
    password: "",
    confirmPassword: "",
    gameUid: "",
    upiId: "",
    termsAccepted: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ======================================================
  // API CONFIGURATION
  // ======================================================

  const API_URL = (
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001"
  ).replace(/\/+$/, "");

  // ======================================================
  // HANDLE INPUT
  // ======================================================

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value, type, checked } = e.target;

    if (name === "mobile") {
      const mobile = value
        .replace(/\D/g, "")
        .slice(0, 10);

      setFormData((prev) => ({
        ...prev,
        mobile,
      }));

      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  // ======================================================
  // SUBMIT REGISTRATION
  // ======================================================

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setError("");

    // ======================================================
    // PERSONAL INFORMATION VALIDATION
    // ======================================================

    if (!formData.fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (formData.fullName.trim().length < 3) {
      setError(
        "Full name must contain at least 3 characters."
      );
      return;
    }

    if (!formData.username.trim()) {
      setError("Please enter a username.");
      return;
    }

    if (formData.username.trim().length < 3) {
      setError(
        "Username must contain at least 3 characters."
      );
      return;
    }

    if (!/^[6-9][0-9]{9}$/.test(formData.mobile)) {
      setError(
        "Please enter a valid 10-digit Indian mobile number."
      );
      return;
    }

    if (!formData.email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        formData.email.trim()
      )
    ) {
      setError("Please enter a valid email address.");
      return;
    }

    // ======================================================
    // PASSWORD VALIDATION
    // ======================================================

    if (!formData.password) {
      setError("Please create a password.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (
      formData.password !==
      formData.confirmPassword
    ) {
      setError("Passwords do not match.");
      return;
    }

    // ======================================================
    // GAME UID VALIDATION
    // ======================================================

    if (!formData.gameUid.trim()) {
      setError(`Please enter your ${game} UID.`);
      return;
    }

    // ======================================================
    // UPI VALIDATION
    // ======================================================

    if (!formData.upiId.trim()) {
      setError("Please enter your UPI ID.");
      return;
    }

    if (
      !/^[\w.-]+@[\w.-]+$/.test(
        formData.upiId.trim()
      )
    ) {
      setError("Please enter a valid UPI ID.");
      return;
    }

    // ======================================================
    // TERMS VALIDATION
    // ======================================================

    if (!formData.termsAccepted) {
      setError(
        "Please accept the Terms & Conditions."
      );
      return;
    }

    setLoading(true);

    try {
      // ====================================================
      // BACKEND REQUEST
      // ====================================================

      const response = await fetch(
        `${API_URL}/api/auth/register`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          credentials: "include",

          body: JSON.stringify({
            fullName:
              formData.fullName.trim(),

            username:
              formData.username
                .trim()
                .toLowerCase(),

            mobile:
              formData.mobile,

            email:
              formData.email
                .trim()
                .toLowerCase(),

            password:
              formData.password,

            game,

            gameUid:
              formData.gameUid.trim(),

            upiId:
              formData.upiId
                .trim()
                .toLowerCase(),

            termsAccepted:
              formData.termsAccepted,
          }),
        }
      );

      // ====================================================
      // READ RESPONSE
      // ====================================================

      let data: any = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      // ====================================================
      // SERVER ERROR
      // ====================================================

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            `Registration failed (${response.status}).`
        );
      }

      // ====================================================
      // REGISTRATION ID CHECK
      // ====================================================

      if (!data.registrationId) {
        throw new Error(
          "Registration ID was not returned by the server."
        );
      }

      // ====================================================
      // SAVE REGISTRATION SESSION
      // ====================================================

      sessionStorage.setItem(
        "registrationId",
        String(data.registrationId)
      );

      sessionStorage.setItem(
        "registrationMobile",
        data.mobile ||
          formData.mobile
      );

      sessionStorage.setItem(
        "registrationEmail",
        data.email ||
          formData.email
      );

      sessionStorage.setItem(
        "registrationUsername",
        data.username ||
          formData.username
      );

      sessionStorage.setItem(
        "registrationGame",
        data.game ||
          game
      );

      // ====================================================
      // GO TO OTP VERIFICATION
      // ====================================================

      router.push("/register/verify");
    } catch (error) {
      console.error(
        "Registration error:",
        error
      );

      // ====================================================
      // NETWORK / BACKEND CONNECTION ERROR
      // ====================================================

      if (
        error instanceof TypeError
      ) {
        setError(
          "Cannot connect to the backend. Please check your Render backend URL and CORS settings."
        );
      } else if (
        error instanceof Error
      ) {
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

  // ======================================================
  // UI
  // ======================================================

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

          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-[#7a8498] sm:block">
              Already registered?
            </span>

            <Link
              href="/login"
              className="rounded-lg border border-[#dfe3ec] bg-white px-4 py-2 text-sm font-semibold text-[#39445a] transition hover:border-[#6366f1] hover:text-[#4f46e5]"
            >
              Login
            </Link>
          </div>
        </div>
      </header>

      {/* PAGE */}

      <div className="mx-auto flex max-w-7xl justify-center px-4 py-8 sm:px-6 sm:py-12">

        <div className="grid w-full max-w-5xl overflow-hidden rounded-2xl border border-[#e2e6ee] bg-white shadow-[0_12px_40px_rgba(25,35,55,0.07)] lg:grid-cols-[280px_1fr]">

          {/* SIDEBAR */}

          <aside className="hidden bg-[#20264a] p-7 text-white lg:block">
            <div className="flex h-full flex-col">

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a5b4fc]">
                  Welcome
                </p>

                <h1 className="mt-3 text-3xl font-extrabold leading-tight">
                  Create your
                  <span className="block text-[#818cf8]">
                    player account
                  </span>
                </h1>

                <p className="mt-4 text-sm leading-6 text-[#b9c0d4]">
                  Register once and use your account to
                  participate in tournaments and manage
                  your gaming profile.
                </p>
              </div>

              <div className="mt-10 space-y-4">

                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-sm">
                    01
                  </div>

                  <div>
                    <p className="text-sm font-semibold">
                      Enter details
                    </p>

                    <p className="mt-1 text-xs text-[#9fa8bf]">
                      Account and gaming information
                    </p>
                  </div>
                </div>

                <div className="ml-4 h-5 w-px bg-white/10" />

                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-sm">
                    02
                  </div>

                  <div>
                    <p className="text-sm font-semibold">
                      Verify mobile
                    </p>

                    <p className="mt-1 text-xs text-[#9fa8bf]">
                      Confirm your OTP
                    </p>
                  </div>
                </div>

                <div className="ml-4 h-5 w-px bg-white/10" />

                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-sm">
                    03
                  </div>

                  <div>
                    <p className="text-sm font-semibold">
                      Start playing
                    </p>

                    <p className="mt-1 text-xs text-[#9fa8bf]">
                      Your account is ready
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-auto rounded-xl border border-white/10 bg-white/[0.05] p-4">
                <p className="text-xs font-semibold">
                  🔒 Secure registration
                </p>

                <p className="mt-1 text-[11px] leading-5 text-[#9fa8bf]">
                  Your mobile number is verified using a
                  one-time password.
                </p>
              </div>

            </div>
          </aside>

          {/* FORM */}

          <section className="p-5 sm:p-8 lg:p-10">

            {/* MOBILE HEADING */}

            <div className="mb-7 lg:hidden">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#6366f1]">
                Player registration
              </p>

              <h1 className="mt-2 text-2xl font-extrabold text-[#172033]">
                Create your account
              </h1>

              <p className="mt-2 text-sm text-[#7a8498]">
                Enter your details to get started.
              </p>
            </div>

            {/* DESKTOP HEADING */}

            <div className="mb-8 hidden lg:block">

              <div className="mb-3 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#6366f1]" />

                <span className="text-xs font-bold uppercase tracking-wider text-[#6366f1]">
                  Step 1 of 3
                </span>
              </div>

              <h2 className="text-2xl font-extrabold text-[#172033]">
                Player information
              </h2>

              <p className="mt-1.5 text-sm text-[#7a8498]">
                Fill in the details below to create your
                account.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-6"
            >

              {/* PERSONAL INFORMATION */}

              <div>

                <div className="mb-4 flex items-center gap-3">

                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#eef2ff] text-xs font-bold text-[#4f46e5]">
                    1
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-[#293247]">
                      Personal information
                    </h3>

                    <p className="text-[11px] text-[#929bad]">
                      Tell us a little about yourself
                    </p>
                  </div>

                </div>

                <div className="grid gap-4 sm:grid-cols-2">

                  {/* FULL NAME */}

                  <div>
                    <label
                      htmlFor="fullName"
                      className="mb-1.5 block text-xs font-semibold text-[#465168]"
                    >
                      Full name
                    </label>

                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      autoComplete="name"
                      className="h-11 w-full rounded-lg border border-[#dce1ea] bg-[#fafbfc] px-3.5 text-sm text-[#172033] outline-none transition placeholder:text-[#a3aaba] hover:border-[#c8cedb] focus:border-[#6366f1] focus:bg-white focus:ring-4 focus:ring-[#6366f1]/10"
                    />
                  </div>

                  {/* USERNAME */}

                  <div>
                    <label
                      htmlFor="username"
                      className="mb-1.5 block text-xs font-semibold text-[#465168]"
                    >
                      Username
                    </label>

                    <div className="flex h-11 overflow-hidden rounded-lg border border-[#dce1ea] bg-[#fafbfc] transition focus-within:border-[#6366f1] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#6366f1]/10">

                      <span className="flex items-center border-r border-[#e4e7ed] px-3 text-sm font-semibold text-[#9aa2b2]">
                        @
                      </span>

                      <input
                        id="username"
                        name="username"
                        type="text"
                        value={formData.username}
                        onChange={handleChange}
                        placeholder="username"
                        autoComplete="username"
                        className="min-w-0 flex-1 bg-transparent px-3 text-sm text-[#172033] outline-none placeholder:text-[#a3aaba]"
                      />

                    </div>
                  </div>

                  {/* MOBILE */}

                  <div>
                    <label
                      htmlFor="mobile"
                      className="mb-1.5 block text-xs font-semibold text-[#465168]"
                    >
                      Mobile number
                    </label>

                    <div className="flex h-11 overflow-hidden rounded-lg border border-[#dce1ea] bg-[#fafbfc] transition focus-within:border-[#6366f1] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#6366f1]/10">

                      <div className="flex items-center gap-1.5 border-r border-[#e4e7ed] px-3">

                        <span className="text-sm">
                          🇮🇳
                        </span>

                        <span className="text-xs font-semibold text-[#6c7588]">
                          +91
                        </span>

                      </div>

                      <input
                        id="mobile"
                        name="mobile"
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        value={formData.mobile}
                        onChange={handleChange}
                        placeholder="10 digit number"
                        autoComplete="tel"
                        className="min-w-0 flex-1 bg-transparent px-3 text-sm text-[#172033] outline-none placeholder:text-[#a3aaba]"
                      />

                    </div>
                  </div>

                  {/* EMAIL */}

                  <div>
                    <label
                      htmlFor="email"
                      className="mb-1.5 block text-xs font-semibold text-[#465168]"
                    >
                      Email address
                    </label>

                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      autoComplete="email"
                      className="h-11 w-full rounded-lg border border-[#dce1ea] bg-[#fafbfc] px-3.5 text-sm text-[#172033] outline-none transition placeholder:text-[#a3aaba] hover:border-[#c8cedb] focus:border-[#6366f1] focus:bg-white focus:ring-4 focus:ring-[#6366f1]/10"
                    />
                  </div>

                </div>
              </div>

              <div className="h-px bg-[#edf0f4]" />

              {/* PASSWORD */}

              <div>

                <div className="mb-4 flex items-center gap-3">

                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#eef2ff] text-xs font-bold text-[#4f46e5]">
                    2
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-[#293247]">
                      Create password
                    </h3>

                    <p className="text-[11px] text-[#929bad]">
                      Use at least 6 characters
                    </p>
                  </div>

                </div>

                <div className="grid gap-4 sm:grid-cols-2">

                  {/* PASSWORD */}

                  <div>
                    <label
                      htmlFor="password"
                      className="mb-1.5 block text-xs font-semibold text-[#465168]"
                    >
                      Password
                    </label>

                    <input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Create a password"
                      autoComplete="new-password"
                      className="h-11 w-full rounded-lg border border-[#dce1ea] bg-[#fafbfc] px-3.5 text-sm text-[#172033] outline-none transition placeholder:text-[#a3aaba] hover:border-[#c8cedb] focus:border-[#6366f1] focus:bg-white focus:ring-4 focus:ring-[#6366f1]/10"
                    />

                    <div className="mt-2 flex gap-1">
                      {[1, 6, 8, 10].map(
                        (length) => (
                          <span
                            key={length}
                            className={`h-1 flex-1 rounded-full ${
                              formData.password.length >=
                              length
                                ? "bg-[#6366f1]"
                                : "bg-[#e5e7eb]"
                            }`}
                          />
                        )
                      )}
                    </div>
                  </div>

                  {/* CONFIRM PASSWORD */}

                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="mb-1.5 block text-xs font-semibold text-[#465168]"
                    >
                      Confirm password
                    </label>

                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={
                        formData.confirmPassword
                      }
                      onChange={handleChange}
                      placeholder="Enter password again"
                      autoComplete="new-password"
                      className={`h-11 w-full rounded-lg border bg-[#fafbfc] px-3.5 text-sm text-[#172033] outline-none transition placeholder:text-[#a3aaba] hover:border-[#c8cedb] focus:bg-white focus:ring-4 ${
                        formData.confirmPassword &&
                        formData.confirmPassword !==
                          formData.password
                          ? "border-red-300 focus:border-red-400 focus:ring-red-500/10"
                          : "border-[#dce1ea] focus:border-[#6366f1] focus:ring-[#6366f1]/10"
                      }`}
                    />

                    {formData.confirmPassword &&
                      formData.confirmPassword ===
                        formData.password && (
                        <p className="mt-1.5 text-[11px] font-medium text-emerald-600">
                          ✓ Passwords match
                        </p>
                      )}
                  </div>

                </div>
              </div>

              <div className="h-px bg-[#edf0f4]" />

              {/* GAMING PROFILE */}

              <div>

                <div className="mb-4 flex items-center gap-3">

                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#eef2ff] text-xs font-bold text-[#4f46e5]">
                    3
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-[#293247]">
                      Gaming profile
                    </h3>

                    <p className="text-[11px] text-[#929bad]">
                      Select your game and enter your UID
                    </p>
                  </div>

                </div>

                <label className="mb-2 block text-xs font-semibold text-[#465168]">
                  Select game
                </label>

                <div className="grid gap-3 sm:grid-cols-2">

                  {/* BGMI */}

                  <button
                    type="button"
                    onClick={() =>
                      setGame("BGMI")
                    }
                    className={`relative flex h-[76px] items-center gap-3 rounded-xl border p-3 text-left transition ${
                      game === "BGMI"
                        ? "border-[#6366f1] bg-[#f3f4ff] ring-2 ring-[#6366f1]/10"
                        : "border-[#dce1ea] bg-[#fafbfc] hover:border-[#c8cedb] hover:bg-white"
                    }`}
                  >

                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-lg ${
                        game === "BGMI"
                          ? "bg-[#e0e7ff]"
                          : "bg-[#eef1f5]"
                      }`}
                    >
                      🎯
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-bold text-[#293247]">
                        BGMI
                      </p>

                      <p className="mt-0.5 truncate text-[10px] text-[#8b94a6]">
                        Battlegrounds Mobile India
                      </p>
                    </div>

                    {game === "BGMI" && (
                      <div className="ml-auto flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#4f46e5] text-white">
                        ✓
                      </div>
                    )}

                  </button>

                  {/* FREE FIRE */}

                  <button
                    type="button"
                    onClick={() =>
                      setGame("Free Fire")
                    }
                    className={`relative flex h-[76px] items-center gap-3 rounded-xl border p-3 text-left transition ${
                      game === "Free Fire"
                        ? "border-[#6366f1] bg-[#f3f4ff] ring-2 ring-[#6366f1]/10"
                        : "border-[#dce1ea] bg-[#fafbfc] hover:border-[#c8cedb] hover:bg-white"
                    }`}
                  >

                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-lg ${
                        game === "Free Fire"
                          ? "bg-[#e0e7ff]"
                          : "bg-[#eef1f5]"
                      }`}
                    >
                      🔥
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-bold text-[#293247]">
                        Free Fire
                      </p>

                      <p className="mt-0.5 truncate text-[10px] text-[#8b94a6]">
                        Garena Free Fire
                      </p>
                    </div>

                    {game === "Free Fire" && (
                      <div className="ml-auto flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#4f46e5] text-white">
                        ✓
                      </div>
                    )}

                  </button>

                </div>

                {/* GAME UID */}

                <div className="mt-4">

                  <label
                    htmlFor="gameUid"
                    className="mb-1.5 flex items-center justify-between text-xs font-semibold text-[#465168]"
                  >
                    <span>
                      {game === "BGMI"
                        ? "BGMI UID"
                        : "Free Fire UID"}
                    </span>

                    <span className="font-normal text-[#9aa2b2]">
                      Required
                    </span>
                  </label>

                  <input
                    id="gameUid"
                    name="gameUid"
                    type="text"
                    value={formData.gameUid}
                    onChange={handleChange}
                    placeholder={`Enter your ${game} UID`}
                    className="h-11 w-full rounded-lg border border-[#dce1ea] bg-[#fafbfc] px-3.5 text-sm text-[#172033] outline-none transition placeholder:text-[#a3aaba] hover:border-[#c8cedb] focus:border-[#6366f1] focus:bg-white focus:ring-4 focus:ring-[#6366f1]/10"
                  />

                </div>

                {/* UPI ID */}

                <div className="mt-4">

                  <label
                    htmlFor="upiId"
                    className="mb-1.5 flex items-center justify-between text-xs font-semibold text-[#465168]"
                  >
                    <span>
                      UPI ID
                    </span>

                    <span className="font-normal text-[#9aa2b2]">
                      Required
                    </span>
                  </label>

                  <input
                    id="upiId"
                    name="upiId"
                    type="text"
                    value={formData.upiId}
                    onChange={handleChange}
                    placeholder="example@upi"
                    autoComplete="off"
                    className="h-11 w-full rounded-lg border border-[#dce1ea] bg-[#fafbfc] px-3.5 text-sm text-[#172033] outline-none transition placeholder:text-[#a3aaba] hover:border-[#c8cedb] focus:border-[#6366f1] focus:bg-white focus:ring-4 focus:ring-[#6366f1]/10"
                  />

                  <p className="mt-1.5 text-[10px] text-[#929bad]">
                    Your UPI ID will be used for tournament
                    prize payments.
                  </p>

                </div>

              </div>

              <div className="h-px bg-[#edf0f4]" />

              {/* TERMS */}

              <label
                htmlFor="termsAccepted"
                className="flex cursor-pointer items-start gap-3"
              >

                <input
                  id="termsAccepted"
                  type="checkbox"
                  name="termsAccepted"
                  checked={
                    formData.termsAccepted
                  }
                  onChange={handleChange}
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-[#cfd5df] accent-[#4f46e5]"
                />

                <span className="text-xs leading-5 text-[#7c8699]">
                  I agree to the{" "}

                  <Link
                    href="/terms"
                    className="font-semibold text-[#4f46e5] hover:underline"
                  >
                    Terms & Conditions
                  </Link>{" "}

                  and{" "}

                  <Link
                    href="/privacy"
                    className="font-semibold text-[#4f46e5] hover:underline"
                  >
                    Privacy Policy
                  </Link>
                  .
                </span>

              </label>

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

                    Sending OTP...
                  </>
                ) : (
                  <>
                    Continue & Send OTP

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

              <p className="text-center text-[11px] text-[#9aa2b2]">
                A verification OTP will be sent to your
                registered mobile number.
              </p>

            </form>

            <div className="mt-7 flex items-center justify-center gap-2 border-t border-[#edf0f4] pt-5 text-xs text-[#8b94a6]">

              <span>
                Already have an account?
              </span>

              <Link
                href="/login"
                className="font-bold text-[#4f46e5] hover:text-[#4338ca]"
              >
                Login
              </Link>

            </div>

            <div className="mt-3 text-center">

              <Link
                href="/"
                className="text-[11px] text-[#9aa2b2] transition hover:text-[#4f46e5]"
              >
                ← Back to Home
              </Link>

            </div>

          </section>
        </div>
      </div>
    </main>
  );
}