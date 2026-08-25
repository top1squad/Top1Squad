import AdminSidebar from "../../components/AdminSidebar";

const users = [
  {
    id: 1,
    username: "Kashish123",
    email: "kashish@example.com",
    game: "BGMI",
    team: "Tech Warriors",
    tournaments: 8,
    joined: "02 Aug 2026",
    status: "Active",
  },
  {
    id: 2,
    username: "RahulFF",
    email: "rahul@example.com",
    game: "Free Fire",
    team: "Fire Kings",
    tournaments: 6,
    joined: "05 Aug 2026",
    status: "Active",
  },
  {
    id: 3,
    username: "ShadowX",
    email: "shadow@example.com",
    game: "BGMI",
    team: "Shadow Squad",
    tournaments: 12,
    joined: "12 Jul 2026",
    status: "Active",
  },
  {
    id: 4,
    username: "RohitGaming",
    email: "rohit@example.com",
    game: "Free Fire",
    team: "Booyah Boys",
    tournaments: 5,
    joined: "20 Jul 2026",
    status: "Suspended",
  },
  {
    id: 5,
    username: "SniperKing",
    email: "sniper@example.com",
    game: "BGMI",
    team: "No Team",
    tournaments: 3,
    joined: "01 Aug 2026",
    status: "Active",
  },
];

export default function UsersPage() {
  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white">
      <AdminSidebar />

      <main className="ml-64 p-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            Users
          </h1>

          <p className="mt-2 text-gray-400">
            Manage all registered players and their tournament activity.
          </p>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-4">

          <StatCard
            title="Total Users"
            value="1,248"
          />

          <StatCard
            title="Active Users"
            value="1,196"
            color="text-green-400"
          />

          <StatCard
            title="BGMI Players"
            value="742"
            color="text-orange-400"
          />

          <StatCard
            title="Free Fire Players"
            value="506"
            color="text-purple-400"
          />

        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-3">

          <input
            type="text"
            placeholder="Search username or email..."
            className="w-96 rounded-lg border border-white/10 bg-[#151515] px-4 py-3 text-sm outline-none placeholder:text-gray-500 focus:border-orange-500"
          />

          <select className="rounded-lg border border-white/10 bg-[#151515] px-4 py-3 text-sm outline-none">
            <option>All Games</option>
            <option>BGMI</option>
            <option>Free Fire</option>
          </select>

          <select className="rounded-lg border border-white/10 bg-[#151515] px-4 py-3 text-sm outline-none">
            <option>All Status</option>
            <option>Active</option>
            <option>Suspended</option>
          </select>

        </div>

        {/* Users Table */}
        <div className="overflow-hidden rounded-xl border border-white/10 bg-[#151515]">

          <div className="border-b border-white/10 p-5">

            <h2 className="text-lg font-semibold">
              Registered Users
            </h2>

            <p className="mt-1 text-sm text-gray-400">
              {users.length} users shown
            </p>

          </div>

          <div className="overflow-x-auto">

            <table className="w-full text-left">

              <thead>
                <tr className="border-b border-white/10 text-sm text-gray-400">

                  <th className="px-5 py-4">
                    User
                  </th>

                  <th className="px-5 py-4">
                    Game
                  </th>

                  <th className="px-5 py-4">
                    Team
                  </th>

                  <th className="px-5 py-4">
                    Tournaments
                  </th>

                  <th className="px-5 py-4">
                    Joined
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

                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-white/5 hover:bg-white/[0.03]"
                  >

                    {/* User */}
                    <td className="px-5 py-4">

                      <p className="font-medium">
                        {user.username}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        {user.email}
                      </p>

                    </td>

                    {/* Game */}
                    <td className="px-5 py-4">

                      <span
                        className={
                          user.game === "BGMI"
                            ? "rounded-md bg-orange-500/10 px-3 py-1 text-xs text-orange-400"
                            : "rounded-md bg-purple-500/10 px-3 py-1 text-xs text-purple-400"
                        }
                      >
                        {user.game}
                      </span>

                    </td>

                    {/* Team */}
                    <td className="px-5 py-4 text-sm text-gray-300">
                      {user.team}
                    </td>

                    {/* Tournaments */}
                    <td className="px-5 py-4 text-sm">
                      {user.tournaments}
                    </td>

                    {/* Joined */}
                    <td className="px-5 py-4 text-sm text-gray-400">
                      {user.joined}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">

                      <span
                        className={
                          user.status === "Active"
                            ? "rounded-full bg-green-500/10 px-3 py-1 text-xs text-green-400"
                            : "rounded-full bg-red-500/10 px-3 py-1 text-xs text-red-400"
                        }
                      >
                        {user.status}
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