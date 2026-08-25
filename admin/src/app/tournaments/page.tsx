import Link from "next/link";
import AdminSidebar from "../../components/AdminSidebar";

const tournaments = [
  {
    id: 1,
    name: "BGMI Night Cup",
    game: "BGMI",
    type: "Squad",
    date: "15 Aug 2026",
    teams: "48 / 64",
    prize: "₹10,000",
    entry: "₹50",
    status: "Upcoming",
  },
  {
    id: 2,
    name: "Free Fire Booyah Cup",
    game: "Free Fire",
    type: "Squad",
    date: "20 Aug 2026",
    teams: "52 / 64",
    prize: "₹15,000",
    entry: "₹100",
    status: "Upcoming",
  },
  {
    id: 3,
    name: "BGMI Pro Battle",
    game: "BGMI",
    type: "Squad",
    date: "25 Aug 2026",
    teams: "64 / 64",
    prize: "₹25,000",
    entry: "₹100",
    status: "Full",
  },
  {
    id: 4,
    name: "Free Fire Weekend War",
    game: "Free Fire",
    type: "Duo",
    date: "30 Aug 2026",
    teams: "20 / 32",
    prize: "₹8,000",
    entry: "₹50",
    status: "Upcoming",
  },
];

export default function TournamentsPage() {
  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white">
      <AdminSidebar />

      <main className="ml-64 p-8">

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              Tournaments
            </h1>

            <p className="mt-2 text-gray-400">
              Create and manage all BGMI and Free Fire tournaments.
            </p>
          </div>

          {/* Create Tournament Button */}
          <Link
            href="/create-tournament"
            className="rounded-lg bg-orange-500 px-5 py-3 font-semibold text-black hover:bg-orange-400"
          >
            + Create Tournament
          </Link>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-3">
          <input
            type="text"
            placeholder="Search tournament..."
            className="w-80 rounded-lg border border-white/10 bg-[#151515] px-4 py-3 text-sm outline-none placeholder:text-gray-500 focus:border-orange-500"
          />

          <select className="rounded-lg border border-white/10 bg-[#151515] px-4 py-3 text-sm outline-none">
            <option>All Games</option>
            <option>BGMI</option>
            <option>Free Fire</option>
          </select>

          <select className="rounded-lg border border-white/10 bg-[#151515] px-4 py-3 text-sm outline-none">
            <option>All Status</option>
            <option>Upcoming</option>
            <option>Live</option>
            <option>Completed</option>
            <option>Full</option>
          </select>
        </div>

        {/* Tournament Table */}
        <div className="overflow-hidden rounded-xl border border-white/10 bg-[#151515]">

          {/* Table Header */}
          <div className="border-b border-white/10 p-5">
            <h2 className="text-lg font-semibold">
              All Tournaments
            </h2>

            <p className="mt-1 text-sm text-gray-400">
              {tournaments.length} tournaments found
            </p>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">

              <thead>
                <tr className="border-b border-white/10 text-sm text-gray-400">
                  <th className="px-5 py-4">Tournament</th>
                  <th className="px-5 py-4">Game</th>
                  <th className="px-5 py-4">Date</th>
                  <th className="px-5 py-4">Teams</th>
                  <th className="px-5 py-4">Prize</th>
                  <th className="px-5 py-4">Entry</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Action</th>
                </tr>
              </thead>

              <tbody>
                {tournaments.map((tournament) => (
                  <tr
                    key={tournament.id}
                    className="border-b border-white/5 hover:bg-white/[0.03]"
                  >

                    {/* Tournament */}
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-medium">
                          {tournament.name}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          {tournament.type}
                        </p>
                      </div>
                    </td>

                    {/* Game */}
                    <td className="px-5 py-4">
                      <span
                        className={
                          tournament.game === "BGMI"
                            ? "rounded-md bg-orange-500/10 px-3 py-1 text-xs text-orange-400"
                            : "rounded-md bg-purple-500/10 px-3 py-1 text-xs text-purple-400"
                        }
                      >
                        {tournament.game}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-5 py-4 text-sm text-gray-300">
                      {tournament.date}
                    </td>

                    {/* Teams */}
                    <td className="px-5 py-4 text-sm">
                      {tournament.teams}
                    </td>

                    {/* Prize */}
                    <td className="px-5 py-4 font-medium">
                      {tournament.prize}
                    </td>

                    {/* Entry */}
                    <td className="px-5 py-4 text-sm text-gray-300">
                      {tournament.entry}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <span
                        className={
                          tournament.status === "Upcoming"
                            ? "rounded-full bg-blue-500/10 px-3 py-1 text-xs text-blue-400"
                            : "rounded-full bg-yellow-500/10 px-3 py-1 text-xs text-yellow-400"
                        }
                      >
                        {tournament.status}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="px-5 py-4">
                      <button className="rounded-md px-3 py-2 text-sm text-gray-300 hover:bg-white/10">
                        ⋮
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        </div>

      </main>
    </div>
  );
}