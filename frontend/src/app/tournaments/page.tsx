"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import TournamentCard from "../../components/TournamentCard";

// ======================================================
// API CONFIG
// ======================================================
//
// Development:
//   NEXT_PUBLIC_API_URL=http://localhost:5001
//
// Production:
//   Set NEXT_PUBLIC_API_URL in your frontend hosting
//   environment variables to your deployed Express backend.
//
// Example:
//   https://your-backend-domain.com
//
// The code also supports:
//   https://your-backend-domain.com/api
//
// We normalize it so requests always become:
//   https://your-backend-domain.com/api/tournaments
// ======================================================

const RAW_API_URL =
  process.env.NEXT_PUBLIC_API_URL ||""
  

const API_URL = RAW_API_URL
  .trim()
  .replace(/\/+$/, "")
  .replace(/\/api$/i, "");

// ======================================================
// TYPES
// ======================================================

interface Tournament {
  _id: string;

  name: string;

  game: "BGMI" | "Free Fire";

  prize: number;

  entryFee: number;

  maxTeams: number;

  registeredTeams: number;

  date: string;

  time: string;

  mode: string;

  map: string;

  status:
    | "Upcoming"
    | "Live"
    | "Completed"
    | "Cancelled";

  description: string;

  rules: string[];
}

// ======================================================
// API RESPONSE HELPERS
// ======================================================

async function parseApiResponse(
  response: Response
): Promise<any> {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    console.error(
      "Backend returned non-JSON response:",
      text
    );

    return {
      message:
        "Backend returned an invalid response.",
    };
  }
}

// ======================================================
// PAGE
// ======================================================

export default function TournamentsPage() {
  // ====================================================
  // STATE
  // ====================================================

  const [tournaments, setTournaments] =
    useState<Tournament[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // ====================================================
  // GET TOURNAMENTS
  // ====================================================

  useEffect(() => {
    let mounted = true;

    const controller =
      new AbortController();

    const fetchTournaments =
      async () => {
        try {
          setLoading(true);
          setError("");

          // ============================================
          // CHECK API URL
          // ============================================

          if (!API_URL) {
            throw new Error(
              "Backend API URL is not configured."
            );
          }

          const endpoint =
            `${API_URL}/api/tournaments`;

          console.log(
            "[TOURNAMENTS] Fetching:",
            endpoint
          );

          // ============================================
          // REQUEST BACKEND
          // ============================================

          const response =
            await fetch(
              endpoint,
              {
                method: "GET",

                credentials:
                  "include",

                headers: {
                  Accept:
                    "application/json",
                },

                cache:
                  "no-store",

                signal:
                  controller.signal,
              }
            );

          // ============================================
          // PARSE RESPONSE
          // ============================================

          const data =
            await parseApiResponse(
              response
            );

          console.log(
            "[TOURNAMENTS] Backend response:",
            {
              status:
                response.status,

              ok:
                response.ok,

              data,
            }
          );

          // ============================================
          // COMPONENT UNMOUNTED
          // ============================================

          if (!mounted) {
            return;
          }

          // ============================================
          // AUTHENTICATION ERROR
          // ============================================

          if (
            response.status ===
            401
          ) {
            setError(
              data?.message ||
                "Please login to view tournaments."
            );

            return;
          }

          // ============================================
          // FORBIDDEN
          // ============================================

          if (
            response.status ===
            403
          ) {
            setError(
              data?.message ||
                "You do not have permission to view tournaments."
            );

            return;
          }

          // ============================================
          // NOT FOUND
          // ============================================

          if (
            response.status ===
            404
          ) {
            setError(
              data?.message ||
                "Tournament API endpoint was not found."
            );

            return;
          }

          // ============================================
          // SERVER ERROR
          // ============================================

          if (
            response.status >=
            500
          ) {
            setError(
              data?.message ||
                "The tournament server is temporarily unavailable. Please try again."
            );

            return;
          }

          // ============================================
          // OTHER BACKEND ERROR
          // ============================================

          if (!response.ok) {
            throw new Error(
              data?.message ||
                data?.error ||
                `Failed to fetch tournaments. HTTP ${response.status}`
            );
          }

          // ============================================
          // EXTRACT TOURNAMENT LIST
          // ============================================

          let tournamentList:
            Tournament[] = [];

          // Backend returns:
          //
          // [
          //   {...},
          //   {...}
          // ]

          if (
            Array.isArray(data)
          ) {
            tournamentList =
              data;
          }

          // Backend returns:
          //
          // {
          //   tournaments: [...]
          // }

          else if (
            Array.isArray(
              data?.tournaments
            )
          ) {
            tournamentList =
              data.tournaments;
          }

          // Backend returns:
          //
          // {
          //   data: [...]
          // }

          else if (
            Array.isArray(
              data?.data
            )
          ) {
            tournamentList =
              data.data;
          }

          // Backend returns:
          //
          // {
          //   data: {
          //     tournaments: [...]
          //   }
          // }

          else if (
            Array.isArray(
              data?.data
                ?.tournaments
            )
          ) {
            tournamentList =
              data.data.tournaments;
          }

          // Backend returns:
          //
          // {
          //   success: true,
          //   data: {
          //     tournaments: [...]
          //   }
          // }

          else {
            tournamentList =
              [];
          }

          // ============================================
          // BASIC DATA NORMALIZATION
          // ============================================

          const normalizedTournaments =
            tournamentList
              .filter(
                (item) =>
                  item &&
                  item._id
              )
              .map(
                (item) => ({
                  ...item,

                  prize:
                    Number(
                      item.prize || 0
                    ),

                  entryFee:
                    Number(
                      item.entryFee ||
                        0
                    ),

                  maxTeams:
                    Number(
                      item.maxTeams ||
                        0
                    ),

                  registeredTeams:
                    Number(
                      item.registeredTeams ||
                        0
                    ),

                  description:
                    item.description ||
                    "",

                  rules:
                    Array.isArray(
                      item.rules
                    )
                      ? item.rules
                      : [],
                })
              );

          // ============================================
          // SAVE TO STATE
          // ============================================

          setTournaments(
            normalizedTournaments
          );

          console.log(
            "[TOURNAMENTS] Loaded:",
            normalizedTournaments.length
          );
        } catch (err) {
          // ==========================================
          // ABORT
          // ==========================================

          if (
            err instanceof
              DOMException &&
            err.name ===
              "AbortError"
          ) {
            return;
          }

          if (
            err instanceof Error &&
            err.name ===
              "AbortError"
          ) {
            return;
          }

          // ==========================================
          // LOG ERROR
          // ==========================================

          console.error(
            "[TOURNAMENTS] Fetch error:",
            err
          );

          // ==========================================
          // SHOW ERROR
          // ==========================================

          if (mounted) {
            setError(
              err instanceof Error
                ? err.message
                : "Unable to connect to the tournament server."
            );
          }
        } finally {
          if (mounted) {
            setLoading(false);
          }
        }
      };

    fetchTournaments();

    // ================================================
    // CLEANUP
    // ================================================

    return () => {
      mounted = false;

      controller.abort();
    };
  }, []);

  // ====================================================
  // FILTER ACTIVE TOURNAMENTS
  // ====================================================

  const upcomingTournaments =
    tournaments.filter(
      (tournament) =>
        tournament.status ===
          "Upcoming" ||
        tournament.status ===
          "Live"
    );

  // ====================================================
  // TOTAL REGISTERED TEAMS
  // ====================================================

  const totalTeams =
    tournaments.reduce(
      (
        total,
        tournament
      ) =>
        total +
        Number(
          tournament.registeredTeams ||
            0
        ),
      0
    );

  // ====================================================
  // TOTAL PRIZE MONEY
  // ====================================================

  const totalPrize =
    tournaments.reduce(
      (
        total,
        tournament
      ) =>
        total +
        Number(
          tournament.prize ||
            0
        ),
      0
    );

  // ====================================================
  // RETRY
  // ====================================================

  const handleRetry =
    () => {
      window.location.reload();
    };

  // ====================================================
  // RENDER
  // ====================================================

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* =================================================
          BACKGROUND
      ================================================= */}

      <div className="pointer-events-none fixed inset-0 -z-0 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-blue-100/60 blur-[140px]" />

        <div className="absolute bottom-0 left-0 h-[350px] w-[350px] rounded-full bg-blue-50 blur-[120px]" />

        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(#2563eb 1px, transparent 1px), linear-gradient(90deg, #2563eb 1px, transparent 1px)",

            backgroundSize:
              "50px 50px",
          }}
        />
      </div>

      {/* =================================================
          HEADER
      ================================================= */}

      <section className="relative z-10 border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
            {/* HERO */}

            <div className="max-w-3xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2">
                <span className="h-2 w-2 rounded-full bg-blue-600" />

                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-600">
                  Tournament Arena
                </span>
              </div>

              <h1 className="text-4xl font-black tracking-[-0.04em] text-slate-900 sm:text-5xl lg:text-6xl">
                Compete.

                <span className="block text-blue-600">
                  Conquer.
                </span>
              </h1>

              <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base">
                Choose your tournament,
                build your team and
                compete against the best
                players for exciting
                rewards and prizes.
              </p>
            </div>

            {/* BACK BUTTON */}

            <Link
              href="/"
              className="group inline-flex w-fit items-center gap-3 rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 hover:shadow-md"
            >
              <span className="transition-transform duration-200 group-hover:-translate-x-1">
                ←
              </span>

              Back to Home
            </Link>
          </div>

          {/* =================================================
              STATS
          ================================================= */}

          {!loading &&
            !error && (
              <div className="mt-12 grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-3">
                {/* TOURNAMENTS */}

                <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    🏆
                  </div>

                  <p className="text-2xl font-black tracking-tight text-slate-900">
                    {
                      tournaments.length
                    }
                  </p>

                  <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Tournaments
                  </p>
                </div>

                {/* TEAMS */}

                <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    👥
                  </div>

                  <p className="text-2xl font-black tracking-tight text-slate-900">
                    {totalTeams}+
                  </p>

                  <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Registered Teams
                  </p>
                </div>

                {/* PRIZE */}

                <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    💰
                  </div>

                  <p className="text-2xl font-black tracking-tight text-blue-600">
                    ₹
                    {totalPrize.toLocaleString(
                      "en-IN"
                    )}
                    +
                  </p>

                  <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Prize Money
                  </p>
                </div>
              </div>
            )}
        </div>
      </section>

      {/* =================================================
          TOURNAMENT SECTION
      ================================================= */}

      <section className="relative z-10 mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20">
        {/* =================================================
            LOADING
        ================================================= */}

        {loading && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map(
              (item) => (
                <div
                  key={item}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                >
                  <div className="h-1 w-full bg-gradient-to-r from-blue-500 to-blue-100" />

                  <div className="animate-pulse p-6">
                    <div className="h-4 w-24 rounded bg-slate-200" />

                    <div className="mt-5 h-7 w-3/4 rounded bg-slate-200" />

                    <div className="mt-4 h-4 w-full rounded bg-slate-100" />

                    <div className="mt-2 h-4 w-5/6 rounded bg-slate-100" />

                    <div className="mt-8 grid grid-cols-2 gap-3">
                      <div className="h-16 rounded-xl bg-slate-100" />

                      <div className="h-16 rounded-xl bg-slate-100" />
                    </div>

                    <div className="mt-5 h-11 rounded-xl bg-slate-100" />
                  </div>
                </div>
              )
            )}
          </div>
        )}

        {/* =================================================
            ERROR
        ================================================= */}

        {!loading && error && (
          <div className="mx-auto max-w-xl">
            <div className="overflow-hidden rounded-2xl border border-red-200 bg-white shadow-sm">
              <div className="h-1 bg-gradient-to-r from-red-500 to-red-100" />

              <div className="p-8 text-center sm:p-10">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-red-200 bg-red-50 text-2xl text-red-600">
                  !
                </div>

                <h2 className="mt-5 text-xl font-bold text-slate-900">
                  Unable to load
                  tournaments
                </h2>

                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-red-500">
                  {error}
                </p>

                {/* API DEBUG INFORMATION */}

                <p className="mx-auto mt-3 max-w-md break-all text-xs text-slate-400">
                  API:{" "}
                  {API_URL}/api/tournaments
                </p>

                <button
                  type="button"
                  onClick={
                    handleRetry
                  }
                  className="mt-7 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:bg-blue-700 hover:shadow-md"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =================================================
            EMPTY
        ================================================= */}

        {!loading &&
          !error &&
          upcomingTournaments.length ===
            0 && (
            <div className="mx-auto max-w-2xl">
              <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm sm:p-14">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-200 bg-blue-50 text-2xl">
                  🎮
                </div>

                <h2 className="mt-6 text-2xl font-black tracking-tight text-slate-900">
                  No tournaments
                  available
                </h2>

                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
                  There are currently no
                  upcoming tournaments.
                  Check back soon for new
                  competitions.
                </p>

                <div className="mx-auto mt-7 h-px max-w-xs bg-gradient-to-r from-transparent via-blue-300 to-transparent" />
              </div>
            </div>
          )}

        {/* =================================================
            TOURNAMENT CARDS
        ================================================= */}

        {!loading &&
          !error &&
          upcomingTournaments.length >
            0 && (
            <>
              {/* SECTION TITLE */}

              <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-blue-600" />

                    <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-blue-600">
                      Compete now
                    </p>
                  </div>

                  <h2 className="mt-3 text-3xl font-black tracking-[-0.03em] text-slate-900 sm:text-4xl">
                    Available
                    Tournaments
                  </h2>

                  <p className="mt-2 text-sm text-slate-500">
                    Join an active
                    competition and prove
                    your skills.
                  </p>
                </div>

                <div className="flex h-fit items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-600">
                  <span className="h-2 w-2 rounded-full bg-blue-600" />

                  {
                    upcomingTournaments.length
                  }{" "}
                  Active
                </div>
              </div>

              {/* CARDS */}

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {upcomingTournaments.map(
                  (tournament) => (
                    <TournamentCard
                      key={
                        tournament._id
                      }
                      tournament={
                        tournament
                      }
                    />
                  )
                )}
              </div>
            </>
          )}
      </section>
    </main>
  );
}