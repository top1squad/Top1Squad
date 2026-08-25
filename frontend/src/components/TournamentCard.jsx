import Link from "next/link";
import GameBadge from "./GameBadge";

export default function TournamentCard({ tournament }) {
  return (
    <div className="group overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 transition hover:-translate-y-1 hover:border-zinc-700">
      
      {/* Banner */}
      <div className="relative flex h-40 items-end bg-gradient-to-br from-zinc-800 via-zinc-900 to-black p-5">
        <div>
          <GameBadge game={tournament.game} />

          <h3 className="mt-3 text-xl font-bold">
            {tournament.name}
          </h3>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">

        <div className="grid grid-cols-2 gap-4">

          <div>
            <p className="text-xs text-zinc-500">
              Prize Pool
            </p>

            <p className="mt-1 font-bold text-green-400">
              ₹{tournament.prize.toLocaleString()}
            </p>
          </div>

          <div>
            <p className="text-xs text-zinc-500">
              Entry Fee
            </p>

            <p className="mt-1 font-bold">
              ₹{tournament.entryFee}
            </p>
          </div>

          <div>
            <p className="text-xs text-zinc-500">
              Teams
            </p>

            <p className="mt-1 font-bold">
              {tournament.registeredTeams}/{tournament.maxTeams}
            </p>
          </div>

          <div>
            <p className="text-xs text-zinc-500">
              Date
            </p>

            <p className="mt-1 font-bold">
              {tournament.date}
            </p>
          </div>

        </div>

        <Link
          href={`/tournaments/${tournament.id}`}
          className="mt-5 block rounded-xl bg-white py-3 text-center text-sm font-bold text-black transition hover:bg-zinc-200"
        >
          View Tournament
        </Link>

      </div>
    </div>
  );
}