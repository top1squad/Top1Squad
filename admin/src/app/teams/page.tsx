import AdminSidebar from "../../components/AdminSidebar";

const teams = [
  {
    id: 1,
    name: "Tech Warriors",
    captain: "Keshav",
    game: "BGMI",
    players: 4,
    tournament: "BGMI Night Cup",
    status: "Approved",
  },
  {
    id: 2,
    name: "Fire Kings",
    captain: "Rahul",
    game: "Free Fire",
    players: 4,
    tournament: "Booyah Cup",
    status: "Approved",
  },
  {
    id: 3,
    name: "Alpha Squad",
    captain: "Aman",
    game: "BGMI",
    players: 3,
    tournament: "Pro Battle",
    status: "Pending",
  },
  {
    id: 4,
    name: "Shadow Elite",
    captain: "Rohit",
    game: "Free Fire",
    players: 4,
    tournament: "Weekend War",
    status: "Rejected",
  },
];

export default function TeamsPage() {
  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white">
      <AdminSidebar />

      <main className="ml-64 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Teams</h1>
          <p className="mt-2 text-gray-400">
            Manage registered teams for all tournaments.
          </p>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-4">
          <StatCard title="Total Teams" value="286" />
          <StatCard title="Approved" value="241" color="text-green-400" />
          <StatCard title="Pending" value="31" color="text-yellow-400" />
          <StatCard title="Rejected" value="14" color="text-red-400" />
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Search team..."
            className="w-80 rounded-lg border border-white/10 bg-[#151515] px-4 py-3 text-sm outline-none placeholder:text-gray-500 focus:border-orange-500"
          />

          <select className="rounded-lg border border-white/10 bg-[#151515] px-4 py-3 text-sm outline-none">
            <option>All Games</option>
            <option>BGMI</option>
            <option>Free Fire</option>
          </select>

          <select className="rounded-lg border border-white/10 bg-[#151515] px-4 py-3 text-sm outline-none">
            <option>All Status</option>
            <option>Approved</option>
            <option>Pending</option>
            <option>Rejected</option>
          </select>
        </div>

        {/* Teams Table */}
        <div className="overflow-hidden rounded-xl border border-white/10 bg-[#151515]">
          <div className="border-b border-white/10 p-5">
            <h2 className="text-lg font-semibold">Registered Teams</h2>
            <p className="mt-1 text-sm text-gray-400">
              {teams.length} teams shown
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10 text-sm text-gray-400">
                  <th className="px-5 py-4">Team</th>
                  <th className="px-5 py-4">Captain</th>
                  <th className="px-5 py-4">Game</th>
                  <th className="px-5 py-4">Players</th>
                  <th className="px-5 py-4">Tournament</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Action</th>
                </tr>
              </thead>

              <tbody>
                {teams.map((team) => (
                  <tr
                    key={team.id}
                    className="border-b border-white/5 hover:bg-white/[0.03]"
                  >
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-medium">{team.name}</p>
                        <p className="text-xs text-gray-500">
                          Team #{team.id}
                        </p>
                      </div>
                    </td>

                    <td className="px-5 py-4">{team.captain}</td>

                    <td className="px-5 py-4">
                      <span
                        className={
                          team.game === "BGMI"
                            ? "rounded-md bg-orange-500/10 px-3 py-1 text-xs text-orange-400"
                            : "rounded-md bg-purple-500/10 px-3 py-1 text-xs text-purple-400"
                        }
                      >
                        {team.game}
                      </span>
                    </td>

                    <td className="px-5 py-4">{team.players}/4</td>

                    <td className="px-5 py-4">{team.tournament}</td>

                    <td className="px-5 py-4">
                      <span
                        className={
                          team.status === "Approved"
                            ? "rounded-full bg-green-500/10 px-3 py-1 text-xs text-green-400"
                            : team.status === "Pending"
                              ? "rounded-full bg-yellow-500/10 px-3 py-1 text-xs text-yellow-400"
                              : "rounded-full bg-red-500/10 px-3 py-1 text-xs text-red-400"
                        }
                      >
                        {team.status}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <button className="rounded-md px-3 py-2 text-sm hover:bg-white/10">
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
      <p className="text-sm text-gray-400">{title}</p>
      <h2 className={`mt-2 text-3xl font-bold ${color}`}>{value}</h2>
    </div>
  );
}