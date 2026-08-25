"use client";

import Link from "next/link";

type Tournament = {
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
  description?: string;
  rules?: string[];
};

type TournamentCardProps = {
  tournament: Tournament;
};

export default function TournamentCard({
  tournament,
}: TournamentCardProps) {
  const isLive = tournament.status === "Live";

  const filledPercentage =
    tournament.maxTeams > 0
      ? Math.min(
          100,
          Math.round(
            (Number(tournament.registeredTeams || 0) /
              Number(tournament.maxTeams || 1)) *
              100
          )
        )
      : 0;

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-100/60">
      {/* ==========================================
          BLUE TOP ACCENT
      ========================================== */}

      <div
        className={`h-1 w-full ${
          isLive
            ? "bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600"
            : "bg-gradient-to-r from-blue-500 via-blue-400 to-sky-400"
        }`}
      />

      {/* ==========================================
          CARD HEADER
      ========================================== */}

      <div className="p-6">
        {/* GAME + STATUS */}

        <div className="flex items-center justify-between gap-3">
          {/* GAME BADGE */}

          <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-[11px] font-bold tracking-wide text-blue-700">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />

            {tournament.game}
          </span>

          {/* STATUS */}

          <span
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider ${
              isLive
                ? "border-green-200 bg-green-50 text-green-700"
                : tournament.status === "Completed"
                ? "border-slate-200 bg-slate-50 text-slate-500"
                : tournament.status === "Cancelled"
                ? "border-red-200 bg-red-50 text-red-600"
                : "border-blue-200 bg-blue-50 text-blue-600"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                isLive
                  ? "bg-green-500"
                  : tournament.status === "Completed"
                  ? "bg-slate-400"
                  : tournament.status === "Cancelled"
                  ? "bg-red-500"
                  : "bg-blue-600"
              }`}
            />

            {tournament.status}
          </span>
        </div>

        {/* ==========================================
            TOURNAMENT NAME
        ========================================== */}

        <h3 className="mt-6 truncate text-2xl font-black tracking-tight text-slate-900 transition-colors duration-200 group-hover:text-blue-600">
          {tournament.name}
        </h3>

        {/* MODE + MAP */}

        <div className="mt-3 flex items-center gap-4 text-sm text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <span className="text-slate-400">◉</span>
            {tournament.mode}
          </span>

          <span className="inline-flex items-center gap-1.5">
            <span className="text-slate-400">◆</span>
            {tournament.map}
          </span>
        </div>
      </div>

      {/* ==========================================
          PRIZE / ENTRY
      ========================================== */}

      <div className="border-y border-slate-100 bg-slate-50/70 px-6 py-5">
        <div className="flex items-end justify-between">
          {/* PRIZE */}

          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
              Prize Pool
            </p>

            <p className="mt-2 text-2xl font-black tracking-tight text-blue-600">
              ₹{Number(tournament.prize || 0).toLocaleString("en-IN")}
            </p>
          </div>

          {/* ENTRY */}

          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
              Entry
            </p>

            <p className="mt-2 text-lg font-black text-slate-900">
              ₹{Number(tournament.entryFee || 0)}
            </p>
          </div>
        </div>
      </div>

      {/* ==========================================
          MATCH DETAILS
      ========================================== */}

      <div className="p-6">
        <div className="grid grid-cols-2 gap-3">
          {/* DATE */}

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400">
              Match Date
            </p>

            <p className="mt-2 text-sm font-bold text-slate-900">
              {tournament.date}
            </p>
          </div>

          {/* TIME */}

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400">
              Time
            </p>

            <p className="mt-2 text-sm font-bold text-slate-900">
              {tournament.time}
            </p>
          </div>

          {/* TEAMS */}

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400">
              Teams
            </p>

            <p className="mt-2 text-sm font-bold text-slate-900">
              {tournament.registeredTeams || 0}/
              {tournament.maxTeams || 0}
            </p>
          </div>

          {/* MODE */}

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400">
              Mode
            </p>

            <p className="mt-2 text-sm font-bold text-slate-900">
              {tournament.mode}
            </p>
          </div>
        </div>

        {/* ==========================================
            SLOTS PROGRESS
        ========================================== */}

        <div className="mt-6">
          <div className="flex items-center justify-between">
            <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400">
              Slots Filled
            </p>

            <p className="text-xs font-bold text-blue-600">
              {filledPercentage}%
            </p>
          </div>

          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
              style={{
                width: `${filledPercentage}%`,
              }}
            />
          </div>
        </div>

        {/* ==========================================
            VIEW TOURNAMENT
        ========================================== */}

        <Link
          href={`/tournaments/${tournament._id}`}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200/60"
        >
          <span>View Tournament</span>

          <span className="text-lg transition-transform duration-200 group-hover:translate-x-1">
            →
          </span>
        </Link>
      </div>
    </div>
  );
}