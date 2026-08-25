"use client";

import { useCallback, useEffect, useState } from "react";

// ======================================================
// API CONFIG
// ======================================================

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5001"
).replace(/\/$/, "");

// ======================================================
// TYPES
// ======================================================

type TournamentStatus =
  | "Upcoming"
  | "Live"
  | "Completed"
  | "Cancelled";

type Tournament = {
  _id: string;
  name: string;
  game: "BGMI" | "Free Fire" | string;
  status: TournamentStatus | string;
};

type Winner = {
  rank: number;
  userId: string | null;
  userName: string;
  username: string;
  teamName: string;
  gameUid: string;
  registrationId: string | null;
};

type TournamentLeaderboard = {
  tournament: Tournament;
  leaderboard: Winner[];
};

type TournamentResponse = {
  success?: boolean;
  message?: string;
  tournaments?: Tournament[];
  data?: Tournament[];
};

type LeaderboardResponse = {
  success?: boolean;
  message?: string;
  leaderboard?: Winner[];
  data?: Winner[];
};

// ======================================================
// HELPERS
// ======================================================

function safeString(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
}

function safeNumber(value: unknown): number {
  const number = Number(value);

  return Number.isFinite(number) ? number : 0;
}

// ======================================================
// NORMALIZE TOURNAMENT
// ======================================================

function normalizeTournament(
  tournament: any
): Tournament | null {
  if (!tournament?._id) {
    return null;
  }

  return {
    _id: safeString(tournament._id),

    name:
      safeString(
        tournament.name ||
          tournament.title ||
          tournament.tournamentName
      ) || "Tournament",

    game:
      safeString(
        tournament.game ||
          tournament.gameName ||
          tournament.gameType
      ) || "Game",

    status:
      safeString(
        tournament.status ||
          tournament.tournamentStatus
      ) || "Upcoming",
  };
}

// ======================================================
// NORMALIZE WINNER
// ======================================================

function normalizeWinner(
  winner: any,
  index: number
): Winner {
  return {
    rank:
      safeNumber(winner?.rank) ||
      index + 1,

    userId:
      winner?.userId
        ? safeString(winner.userId)
        : null,

    userName:
      safeString(
        winner?.userName ||
          winner?.name ||
          winner?.playerName ||
          winner?.fullName
      ) || "Unknown Player",

    username:
      safeString(
        winner?.username ||
          winner?.userUsername
      ),

    teamName:
      safeString(
        winner?.teamName ||
          winner?.team ||
          winner?.team?.name
      ) || "N/A",

    gameUid:
      safeString(
        winner?.gameUid ||
          winner?.gameUID ||
          winner?.uid ||
          winner?.gameId
      ) || "N/A",

    registrationId:
      winner?.registrationId
        ? safeString(
            winner.registrationId
          )
        : null,
  };
}

// ======================================================
// EXTRACT TOURNAMENTS
// ======================================================

function extractTournaments(
  data: TournamentResponse | Tournament[] | null
): Tournament[] {
  if (Array.isArray(data)) {
    return data
      .map(normalizeTournament)
      .filter(
        (
          tournament
        ): tournament is Tournament =>
          Boolean(tournament)
      );
  }

  if (
    Array.isArray(
      data?.tournaments
    )
  ) {
    return data.tournaments
      .map(normalizeTournament)
      .filter(
        (
          tournament
        ): tournament is Tournament =>
          Boolean(tournament)
      );
  }

  if (
    Array.isArray(data?.data)
  ) {
    return data.data
      .map(normalizeTournament)
      .filter(
        (
          tournament
        ): tournament is Tournament =>
          Boolean(tournament)
      );
  }

  return [];
}

// ======================================================
// EXTRACT LEADERBOARD
// ======================================================

function extractLeaderboard(
  data: LeaderboardResponse | Winner[] | null
): Winner[] {
  if (Array.isArray(data)) {
    return data.map(
      normalizeWinner
    );
  }

  if (
    Array.isArray(
      data?.leaderboard
    )
  ) {
    return data.leaderboard.map(
      normalizeWinner
    );
  }

  if (
    Array.isArray(data?.data)
  ) {
    return data.data.map(
      normalizeWinner
    );
  }

  return [];
}

// ======================================================
// GET TOURNAMENTS
// ======================================================

async function fetchTournaments(): Promise<
  Tournament[]
> {
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

  const text =
    await response.text();

  let data:
    | TournamentResponse
    | Tournament[]
    | null = null;

  try {
    data = text
      ? JSON.parse(text)
      : null;
  } catch {
    throw new Error(
      "Backend returned an invalid JSON response."
    );
  }

  console.log(
    "TOURNAMENT API:",
    {
      status: response.status,
      data,
    }
  );

  if (!response.ok) {
    throw new Error(
      (data as TournamentResponse)
        ?.message ||
        `Failed to load tournaments. HTTP ${response.status}`
    );
  }

  return extractTournaments(
    data
  );
}

// ======================================================
// GET LEADERBOARD
// ======================================================

async function fetchLeaderboard(
  tournamentId: string
): Promise<Winner[]> {
  const response = await fetch(
    `${API_URL}/api/leaderboard/${tournamentId}`,
    {
      method: "GET",

      credentials: "include",

      headers: {
        Accept: "application/json",
      },

      cache: "no-store",
    }
  );

  const text =
    await response.text();

  let data:
    | LeaderboardResponse
    | Winner[]
    | null = null;

  try {
    data = text
      ? JSON.parse(text)
      : null;
  } catch {
    throw new Error(
      "Leaderboard API returned invalid JSON."
    );
  }

  console.log(
    `LEADERBOARD API ${tournamentId}:`,
    {
      status: response.status,
      data,
    }
  );

  if (!response.ok) {
    throw new Error(
      (data as LeaderboardResponse)
        ?.message ||
        `Failed to load leaderboard. HTTP ${response.status}`
    );
  }

  return extractLeaderboard(
    data
  );
}

// ======================================================
// PAGE
// ======================================================

export default function LeaderboardPage() {
  const [
    leaderboards,
    setLeaderboards,
  ] = useState<
    TournamentLeaderboard[]
  >([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  // ====================================================
  // LOAD DATA
  // ====================================================

  const loadLeaderboard =
    useCallback(async () => {
      try {
        setLoading(true);
        setError("");

        // ==============================================
        // GET TOURNAMENTS
        // ==============================================

        const tournaments =
          await fetchTournaments();

        console.log(
          "TOURNAMENTS FOUND:",
          tournaments
        );

        // ==============================================
        // GET LEADERBOARD FOR EVERY TOURNAMENT
        // ==============================================

        const results =
          await Promise.all(
            tournaments.map(
              async (
                tournament
              ) => {
                try {
                  const leaderboard =
                    await fetchLeaderboard(
                      tournament._id
                    );

                  return {
                    tournament,
                    leaderboard,
                  };
                } catch (err) {
                  console.error(
                    `Leaderboard error for tournament ${tournament._id}:`,
                    err
                  );

                  // Do not break the entire page
                  // if one tournament has no leaderboard.
                  return {
                    tournament,
                    leaderboard: [],
                  };
                }
              }
            )
          );

        console.log(
          "FINAL LEADERBOARDS:",
          results
        );

        setLeaderboards(
          results
        );
      } catch (err) {
        console.error(
          "LOAD LEADERBOARD ERROR:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load leaderboard."
        );

        setLeaderboards([]);
      } finally {
        setLoading(false);
      }
    }, []);

  // ====================================================
  // INITIAL LOAD
  // ====================================================

  useEffect(() => {
    loadLeaderboard();
  }, [loadLeaderboard]);

  // ====================================================
  // LOADING
  // ====================================================

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-5 py-10 text-slate-900 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <div className="h-10 w-56 animate-pulse rounded-lg bg-slate-200" />

            <div className="mt-3 h-5 w-80 animate-pulse rounded bg-slate-200" />
          </div>

          <div className="space-y-8">
            {[1, 2].map(
              (item) => (
                <div
                  key={item}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                >
                  <div className="h-1 bg-blue-500/20" />

                  <div className="p-6">
                    <div className="animate-pulse">
                      <div className="h-7 w-64 rounded bg-slate-200" />

                      <div className="mt-3 h-4 w-40 rounded bg-slate-100" />

                      <div className="mt-8 grid gap-5 md:grid-cols-3">
                        {[1, 2, 3].map(
                          (card) => (
                            <div
                              key={card}
                              className="h-56 rounded-xl bg-slate-100"
                            />
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </main>
    );
  }

  // ====================================================
  // PAGE
  // ====================================================

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-50 text-slate-900">

      {/* ==================================================
          BACKGROUND
      ================================================== */}

      <div className="pointer-events-none fixed inset-0 -z-0 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-blue-100/70 blur-[140px]" />

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

      {/* ==================================================
          HEADER
      ================================================== */}

      <section className="relative z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">

          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">

            <div className="max-w-3xl">

              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2">
                <span className="h-2 w-2 rounded-full bg-blue-600" />

                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-600">
                  Tournament Rankings
                </span>
              </div>

              <h1 className="text-4xl font-black tracking-[-0.04em] text-slate-900 sm:text-5xl lg:text-6xl">
                Leader
                <span className="block text-blue-600">
                  board
                </span>
              </h1>

              <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base">
                Check the winners and top-performing
                players from our tournaments.
              </p>

            </div>

            <button
              type="button"
              onClick={loadLeaderboard}
              disabled={loading}
              className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-bold text-slate-700 shadow-sm transition-all hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span>
                ↻
              </span>

              Refresh
            </button>

          </div>

          {/* ==================================================
              STATS
          ================================================== */}

          <div className="mt-10 grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-3">

            <StatCard
              icon="🏆"
              value={leaderboards.length}
              label="Tournaments"
            />

            <StatCard
              icon="🥇"
              value={leaderboards.reduce(
                (
                  total,
                  item
                ) =>
                  total +
                  item.leaderboard.length,
                0
              )}
              label="Winners Listed"
            />

            <StatCard
              icon="🎮"
              value={
                new Set(
                  leaderboards.map(
                    (item) =>
                      item.tournament.game
                  )
                ).size
              }
              label="Games"
            />

          </div>

        </div>
      </section>

      {/* ==================================================
          CONTENT
      ================================================== */}

      <section className="relative z-10 mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">

        {/* ==================================================
            ERROR
        ================================================== */}

        {error && (
          <div className="mx-auto mb-8 max-w-2xl overflow-hidden rounded-2xl border border-red-200 bg-white shadow-sm">

            <div className="h-1 bg-gradient-to-r from-red-500 to-red-100" />

            <div className="p-8 text-center">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-red-200 bg-red-50 text-2xl text-red-600">
                !
              </div>

              <h2 className="mt-5 text-xl font-black text-slate-900">
                Unable to load leaderboard
              </h2>

              <p className="mt-3 text-sm leading-6 text-red-500">
                {error}
              </p>

              <button
                type="button"
                onClick={loadLeaderboard}
                className="mt-6 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
              >
                Try Again
              </button>

            </div>
          </div>
        )}

        {/* ==================================================
            NO TOURNAMENTS
        ================================================== */}

        {!error &&
          leaderboards.length === 0 && (
            <div className="mx-auto max-w-2xl">

              <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm sm:p-14">

                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-200 bg-blue-50 text-3xl">
                  🏆
                </div>

                <h2 className="mt-6 text-2xl font-black tracking-tight text-slate-900">
                  No tournaments found
                </h2>

                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
                  There are no tournaments available
                  yet.
                </p>

              </div>

            </div>
          )}

        {/* ==================================================
            TOURNAMENTS
        ================================================== */}

        {!error &&
          leaderboards.length > 0 && (
            <div className="space-y-8">

              {leaderboards.map(
                ({
                  tournament,
                  leaderboard,
                }) => (
                  <TournamentLeaderboardCard
                    key={
                      tournament._id
                    }
                    tournament={
                      tournament
                    }
                    leaderboard={
                      leaderboard
                    }
                  />
                )
              )}

            </div>
          )}

      </section>
    </main>
  );
}

// ======================================================
// STAT CARD
// ======================================================

function StatCard({
  icon,
  value,
  label,
}: {
  icon: string;
  value: number;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md">

      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-xl">
        {icon}
      </div>

      <p className="text-2xl font-black tracking-tight text-slate-900">
        {value}
      </p>

      <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </p>

    </div>
  );
}

// ======================================================
// TOURNAMENT LEADERBOARD CARD
// ======================================================

function TournamentLeaderboardCard({
  tournament,
  leaderboard,
}: {
  tournament: Tournament;
  leaderboard: Winner[];
}) {
  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

      {/* BLUE ACCENT */}

      <div className="h-1 bg-gradient-to-r from-blue-600 via-blue-400 to-transparent" />

      {/* HEADER */}

      <div className="border-b border-slate-100 p-6 sm:p-7">

        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">

          <div>

            <div className="flex flex-wrap items-center gap-3">

              <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                {tournament.name}
              </h2>

              <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600">
                {tournament.game}
              </span>

            </div>

            <p className="mt-2 text-sm text-slate-500">
              Tournament winners
            </p>

          </div>

          <TournamentStatus
            status={
              tournament.status
            }
          />

        </div>

      </div>

      {/* WINNERS */}

      {leaderboard.length === 0 ? (
        <div className="p-10 text-center sm:p-14">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-200 bg-blue-50 text-2xl">
            🏆
          </div>

          <h3 className="mt-5 text-xl font-black text-slate-900">
            Winners not announced yet
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            The tournament winners will appear
            here after they are announced.
          </p>

        </div>
      ) : (
        <div className="grid gap-5 p-6 md:grid-cols-2 lg:grid-cols-3">
          {leaderboard
            .sort(
              (a, b) =>
                a.rank - b.rank
            )
            .map(
              (winner) => (
                <WinnerCard
                  key={`${tournament._id}-${winner.rank}-${winner.userId || winner.username || winner.gameUid}`}
                  winner={
                    winner
                  }
                />
              )
            )}
        </div>
      )}

    </article>
  );
}

// ======================================================
// TOURNAMENT STATUS
// ======================================================

function TournamentStatus({
  status,
}: {
  status: string;
}) {
  const normalized =
    status
      .toLowerCase()
      .trim();

  let className =
    "border-slate-200 bg-slate-50 text-slate-600";

  if (
    normalized ===
    "live"
  ) {
    className =
      "border-red-200 bg-red-50 text-red-600";
  } else if (
    normalized ===
    "upcoming"
  ) {
    className =
      "border-blue-200 bg-blue-50 text-blue-600";
  } else if (
    normalized ===
    "completed"
  ) {
    className =
      "border-emerald-200 bg-emerald-50 text-emerald-600";
  } else if (
    normalized ===
      "cancelled" ||
    normalized ===
      "canceled"
  ) {
    className =
      "border-slate-200 bg-slate-50 text-slate-500";
  }

  return (
    <span
      className={`w-fit rounded-full border px-4 py-2 text-xs font-bold ${className}`}
    >
      {status}
    </span>
  );
}

// ======================================================
// WINNER CARD
// ======================================================

function WinnerCard({
  winner,
}: {
  winner: Winner;
}) {
  const rank =
    safeNumber(
      winner.rank
    );

  const getMedal = () => {
    if (rank === 1) {
      return "🥇";
    }

    if (rank === 2) {
      return "🥈";
    }

    if (rank === 3) {
      return "🥉";
    }

    return "🏆";
  };

  const getPosition = () => {
    if (rank === 1) {
      return "1st Place";
    }

    if (rank === 2) {
      return "2nd Place";
    }

    if (rank === 3) {
      return "3rd Place";
    }

    return `#${rank}`;
  };

  const isTopThree =
    rank >= 1 &&
    rank <= 3;

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border bg-white p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${
        rank === 1
          ? "border-yellow-200"
          : rank === 2
          ? "border-slate-300"
          : rank === 3
          ? "border-orange-200"
          : "border-slate-200"
      }`}
    >

      {/* TOP ACCENT */}

      <div
        className={`absolute left-0 right-0 top-0 h-1 ${
          rank === 1
            ? "bg-yellow-400"
            : rank === 2
            ? "bg-slate-400"
            : rank === 3
            ? "bg-orange-400"
            : "bg-blue-500"
        }`}
      />

      {/* POSITION */}

      <div className="flex items-center justify-between">

        <span
          className={`rounded-full px-3 py-1 text-xs font-black ${
            isTopThree
              ? "bg-blue-50 text-blue-600"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          {getPosition()}
        </span>

        <span className="text-3xl">
          {getMedal()}
        </span>

      </div>

      {/* PLAYER */}

      <div className="mt-6">

        <h3 className="truncate text-xl font-black text-slate-900">
          {winner.userName ||
            "Unknown Player"}
        </h3>

        {winner.username && (
          <p className="mt-1 truncate text-sm font-medium text-slate-500">
            @{winner.username}
          </p>
        )}

      </div>

      {/* DETAILS */}

      <div className="mt-6 space-y-4">

        {/* TEAM */}

        <WinnerDetail
          label="Team"
          value={
            winner.teamName ||
            "N/A"
          }
        />

        {/* GAME UID */}

        <WinnerDetail
          label="Game UID"
          value={
            winner.gameUid ||
            "N/A"
          }
          mono
        />

      </div>

    </div>
  );
}

// ======================================================
// WINNER DETAIL
// ======================================================

function WinnerDetail({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">

      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p
        className={`mt-1 truncate text-sm font-bold text-slate-800 ${
          mono
            ? "font-mono"
            : ""
        }`}
      >
        {value}
      </p>

    </div>
  );
}