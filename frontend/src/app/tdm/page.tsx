"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

// ======================================================
// API
// ======================================================
//
// IMPORTANT:
// Set NEXT_PUBLIC_API_URL in your deployment environment
// to your deployed Express backend URL.
//
// Example:
// https://your-backend.vercel.app
//
// For local development:
// http://localhost:5001
//
// Do NOT put Markdown like:
// [http://localhost:5001](http://localhost:5001)
// here.
//

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001"
).replace(/\/$/, "");

// ======================================================
// TYPES
// ======================================================

type MatchStatus =
  | "Live"
  | "Upcoming"
  | "Completed"
  | "Cancelled";

type Filter =
  | "All"
  | "Live"
  | "Upcoming"
  | "Completed";

type Game =
  | "BGMI"
  | "Free Fire"
  | string;

type TdmMatch = {
  _id: string;

  name?: string;
  title?: string;
  tournamentName?: string;
  matchName?: string;

  type?: string;
  mode?: string;
  gameType?: string;

  game?: Game;
  gameName?: string;

  prize?: number | string;
  prizePool?: number | string;
  prizeMoney?: number | string;

  entryFee?: number | string;
  registrationFee?: number | string;

  date?: string;
  matchDate?: string;
  startDate?: string;

  time?: string;
  matchTime?: string;
  startTime?: string;

  maxTeams?: number | string;
  maxSlots?: number | string;
  slots?: number | string;
  totalSlots?: number | string;

  registeredTeams?: number | string;
  registeredSlots?: number | string;
  filledSlots?: number | string;
  registeredPlayers?: number | string;

  status?: string;
  tournamentStatus?: string;

  map?: string;
  mapName?: string;

  description?: string;

  roomId?: string;
  roomID?: string;
  roomPassword?: string;
  roomPass?: string;
  password?: string;

  createdAt?: string;
  updatedAt?: string;
};

type MatchesResponse = {
  success?: boolean;
  count?: number;

  matches?: TdmMatch[];
  tournaments?: TdmMatch[];
  data?: TdmMatch[];

  message?: string;
};

// ======================================================
// HELPERS
// ======================================================

function safeNumber(value: unknown): number {
  const number = Number(value);

  return Number.isFinite(number) ? number : 0;
}

function safeString(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
}

// ======================================================
// MONEY
// ======================================================

function money(value: unknown): string {
  return `₹${safeNumber(value).toLocaleString("en-IN")}`;
}

// ======================================================
// DATE
// ======================================================

function formatDate(value?: string): string {
  if (!value) {
    return "Date not available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ======================================================
// GAME
// ======================================================

function normalizeGame(game?: string): string {
  const value = String(game || "")
    .trim()
    .toLowerCase();

  if (
    value === "bgmi" ||
    value === "pubg" ||
    value === "pubg mobile"
  ) {
    return "BGMI";
  }

  if (
    value === "freefire" ||
    value === "free fire" ||
    value === "free-fire"
  ) {
    return "Free Fire";
  }

  return game || "Game";
}

// ======================================================
// STATUS
// ======================================================

function normalizeStatus(status?: string): MatchStatus {
  const value = String(status || "")
    .trim()
    .toLowerCase();

  if (
    value === "live" ||
    value === "started" ||
    value === "ongoing" ||
    value === "in progress" ||
    value === "in-progress"
  ) {
    return "Live";
  }

  if (
    value === "completed" ||
    value === "complete" ||
    value === "finished" ||
    value === "ended"
  ) {
    return "Completed";
  }

  if (
    value === "cancelled" ||
    value === "canceled" ||
    value === "rejected"
  ) {
    return "Cancelled";
  }

  return "Upcoming";
}

// ======================================================
// NORMALIZE MATCH
// ======================================================

function normalizeMatch(raw: TdmMatch): TdmMatch {
  return {
    ...raw,

    _id: safeString(raw._id),

    name:
      raw.name ||
      raw.title ||
      raw.tournamentName ||
      raw.matchName ||
      "TDM Match",

    type:
      raw.type ||
      raw.mode ||
      raw.gameType ||
      "TDM",

    game: normalizeGame(
      raw.game || raw.gameName
    ),

    prize: safeNumber(
      raw.prize ??
        raw.prizePool ??
        raw.prizeMoney
    ),

    entryFee: safeNumber(
      raw.entryFee ??
        raw.registrationFee
    ),

    date:
      raw.date ||
      raw.matchDate ||
      raw.startDate ||
      "",

    time:
      raw.time ||
      raw.matchTime ||
      raw.startTime ||
      "",

    maxTeams: safeNumber(
      raw.maxTeams ??
        raw.maxSlots ??
        raw.slots ??
        raw.totalSlots ??
        2
    ),

    registeredTeams: safeNumber(
      raw.registeredTeams ??
        raw.registeredSlots ??
        raw.filledSlots ??
        raw.registeredPlayers ??
        0
    ),

    status:
      raw.status ||
      raw.tournamentStatus ||
      "Upcoming",

    map:
      raw.map ||
      raw.mapName ||
      "Map not specified",
  };
}

// ======================================================
// FETCH TDM MATCHES
// ======================================================

async function fetchTdmMatches(): Promise<MatchesResponse> {
  const url =
    `${API_BASE_URL}/api/squad-clash-tdm?type=TDM`;

  console.log(
    "Loading TDM matches from:",
    url
  );

  const response = await fetch(url, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
  });

  const text = await response.text();

  let data: MatchesResponse | null = null;

  try {
    data = text
      ? JSON.parse(text)
      : null;
  } catch (error) {
    console.error(
      "TDM API JSON parse error:",
      error
    );

    throw new Error(
      "Backend returned an invalid JSON response."
    );
  }

  console.log(
    "TDM API response:",
    data
  );

  if (!response.ok) {
    throw new Error(
      data?.message ||
        `Unable to load TDM matches. HTTP ${response.status}`
    );
  }

  if (!data) {
    throw new Error(
      "Empty response received from TDM API."
    );
  }

  return data;
}

// ======================================================
// EXTRACT MATCHES
// ======================================================

function extractMatches(
  data: MatchesResponse
): TdmMatch[] {
  if (Array.isArray(data?.matches)) {
    return data.matches;
  }

  if (Array.isArray(data?.tournaments)) {
    return data.tournaments;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  return [];
}

// ======================================================
// PAGE
// ======================================================

export default function TdmPage() {
  const [matches, setMatches] =
    useState<TdmMatch[]>([]);

  const [filter, setFilter] =
    useState<Filter>("All");

  const [gameFilter, setGameFilter] =
    useState<"All" | "BGMI" | "Free Fire">(
      "All"
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // ====================================================
  // LOAD MATCHES
  // ====================================================

  useEffect(() => {
    let cancelled = false;

    async function loadMatches() {
      try {
        setLoading(true);
        setError("");

        const data =
          await fetchTdmMatches();

        if (cancelled) {
          return;
        }

        const receivedMatches =
          extractMatches(data);

        console.log(
          "TDM matches found:",
          receivedMatches
        );

        const normalizedMatches =
          receivedMatches
            .map(normalizeMatch)
            .filter((match) =>
              Boolean(match._id)
            );

        setMatches(
          normalizedMatches
        );
      } catch (err: any) {
        if (cancelled) {
          return;
        }

        console.error(
          "TDM matches error:",
          err
        );

        setError(
          err?.message ||
            "Unable to load TDM matches."
        );

        setMatches([]);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadMatches();

    return () => {
      cancelled = true;
    };
  }, []);

  // ====================================================
  // FILTER
  // ====================================================

  const filteredMatches =
    useMemo(() => {
      return matches.filter(
        (match) => {
          const status =
            normalizeStatus(
              match.status
            );

          const game =
            normalizeGame(
              match.game
            );

          const statusMatch =
            filter === "All" ||
            status === filter;

          const gameMatch =
            gameFilter === "All" ||
            game === gameFilter;

          return (
            statusMatch &&
            gameMatch
          );
        }
      );
    }, [
      matches,
      filter,
      gameFilter,
    ]);

  // ====================================================
  // COUNTS
  // ====================================================

  const liveCount =
    matches.filter(
      (match) =>
        normalizeStatus(
          match.status
        ) === "Live"
    ).length;

  const upcomingCount =
    matches.filter(
      (match) =>
        normalizeStatus(
          match.status
        ) === "Upcoming"
    ).length;

  const completedCount =
    matches.filter(
      (match) =>
        normalizeStatus(
          match.status
        ) === "Completed"
    ).length;

  // ====================================================
  // RENDER
  // ====================================================

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#030712] text-white">

      {/* BACKGROUND */}

      <div className="pointer-events-none fixed inset-0 -z-0">
        <div className="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-blue-600/10 blur-[140px]" />

        <div className="absolute bottom-0 left-0 h-[350px] w-[350px] rounded-full bg-blue-900/10 blur-[120px]" />

        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(#60a5fa 1px, transparent 1px), linear-gradient(90deg, #60a5fa 1px, transparent 1px)",
            backgroundSize:
              "50px 50px",
          }}
        />
      </div>

      {/* HEADER */}

      <section className="relative z-10 border-b border-white/[0.07] bg-[#030712]/90">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20">

          <div className="flex flex-col justify-between gap-10 lg:flex-row lg:items-end">

            <div className="max-w-3xl">

              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/[0.08] px-3.5 py-2">

                <span className="h-1.5 w-1.5 rounded-full bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.8)]" />

                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-400">
                  Team Deathmatch
                </span>

              </div>

              <h1 className="text-4xl font-black tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl">
                TDM

                <span className="block bg-gradient-to-r from-blue-400 via-blue-500 to-cyan-400 bg-clip-text text-transparent">
                  Matches
                </span>
              </h1>

              <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
                Compete in two-team TDM
                matches. Choose your
                game, check the match
                details and register
                your team.
              </p>

            </div>

            {/* STATS */}

            <div className="grid grid-cols-3 gap-px overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.08]">

              <MiniStat
                label="Total"
                value={matches.length}
              />

              <MiniStat
                label="Live"
                value={liveCount}
              />

              <MiniStat
                label="Upcoming"
                value={upcomingCount}
              />

            </div>

          </div>

        </div>
      </section>

      {/* FILTERS */}

      <section className="relative z-10 mx-auto max-w-7xl px-5 pt-8 sm:px-8">

        <div className="rounded-2xl border border-white/[0.08] bg-[#070d1a] p-3">

          {/* STATUS */}

          <div className="flex gap-2 overflow-x-auto pb-0">

            <FilterButton
              label={`All (${matches.length})`}
              active={filter === "All"}
              onClick={() =>
                setFilter("All")
              }
            />

            <FilterButton
              label={`Live (${liveCount})`}
              active={filter === "Live"}
              onClick={() =>
                setFilter("Live")
              }
            />

            <FilterButton
              label={`Upcoming (${upcomingCount})`}
              active={filter === "Upcoming"}
              onClick={() =>
                setFilter("Upcoming")
              }
            />

            <FilterButton
              label={`Completed (${completedCount})`}
              active={filter === "Completed"}
              onClick={() =>
                setFilter("Completed")
              }
            />

          </div>

          {/* GAME */}

          <div className="mt-3 border-t border-white/[0.07] pt-3">

            <div className="flex gap-2 overflow-x-auto">

              <GameButton
                label="All Games"
                active={
                  gameFilter === "All"
                }
                onClick={() =>
                  setGameFilter("All")
                }
              />

              <GameButton
                label="BGMI"
                active={
                  gameFilter === "BGMI"
                }
                onClick={() =>
                  setGameFilter("BGMI")
                }
              />

              <GameButton
                label="Free Fire"
                active={
                  gameFilter === "Free Fire"
                }
                onClick={() =>
                  setGameFilter(
                    "Free Fire"
                  )
                }
              />

            </div>

          </div>

        </div>

      </section>

      {/* MATCH LIST */}

      <section className="relative z-10 mx-auto max-w-7xl px-5 py-8 pb-20 sm:px-8">

        {/* LOADING */}

        {loading && (
          <LoadingState />
        )}

        {/* ERROR */}

        {!loading && error && (
          <ErrorState
            message={error}
          />
        )}

        {/* EMPTY */}

        {!loading &&
          !error &&
          filteredMatches.length ===
            0 && (
            <EmptyState
              hasMatches={
                matches.length > 0
              }
              onClearFilters={() => {
                setFilter("All");
                setGameFilter("All");
              }}
            />
          )}

        {/* MATCHES */}

        {!loading &&
          !error &&
          filteredMatches.length >
            0 && (
            <>
              <div className="mb-6 flex items-center justify-between">

                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-blue-400">
                    Available now
                  </p>

                  <h2 className="mt-2 text-2xl font-black tracking-tight text-white sm:text-3xl">
                    TDM Arena
                  </h2>
                </div>

                <div className="flex items-center gap-2 rounded-lg border border-white/[0.07] bg-white/[0.025] px-3 py-2 text-xs font-medium text-slate-400">

                  <span className="h-2 w-2 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]" />

                  {filteredMatches.length} Matches

                </div>

              </div>

              <div className="grid gap-6 lg:grid-cols-2">

                {filteredMatches.map(
                  (match) => (
                    <TdmMatchCard
                      key={match._id}
                      match={match}
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

// ======================================================
// MINI STAT
// ======================================================

function MiniStat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="min-w-[85px] bg-[#070d1a] px-5 py-4 text-center transition-colors hover:bg-[#0a1222] sm:min-w-[100px]">

      <p className="text-xl font-black tracking-tight text-white">
        {value}
      </p>

      <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
        {label}
      </p>

    </div>
  );
}

// ======================================================
// FILTER BUTTON
// ======================================================

function FilterButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`whitespace-nowrap rounded-xl px-5 py-2.5 text-sm font-bold transition-all duration-200 ${
        active
          ? "bg-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.18)]"
          : "bg-white/[0.025] text-slate-400 hover:bg-white/[0.06] hover:text-white"
      }`}
    >
      {label}
    </button>
  );
}

// ======================================================
// GAME BUTTON
// ======================================================

function GameButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`whitespace-nowrap rounded-xl border px-5 py-2.5 text-sm font-bold transition-all duration-200 ${
        active
          ? "border-blue-500/40 bg-blue-500/10 text-blue-400"
          : "border-white/[0.07] bg-[#030712] text-slate-400 hover:border-blue-500/20 hover:text-white"
      }`}
    >
      {label}
    </button>
  );
}

// ======================================================
// MATCH CARD
// ======================================================

function TdmMatchCard({
  match,
}: {
  match: TdmMatch;
}) {
  const game = normalizeGame(
    match.game
  );

  const status = normalizeStatus(
    match.status
  );

  const teams = safeNumber(
    match.registeredTeams
  );

  const maxTeams =
    safeNumber(match.maxTeams) || 2;

  const full =
    teams >= maxTeams;

  const progress = Math.min(
    (teams / maxTeams) * 100,
    100
  );

  const matchName =
    match.name || "TDM Match";

  const map =
    match.map ||
    "Map not specified";

  const date =
    match.date || "";

  const time =
    match.time || "Time TBA";

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#070d1a] transition-all duration-300 hover:border-blue-500/25 hover:bg-[#091121]">

      {/* BLUE ACCENT */}

      <div
        className={`h-1 w-full ${
          status === "Live"
            ? "bg-gradient-to-r from-red-500 via-red-400/50 to-transparent"
            : "bg-gradient-to-r from-blue-500 via-blue-400/40 to-transparent"
        }`}
      />

      <div className="p-5 sm:p-6">

        {/* TOP */}

        <div className="flex items-start justify-between gap-4">

          <div className="min-w-0">

            <div className="flex flex-wrap items-center gap-2">

              {/* GAME */}

              <span
                className={`rounded-full border px-3 py-1 text-xs font-bold ${
                  game === "BGMI"
                    ? "border-blue-500/20 bg-blue-500/10 text-blue-400"
                    : "border-cyan-500/20 bg-cyan-500/10 text-cyan-400"
                }`}
              >
                {game}
              </span>

              {/* STATUS */}

              <StatusBadge
                status={status}
              />

            </div>

            <h2 className="mt-4 truncate text-xl font-black tracking-tight text-white sm:text-2xl">
              {matchName}
            </h2>

            <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
              <span className="text-blue-400">
                ◆
              </span>
              Team Deathmatch
            </p>

          </div>

          {/* DATE DESKTOP */}

          <div className="hidden shrink-0 rounded-xl border border-white/[0.07] bg-[#030712] px-4 py-3 text-center sm:block">

            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
              Match Date
            </p>

            <p className="mt-1 text-sm font-bold text-white">
              {formatDate(date)}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              {time}
            </p>

          </div>

        </div>

        {/* MOBILE DATE */}

        <div className="mt-5 grid grid-cols-2 gap-3 sm:hidden">

          <Detail
            label="Date"
            value={formatDate(date)}
          />

          <Detail
            label="Time"
            value={time}
          />

        </div>

        {/* DESCRIPTION */}

        {match.description && (
          <p className="mt-5 line-clamp-2 text-sm leading-6 text-slate-500">
            {match.description}
          </p>
        )}

        {/* DETAILS */}

        <div className="mt-6 grid grid-cols-2 gap-3">

          <Detail
            label="Prize Pool"
            value={money(match.prize)}
            blue
          />

          <Detail
            label="Entry Fee"
            value={
              safeNumber(
                match.entryFee
              ) === 0
                ? "FREE"
                : money(
                    match.entryFee
                  )
            }
          />

          <Detail
            label="Map"
            value={map}
          />

          <Detail
            label="Teams"
            value={`${teams}/${maxTeams}`}
          />

        </div>

        {/* PROGRESS */}

        <div className="mt-6">

          <div className="mb-2 flex items-center justify-between">

            <span className="text-xs font-medium text-slate-500">
              Team Slots
            </span>

            <span className="text-xs font-bold text-slate-300">
              {teams} / {maxTeams}
            </span>

          </div>

          <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.08]">

            <div
              className={`h-full rounded-full transition-all duration-500 ${
                full
                  ? "bg-slate-500"
                  : "bg-gradient-to-r from-blue-600 to-cyan-400"
              }`}
              style={{
                width: `${progress}%`,
              }}
            />

          </div>

        </div>

        {/* ACTIONS */}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">

          <Link
            href={`/tdm/${match._id}`}
            className="flex-1 rounded-xl bg-blue-500 px-5 py-3 text-center text-sm font-black text-white transition-all duration-200 hover:bg-blue-400 hover:shadow-[0_0_25px_rgba(59,130,246,0.22)]"
          >
            {full
              ? "View Match"
              : "View & Register"}
          </Link>

          <Link
            href={`/tdm/${match._id}`}
            className="rounded-xl border border-white/[0.08] px-5 py-3 text-center text-sm font-bold text-slate-300 transition-all duration-200 hover:border-blue-500/30 hover:bg-blue-500/[0.06] hover:text-white"
          >
            Details
          </Link>

        </div>

      </div>
    </article>
  );
}

// ======================================================
// STATUS BADGE
// ======================================================

function StatusBadge({
  status,
}: {
  status: MatchStatus;
}) {
  const styles: Record<
    MatchStatus,
    string
  > = {
    Live:
      "border-red-500/20 bg-red-500/10 text-red-400",

    Upcoming:
      "border-blue-500/20 bg-blue-500/10 text-blue-400",

    Completed:
      "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",

    Cancelled:
      "border-white/[0.06] bg-white/[0.04] text-slate-500",
  };

  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-bold ${styles[status]}`}
    >
      {status === "Live" && (
        <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-red-400 shadow-[0_0_7px_rgba(248,113,113,0.8)]" />
      )}

      {status}
    </span>
  );
}

// ======================================================
// DETAIL
// ======================================================

function Detail({
  label,
  value,
  blue = false,
}: {
  label: string;
  value: string;
  blue?: boolean;
}) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-[#030712] p-4 transition-colors hover:border-blue-500/15">

      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
        {label}
      </p>

      <p
        className={`mt-1 truncate text-sm font-bold ${
          blue
            ? "text-blue-400"
            : "text-slate-300"
        }`}
      >
        {value}
      </p>

    </div>
  );
}

// ======================================================
// LOADING
// ======================================================

function LoadingState() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">

      {[1, 2, 3, 4].map(
        (item) => (
          <div
            key={item}
            className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#070d1a]"
          >

            <div className="h-1 bg-blue-500/20" />

            <div className="animate-pulse p-6">

              <div className="flex justify-between">

                <div>

                  <div className="h-6 w-24 rounded-full bg-white/[0.06]" />

                  <div className="mt-5 h-7 w-64 rounded bg-white/[0.06]" />

                  <div className="mt-2 h-4 w-36 rounded bg-white/[0.04]" />

                </div>

                <div className="hidden h-20 w-28 rounded-xl bg-white/[0.03] sm:block" />

              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">

                <div className="h-20 rounded-xl bg-white/[0.03]" />

                <div className="h-20 rounded-xl bg-white/[0.03]" />

                <div className="h-20 rounded-xl bg-white/[0.03]" />

                <div className="h-20 rounded-xl bg-white/[0.03]" />

              </div>

              <div className="mt-6 h-1.5 rounded-full bg-white/[0.06]" />

              <div className="mt-6 h-12 rounded-xl bg-white/[0.06]" />

            </div>
          </div>
        )
      )}

    </div>
  );
}

// ======================================================
// ERROR
// ======================================================

function ErrorState({
  message,
}: {
  message: string;
}) {
  return (
    <div className="mx-auto max-w-xl">

      <div className="overflow-hidden rounded-2xl border border-red-500/20 bg-[#080b13]">

        <div className="h-1 bg-gradient-to-r from-red-500 to-red-500/20" />

        <div className="p-8 text-center sm:p-10">

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10 text-2xl">
            !
          </div>

          <h2 className="mt-5 text-xl font-black text-white">
            Unable to load TDM matches
          </h2>

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-red-400/80">
            {message}
          </p>

          <button
            type="button"
            onClick={() =>
              window.location.reload()
            }
            className="mt-7 rounded-xl bg-blue-500 px-6 py-3 text-sm font-bold text-white transition-all duration-200 hover:bg-blue-400 hover:shadow-[0_0_25px_rgba(59,130,246,0.25)]"
          >
            Try Again
          </button>

        </div>
      </div>
    </div>
  );
}

// ======================================================
// EMPTY
// ======================================================

function EmptyState({
  hasMatches,
  onClearFilters,
}: {
  hasMatches: boolean;
  onClearFilters: () => void;
}) {
  return (
    <div className="mx-auto max-w-2xl">

      <div className="rounded-2xl border border-white/[0.08] bg-[#070d1a] p-10 text-center sm:p-14">

        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10 text-2xl">
          🎯
        </div>

        <h2 className="mt-6 text-2xl font-black tracking-tight text-white">

          {hasMatches
            ? "No matches match your filters"
            : "No TDM matches found"}

        </h2>

        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">

          {hasMatches
            ? "Try changing the status or game filter."
            : "There are currently no TDM matches available."}

        </p>

        {hasMatches ? (
          <button
            type="button"
            onClick={onClearFilters}
            className="mt-7 rounded-xl bg-blue-500 px-6 py-3 text-sm font-bold text-white transition-all duration-200 hover:bg-blue-400 hover:shadow-[0_0_25px_rgba(59,130,246,0.2)]"
          >
            Clear Filters
          </button>
        ) : (
          <Link
            href="/tournaments"
            className="mt-7 inline-block rounded-xl bg-blue-500 px-6 py-3 text-sm font-bold text-white transition-all duration-200 hover:bg-blue-400 hover:shadow-[0_0_25px_rgba(59,130,246,0.2)]"
          >
            Browse Tournaments
          </Link>
        )}

      </div>
    </div>
  );
}