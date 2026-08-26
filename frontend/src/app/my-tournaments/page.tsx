"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import Link from "next/link";

// ======================================================
// API
// ======================================================

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || ""
).replace(/\/$/, "");

// ======================================================
// TYPES
// ======================================================

type TournamentType =
  | "normal"
  | "tdm"
  | "clash"
  | "unknown";

type Player = {
  _id?: string;
  user?: string | null;
  userId?: string | null;
  slot?: number;
  uid?: string;
  gameUid?: string;
  name?: string;
  playerName?: string;
  verified?: boolean;
};

type Tournament = {
  _id: string;
  name: string;
  game: string;
  prize: number;
  entryFee: number;
  maxTeams: number;
  registeredTeams: number;
  date: string;
  time: string;
  mode: string;
  type?: string;
  map: string;
  status: string;
  roomId?: string;
  roomPassword?: string;
  teamSlot?: string;
  teamName?: string;
  players?: Player[];
  gameType?: string;
};

type Registration = {
  _id: string;
  tournament: Tournament | null;
  playerTeamName: string;
  gameUid: string;
  players: Player[];
  paymentStatus: string;
  registrationStatus: string;
  createdAt: string;
  source: "normal" | "tdm";
  tournamentId?: string;
  matchId?: string;
  teamSlot?: string;
  teamName?: string;
  mode?: string;
  type?: string;
  game?: string;
  adminNote?: string;
};

// ======================================================
// HELPERS
// ======================================================

function safeString(value: any): string {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function safeNumber(value: any): number {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

// ======================================================
// TOURNAMENT TYPE
// ======================================================

function getTournamentType(
  tournament: Tournament | null,
  registration?: Registration | null
): TournamentType {
  const text = [
    tournament?.type,
    tournament?.mode,
    tournament?.gameType,
    registration?.type,
    registration?.mode,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (
    text.includes("tdm") ||
    text.includes("team death") ||
    text.includes("team-death")
  ) {
    return "tdm";
  }

  if (
    text.includes("clash") ||
    text.includes("squad clash") ||
    text.includes("squad-clash")
  ) {
    return "clash";
  }

  if (registration?.source === "tdm") {
    return "tdm";
  }

  return "normal";
}

function getTournamentTypeLabel(
  tournament: Tournament | null,
  registration?: Registration | null
): string {
  const type = getTournamentType(
    tournament,
    registration
  );

  switch (type) {
    case "tdm":
      return "TDM";

    case "clash":
      return "Squad Clash";

    default:
      return "Tournament";
  }
}

// ======================================================
// NORMALIZE PLAYER
// ======================================================

function normalizePlayer(
  player: any,
  index: number
): Player {
  if (typeof player === "string") {
    return {
      slot: index + 1,
      uid: player,
      gameUid: player,
      name: player,
      playerName: player,
    };
  }

  return {
    _id: safeString(player?._id),

    user:
      player?.user ||
      player?.userId ||
      null,

    userId:
      player?.userId ||
      player?.user ||
      null,

    slot:
      Number(player?.slot) ||
      index + 1,

    uid: safeString(
      player?.uid ||
        player?.gameUid ||
        player?.playerUid ||
        player?.playerId ||
        player?.gameId
    ),

    gameUid: safeString(
      player?.gameUid ||
        player?.uid ||
        player?.playerUid
    ),

    name:
      player?.name ||
      player?.playerName ||
      player?.username ||
      "Player",

    playerName:
      player?.playerName ||
      player?.name ||
      player?.username ||
      "Player",

    verified: Boolean(player?.verified),
  };
}

// ======================================================
// NORMALIZE TOURNAMENT
// ======================================================

function normalizeTournament(
  value: any,
  registration: any
): Tournament | null {
  const t =
    value ||
    registration?.tournament ||
    registration?.match ||
    registration?.tournamentData;

  if (!t) return null;

  const tournamentId = safeString(
    t._id ||
      t.id ||
      t.tournamentId ||
      registration?.tournamentId ||
      registration?.matchId
  );

  const teamSlot = safeString(
    registration?.teamSlot ||
      t.teamSlot
  ).toUpperCase();

  const teamName = safeString(
    registration?.teamName ||
      t.teamName ||
      registration?.playerTeamName
  );

  const rawPlayers =
    Array.isArray(registration?.players)
      ? registration.players
      : Array.isArray(t.players)
      ? t.players
      : [];

  return {
    _id: tournamentId,

    name:
      t.name ||
      t.title ||
      t.tournamentName ||
      t.matchName ||
      "Tournament",

    game:
      t.game ||
      t.gameName ||
      registration?.game ||
      "BGMI",

    prize: safeNumber(
      t.prize ??
        t.prizePool ??
        t.prizeMoney ??
        0
    ),

    entryFee: safeNumber(
      t.entryFee ??
        t.registrationFee ??
        0
    ),

    maxTeams: safeNumber(
      t.maxTeams ??
        t.maxSlots ??
        t.slots ??
        t.totalSlots ??
        0
    ),

    registeredTeams: safeNumber(
      t.registeredTeams ??
        t.registeredSlots ??
        t.filledSlots ??
        t.registeredPlayers ??
        0
    ),

    date:
      t.date ||
      t.matchDate ||
      t.startDate ||
      "",

    time:
      t.time ||
      t.matchTime ||
      t.startTime ||
      "",

    mode: safeString(
      t.mode ||
        t.type ||
        t.tournamentType ||
        registration?.mode ||
        ""
    ),

    type: safeString(
      t.type ||
        t.tournamentType ||
        t.mode ||
        registration?.type ||
        ""
    ),

    gameType: safeString(
      t.gameType ||
        registration?.gameType ||
        ""
    ),

    map:
      t.map ||
      t.mapName ||
      "Map not specified",

    status:
      t.status ||
      t.tournamentStatus ||
      "Upcoming",

    roomId: safeString(
      t.roomId ||
        t.roomID ||
        t.room?.id ||
        registration?.roomId
    ),

    roomPassword: safeString(
      t.roomPassword ||
        t.roomPass ||
        t.password ||
        t.room?.password ||
        registration?.roomPassword
    ),

    teamSlot,
    teamName,

    players: rawPlayers.map(
      (player: any, index: number) =>
        normalizePlayer(player, index)
    ),
  };
}

// ======================================================
// NORMALIZE REGISTRATION
// ======================================================

function normalizeRegistration(
  registration: any,
  source: "normal" | "tdm"
): Registration {
  const tournament = normalizeTournament(
    registration?.tournament ||
      registration?.match ||
      registration?.tournamentData,
    registration
  );

  const players =
    Array.isArray(registration?.players)
      ? registration.players.map(
          (player: any, index: number) =>
            normalizePlayer(player, index)
        )
      : [];

  const firstPlayer = players[0];

  const uid =
    registration?.gameUid ||
    registration?.playerUid ||
    registration?.leaderUid ||
    registration?.leaderGameUid ||
    registration?.uid ||
    firstPlayer?.uid ||
    "";

  return {
    _id: safeString(
      registration?._id ||
        registration?.id ||
        `${source}-${Date.now()}-${Math.random()}`
    ),

    tournament,

    playerTeamName:
      registration?.teamName ||
      registration?.playerTeamName ||
      registration?.squadName ||
      registration?.playerName ||
      tournament?.teamName ||
      "N/A",

    gameUid: safeString(uid),

    players,

    paymentStatus:
      registration?.paymentStatus ||
      registration?.payment?.status ||
      "Pending",

    registrationStatus:
      registration?.registrationStatus ||
      registration?.status ||
      "Pending",

    createdAt:
      registration?.createdAt ||
      new Date().toISOString(),

    source,

    tournamentId: safeString(
      registration?.tournamentId ||
        tournament?._id
    ),

    matchId: safeString(
      registration?.matchId ||
        registration?.match?._id
    ),

    teamSlot: safeString(
      registration?.teamSlot ||
        tournament?.teamSlot
    ).toUpperCase(),

    teamName:
      registration?.teamName ||
      tournament?.teamName ||
      "",

    mode:
      registration?.mode ||
      tournament?.mode ||
      "",

    type:
      registration?.type ||
      tournament?.type ||
      "",

    game:
      registration?.game ||
      tournament?.game ||
      "BGMI",

    adminNote:
      registration?.adminNote ||
      "",
  };
}

// ======================================================
// FORMATTERS
// ======================================================

function formatDate(date: string): string {
  if (!date) return "Date TBA";

  const d = new Date(date);

  if (Number.isNaN(d.getTime())) {
    return date;
  }

  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTime(time: string): string {
  if (!time) return "Time TBA";
  return time;
}

function money(value: number): string {
  return `₹${safeNumber(value).toLocaleString("en-IN")}`;
}

async function copyText(value: string) {
  if (!value) return;

  try {
    await navigator.clipboard.writeText(value);
  } catch (error) {
    console.error("COPY ERROR:", error);
  }
}

// ======================================================
// PAGE
// ======================================================

export default function MyTournamentsPage() {
  const [
    registrations,
    setRegistrations,
  ] = useState<Registration[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // ====================================================
  // LOAD MY TOURNAMENTS
  // ====================================================

  const loadMyTournaments =
    useCallback(async () => {
      try {
        setLoading(true);
        setError("");

        const normalRequest = fetch(
          `${API_URL}/api/registrations/my`,
          {
            credentials: "include",
            cache: "no-store",
            headers: {
              Accept: "application/json",
            },
          }
        );

        const tdmRequest = fetch(
          `${API_URL}/api/squad-clash-tdm/registrations/my`,
          {
            credentials: "include",
            cache: "no-store",
            headers: {
              Accept: "application/json",
            },
          }
        );

        const [
          normalResponse,
          tdmResponse,
        ] = await Promise.all([
          normalRequest,
          tdmRequest,
        ]);

        const normalText =
          await normalResponse.text();

        const tdmText =
          await tdmResponse.text();

        let normalData: any = {};
        let tdmData: any = {};

        try {
          normalData = normalText
            ? JSON.parse(normalText)
            : {};
        } catch (parseError) {
          console.error(
            "NORMAL JSON ERROR:",
            parseError
          );
        }

        try {
          tdmData = tdmText
            ? JSON.parse(tdmText)
            : {};
        } catch (parseError) {
          console.error(
            "TDM JSON ERROR:",
            parseError
          );
        }

        const normalList =
          Array.isArray(
            normalData?.registrations
          )
            ? normalData.registrations
            : Array.isArray(normalData?.data)
            ? normalData.data
            : Array.isArray(normalData)
            ? normalData
            : [];

        const tdmList =
          Array.isArray(
            tdmData?.registrations
          )
            ? tdmData.registrations
            : Array.isArray(tdmData?.data)
            ? tdmData.data
            : Array.isArray(tdmData)
            ? tdmData
            : [];

        const normal =
          normalList.map((item: any) =>
            normalizeRegistration(
              item,
              "normal"
            )
          );

        const tdm =
          tdmList.map((item: any) =>
            normalizeRegistration(
              item,
              "tdm"
            )
          );

        const all = [...normal, ...tdm];

        const unique = Array.from(
          new Map(
            all.map((item) => [
              item._id,
              item,
            ])
          ).values()
        );

        unique.sort(
          (a, b) =>
            new Date(
              b.createdAt
            ).getTime() -
            new Date(
              a.createdAt
            ).getTime()
        );

        // ==================================================
        // REFRESH LIVE + CONFIRMED MATCHES
        // ==================================================

        const updated =
          await Promise.all(
            unique.map(
              async (registration) => {
                const tournament =
                  registration.tournament;

                if (!tournament) {
                  return registration;
                }

                const tournamentId =
                  tournament._id ||
                  registration.tournamentId ||
                  registration.matchId;

                if (!tournamentId) {
                  return registration;
                }

                const type =
                  getTournamentType(
                    tournament,
                    registration
                  );

                const isLive =
                  String(
                    tournament.status
                  ).toLowerCase() ===
                  "live";

                const isConfirmed =
                  String(
                    registration.registrationStatus
                  ).toLowerCase() ===
                  "confirmed";

                if (
                  !isLive ||
                  !isConfirmed
                ) {
                  return registration;
                }

                if (
                  type === "tdm" ||
                  type === "clash"
                ) {
                  try {
                    const response =
                      await fetch(
                        `${API_URL}/api/squad-clash-tdm/${encodeURIComponent(
                          tournamentId
                        )}`,
                        {
                          method: "GET",
                          credentials:
                            "include",
                          cache:
                            "no-store",
                          headers: {
                            Accept:
                              "application/json",
                          },
                        }
                      );

                    if (!response.ok) {
                      return registration;
                    }

                    const data =
                      await response.json();

                    const match =
                      data?.match ||
                      data?.tournament ||
                      data?.data?.match ||
                      data?.data?.tournament ||
                      data?.data ||
                      null;

                    if (!match) {
                      return registration;
                    }

                    return {
                      ...registration,

                      tournament: {
                        ...tournament,

                        _id: safeString(
                          match._id ||
                            tournament._id
                        ),

                        name:
                          match.name ||
                          match.title ||
                          tournament.name,

                        game:
                          match.game ||
                          match.gameName ||
                          tournament.game,

                        prize: safeNumber(
                          match.prize ??
                            match.prizePool ??
                            tournament.prize
                        ),

                        entryFee:
                          safeNumber(
                            match.entryFee ??
                              match.registrationFee ??
                              tournament.entryFee
                          ),

                        maxTeams:
                          safeNumber(
                            match.maxTeams ??
                              match.maxSlots ??
                              tournament.maxTeams
                          ),

                        registeredTeams:
                          safeNumber(
                            match.registeredTeams ??
                              match.registeredSlots ??
                              match.filledSlots ??
                              tournament.registeredTeams
                          ),

                        date:
                          match.date ||
                          match.matchDate ||
                          tournament.date,

                        time:
                          match.time ||
                          match.matchTime ||
                          tournament.time,

                        mode:
                          match.mode ||
                          tournament.mode,

                        type:
                          match.type ||
                          tournament.type,

                        gameType:
                          match.gameType ||
                          tournament.gameType,

                        map:
                          match.map ||
                          match.mapName ||
                          tournament.map,

                        status:
                          match.status ||
                          tournament.status,

                        roomId:
                          safeString(
                            match.roomId ||
                              match.roomID ||
                              match.room?.id
                          ),

                        roomPassword:
                          safeString(
                            match.roomPassword ||
                              match.roomPass ||
                              match.password ||
                              match.room?.password
                          ),

                        teamSlot:
                          registration.teamSlot ||
                          tournament.teamSlot,

                        teamName:
                          registration.teamName ||
                          tournament.teamName,

                        players:
                          registration.players,
                      },
                    };
                  } catch (
                    refreshError
                  ) {
                    console.error(
                      "TDM MATCH REFRESH ERROR:",
                      refreshError
                    );

                    return registration;
                  }
                }

                return registration;
              }
            )
          );

        setRegistrations(updated);

        if (
          updated.length === 0 &&
          normalResponse.status === 401 &&
          tdmResponse.status === 401
        ) {
          setError(
            "Please login to view your tournaments."
          );
        }
      } catch (err) {
        console.error(
          "LOAD MY TOURNAMENTS ERROR:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load tournaments."
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    loadMyTournaments();
  }, [loadMyTournaments]);

  // ====================================================
  // STATS
  // ====================================================

  const stats = useMemo(() => {
    let live = 0;
    let upcoming = 0;
    let completed = 0;
    let confirmed = 0;

    registrations.forEach(
      (registration) => {
        const status =
          String(
            registration.tournament?.status ||
              ""
          ).toLowerCase();

        if (status === "live") live++;
        if (status === "upcoming") upcoming++;
        if (status === "completed") completed++;

        if (
          String(
            registration.registrationStatus
          ).toLowerCase() === "confirmed"
        ) {
          confirmed++;
        }
      }
    );

    return {
      total: registrations.length,
      live,
      upcoming,
      completed,
      confirmed,
    };
  }, [registrations]);

  // ====================================================
  // LOADING
  // ====================================================

  if (loading) {
    return (
      <main className="min-h-screen bg-[#070b14] text-white">
        <div className="mx-auto flex min-h-screen max-w-[1440px] items-center justify-center px-4">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0d1320] p-10 text-center shadow-2xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-indigo-400/20 bg-indigo-500/10">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-white/10 border-t-indigo-400" />
            </div>

            <h2 className="mt-6 text-lg font-black">
              Loading tournaments
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Fetching your registrations
              and match information...
            </p>
          </div>
        </div>
      </main>
    );
  }

  // ====================================================
  // PAGE
  // ====================================================

  return (
    <main className="min-h-screen bg-[#070b14] text-white">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-180px] top-[-180px] h-[420px] w-[420px] rounded-full bg-indigo-600/10 blur-[120px]" />

        <div className="absolute right-[-180px] top-[25%] h-[420px] w-[420px] rounded-full bg-purple-600/10 blur-[120px]" />
      </div>

      {/* HEADER */}
      <header className="relative border-b border-white/[0.06] bg-[#080d17]/90 backdrop-blur-xl">
        <div className="mx-auto max-w-[1440px] px-4 py-7 sm:px-6 lg:px-8 lg:py-10">
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 transition hover:text-white"
          >
            ← Back to profile
          </Link>

          <div className="mt-8 flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 shadow-[0_0_12px_rgba(129,140,248,0.9)]" />

                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-indigo-400">
                  Player dashboard
                </p>
              </div>

              <h1 className="mt-3 text-4xl font-black tracking-[-0.04em] sm:text-5xl">
                My Tournaments
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-500">
                Manage registrations, team
                information, match schedules
                and live match access from one
                place.
              </p>
            </div>

            <Link
              href="/tournaments"
              className="inline-flex items-center justify-center rounded-xl border border-indigo-400/20 bg-indigo-500 px-6 py-3.5 text-xs font-black uppercase tracking-wide text-white shadow-[0_8px_30px_rgba(79,70,229,0.25)] transition hover:bg-indigo-400"
            >
              Browse tournaments

              <span className="ml-2">
                →
              </span>
            </Link>
          </div>

          {/* STATS */}
          <div className="mt-9 grid grid-cols-2 overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0d1320] sm:grid-cols-3 lg:grid-cols-5">
            <DashboardStat
              label="Total"
              value={stats.total}
            />

            <DashboardStat
              label="Live"
              value={stats.live}
              green
            />

            <DashboardStat
              label="Upcoming"
              value={stats.upcoming}
            />

            <DashboardStat
              label="Completed"
              value={stats.completed}
            />

            <DashboardStat
              label="Confirmed"
              value={stats.confirmed}
              green
            />
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <section className="relative mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        {/* ERROR */}
        {error && (
          <div className="mb-7 rounded-2xl border border-red-500/20 bg-red-500/[0.07] p-5">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-red-400">
                  Unable to load
                </p>

                <p className="mt-1 text-sm font-bold text-red-300">
                  {error}
                </p>
              </div>

              <button
                type="button"
                onClick={loadMyTournaments}
                className="rounded-xl border border-red-400/20 bg-red-500/10 px-5 py-2.5 text-[10px] font-black uppercase tracking-wider text-red-300 transition hover:bg-red-500/20"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* EMPTY */}
        {!error &&
          registrations.length === 0 && (
            <EmptyTournaments />
          )}

        {/* LIST */}
        {registrations.length > 0 && (
          <div>
            <div className="mb-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-indigo-400">
                  Your competitions
                </p>

                <h2 className="mt-2 text-2xl font-black tracking-tight">
                  Registered tournaments
                </h2>
              </div>

              <p className="text-xs text-slate-600">
                {registrations.length}{" "}
                registration
                {registrations.length !== 1
                  ? "s"
                  : ""}
              </p>
            </div>

            <div className="space-y-6">
              {registrations.map(
                (registration) => (
                  <TournamentRegistrationCard
                    key={registration._id}
                    registration={
                      registration
                    }
                    onRefresh={
                      loadMyTournaments
                    }
                  />
                )
              )}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

// ======================================================
// TOURNAMENT REGISTRATION CARD
// ======================================================

function TournamentRegistrationCard({
  registration,
  onRefresh,
}: {
  registration: Registration;
  onRefresh: () => void;
}) {
  const tournament =
    registration.tournament;

  if (!tournament) {
    return (
      <div className="rounded-3xl border border-white/[0.07] bg-[#0d1320] p-7">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-600">
          Registration
        </p>

        <h2 className="mt-2 text-lg font-black">
          Tournament details unavailable
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          The tournament associated with
          this registration is no longer
          available.
        </p>
      </div>
    );
  }

  const tournamentType =
    getTournamentType(
      tournament,
      registration
    );

  const typeLabel =
    getTournamentTypeLabel(
      tournament,
      registration
    );

  const isTdm =
    tournamentType === "tdm";

  const isClash =
    tournamentType === "clash";

  const isNormal =
    tournamentType === "normal";

  const status = String(
    tournament.status
  ).toLowerCase();

  const live = status === "live";
  const upcoming = status === "upcoming";
  const completed = status === "completed";

  const confirmed =
    String(
      registration.registrationStatus
    ).toLowerCase() === "confirmed";

  const cancelled =
    String(
      registration.registrationStatus
    ).toLowerCase() === "cancelled";

  const rejected =
    String(
      registration.registrationStatus
    ).toLowerCase() === "rejected";

  const canViewRoom =
    live &&
    confirmed &&
    !cancelled &&
    !rejected;

  const hasRoomId =
    Boolean(tournament.roomId);

  const hasRoomPassword =
    Boolean(tournament.roomPassword);

  const hasRoomDetails =
    hasRoomId &&
    hasRoomPassword;

  const detailsId =
    tournament._id ||
    registration.tournamentId ||
    registration.matchId;

  const progress =
    tournament.maxTeams > 0
      ? Math.min(
          100,
          Math.round(
            (tournament.registeredTeams /
              tournament.maxTeams) *
              100
          )
        )
      : 0;

  const players =
    registration.players?.length
      ? registration.players
      : tournament.players || [];

  const teamSlot = (
    registration.teamSlot ||
    tournament.teamSlot ||
    ""
  ).toUpperCase();

  const teamName =
    registration.teamName ||
    registration.playerTeamName ||
    tournament.teamName ||
    "N/A";

  return (
    <article className="group overflow-hidden rounded-3xl border border-white/[0.07] bg-[#0d1320] shadow-[0_20px_70px_rgba(0,0,0,0.2)] transition hover:border-indigo-400/20">
      {/* TOP LINE */}
      <div
        className={`h-[2px] ${
          live
            ? "bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.7)]"
            : rejected || cancelled
            ? "bg-red-400"
            : "bg-indigo-500"
        }`}
      />

      {/* HEADER */}
      <div className="p-6 sm:p-7">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <GameBadge game={tournament.game} />

              <TypeBadge
                type={tournamentType}
                label={typeLabel}
              />

              {teamSlot && (
                <span className="rounded-lg border border-emerald-400/10 bg-emerald-400/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-emerald-400">
                  Team {teamSlot}
                </span>
              )}
            </div>

            <h2 className="mt-4 text-2xl font-black tracking-tight text-white sm:text-3xl">
              {tournament.name}
            </h2>

            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-[11px] text-slate-600">
              <span>
                {tournament.map}
              </span>

              <span>
                {tournament.mode ||
                  typeLabel}
              </span>

              <span>
                {tournament.game}
              </span>
            </div>
          </div>

          <StatusBadge
            status={tournament.status}
            live={live}
            completed={completed}
            cancelled={cancelled}
            rejected={rejected}
          />
        </div>
      </div>

      {/* MAIN STATS */}
      <div className="mx-5 grid overflow-hidden rounded-2xl border border-white/[0.06] bg-[#080d17] sm:mx-6 sm:grid-cols-4">
        <CardStat
          label="Prize"
          value={money(
            tournament.prize
          )}
          green
        />

        <CardStat
          label="Entry"
          value={
            tournament.entryFee
              ? money(
                  tournament.entryFee
                )
              : "FREE"
          }
        />

        <CardStat
          label="Slots"
          value={`${tournament.registeredTeams}/${tournament.maxTeams}`}
        />

        <CardStat
          label="Match date"
          value={formatDate(
            tournament.date
          )}
        />
      </div>

      {/* MATCH INFO */}
      <div className="mx-5 mt-4 grid gap-3 sm:mx-6 sm:grid-cols-2">
        <Info
          label="Match date"
          value={formatDate(
            tournament.date
          )}
        />

        <Info
          label="Match time"
          value={formatTime(
            tournament.time
          )}
        />
      </div>

      {/* PROGRESS */}
      {tournament.maxTeams > 0 && (
        <div className="px-5 pt-6 sm:px-6">
          <div className="flex items-center justify-between">
            <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-600">
              Tournament capacity
            </p>

            <p className="text-[10px] font-black text-indigo-400">
              {progress}% filled
            </p>
          </div>

          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className="h-full rounded-full bg-indigo-500 transition-all"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* TDM / CLASH TEAM */}
      {(isTdm || isClash) && (
        <div className="mx-5 mt-6 rounded-2xl border border-white/[0.06] bg-[#080d17] p-5 sm:mx-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600">
                {isTdm
                  ? "TDM registration"
                  : "Squad clash registration"}
              </p>

              <p className="mt-2 text-base font-black text-white">
                {teamName}
              </p>
            </div>

            {teamSlot && (
              <div className="rounded-xl border border-indigo-400/10 bg-indigo-500/10 px-5 py-3 text-center">
                <p className="text-[8px] font-black uppercase tracking-[0.15em] text-slate-500">
                  Team slot
                </p>

                <p className="mt-1 text-xl font-black text-indigo-400">
                  {teamSlot}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PLAYERS */}
      {(isTdm || isClash) &&
        players.length > 0 && (
          <div className="mx-5 mt-5 rounded-2xl border border-white/[0.06] bg-[#080d17] p-5 sm:mx-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600">
                  Team players
                </p>

                <p className="mt-1 text-xs text-slate-600">
                  {players.length} registered
                  players
                </p>
              </div>

              <span className="rounded-lg border border-indigo-400/10 bg-indigo-500/10 px-3 py-1.5 text-[9px] font-black text-indigo-400">
                {players.length}/4
              </span>
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {players.map(
                (player, index) => {
                  const playerUid =
                    player.uid ||
                    player.gameUid ||
                    "N/A";

                  return (
                    <div
                      key={`${registration._id}-player-${index}`}
                      className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.05] bg-[#0d1320] p-3"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-[10px] font-black text-indigo-400">
                          {player.slot ||
                            index + 1}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-xs font-bold text-slate-200">
                            {player.name ||
                              player.playerName ||
                              "Player"}
                          </p>

                          <p className="mt-1 truncate text-[10px] text-slate-600">
                            UID: {playerUid}
                          </p>
                        </div>
                      </div>

                      {player.verified && (
                        <span className="shrink-0 rounded-full bg-emerald-400/10 px-2 py-1 text-[8px] font-black text-emerald-400">
                          Verified
                        </span>
                      )}
                    </div>
                  );
                }
              )}
            </div>
          </div>
        )}

      {/* LIVE ROOM */}
      {canViewRoom && (
        <div className="mx-5 mt-6 overflow-hidden rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.04] sm:mx-6">
          <div className="border-b border-emerald-400/10 px-5 py-5">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-400/10 text-lg">
                🎮
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">
                  Match is live
                </p>

                <p className="mt-1 text-xs leading-5 text-emerald-300/60">
                  Your registration is
                  confirmed. Use the credentials
                  below to join.
                </p>
              </div>
            </div>
          </div>

          {hasRoomDetails ? (
            <div className="grid gap-3 p-4 sm:grid-cols-2">
              <RoomCredential
                label="Room ID"
                value={
                  tournament.roomId || ""
                }
              />

              <RoomCredential
                label="Room password"
                value={
                  tournament.roomPassword ||
                  ""
                }
              />
            </div>
          ) : (
            <div className="p-4">
              <div className="rounded-xl border border-amber-400/20 bg-amber-400/[0.05] p-4">
                <p className="text-sm font-black text-amber-300">
                  Room details are being
                  prepared
                </p>

                <p className="mt-1 text-xs leading-5 text-amber-300/60">
                  Your registration is
                  confirmed, but the Room ID or
                  password has not been published
                  yet.
                </p>

                <button
                  type="button"
                  onClick={onRefresh}
                  className="mt-4 rounded-lg border border-amber-400/20 bg-amber-400/10 px-4 py-2 text-[10px] font-black uppercase tracking-wider text-amber-300 transition hover:bg-amber-400/20"
                >
                  Refresh room details
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* LIVE BUT NOT CONFIRMED */}
      {live &&
        !canViewRoom &&
        !cancelled &&
        !rejected && (
          <div className="mx-5 mt-6 overflow-hidden rounded-2xl border border-amber-400/20 bg-amber-400/[0.04] sm:mx-6">
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-400/10 text-lg">
                  🔒
                </div>

                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400">
                    Match is live
                  </p>

                  <h3 className="mt-2 text-base font-black text-white">
                    Registration is not
                    confirmed
                  </h3>

                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    Room ID and password are
                    hidden until your payment and
                    registration are confirmed.
                  </p>

                  <div className="mt-4 rounded-xl border border-white/[0.06] bg-[#0d1320] p-4">
                    <p className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-600">
                      Need help?
                    </p>

                    <a
                      href="tel:9027634500"
                      className="mt-2 block text-base font-black text-indigo-400 hover:text-indigo-300"
                    >
                      📞 9027634500
                    </a>

                    <p className="mt-1 text-[10px] text-slate-600">
                      Contact support for payment
                      confirmation.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={onRefresh}
                    className="mt-4 rounded-lg border border-amber-400/20 bg-amber-400/10 px-4 py-2 text-[10px] font-black uppercase tracking-wider text-amber-300 transition hover:bg-amber-400/20"
                  >
                    Refresh status
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      {/* LIVE + REJECTED */}
      {live && rejected && (
        <div className="mx-5 mt-6 rounded-2xl border border-red-400/20 bg-red-400/[0.04] p-6 sm:mx-6">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-400/10">
              ❌
            </div>

            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-red-400">
                Registration rejected
              </p>

              <h3 className="mt-2 text-base font-black text-white">
                You cannot join this match
              </h3>

              <p className="mt-2 text-xs leading-5 text-slate-500">
                Your registration was rejected.
                Room details are not available.
              </p>

              <a
                href="tel:9027634500"
                className="mt-4 inline-block text-sm font-black text-indigo-400"
              >
                📞 Contact: 9027634500
              </a>
            </div>
          </div>
        </div>
      )}

      {/* UPCOMING */}
      {upcoming &&
        !cancelled &&
        !rejected && (
          <div className="mx-5 mt-6 rounded-2xl border border-indigo-400/10 bg-indigo-500/[0.04] p-5 sm:mx-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10">
                ⏳
              </div>

              <div>
                <p className="text-xs font-black text-indigo-400">
                  Match is upcoming
                </p>

                <p className="mt-1 text-[10px] leading-5 text-slate-600">
                  Room details will become
                  available after the match is made
                  live and your registration is
                  confirmed.
                </p>
              </div>
            </div>
          </div>
        )}

      {/* REGISTRATION DETAILS */}
      <div className="mt-6 border-t border-white/[0.06] p-6 sm:p-7">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">
              Your registration
            </p>

            <p className="mt-1 text-xs text-slate-700">
              Registration and payment
              information
            </p>
          </div>

          <RegistrationStatus
            status={
              registration.registrationStatus
            }
            confirmed={confirmed}
            cancelled={cancelled}
            rejected={rejected}
          />
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <Info
            label={
              isNormal
                ? "Team / player"
                : "Team name"
            }
            value={teamName}
          />

          <Info
            label={
              isNormal
                ? "Game ID"
                : "Team slot"
            }
            value={
              isNormal
                ? registration.gameUid ||
                  "N/A"
                : teamSlot ||
                  "Not assigned"
            }
          />

          <Info
            label="Payment"
            value={
              registration.paymentStatus
            }
            green={
              registration.paymentStatus ===
                "Paid" ||
              registration.paymentStatus ===
                "Verified"
            }
          />
        </div>

        {(isTdm || isClash) && (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <Info
              label="Match type"
              value={typeLabel}
            />

            <Info
              label="Players"
              value={`${players.length}/4`}
            />
          </div>
        )}

        {registration.adminNote && (
          <div className="mt-4 rounded-xl border border-white/[0.06] bg-[#080d17] p-4">
            <p className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-600">
              Admin note
            </p>

            <p className="mt-2 text-xs leading-5 text-slate-500">
              {registration.adminNote}
            </p>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div className="flex flex-col justify-between gap-4 border-t border-white/[0.06] bg-[#080d17] p-5 sm:flex-row sm:items-center sm:px-7">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-700">
            Registration status
          </p>

          <p
            className={`mt-1 text-xs font-black ${
              confirmed
                ? "text-emerald-400"
                : cancelled || rejected
                ? "text-red-400"
                : "text-amber-400"
            }`}
          >
            {registration.registrationStatus}
          </p>
        </div>

        {live &&
        confirmed &&
        !cancelled &&
        !rejected &&
        detailsId ? (
          <Link
            href={`/my-tournaments/${detailsId}`}
            className="inline-flex items-center justify-center rounded-xl bg-indigo-500 px-6 py-3 text-[10px] font-black uppercase tracking-wider text-white shadow-[0_8px_25px_rgba(79,70,229,0.25)] transition hover:bg-indigo-400"
          >
            🔐 View match details →
          </Link>
        ) : (
          <div className="rounded-xl border border-white/[0.06] bg-[#0d1320] px-5 py-3 text-center text-[10px] font-bold text-slate-600">
            🔒 Room details available after
            confirmation
          </div>
        )}
      </div>
    </article>
  );
}

// ======================================================
// DASHBOARD STAT
// ======================================================

function DashboardStat({
  label,
  value,
  green = false,
}: {
  label: string;
  value: number;
  green?: boolean;
}) {
  return (
    <div className="border-b border-white/[0.06] px-5 py-5 last:border-b-0 sm:px-6 md:border-b-0 md:border-r md:last:border-r-0">
      <p
        className={`text-2xl font-black tracking-tight ${
          green
            ? "text-emerald-400"
            : "text-white"
        }`}
      >
        {value}
      </p>

      <p className="mt-1.5 text-[9px] font-black uppercase tracking-[0.16em] text-slate-600">
        {label}
      </p>
    </div>
  );
}

// ======================================================
// GAME BADGE
// ======================================================

function GameBadge({
  game,
}: {
  game: string;
}) {
  const bgmi =
    game.toLowerCase() === "bgmi";

  return (
    <span
      className={`rounded-lg border px-2.5 py-1 text-[9px] font-black uppercase tracking-wide ${
        bgmi
          ? "border-indigo-400/10 bg-indigo-500/10 text-indigo-400"
          : "border-orange-400/10 bg-orange-500/10 text-orange-400"
      }`}
    >
      {game}
    </span>
  );
}

// ======================================================
// TYPE BADGE
// ======================================================

function TypeBadge({
  type,
  label,
}: {
  type: TournamentType;
  label: string;
}) {
  const classes =
    type === "tdm"
      ? "border-blue-400/10 bg-blue-500/10 text-blue-400"
      : type === "clash"
      ? "border-purple-400/10 bg-purple-500/10 text-purple-400"
      : "border-white/[0.07] bg-white/[0.04] text-slate-500";

  return (
    <span
      className={`rounded-lg border px-2.5 py-1 text-[9px] font-black uppercase tracking-wide ${classes}`}
    >
      {label}
    </span>
  );
}

// ======================================================
// STATUS BADGE
// ======================================================

function StatusBadge({
  status,
  live,
  completed,
  cancelled,
  rejected,
}: {
  status: string;
  live: boolean;
  completed: boolean;
  cancelled: boolean;
  rejected: boolean;
}) {
  const classes = live
    ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-400"
    : completed
    ? "border-white/[0.07] bg-white/[0.04] text-slate-500"
    : cancelled || rejected
    ? "border-red-400/20 bg-red-400/10 text-red-400"
    : "border-amber-400/20 bg-amber-400/10 text-amber-400";

  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-xl border px-3.5 py-2 text-[9px] font-black uppercase tracking-wide ${classes}`}
    >
      {live && (
        <span className="mr-2 h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
      )}

      {live ? "Live" : status}
    </span>
  );
}

// ======================================================
// REGISTRATION STATUS
// ======================================================

function RegistrationStatus({
  status,
  confirmed,
  cancelled,
  rejected,
}: {
  status: string;
  confirmed: boolean;
  cancelled: boolean;
  rejected: boolean;
}) {
  const classes = confirmed
    ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-400"
    : cancelled || rejected
    ? "border-red-400/20 bg-red-400/10 text-red-400"
    : "border-amber-400/20 bg-amber-400/10 text-amber-400";

  return (
    <span
      className={`inline-flex rounded-lg border px-3 py-1.5 text-[9px] font-black uppercase tracking-wide ${classes}`}
    >
      {status}
    </span>
  );
}

// ======================================================
// CARD STAT
// ======================================================

function CardStat({
  label,
  value,
  green = false,
}: {
  label: string;
  value: string;
  green?: boolean;
}) {
  return (
    <div className="border-b border-white/[0.06] p-4 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0">
      <p className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-600">
        {label}
      </p>

      <p
        className={`mt-2 text-sm font-black ${
          green
            ? "text-emerald-400"
            : "text-slate-200"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

// ======================================================
// INFO
// ======================================================

function Info({
  label,
  value,
  green = false,
}: {
  label: string;
  value: string;
  green?: boolean;
}) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#080d17] p-3.5">
      <p className="text-[8px] font-black uppercase tracking-[0.15em] text-slate-600">
        {label}
      </p>

      <p
        className={`mt-1.5 truncate text-xs font-bold ${
          green
            ? "text-emerald-400"
            : "text-slate-400"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

// ======================================================
// ROOM CREDENTIAL
// ======================================================

function RoomCredential({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  const [copied, setCopied] =
    useState(false);

  const handleCopy = async () => {
    await copyText(value);

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 1500);
  };

  return (
    <div className="rounded-xl border border-emerald-400/10 bg-[#0d1320] p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-600">
          {label}
        </p>

        <button
          type="button"
          onClick={handleCopy}
          className="rounded-lg border border-white/[0.07] bg-white/[0.03] px-2.5 py-1.5 text-[9px] font-black uppercase text-slate-400 transition hover:border-indigo-400/20 hover:text-indigo-400"
        >
          {copied
            ? "✓ Copied"
            : "Copy"}
        </button>
      </div>

      <p className="mt-3 break-all text-lg font-black tracking-wide text-white">
        {value}
      </p>
    </div>
  );
}

// ======================================================
// EMPTY STATE
// ======================================================

function EmptyTournaments() {
  return (
    <div className="rounded-3xl border border-white/[0.07] bg-[#0d1320] p-10 text-center shadow-2xl sm:p-16">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-indigo-400/10 bg-indigo-500/10 text-2xl font-black text-indigo-400">
        —
      </div>

      <p className="mt-7 text-[10px] font-black uppercase tracking-[0.25em] text-indigo-400">
        Your dashboard
      </p>

      <h2 className="mt-2 text-2xl font-black tracking-tight">
        No tournaments yet
      </h2>

      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600">
        You haven't registered for any
        competitions yet. Explore available
        tournaments and find your next match.
      </p>

      <Link
        href="/tournaments"
        className="mt-7 inline-flex rounded-xl bg-indigo-500 px-6 py-3.5 text-xs font-black uppercase tracking-wide text-white shadow-[0_8px_25px_rgba(79,70,229,0.25)] transition hover:bg-indigo-400"
      >
        Browse tournaments →
      </Link>
    </div>
  );
}