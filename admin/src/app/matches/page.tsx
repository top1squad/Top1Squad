import Link from "next/link";
import AdminSidebar from "../../components/AdminSidebar";

const matches = [
  {
    id: 1,
    name: "Match 1",
    tournament: "BGMI Night Cup",
    game: "BGMI",
    map: "Erangel",
    date: "15 Aug 2026",
    time: "08:00 PM",
    teams: "16 / 16",
    roomId: "78451236",
    status: "Upcoming",
  },
  {
    id: 2,
    name: "Match 2",
    tournament: "BGMI Night Cup",
    game: "BGMI",
    map: "Miramar",
    date: "15 Aug 2026",
    time: "09:00 PM",
    teams: "14 / 16",
    roomId: "78451291",
    status: "Upcoming",
  },
  {
    id: 3,
    name: "Match 1",
    tournament: "Free Fire Booyah Cup",
    game: "Free Fire",
    map: "Bermuda",
    date: "20 Aug 2026",
    time: "07:00 PM",
    teams: "12 / 16",
    roomId: "FF784512",
    status: "Live",
  },
  {
    id: 4,
    name: "Final Match",
    tournament: "BGMI Pro Battle",
    game: "BGMI",
    map: "Erangel",
    date: "25 Aug 2026",
    time: "09:00 PM",
    teams: "16 / 16",
    roomId: "78459921",
    status: "Completed",
  },
];

export default function MatchesPage() {
  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white">
      <AdminSidebar />

      <main className="ml-64 p-8">

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              Matches
            </h1>

            <p className="mt-2 text-gray-400">
              Create and manage tournament matches.
            </p>
          </div>

          <Link href="/matches/create">
            <button className="rounded-lg bg-orange-500 px-5 py-3 font-semibold text-black hover:bg-orange-400">
              + Create Match
            </button>
          </Link>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-4">

          <StatCard
            title="Total Matches"
            value="128"
          />

          <StatCard
            title="Upcoming"
            value="42"
            color="text-blue-400"
          />

          <StatCard
            title="Live"
            value="3"
            color="text-green-400"
          />

          <StatCard
            title="Completed"
            value="83"
            color="text-gray-400"
          />

        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-3">

          <input
            type="text"
            placeholder="Search match..."
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
          </select>

        </div>

        {/* Match Table */}
        <div className="overflow-hidden rounded-xl border border-white/10 bg-[#151515]">

          <div className="border-b border-white/10 p-5">
            <h2 className="text-lg font-semibold">
              All Matches
            </h2>

            <p className="mt-1 text-sm text-gray-400">
              {matches.length} matches shown
            </p>
          </div>

          <div className="overflow-x-auto">

            <table className="w-full text-left">

              <thead>
                <tr className="border-b border-white/10 text-sm text-gray-400">

                  <th className="px-5 py-4">
                    Match
                  </th>

                  <th className="px-5 py-4">
                    Tournament
                  </th>

                  <th className="px-5 py-4">
                    Game
                  </th>

                  <th className="px-5 py-4">
                    Map
                  </th>

                  <th className="px-5 py-4">
                    Schedule
                  </th>

                  <th className="px-5 py-4">
                    Teams
                  </th>

                  <th className="px-5 py-4">
                    Room ID
                  </th>

                  <th className="px-5 py-4">
                    Status
                  </th>

                  <th className="px-5 py-4">
                    Action
                  </th>

                </tr>
              </thead>

              <tbody>

                {matches.map((match) => (
                  <tr
                    key={match.id}
                    className="border-b border-white/5 hover:bg-white/[0.03]"
                  >

                    {/* Match */}
                    <td className="px-5 py-4">

                      <p className="font-medium">
                        {match.name}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        Match #{match.id}
                      </p>

                    </td>

                    {/* Tournament */}
                    <td className="px-5 py-4 text-sm text-gray-300">
                      {match.tournament}
                    </td>

                    {/* Game */}
                    <td className="px-5 py-4">

                      <span
                        className={
                          match.game === "BGMI"
                            ? "rounded-md bg-orange-500/10 px-3 py-1 text-xs text-orange-400"
                            : "rounded-md bg-purple-500/10 px-3 py-1 text-xs text-purple-400"
                        }
                      >
                        {match.game}
                      </span>

                    </td>

                    {/* Map */}
                    <td className="px-5 py-4 text-sm text-gray-300">
                      {match.map}
                    </td>

                    {/* Schedule */}
                    <td className="px-5 py-4">

                      <p className="text-sm">
                        {match.date}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        {match.time}
                      </p>

                    </td>

                    {/* Teams */}
                    <td className="px-5 py-4 text-sm">
                      {match.teams}
                    </td>

                    {/* Room ID */}
                    <td className="px-5 py-4">

                      <span className="rounded-md bg-white/5 px-3 py-1 font-mono text-xs text-gray-300">
                        {match.roomId}
                      </span>

                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">

                      <span
                        className={
                          match.status === "Upcoming"
                            ? "rounded-full bg-blue-500/10 px-3 py-1 text-xs text-blue-400"
                            : match.status === "Live"
                              ? "rounded-full bg-green-500/10 px-3 py-1 text-xs text-green-400"
                              : "rounded-full bg-gray-500/10 px-3 py-1 text-xs text-gray-400"
                        }
                      >
                        {match.status}
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

function StatCard({
  title,
  value,
  color = "text-white",
}: {
  title: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#151515] p-5">

      <p className="text-sm text-gray-400">
        {title}
      </p>

      <h2 className={`mt-2 text-3xl font-bold ${color}`}>
        {value}
      </h2>

    </div>
  );
}