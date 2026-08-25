import AdminSidebar from "../../components/AdminSidebar";

const results = [
  {
    id: 1,
    match: "Match 1",
    tournament: "BGMI Night Cup",
    game: "BGMI",
    date: "15 Aug 2026",
    teams: 16,
    winner: "Tech Warriors",
    prize: "₹2,500",
    status: "Published",
  },
  {
    id: 2,
    match: "Match 2",
    tournament: "BGMI Night Cup",
    game: "BGMI",
    date: "15 Aug 2026",
    teams: 16,
    winner: "Shadow Squad",
    prize: "₹2,500",
    status: "Published",
  },
  {
    id: 3,
    match: "Match 1",
    tournament: "Free Fire Booyah Cup",
    game: "Free Fire",
    date: "20 Aug 2026",
    teams: 16,
    winner: "Fire Kings",
    prize: "₹5,000",
    status: "Published",
  },
  {
    id: 4,
    match: "Final Match",
    tournament: "BGMI Pro Battle",
    game: "BGMI",
    date: "25 Aug 2026",
    teams: 16,
    winner: "Not Announced",
    prize: "₹10,000",
    status: "Pending",
  },
];

export default function ResultsPage() {
  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white">
      <AdminSidebar />

      <main className="ml-64 p-8">

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              Results & Winners
            </h1>

            <p className="mt-2 text-gray-400">
              Enter match results and announce tournament winners.
            </p>
          </div>

          <button className="rounded-lg bg-orange-500 px-5 py-3 font-semibold text-black hover:bg-orange-400">
            + Add Result
          </button>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-4">

          <StatCard
            title="Total Results"
            value="96"
          />

          <StatCard
            title="Published"
            value="91"
            color="text-green-400"
          />

          <StatCard
            title="Pending"
            value="5"
            color="text-yellow-400"
          />

          <StatCard
            title="Winners Announced"
            value="42"
            color="text-orange-400"
          />

        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-3">

          <input
            type="text"
            placeholder="Search match or tournament..."
            className="w-80 rounded-lg border border-white/10 bg-[#151515] px-4 py-3 text-sm outline-none placeholder:text-gray-500 focus:border-orange-500"
          />

          <select className="rounded-lg border border-white/10 bg-[#151515] px-4 py-3 text-sm outline-none">
            <option>All Games</option>
            <option>BGMI</option>
            <option>Free Fire</option>
          </select>

          <select className="rounded-lg border border-white/10 bg-[#151515] px-4 py-3 text-sm outline-none">
            <option>All Status</option>
            <option>Published</option>
            <option>Pending</option>
          </select>

        </div>

        {/* Results Table */}
        <div className="overflow-hidden rounded-xl border border-white/10 bg-[#151515]">

          <div className="border-b border-white/10 p-5">

            <h2 className="text-lg font-semibold">
              Match Results
            </h2>

            <p className="mt-1 text-sm text-gray-400">
              {results.length} results shown
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
                    Date
                  </th>

                  <th className="px-5 py-4">
                    Teams
                  </th>

                  <th className="px-5 py-4">
                    Winner
                  </th>

                  <th className="px-5 py-4">
                    Prize
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

                {results.map((result) => (
                  <tr
                    key={result.id}
                    className="border-b border-white/5 hover:bg-white/[0.03]"
                  >

                    {/* Match */}
                    <td className="px-5 py-4">

                      <p className="font-medium">
                        {result.match}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        Result #{result.id}
                      </p>

                    </td>

                    {/* Tournament */}
                    <td className="px-5 py-4 text-sm text-gray-300">
                      {result.tournament}
                    </td>

                    {/* Game */}
                    <td className="px-5 py-4">

                      <span
                        className={
                          result.game === "BGMI"
                            ? "rounded-md bg-orange-500/10 px-3 py-1 text-xs text-orange-400"
                            : "rounded-md bg-purple-500/10 px-3 py-1 text-xs text-purple-400"
                        }
                      >
                        {result.game}
                      </span>

                    </td>

                    {/* Date */}
                    <td className="px-5 py-4 text-sm text-gray-400">
                      {result.date}
                    </td>

                    {/* Teams */}
                    <td className="px-5 py-4 text-sm">
                      {result.teams}
                    </td>

                    {/* Winner */}
                    <td className="px-5 py-4">

                      {result.winner === "Not Announced" ? (
                        <span className="text-sm text-gray-500">
                          Not Announced
                        </span>
                      ) : (
                        <div>
                          <p className="font-medium text-yellow-400">
                            🏆 {result.winner}
                          </p>

                          <p className="mt-1 text-xs text-gray-500">
                            Winner
                          </p>
                        </div>
                      )}

                    </td>

                    {/* Prize */}
                    <td className="px-5 py-4 font-medium">
                      {result.prize}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">

                      <span
                        className={
                          result.status === "Published"
                            ? "rounded-full bg-green-500/10 px-3 py-1 text-xs text-green-400"
                            : "rounded-full bg-yellow-500/10 px-3 py-1 text-xs text-yellow-400"
                        }
                      >
                        {result.status}
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