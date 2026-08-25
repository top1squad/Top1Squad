"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import TournamentCard from "../../components/TournamentCard";

// ======================================================
// API
// ======================================================

const RAW_API_URL =
  process.env.NEXT_PUBLIC_API_URL || "";

const API_URL = RAW_API_URL
  .replace(/\/+$/, "")
  .replace(/\/api$/, "");

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
  status: "Upcoming" | "Live" | "Completed" | "Cancelled";
  description: string;
  rules: string[];
}

export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================
  // GET TOURNAMENTS
  // ==========================================

  useEffect(() => {
    let mounted = true;

    const fetchTournaments = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/tournaments`,
          {
            method: "GET",

            credentials: "include",

            headers: {
              Accept: "application/json",
            },

            cache: "no-store",
          }
        );

        const data = await response.json().catch(() => null);

        console.log("Tournament response:", {
          status: response.status,
          ok: response.ok,
          data,
        });

        // ==========================================
        // NOT AUTHENTICATED
        // ==========================================

        if (response.status === 401) {
          if (mounted) {
            setError("Please login to view tournaments.");
          }

          return;
        }

        // ==========================================
        // OTHER BACKEND ERROR
        // ==========================================

        if (!response.ok) {
          throw new Error(
            data?.message ||
              data?.error ||
              "Failed to fetch tournaments"
          );
        }

        // ==========================================
        // GET TOURNAMENT LIST
        // ==========================================

        let tournamentList: Tournament[] = [];

        if (Array.isArray(data)) {
          tournamentList = data;
        } else if (Array.isArray(data?.tournaments)) {
          tournamentList = data.tournaments;
        } else if (Array.isArray(data?.data)) {
          tournamentList = data.data;
        }

        // ==========================================
        // SAVE DATA
        // ==========================================

        if (mounted) {
          setTournaments(tournamentList);
        }
      } catch (err) {
        console.error("Tournament fetch error:", err);

        if (mounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load tournaments."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchTournaments();

    return () => {
      mounted = false;
    };
  }, []);

  // ==========================================
  // FILTER
  // ==========================================

  const upcomingTournaments = tournaments.filter(
    (tournament) =>
      tournament.status === "Upcoming" ||
      tournament.status === "Live"
  );

  // ==========================================
  // STATS
  // ==========================================

  const totalTeams = tournaments.reduce(
    (total, tournament) =>
      total + Number(tournament.registeredTeams || 0),
    0
  );

  const totalPrize = tournaments.reduce(
    (total, tournament) =>
      total + Number(tournament.prize || 0),
    0
  );

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* ==========================================
          BACKGROUND
      ========================================== */}

      <div className="pointer-events-none fixed inset-0 -z-0 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-blue-100/60 blur-[140px]" />

        <div className="absolute bottom-0 left-0 h-[350px] w-[350px] rounded-full bg-blue-50 blur-[120px]" />

        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(#2563eb 1px, transparent 1px), linear-gradient(90deg, #2563eb 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      {/* ==========================================
          HEADER
      ========================================== */}

      <section className="relative z-10 border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
            {/* HERO CONTENT */}

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
                Choose your tournament, build your team and
                compete against the best players for exciting
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

          {/* ==========================================
              STATS
          ========================================== */}

          {!loading && !error && (
            <div className="mt-12 grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-3">
              {/* TOURNAMENTS */}

              <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  🏆
                </div>

                <p className="text-2xl font-black tracking-tight text-slate-900">
                  {tournaments.length}
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
                  ₹{totalPrize.toLocaleString("en-IN")}+
                </p>

                <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Prize Money
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ==========================================
          TOURNAMENT SECTION
      ========================================== */}

      <section className="relative z-10 mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20">
        {/* ==========================================
            LOADING
        ========================================== */}

        {loading && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
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
            ))}
          </div>
        )}

        {/* ==========================================
            ERROR
        ========================================== */}

        {!loading && error && (
          <div className="mx-auto max-w-xl">
            <div className="overflow-hidden rounded-2xl border border-red-200 bg-white shadow-sm">
              <div className="h-1 bg-gradient-to-r from-red-500 to-red-100" />

              <div className="p-8 text-center sm:p-10">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-red-200 bg-red-50 text-2xl text-red-600">
                  !
                </div>

                <h2 className="mt-5 text-xl font-bold text-slate-900">
                  Unable to load tournaments
                </h2>

                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-red-500">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={() => {
                    window.location.reload();
                  }}
                  className="mt-7 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:bg-blue-700 hover:shadow-md"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            EMPTY
        ========================================== */}

        {!loading &&
          !error &&
          upcomingTournaments.length === 0 && (
            <div className="mx-auto max-w-2xl">
              <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm sm:p-14">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-200 bg-blue-50 text-2xl">
                  🎮
                </div>

                <h2 className="mt-6 text-2xl font-black tracking-tight text-slate-900">
                  No tournaments available
                </h2>

                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
                  There are currently no upcoming tournaments.
                  Check back soon for new competitions.
                </p>

                <div className="mx-auto mt-7 h-px max-w-xs bg-gradient-to-r from-transparent via-blue-300 to-transparent" />
              </div>
            </div>
          )}

        {/* ==========================================
            TOURNAMENT CARDS
        ========================================== */}

        {!loading &&
          !error &&
          upcomingTournaments.length > 0 && (
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
                    Available Tournaments
                  </h2>

                  <p className="mt-2 text-sm text-slate-500">
                    Join an active competition and prove your
                    skills.
                  </p>
                </div>

                <div className="flex h-fit items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-600">
                  <span className="h-2 w-2 rounded-full bg-blue-600" />

                  {upcomingTournaments.length} Active
                </div>
              </div>

              {/* CARDS */}

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {upcomingTournaments.map((tournament) => (
                  <TournamentCard
                    key={tournament._id}
                    tournament={tournament}
                  />
                ))}
              </div>
            </>
          )}
      </section>
    </main>
  );
}