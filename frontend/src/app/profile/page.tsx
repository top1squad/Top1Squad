"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/* ============================================================
   TYPES
============================================================ */

type User = {
  id: string;
  username: string;
  fullName: string;
  email: string;
  mobile: string;
  game: "BGMI" | "Free Fire";
  gameUid: string;
  role: "user" | "admin";
};

type ProfileStats = {
  tournamentsJoined: number;
  tournamentsWon: number;
};

/* ============================================================
   API
============================================================ */

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5001";

/* ============================================================
   PROFILE PAGE
============================================================ */

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);

  const [stats, setStats] = useState<ProfileStats>({
    tournamentsJoined: 0,
    tournamentsWon: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ==========================================================
     LOAD PROFILE
  ========================================================== */

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError("");

        /* CURRENT USER */

        const userResponse = await fetch(
          `${API_URL}/api/auth/me`,
          {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const userData = await userResponse.json();

        if (!userResponse.ok) {
          throw new Error(
            userData.message ||
              "Unable to load profile"
          );
        }

        if (
          !userData.success ||
          !userData.authenticated ||
          !userData.user
        ) {
          throw new Error(
            "You are not logged in"
          );
        }

        setUser(userData.user);

        /* PROFILE STATISTICS */

        const statsResponse = await fetch(
          `${API_URL}/api/profile/stats`,
          {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const statsData =
          await statsResponse.json();

        if (!statsResponse.ok) {
          throw new Error(
            statsData.message ||
              "Unable to load statistics"
          );
        }

        if (statsData.success) {
          setStats(statsData.stats);
        }
      } catch (err) {
        console.error(
          "Profile error:",
          err
        );

        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError(
            "Something went wrong"
          );
        }
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  /* ==========================================================
     LOADING
  ========================================================== */

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f7f8fb] px-4 py-10 text-[#20283a] sm:px-6 lg:px-8">

        <div className="mx-auto max-w-[1200px]">

          <div className="animate-pulse">

            <div className="h-4 w-24 rounded bg-[#e5e8ee]" />

            <div className="mt-8 h-9 w-52 rounded bg-[#e5e8ee]" />

            <div className="mt-3 h-4 w-80 rounded bg-[#e9ebf0]" />

            <div className="mt-8 h-56 rounded-2xl bg-white ring-1 ring-[#e3e6ed]" />

            <div className="mt-5 grid gap-5 md:grid-cols-2">

              <div className="h-48 rounded-2xl bg-white ring-1 ring-[#e3e6ed]" />

              <div className="h-48 rounded-2xl bg-white ring-1 ring-[#e3e6ed]" />

            </div>

          </div>

        </div>

      </main>
    );
  }

  /* ==========================================================
     ERROR
  ========================================================== */

  if (error || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f8fb] px-5 text-[#20283a]">

        <div className="w-full max-w-md rounded-2xl border border-[#e2e5eb] bg-white p-8 text-center shadow-sm">

          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#eef0ff] text-sm font-black text-[#4f46e5]">
            !
          </div>

          <h1 className="mt-5 text-2xl font-black">
            Profile unavailable
          </h1>

          <p className="mt-2 text-sm leading-6 text-[#8b93a4]">
            {error ||
              "Please login to view your profile."}
          </p>

          <Link
            href="/login"
            className="mt-6 inline-flex rounded-xl bg-[#252b55] px-6 py-3 text-xs font-bold text-white transition hover:bg-[#303867]"
          >
            Go to login →
          </Link>

        </div>

      </main>
    );
  }

  /* ==========================================================
     PROFILE DATA
  ========================================================== */

  const avatarLetter =
    user.fullName
      ?.charAt(0)
      ?.toUpperCase() || "U";

  const winRate =
    stats.tournamentsJoined > 0
      ? Math.round(
          (stats.tournamentsWon /
            stats.tournamentsJoined) *
            100
        )
      : 0;

  const isBGMI = user.game === "BGMI";

  /* ==========================================================
     UI
  ========================================================== */

  return (
    <main className="min-h-screen bg-[#f7f8fb] text-[#20283a]">

      {/* ======================================================
          PAGE HEADER
      ====================================================== */}

      <section className="border-b border-[#e4e7ed] bg-white">

        <div className="mx-auto max-w-[1200px] px-4 py-7 sm:px-6 lg:px-8">

          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[11px] font-bold text-[#8b93a4] transition hover:text-[#4f46e5]"
          >
            ← Back to home
          </Link>

          <div className="mt-6">

            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#4f46e5]">
              Account
            </p>

            <h1 className="mt-2 text-3xl font-black tracking-tight text-[#20283a] sm:text-4xl">
              My Profile
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-[#8b93a4]">
              Manage your player identity, gaming account
              and competitive activity.
            </p>

          </div>

        </div>

      </section>

      {/* ======================================================
          CONTENT
      ====================================================== */}

      <section className="mx-auto max-w-[1200px] px-4 py-7 sm:px-6 lg:px-8 lg:py-10">

        {/* ====================================================
            PROFILE HERO
        ==================================================== */}

        <div className="overflow-hidden rounded-2xl border border-[#dfe3ea] bg-white">

          <div className="h-2 bg-[#252b55]" />

          <div className="p-5 sm:p-7">

            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">

                {/* AVATAR */}

                <div
                  className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl text-2xl font-black ${
                    isBGMI
                      ? "bg-[#eef0ff] text-[#4f46e5]"
                      : "bg-[#fff1e9] text-[#ea580c]"
                  }`}
                >
                  {avatarLetter}
                </div>

                {/* USER */}

                <div>

                  <div className="flex flex-wrap items-center gap-2">

                    <h2 className="text-2xl font-black tracking-tight text-[#20283a]">
                      {user.fullName}
                    </h2>

                    {user.role === "admin" && (
                      <span className="rounded-full bg-[#f1f2f6] px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-[#626b7c]">
                        Admin
                      </span>
                    )}

                  </div>

                  <p className="mt-1 text-xs text-[#9299a8]">
                    @{user.username}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">

                    <span
                      className={`rounded-full px-3 py-1.5 text-[9px] font-bold ${
                        isBGMI
                          ? "bg-[#eef0ff] text-[#4f46e5]"
                          : "bg-[#fff1e9] text-[#ea580c]"
                      }`}
                    >
                      {user.game} Player
                    </span>

                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ecfdf5] px-3 py-1.5 text-[9px] font-bold text-[#059669]">

                      <span className="h-1.5 w-1.5 rounded-full bg-[#10b981]" />

                      Account active

                    </span>

                  </div>

                </div>

              </div>

              <Link
                href="/settings"
                className="inline-flex items-center justify-center rounded-xl bg-[#252b55] px-5 py-3 text-[11px] font-bold text-white transition hover:bg-[#303867]"
              >
                Edit profile →
              </Link>

            </div>

          </div>

        </div>

        {/* ====================================================
            QUICK STATS
        ==================================================== */}

        <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">

          <StatCard
            label="Tournaments joined"
            value={String(stats.tournamentsJoined)}
          />

          <StatCard
            label="Tournaments won"
            value={String(stats.tournamentsWon)}
            accent
          />

          <StatCard
            label="Win rate"
            value={`${winRate}%`}
          />

          <StatCard
            label="Game"
            value={user.game}
            small
          />

        </div>

        {/* ====================================================
            MAIN GRID
        ==================================================== */}

        <div className="mt-5 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">

          {/* ==================================================
              ACCOUNT INFORMATION
          ================================================== */}

          <section className="rounded-2xl border border-[#e2e5eb] bg-white">

            <div className="border-b border-[#edf0f4] px-5 py-4 sm:px-6">

              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#4f46e5]">
                Personal
              </p>

              <h2 className="mt-1 text-base font-extrabold text-[#252d40]">
                Account information
              </h2>

            </div>

            <div className="grid gap-x-6 gap-y-0 sm:grid-cols-2">

              <InfoField
                label="Full name"
                value={user.fullName}
              />

              <InfoField
                label="Username"
                value={`@${user.username}`}
              />

              <InfoField
                label="Email address"
                value={user.email}
              />

              <InfoField
                label="Mobile number"
                value={user.mobile}
              />

            </div>

          </section>

          {/* ==================================================
              GAME ACCOUNT
          ================================================== */}

          <section className="rounded-2xl border border-[#e2e5eb] bg-white">

            <div className="border-b border-[#edf0f4] px-5 py-4 sm:px-6">

              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#4f46e5]">
                Gaming identity
              </p>

              <h2 className="mt-1 text-base font-extrabold text-[#252d40]">
                Game account
              </h2>

            </div>

            <div className="p-5 sm:p-6">

              <div
                className={`rounded-xl border p-5 ${
                  isBGMI
                    ? "border-[#dfe2ff] bg-[#f7f7ff]"
                    : "border-[#ffe0cf] bg-[#fff9f5]"
                }`}
              >

                <div className="flex items-start justify-between gap-4">

                  <div className="flex items-center gap-3">

                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-xl text-xs font-black ${
                        isBGMI
                          ? "bg-[#eef0ff] text-[#4f46e5]"
                          : "bg-[#fff1e9] text-[#ea580c]"
                      }`}
                    >
                      {isBGMI ? "B" : "F"}
                    </div>

                    <div>

                      <h3 className="text-sm font-extrabold text-[#252d40]">
                        {user.game}
                      </h3>

                      <p className="mt-0.5 text-[9px] text-[#969dac]">
                        Registered game account
                      </p>

                    </div>

                  </div>

                  <span className="rounded-full bg-[#ecfdf5] px-2.5 py-1 text-[8px] font-bold text-[#059669]">
                    Verified
                  </span>

                </div>

                <div className="mt-6">

                  <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#969dac]">
                    {user.game} UID
                  </p>

                  <div className="mt-2 flex items-center justify-between gap-3">

                    <p className="break-all text-sm font-black text-[#252d40]">
                      {user.gameUid}
                    </p>

                    <span className="shrink-0 text-[9px] font-bold text-[#a0a6b3]">
                      UID
                    </span>

                  </div>

                </div>

              </div>

            </div>

          </section>

        </div>

        {/* ====================================================
            PERFORMANCE
        ==================================================== */}

        <section className="mt-5 rounded-2xl border border-[#e2e5eb] bg-white">

          <div className="border-b border-[#edf0f4] px-5 py-4 sm:px-6">

            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">

              <div>

                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#4f46e5]">
                  Performance
                </p>

                <h2 className="mt-1 text-base font-extrabold text-[#252d40]">
                  Tournament record
                </h2>

              </div>

              <Link
                href="/leaderboard"
                className="text-[10px] font-bold text-[#4f46e5]"
              >
                View leaderboard →
              </Link>

            </div>

          </div>

          <div className="grid gap-0 sm:grid-cols-2">

            <PerformanceItem
              number={stats.tournamentsJoined}
              title="Tournaments joined"
              description="Competitions you've entered."
            />

            <PerformanceItem
              number={stats.tournamentsWon}
              title="Tournaments won"
              description="Competitions where you finished first."
              accent
            />

          </div>

          <div className="border-t border-[#edf0f4] px-5 py-5 sm:px-6">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#969dac]">
                  Win rate
                </p>

                <p className="mt-1 text-xl font-black text-[#252d40]">
                  {winRate}%
                </p>

              </div>

              <div className="w-40 max-w-[45%]">

                <div className="h-2 overflow-hidden rounded-full bg-[#eef0f4]">

                  <div
                    className="h-full rounded-full bg-[#4f46e5] transition-all"
                    style={{
                      width: `${Math.min(
                        winRate,
                        100
                      )}%`,
                    }}
                  />

                </div>

                <p className="mt-2 text-right text-[8px] text-[#a0a6b3]">
                  Based on joined tournaments
                </p>

              </div>

            </div>

          </div>

        </section>

        {/* ====================================================
            ACCOUNT ACTIONS
        ==================================================== */}

        <section className="mt-5 rounded-2xl border border-[#e2e5eb] bg-white">

          <div className="border-b border-[#edf0f4] px-5 py-4 sm:px-6">

            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#4f46e5]">
              Workspace
            </p>

            <h2 className="mt-1 text-base font-extrabold text-[#252d40]">
              Account & activity
            </h2>

          </div>

          <div className="divide-y divide-[#edf0f4]">

            <AccountAction
              href="/my-tournaments"
              number="01"
              title="My tournaments"
              description="View tournaments you have joined."
            />

            <AccountAction
              href="/my-matches"
              number="02"
              title="My matches"
              description="View upcoming and completed matches."
            />

            <AccountAction
              href="/notifications"
              number="03"
              title="Notifications"
              description="Check tournament and match updates."
            />

            <AccountAction
              href="/settings"
              number="04"
              title="Settings"
              description="Manage your account settings."
            />

          </div>

        </section>

        {/* ====================================================
            LOGOUT
        ==================================================== */}

        <LogoutButton />

      </section>

    </main>
  );
}

/* ============================================================
   STAT CARD
============================================================ */

function StatCard({
  label,
  value,
  accent = false,
  small = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
  small?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-[#e2e5eb] bg-white p-4 sm:p-5">

      <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#969dac]">
        {label}
      </p>

      <p
        className={`mt-2 font-black tracking-tight ${
          small
            ? "text-base"
            : "text-2xl"
        } ${
          accent
            ? "text-[#4f46e5]"
            : "text-[#252d40]"
        }`}
      >
        {value}
      </p>

    </div>
  );
}

/* ============================================================
   INFO FIELD
============================================================ */

function InfoField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="border-b border-[#edf0f4] px-5 py-4 last:border-b-0 sm:px-6 sm:nth-[2]:border-b-0">

      <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#969dac]">
        {label}
      </p>

      <p className="mt-1.5 break-words text-xs font-bold text-[#30394c]">
        {value}
      </p>

    </div>
  );
}

/* ============================================================
   PERFORMANCE ITEM
============================================================ */

function PerformanceItem({
  number,
  title,
  description,
  accent = false,
}: {
  number: number;
  title: string;
  description: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center gap-4 px-5 py-5 sm:px-6">

      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-lg font-black ${
          accent
            ? "bg-[#eef0ff] text-[#4f46e5]"
            : "bg-[#f1f2f6] text-[#4b5568]"
        }`}
      >
        {number}
      </div>

      <div>

        <h3 className="text-xs font-extrabold text-[#30394c]">
          {title}
        </h3>

        <p className="mt-1 text-[9px] leading-4 text-[#969dac]">
          {description}
        </p>

      </div>

    </div>
  );
}

/* ============================================================
   ACCOUNT ACTION
============================================================ */

function AccountAction({
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

        <p className="mt-1 text-[9px] text-[#969dac]">
          {description}
        </p>

      </div>

      <span className="text-sm text-[#b5bac4] transition group-hover:translate-x-0.5 group-hover:text-[#4f46e5]">
        →
      </span>

    </Link>
  );
}

/* ============================================================
   LOGOUT
============================================================ */

function LogoutButton() {
  const [loading, setLoading] =
    useState(false);

  const handleLogout = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/api/auth/logout`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type":
              "application/json",
          },
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Logout failed"
        );
      }

      window.location.href = "/login";
    } catch (error) {
      console.error(
        "Logout error:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Logout failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className="mt-5 flex w-full items-center justify-between rounded-2xl border border-red-200 bg-white px-5 py-4 text-left transition hover:border-red-300 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
    >

      <div>

        <p className="text-xs font-extrabold text-red-600">
          {loading
            ? "Signing out..."
            : "Sign out"}
        </p>

        <p className="mt-1 text-[9px] text-[#a0a6b3]">
          End your current account session.
        </p>

      </div>

      <span className="text-sm text-red-400">
        →
      </span>

    </button>
  );
}