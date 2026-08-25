import AdminSidebar from "../components/AdminSidebar";

const stats = [
  {
    title: "Total Players",
    value: "1,248",
    change: "+12%",
  },
  {
    title: "Tournaments",
    value: "56",
    change: "+8%",
  },
  {
    title: "Live Matches",
    value: "4",
    change: "Live",
  },
  {
    title: "Revenue",
    value: "₹5.2L",
    change: "+18%",
  },
];

const tournaments = [
  {
    name: "BGMI Night Cup",
    game: "BGMI",
    date: "15 Aug 2026",
    teams: "48 / 64",
    prize: "₹10,000",
    status: "Upcoming",
  },
  {
    name: "Free Fire Booyah Cup",
    game: "Free Fire",
    date: "20 Aug 2026",
    teams: "52 / 64",
    prize: "₹15,000",
    status: "Upcoming",
  },
  {
    name: "BGMI Pro Battle",
    game: "BGMI",
    date: "25 Aug 2026",
    teams: "64 / 64",
    prize: "₹25,000",
    status: "Full",
  },
];

const registrations = [
  {
    player: "Keshav",
    tournament: "BGMI Night Cup",
    amount: "₹50",
    status: "Paid",
  },
  {
    player: "Rahul",
    tournament: "Free Fire Booyah Cup",
    amount: "₹100",
    status: "Pending",
  },
  {
    player: "Aman",
    tournament: "BGMI Pro Battle",
    amount: "₹50",
    status: "Paid",
  },
];

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white">
      <AdminSidebar />

      <main className="ml-64 p-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            Dashboard
          </h1>

          <p className="mt-2 text-gray-400">
            Welcome back, Admin. Here's what's happening today.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.title}
              className="rounded-xl border border-white/10 bg-[#151515] p-5"
            >
              <p className="text-sm text-gray-400">
                {stat.title}
              </p>

              <div className="mt-3 flex items-end justify-between">
                <h2 className="text-3xl font-bold">
                  {stat.value}
                </h2>

                <span className="text-sm text-green-400">
                  {stat.change}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Tournaments */}
        <div className="mt-8 rounded-xl border border-white/10 bg-[#151515]">

          <div className="flex items-center justify-between border-b border-white/10 p-5">
            <div>
              <h2 className="text-xl font-semibold">
                Recent Tournaments
              </h2>

              <p className="mt-1 text-sm text-gray-400">
                Recently created tournaments
              </p>
            </div>

            <button className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-black hover:bg-orange-400">
              + Create Tournament
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10 text-sm text-gray-400">
                  <th className="px-5 py-4">Tournament</th>
                  <th className="px-5 py-4">Game</th>
                  <th className="px-5 py-4">Date</th>
                  <th className="px-5 py-4">Teams</th>
                  <th className="px-5 py-4">Prize</th>
                  <th className="px-5 py-4">Status</th>
                </tr>
              </thead>

              <tbody>
                {tournaments.map((tournament) => (
                  <tr
                    key={tournament.name}
                    className="border-b border-white/5 hover:bg-white/[0.03]"
                  >
                    <td className="px-5 py-4 font-medium">
                      {tournament.name}
                    </td>

                    <td className="px-5 py-4 text-gray-300">
                      {tournament.game}
                    </td>

                    <td className="px-5 py-4 text-gray-300">
                      {tournament.date}
                    </td>

                    <td className="px-5 py-4 text-gray-300">
                      {tournament.teams}
                    </td>

                    <td className="px-5 py-4">
                      {tournament.prize}
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-full bg-orange-500/10 px-3 py-1 text-xs text-orange-400">
                        {tournament.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Registrations */}
        <div className="mt-8 rounded-xl border border-white/10 bg-[#151515]">

          <div className="border-b border-white/10 p-5">
            <h2 className="text-xl font-semibold">
              Recent Registrations
            </h2>

            <p className="mt-1 text-sm text-gray-400">
              Latest tournament registrations
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10 text-sm text-gray-400">
                  <th className="px-5 py-4">Player</th>
                  <th className="px-5 py-4">Tournament</th>
                  <th className="px-5 py-4">Amount</th>
                  <th className="px-5 py-4">Status</th>
                </tr>
              </thead>

              <tbody>
                {registrations.map((registration) => (
                  <tr
                    key={registration.player}
                    className="border-b border-white/5 hover:bg-white/[0.03]"
                  >
                    <td className="px-5 py-4 font-medium">
                      {registration.player}
                    </td>

                    <td className="px-5 py-4 text-gray-300">
                      {registration.tournament}
                    </td>

                    <td className="px-5 py-4">
                      {registration.amount}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={
                          registration.status === "Paid"
                            ? "rounded-full bg-green-500/10 px-3 py-1 text-xs text-green-400"
                            : "rounded-full bg-yellow-500/10 px-3 py-1 text-xs text-yellow-400"
                        }
                      >
                        {registration.status}
                      </span>
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