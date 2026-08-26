"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

// ======================================================
// TYPES
// ======================================================

type User = {
  id: string;
  username: string;
  fullName: string;
  email: string;
  mobile: string;

  game: "BGMI" | "Free Fire";

  gameUid: string;

  bgmiUid: string;
  freeFireUid: string;

  upiId: string;

  role: "user" | "admin";
};

// ======================================================
// API
// ======================================================

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5001"
).replace(/\/$/, "");

// ======================================================
// SETTINGS PAGE
// ======================================================

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null);

  const [loading, setLoading] = useState(true);

  // ====================================================
  // ACCOUNT
  // ====================================================

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [upiId, setUpiId] = useState("");

  // ====================================================
  // GAME IDS
  // ====================================================

  const [bgmiUid, setBgmiUid] = useState("");
  const [freeFireUid, setFreeFireUid] = useState("");

  // ====================================================
  // PREFERENCES
  // ====================================================

  const [notifications, setNotifications] =
    useState(true);

  // ====================================================
  // SAVING STATES
  // ====================================================

  const [savingProfile, setSavingProfile] =
    useState(false);

  const [savingGame, setSavingGame] = useState<
    "BGMI" | "Free Fire" | null
  >(null);

  // ====================================================
  // MESSAGES
  // ====================================================

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ====================================================
  // SAFE JSON RESPONSE
  // ====================================================

  async function parseResponse(response: Response) {
    const text = await response.text();

    if (!text) {
      return {};
    }

    try {
      return JSON.parse(text);
    } catch {
      throw new Error(
        "Backend returned an invalid response."
      );
    }
  }

  // ====================================================
  // LOAD USER
  // ====================================================

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      const response = await fetch(
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

      const data = await parseResponse(response);

      console.log("AUTH ME RESPONSE:", {
        status: response.status,
        data,
      });

      if (!response.ok) {
        throw new Error(
          data.message || "Please login first"
        );
      }

      if (
        !data.success ||
        !data.authenticated ||
        !data.user
      ) {
        throw new Error("Please login first");
      }

      const currentUser: User = {
        ...data.user,
        id:
          data.user.id ||
          data.user._id ||
          "",
        username:
          data.user.username || "",
        fullName:
          data.user.fullName || "",
        email:
          data.user.email || "",
        mobile:
          data.user.mobile || "",
        game:
          data.user.game || "BGMI",
        gameUid:
          data.user.gameUid || "",
        bgmiUid:
          data.user.bgmiUid || "",
        freeFireUid:
          data.user.freeFireUid || "",
        upiId:
          data.user.upiId || "",
        role:
          data.user.role || "user",
      };

      setUser(currentUser);

      setFullName(
        currentUser.fullName || ""
      );

      setUsername(
        currentUser.username || ""
      );

      setEmail(
        currentUser.email || ""
      );

      setMobile(
        currentUser.mobile || ""
      );

      setUpiId(
        currentUser.upiId || ""
      );

      setBgmiUid(
        currentUser.bgmiUid || ""
      );

      setFreeFireUid(
        currentUser.freeFireUid || ""
      );
    } catch (err) {
      console.error(
        "Load settings error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load settings"
      );
    } finally {
      setLoading(false);
    }
  }

  // ====================================================
  // SAVE ACCOUNT
  // ====================================================

  async function saveProfile() {
    try {
      setSavingProfile(true);
      setMessage("");
      setError("");

      const cleanFullName =
        fullName.trim();

      const cleanUsername =
        username.trim();

      const cleanEmail =
        email.trim();

      const cleanUpiId =
        upiId.trim();

      if (!cleanFullName) {
        throw new Error(
          "Full name cannot be empty."
        );
      }

      if (!cleanUsername) {
        throw new Error(
          "Username cannot be empty."
        );
      }

      if (!cleanEmail) {
        throw new Error(
          "Email address cannot be empty."
        );
      }

      const response = await fetch(
        `${API_URL}/api/auth/profile`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type":
              "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            fullName:
              cleanFullName,
            username:
              cleanUsername,
            email:
              cleanEmail,
            upiId:
              cleanUpiId,
          }),
        }
      );

      const data =
        await parseResponse(response);

      console.log(
        "PROFILE UPDATE RESPONSE:",
        {
          status: response.status,
          data,
        }
      );

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to update profile"
        );
      }

      if (!data.user) {
        throw new Error(
          "Profile updated but backend did not return user data."
        );
      }

      const updatedUser: User = {
        ...data.user,
        id:
          data.user.id ||
          data.user._id ||
          user?.id ||
          "",
        username:
          data.user.username ||
          cleanUsername,
        fullName:
          data.user.fullName ||
          cleanFullName,
        email:
          data.user.email ||
          cleanEmail,
        mobile:
          data.user.mobile ||
          mobile,
        game:
          data.user.game ||
          user?.game ||
          "BGMI",
        gameUid:
          data.user.gameUid ||
          user?.gameUid ||
          "",
        bgmiUid:
          data.user.bgmiUid ||
          bgmiUid,
        freeFireUid:
          data.user.freeFireUid ||
          freeFireUid,
        upiId:
          data.user.upiId ??
          cleanUpiId,
        role:
          data.user.role ||
          user?.role ||
          "user",
      };

      setUser(updatedUser);

      setFullName(
        updatedUser.fullName || ""
      );

      setUsername(
        updatedUser.username || ""
      );

      setEmail(
        updatedUser.email || ""
      );

      setMobile(
        updatedUser.mobile || ""
      );

      setUpiId(
        updatedUser.upiId || ""
      );

      setBgmiUid(
        updatedUser.bgmiUid || ""
      );

      setFreeFireUid(
        updatedUser.freeFireUid || ""
      );

      setMessage(
        "Account information updated successfully."
      );
    } catch (err) {
      console.error(
        "Save profile error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to update profile"
      );
    } finally {
      setSavingProfile(false);
    }
  }

  // ====================================================
  // SAVE GAME UID
  // ====================================================

  async function saveGameUid(
    game: "BGMI" | "Free Fire"
  ) {
    const uid =
      game === "BGMI"
        ? bgmiUid.trim()
        : freeFireUid.trim();

    if (!uid) {
      setMessage("");

      setError(
        `${game} UID cannot be empty.`
      );

      return;
    }

    try {
      setSavingGame(game);
      setMessage("");
      setError("");

      const response = await fetch(
        `${API_URL}/api/auth/game-uid`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type":
              "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            game,
            gameUid: uid,
          }),
        }
      );

      const data =
        await parseResponse(response);

      console.log(
        "GAME UID UPDATE RESPONSE:",
        {
          status: response.status,
          data,
        }
      );

      if (!response.ok) {
        throw new Error(
          data.message ||
            `Unable to update ${game} UID`
        );
      }

      if (!data.user) {
        throw new Error(
          "Game UID updated but backend did not return user data."
        );
      }

      const updatedUser: User = {
        ...data.user,
        id:
          data.user.id ||
          data.user._id ||
          user?.id ||
          "",
        username:
          data.user.username ||
          username,
        fullName:
          data.user.fullName ||
          fullName,
        email:
          data.user.email ||
          email,
        mobile:
          data.user.mobile ||
          mobile,
        game:
          data.user.game ||
          user?.game ||
          game,
        gameUid:
          data.user.gameUid ||
          uid,
        bgmiUid:
          data.user.bgmiUid ||
          (game === "BGMI"
            ? uid
            : bgmiUid),
        freeFireUid:
          data.user.freeFireUid ||
          (game === "Free Fire"
            ? uid
            : freeFireUid),
        upiId:
          data.user.upiId ??
          upiId,
        role:
          data.user.role ||
          user?.role ||
          "user",
      };

      setUser(updatedUser);

      setBgmiUid(
        updatedUser.bgmiUid || ""
      );

      setFreeFireUid(
        updatedUser.freeFireUid || ""
      );

      setUpiId(
        updatedUser.upiId || ""
      );

      setMobile(
        updatedUser.mobile || mobile
      );

      setMessage(
        `${game} UID saved successfully.`
      );
    } catch (err) {
      console.error(
        "Game UID update error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : `Unable to update ${game} UID`
      );
    } finally {
      setSavingGame(null);
    }
  }

  // ====================================================
  // LOGOUT
  // ====================================================

  async function logout() {
    try {
      setError("");
      setMessage("");

      const response = await fetch(
        `${API_URL}/api/auth/logout`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
        }
      );

      const data =
        await parseResponse(response);

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Logout failed"
        );
      }

      window.location.href = "/login";
    } catch (err) {
      console.error(
        "Logout error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Logout failed"
      );
    }
  }

  // ====================================================
  // LOADING
  // ====================================================

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f7f8fb] px-4 py-10 text-[#20283a] sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1100px] animate-pulse">

          <div className="h-4 w-24 rounded bg-[#e3e6ec]" />

          <div className="mt-7 h-9 w-48 rounded bg-[#e3e6ec]" />

          <div className="mt-3 h-4 w-80 rounded bg-[#e9ebef]" />

          <div className="mt-8 grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">

            <div className="h-64 rounded-2xl bg-white ring-1 ring-[#e2e5eb]" />

            <div className="h-64 rounded-2xl bg-white ring-1 ring-[#e2e5eb]" />

          </div>

          <div className="mt-5 h-72 rounded-2xl bg-white ring-1 ring-[#e2e5eb]" />

        </div>
      </main>
    );
  }

  // ====================================================
  // NOT LOGGED IN
  // ====================================================

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f8fb] px-5 text-[#20283a]">

        <div className="w-full max-w-md rounded-2xl border border-[#e2e5eb] bg-white p-8 text-center shadow-sm">

          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#eef0ff] text-sm font-black text-[#4f46e5]">
            !
          </div>

          <h1 className="mt-5 text-2xl font-black">
            Login required
          </h1>

          <p className="mt-2 text-sm leading-6 text-[#8b93a4]">
            Please login to manage your
            account settings.
          </p>

          <Link
            href="/login"
            className="mt-6 inline-flex rounded-xl bg-[#252b55] px-6 py-3 text-xs font-bold text-white transition hover:bg-[#303867]"
          >
            Login →
          </Link>

        </div>

      </main>
    );
  }

  const initial =
    user.fullName
      ?.charAt(0)
      ?.toUpperCase() ||
    "U";

  return (
    <main className="min-h-screen bg-[#f7f8fb] text-[#20283a]">

      {/* ==================================================
          HEADER
      ================================================== */}

      <section className="border-b border-[#e3e6ec] bg-white">

        <div className="mx-auto max-w-[1100px] px-4 py-7 sm:px-6 lg:px-8">

          <Link
            href="/profile"
            className="inline-flex items-center gap-2 text-[11px] font-bold text-[#8b93a4] transition hover:text-[#4f46e5]"
          >
            ← Back to profile
          </Link>

          <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#4f46e5]">
                Account control
              </p>

              <h1 className="mt-2 text-3xl font-black tracking-tight text-[#20283a] sm:text-4xl">
                Settings
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-[#8b93a4]">
                Manage your account details, game
                identities and preferences.
              </p>

            </div>

            <div className="flex items-center gap-3 rounded-xl border border-[#e4e7ed] bg-[#fafbfc] px-3 py-2.5">

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#252b55] text-xs font-black text-white">
                {initial}
              </div>

              <div>

                <p className="text-[10px] font-extrabold text-[#30394c]">
                  {user.fullName}
                </p>

                <p className="mt-0.5 text-[9px] text-[#969dac]">
                  @{user.username}
                </p>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* ==================================================
          CONTENT
      ================================================== */}

      <section className="mx-auto max-w-[1100px] px-4 py-7 sm:px-6 lg:px-8 lg:py-9">

        {/* =================================================
            FEEDBACK
        ================================================= */}

        {message && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3.5">

            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-black text-white">
              ✓
            </span>

            <p className="text-xs font-semibold leading-5 text-emerald-700">
              {message}
            </p>

          </div>
        )}

        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5">

            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white">
              !
            </span>

            <p className="text-xs font-semibold leading-5 text-red-700">
              {error}
            </p>

          </div>
        )}

        {/* =================================================
            ACCOUNT + PROFILE SUMMARY
        ================================================= */}

        <div className="grid gap-5 lg:grid-cols-[0.72fr_1.28fr]">

          {/* PROFILE SUMMARY */}

          <section className="rounded-2xl border border-[#e1e5eb] bg-white">

            <div className="h-1.5 rounded-t-2xl bg-[#252b55]" />

            <div className="p-6">

              <div className="flex items-center gap-4">

                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#eef0ff] text-lg font-black text-[#4f46e5]">
                  {initial}
                </div>

                <div className="min-w-0">

                  <h2 className="truncate text-base font-black text-[#252d40]">
                    {user.fullName}
                  </h2>

                  <p className="mt-1 truncate text-[10px] text-[#969dac]">
                    @{user.username}
                  </p>

                </div>

              </div>

              <div className="mt-6 space-y-3">

                <SummaryRow
                  label="Email"
                  value={user.email || "Not set"}
                />

                <SummaryRow
                  label="Mobile"
                  value={user.mobile || "Not set"}
                />

                <SummaryRow
                  label="Game"
                  value={user.game || "Not set"}
                />

                <SummaryRow
                  label="UPI ID"
                  value={user.upiId || "Not set"}
                />

                <SummaryRow
                  label="Role"
                  value={
                    user.role === "admin"
                      ? "Administrator"
                      : "Player"
                  }
                />

              </div>

              <Link
                href="/profile"
                className="mt-6 flex w-full items-center justify-center rounded-xl border border-[#dfe3e9] px-4 py-2.5 text-[10px] font-bold text-[#4f46e5] transition hover:border-[#4f46e5] hover:bg-[#f7f7ff]"
              >
                View full profile →
              </Link>

            </div>

          </section>

          {/* ACCOUNT INFORMATION */}

          <section className="rounded-2xl border border-[#e1e5eb] bg-white">

            <SettingsSectionHeader
              eyebrow="Personal information"
              title="Account details"
              description="Update the information associated with your account."
            />

            <div className="p-5 sm:p-6">

              <div className="grid gap-5 sm:grid-cols-2">

                <FormField
                  label="Full name"
                  value={fullName}
                  onChange={setFullName}
                  placeholder="Your full name"
                />

                <FormField
                  label="Username"
                  value={username}
                  onChange={setUsername}
                  placeholder="Your username"
                />

                <FormField
                  label="Email address"
                  type="email"
                  value={email}
                  onChange={setEmail}
                  placeholder="you@example.com"
                />

                <div>

                  <label className="text-[10px] font-bold text-[#4d5668]">
                    Mobile number
                  </label>

                  <div className="relative mt-2">

                    <input
                      type="tel"
                      value={mobile}
                      readOnly
                      disabled
                      className="w-full cursor-not-allowed rounded-xl border border-[#e2e5eb] bg-[#f4f5f7] px-4 py-3 text-xs font-semibold text-[#8c94a3] outline-none"
                    />

                    <span className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md bg-[#e8eaf0] px-2 py-1 text-[8px] font-bold text-[#858d9d]">
                      LOCKED
                    </span>

                  </div>

                  <p className="mt-1.5 text-[9px] text-[#a0a6b3]">
                    Mobile number cannot be changed.
                  </p>

                </div>

                {/* UPI ID */}

                <div className="sm:col-span-2">

                  <label className="text-[10px] font-bold text-[#4d5668]">
                    UPI ID
                  </label>

                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) =>
                      setUpiId(e.target.value)
                    }
                    placeholder="example@upi"
                    autoComplete="off"
                    className="mt-2 w-full rounded-xl border border-[#dfe3e9] bg-white px-4 py-3 text-xs font-semibold text-[#30394c] outline-none transition placeholder:text-[#b1b6c0] focus:border-[#4f46e5] focus:ring-3 focus:ring-[#4f46e5]/10"
                  />

                  <p className="mt-1.5 text-[9px] text-[#a0a6b3]">
                    Add your UPI ID to receive tournament
                    winnings and payments.
                  </p>

                </div>

              </div>

              <div className="mt-6 flex justify-end">

                <button
                  type="button"
                  onClick={saveProfile}
                  disabled={savingProfile}
                  className="rounded-xl bg-[#252b55] px-5 py-3 text-[10px] font-bold text-white transition hover:bg-[#303867] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {savingProfile
                    ? "Saving changes..."
                    : "Save account changes"}
                </button>

              </div>

            </div>

          </section>

        </div>

        {/* =================================================
            GAME ACCOUNTS
        ================================================= */}

        <section className="mt-5 rounded-2xl border border-[#e1e5eb] bg-white">

          <SettingsSectionHeader
            eyebrow="Gaming identity"
            title="Game accounts"
            description="Connect your BGMI and Free Fire UIDs for tournament registration."
          />

          <div className="grid gap-4 p-5 sm:p-6 lg:grid-cols-2">

            {/* BGMI */}

            <GameAccountCard
              game="BGMI"
              uid={bgmiUid}
              setUid={setBgmiUid}
              saving={savingGame === "BGMI"}
              onSave={() =>
                saveGameUid("BGMI")
              }
              color="indigo"
            />

            {/* FREE FIRE */}

            <GameAccountCard
              game="Free Fire"
              uid={freeFireUid}
              setUid={setFreeFireUid}
              saving={
                savingGame === "Free Fire"
              }
              onSave={() =>
                saveGameUid("Free Fire")
              }
              color="orange"
            />

          </div>

        </section>

        {/* =================================================
            PREFERENCES
        ================================================= */}

        <section className="mt-5 rounded-2xl border border-[#e1e5eb] bg-white">

          <SettingsSectionHeader
            eyebrow="Preferences"
            title="Notifications"
            description="Control how tournament updates appear in your account."
          />

          <div className="px-5 py-5 sm:px-6">

            <div className="flex items-center justify-between gap-5 rounded-xl border border-[#e7e9ee] bg-[#fafbfc] p-4">

              <div className="flex items-start gap-3">

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#eef0ff] text-xs font-black text-[#4f46e5]">
                  N
                </div>

                <div>

                  <h3 className="text-xs font-extrabold text-[#30394c]">
                    Tournament notifications
                  </h3>

                  <p className="mt-1 max-w-lg text-[9px] leading-5 text-[#969dac]">
                    Receive updates about tournaments,
                    matches and competitive activity.
                  </p>

                </div>

              </div>

              <button
                type="button"
                onClick={() =>
                  setNotifications(
                    !notifications
                  )
                }
                aria-label="Toggle tournament notifications"
                className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                  notifications
                    ? "bg-[#4f46e5]"
                    : "bg-[#c9ced7]"
                }`}
              >

                <span
                  className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
                    notifications
                      ? "left-6"
                      : "left-1"
                  }`}
                />

              </button>

            </div>

          </div>

        </section>

        {/* =================================================
            ACCOUNT NAVIGATION
        ================================================= */}

        <section className="mt-5 overflow-hidden rounded-2xl border border-[#e1e5eb] bg-white">

          <div className="border-b border-[#edf0f4] px-5 py-4 sm:px-6">

            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#4f46e5]">
              Quick access
            </p>

            <h2 className="mt-1 text-sm font-extrabold text-[#252d40]">
              Account workspace
            </h2>

          </div>

          <div className="divide-y divide-[#edf0f4]">

            <SettingsLink
              href="/profile"
              number="01"
              title="My profile"
              description="View your player profile and tournament record."
            />

            <SettingsLink
              href="/my-tournaments"
              number="02"
              title="My tournaments"
              description="View tournaments you have joined."
            />

            <SettingsLink
              href="/notifications"
              number="03"
              title="Notifications"
              description="Check tournament and match updates."
            />

          </div>

        </section>

        {/* =================================================
            LOGOUT
        ================================================= */}

        <button
          type="button"
          onClick={logout}
          className="mt-5 flex w-full items-center justify-between rounded-2xl border border-red-200 bg-white px-5 py-4 text-left transition hover:border-red-300 hover:bg-red-50"
        >

          <div>

            <p className="text-xs font-extrabold text-red-600">
              Sign out
            </p>

            <p className="mt-1 text-[9px] text-[#a0a6b3]">
              End your current account session.
            </p>

          </div>

          <span className="text-sm text-red-400">
            →
          </span>

        </button>

      </section>

    </main>
  );
}

// ============================================================
// SETTINGS HEADER
// ============================================================

function SettingsSectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="border-b border-[#edf0f4] px-5 py-4 sm:px-6">

      <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#4f46e5]">
        {eyebrow}
      </p>

      <h2 className="mt-1 text-base font-extrabold text-[#252d40]">
        {title}
      </h2>

      <p className="mt-1 text-[10px] leading-5 text-[#969dac]">
        {description}
      </p>

    </div>
  );
}

// ============================================================
// FORM FIELD
// ============================================================

function FormField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <div>

      <label className="text-[10px] font-bold text-[#4d5668]">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        placeholder={placeholder}
        className="mt-2 w-full rounded-xl border border-[#dfe3e9] bg-white px-4 py-3 text-xs font-semibold text-[#30394c] outline-none transition placeholder:text-[#b1b6c0] focus:border-[#4f46e5] focus:ring-3 focus:ring-[#4f46e5]/10"
      />

    </div>
  );
}

// ============================================================
// GAME ACCOUNT CARD
// ============================================================

function GameAccountCard({
  game,
  uid,
  setUid,
  saving,
  onSave,
  color,
}: {
  game: "BGMI" | "Free Fire";
  uid: string;
  setUid: (value: string) => void;
  saving: boolean;
  onSave: () => void;
  color: "indigo" | "orange";
}) {
  const isIndigo =
    color === "indigo";

  return (
    <div
      className={`rounded-2xl border p-5 ${
        isIndigo
          ? "border-[#dfe2ff] bg-[#f9f9ff]"
          : "border-[#ffe2d1] bg-[#fffaf7]"
      }`}
    >

      <div className="flex items-center justify-between gap-3">

        <div className="flex items-center gap-3">

          <div
            className={`flex h-11 w-11 items-center justify-center rounded-xl text-xs font-black ${
              isIndigo
                ? "bg-[#eef0ff] text-[#4f46e5]"
                : "bg-[#fff0e7] text-[#ea580c]"
            }`}
          >
            {isIndigo
              ? "B"
              : "F"}
          </div>

          <div>

            <h3 className="text-sm font-black text-[#30394c]">
              {game}
            </h3>

            <p className="mt-0.5 text-[9px] text-[#969dac]">
              Player game identity
            </p>

          </div>

        </div>

        {uid && (
          <span className="rounded-full bg-[#ecfdf5] px-2.5 py-1 text-[8px] font-bold text-[#059669]">
            Connected
          </span>
        )}

      </div>

      <div className="mt-5">

        <label className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#737b8b]">
          {game} UID
        </label>

        <input
          type="text"
          value={uid}
          onChange={(e) =>
            setUid(e.target.value)
          }
          placeholder={`Enter ${game} UID`}
          autoComplete="off"
          className="mt-2 w-full rounded-xl border border-[#dfe3e9] bg-white px-4 py-3 text-xs font-semibold text-[#30394c] outline-none transition placeholder:text-[#b1b6c0] focus:border-[#4f46e5] focus:ring-3 focus:ring-[#4f46e5]/10"
        />

      </div>

      <button
        type="button"
        onClick={onSave}
        disabled={saving}
        className={`mt-4 w-full rounded-xl px-4 py-3 text-[10px] font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${
          isIndigo
            ? "bg-[#4f46e5] hover:bg-[#4338ca]"
            : "bg-[#ea580c] hover:bg-[#c2410c]"
        }`}
      >
        {saving
          ? "Saving..."
          : uid
          ? `Update ${game} UID`
          : `Add ${game} UID`}
      </button>

    </div>
  );
}

// ============================================================
// SUMMARY ROW
// ============================================================

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg bg-[#fafbfc] px-3 py-2.5">

      <span className="shrink-0 text-[9px] font-bold uppercase tracking-wide text-[#9aa1ae]">
        {label}
      </span>

      <span className="max-w-[60%] break-words text-right text-[10px] font-bold text-[#4b5568]">
        {value}
      </span>

    </div>
  );
}

// ============================================================
// SETTINGS LINK
// ============================================================

function SettingsLink({
  href,
  number,
  title,
  description,
}: {
  href: string;
  number: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 px-5 py-4 transition hover:bg-[#fafbfc] sm:px-6"
    >

      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#f1f2f7] text-[9px] font-black text-[#626b7c] transition group-hover:bg-[#eef0ff] group-hover:text-[#4f46e5]">
        {number}
      </div>

      <div className="min-w-0 flex-1">

        <h3 className="text-xs font-extrabold text-[#30394c]">
          {title}
        </h3>

        <p className="mt-1 text-[9px] leading-4 text-[#969dac]">
          {description}
        </p>

      </div>

      <span className="text-sm text-[#b5bac4] transition group-hover:translate-x-0.5 group-hover:text-[#4f46e5]">
        →
      </span>

    </Link>
  );
}