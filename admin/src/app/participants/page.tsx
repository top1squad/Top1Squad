import AdminSidebar from "../../components/AdminSidebar";

const participants = [
  {
    id: 1,
    team: "Tech Warriors",
    captain: "Keshav",
    game: "BGMI",
    tournament: "BGMI Night Cup",
    players: 4,
    registered: "10 Aug 2026",
    payment: "Paid",
    status: "Confirmed",
  },
  {
    id: 2,
    team: "Shadow Squad",
    captain: "Aman",
    game: "BGMI",
    tournament: "BGMI Night Cup",
    players: 4,
    registered: "11 Aug 2026",
    payment: "Paid",
    status: "Confirmed",
  },
  {
    id: 3,
    team: "Fire Kings",
    captain: "Rahul",
    game: "Free Fire",
    tournament: "Free Fire Booyah Cup",
    players: 4,
    registered: "12 Aug 2026",
    payment: "Paid",
    status: "Confirmed",
  },
  {
    id: 4,
    team: "Booyah Boys",
    captain: "Rohit",
    game: "Free Fire",
    tournament: "Free Fire Booyah Cup",
    players: 4,
    registered: "13 Aug 2026",
    payment: "Pending",
    status: "Pending",
  },
  {
    id: 5,
    team: "Alpha Squad",
    captain: "Vikas",
    game: "BGMI",
    tournament: "BGMI Pro Battle",
    players: 4,
    registered: "14 Aug 2026",
    payment: "Paid",
    status: "Confirmed",
  },
];

export default function ParticipantsPage() {
  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white">
      <AdminSidebar />

      <main className="ml-64 p-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            Participants
          </h1>

          <p className="mt-2 text-gray-400">
            Manage teams registered for tournaments.
          </p>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-4">

          <StatCard
            title="Total Registrations"
            value="486"
          />

          <StatCard
            title="Confirmed"
            value="452"
            color="text-green-400"
          />

          <StatCard
            title="Pending"
            value="24"
            color="text-yellow-400"
          />

          <StatCard
            title="Cancelled"
            value="10"
            color="text-red-400"
          />

        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-3">

          <input
            type="text"
            placeholder="Search team or captain..."
            className="w-80 rounded-lg border border-white/10 bg-[#151515] px-4 py-3 text-sm outline-none placeholder:text-gray-500 focus:border-orange-500"
          />

          <select className="rounded-lg border border-white/10 bg-[#151515] px-4 py-3 text-sm outline-none">
            <option>All Tournaments</option>
            <option>BGMI Night Cup</option>
            <option>Free Fire Booyah Cup</option>
            <option>BGMI Pro Battle</option>
          </select>

          <select className="rounded-lg border border-white/10 bg-[#151515] px-4 py-3 text-sm outline-none">
            <option>All Games</option>
            <option>BGMI</option>
            <option>Free Fire</option>
          </select>

          <select className="rounded-lg border border-white/10 bg-[#151515] px-4 py-3 text-sm outline-none">
            <option>All Status</option>
            <option>Confirmed</option>
            <option>Pending</option>
            <option>Cancelled</option>
          </select>

        </div>

        {/* Participants Table */}
        <div className="overflow-hidden rounded-xl border border-white/10 bg-[#151515]">

          <div className="border-b border-white/10 p-5">

            <h2 className="text-lg font-semibold">
              Tournament Registrations
            </h2>

            <p className="mt-1 text-sm text-gray-400">
              {participants.length} registrations shown
            </p>

          </div>

          <div className="overflow-x-auto">

            <table className="w-full text-left">

              <thead>
                <tr className="border-b border-white/10 text-sm text-gray-400">

                  <th className="px-5 py-4">
                    Team
                  </th>

                  <th className="px-5 py-4">
                    Captain
                  </th>

                  <th className="px-5 py-4">
                    Game
                  </th>

                  <th className="px-5 py-4">
                    Tournament
                  </th>

                  <th className="px-5 py-4">
                    Players
                  </th>

                  <th className="px-5 py-4">
                    Registered
                  </th>

                  <th className="px-5 py-4">
                    Payment
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

                {participants.map((participant) => (
                  <tr
                    key={participant.id}
                    className="border-b border-white/5 hover:bg-white/[0.03]"
                  >

                    {/* Team */}
                    <td className="px-5 py-4">

                      <p className="font-medium">
                        {participant.team}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        Registration #{participant.id}
                      </p>

                    </td>

                    {/* Captain */}
                    <td className="px-5 py-4 text-sm text-gray-300">
                      {participant.captain}
                    </td>

                    {/* Game */}
                    <td className="px-5 py-4">

                      <span
                        className={
                          participant.game === "BGMI"
                            ? "rounded-md bg-orange-500/10 px-3 py-1 text-xs text-orange-400"
                            : "rounded-md bg-purple-500/10 px-3 py-1 text-xs text-purple-400"
                        }
                      >
                        {participant.game}
                      </span>

                    </td>

                    {/* Tournament */}
                    <td className="px-5 py-4 text-sm text-gray-300">
                      {participant.tournament}
                    </td>

                    {/* Players */}
                    <td className="px-5 py-4 text-sm">
                      {participant.players}
                    </td>

                    {/* Registered */}
                    <td className="px-5 py-4 text-sm text-gray-400">
                      {participant.registered}
                    </td>

                    {/* Payment */}
                    <td className="px-5 py-4">

                      <span
                        className={
                          participant.payment === "Paid"
                            ? "rounded-full bg-green-500/10 px-3 py-1 text-xs text-green-400"
                            : "rounded-full bg-yellow-500/10 px-3 py-1 text-xs text-yellow-400"
                        }
                      >
                        {participant.payment}
                      </span>

                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">

                      <span
                        className={
                          participant.status === "Confirmed"
                            ? "rounded-full bg-green-500/10 px-3 py-1 text-xs text-green-400"
                            : participant.status === "Pending"
                              ? "rounded-full bg-yellow-500/10 px-3 py-1 text-xs text-yellow-400"
                              : "rounded-full bg-red-500/10 px-3 py-1 text-xs text-red-400"
                        }
                      >
                        {participant.status}
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