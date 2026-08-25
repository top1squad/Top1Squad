"use client";

import { useState } from "react";
import AdminSidebar from "../../components/AdminSidebar";

const admins = [
  {
    id: 1,
    name: "Kashish",
    email: "admin@battlearena.com",
    role: "Super Admin",
    status: "Active",
    lastLogin: "Today, 06:32 PM",
  },
  {
    id: 2,
    name: "Tournament Manager",
    email: "manager@battlearena.com",
    role: "Tournament Manager",
    status: "Active",
    lastLogin: "Today, 04:15 PM",
  },
  {
    id: 3,
    name: "Support Staff",
    email: "support@battlearena.com",
    role: "Support Staff",
    status: "Active",
    lastLogin: "Yesterday, 09:20 PM",
  },
  {
    id: 4,
    name: "Old Admin",
    email: "oldadmin@battlearena.com",
    role: "Support Staff",
    status: "Disabled",
    lastLogin: "05 Aug 2026",
  },
];

export default function AdminsPage() {
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white">
      <AdminSidebar />

      <main className="ml-64 p-8">

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">

          <div>
            <h1 className="text-3xl font-bold">
              Admin & Staff
            </h1>

            <p className="mt-2 text-gray-400">
              Manage administrators and staff members.
            </p>
          </div>

          <button
            onClick={() => setShowCreate(true)}
            className="rounded-lg bg-orange-500 px-5 py-3 font-semibold text-black hover:bg-orange-400"
          >
            + Add Admin
          </button>

        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-4">

          <StatCard
            title="Total Admins"
            value="4"
          />

          <StatCard
            title="Active"
            value="3"
            color="text-green-400"
          />

          <StatCard
            title="Disabled"
            value="1"
            color="text-red-400"
          />

          <StatCard
            title="Super Admin"
            value="1"
            color="text-orange-400"
          />

        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-3">

          <input
            type="text"
            placeholder="Search admin..."
            className="w-80 rounded-lg border border-white/10 bg-[#151515] px-4 py-3 text-sm outline-none placeholder:text-gray-500 focus:border-orange-500"
          />

          <select className="rounded-lg border border-white/10 bg-[#151515] px-4 py-3 text-sm outline-none">
            <option>All Roles</option>
            <option>Super Admin</option>
            <option>Tournament Manager</option>
            <option>Support Staff</option>
          </select>

          <select className="rounded-lg border border-white/10 bg-[#151515] px-4 py-3 text-sm outline-none">
            <option>All Status</option>
            <option>Active</option>
            <option>Disabled</option>
          </select>

        </div>

        {/* Admin Table */}
        <div className="overflow-hidden rounded-xl border border-white/10 bg-[#151515]">

          <div className="border-b border-white/10 p-5">

            <h2 className="text-lg font-semibold">
              All Admins
            </h2>

            <p className="mt-1 text-sm text-gray-400">
              {admins.length} administrators found
            </p>

          </div>

          <div className="overflow-x-auto">

            <table className="w-full text-left">

              <thead>

                <tr className="border-b border-white/10 text-sm text-gray-400">

                  <th className="px-5 py-4">
                    Admin
                  </th>

                  <th className="px-5 py-4">
                    Role
                  </th>

                  <th className="px-5 py-4">
                    Status
                  </th>

                  <th className="px-5 py-4">
                    Last Login
                  </th>

                  <th className="px-5 py-4">
                    Action
                  </th>

                </tr>

              </thead>

              <tbody>

                {admins.map((admin) => (

                  <tr
                    key={admin.id}
                    className="border-b border-white/5 hover:bg-white/[0.03]"
                  >

                    {/* Admin */}
                    <td className="px-5 py-4">

                      <div className="flex items-center gap-3">

                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500/10 font-semibold text-orange-400">
                          {admin.name.charAt(0).toUpperCase()}
                        </div>

                        <div>

                          <p className="font-medium">
                            {admin.name}
                          </p>

                          <p className="mt-1 text-xs text-gray-500">
                            {admin.email}
                          </p>

                        </div>

                      </div>

                    </td>

                    {/* Role */}
                    <td className="px-5 py-4">

                      <span
                        className={
                          admin.role === "Super Admin"
                            ? "rounded-md bg-orange-500/10 px-3 py-1 text-xs text-orange-400"
                            : admin.role === "Tournament Manager"
                              ? "rounded-md bg-blue-500/10 px-3 py-1 text-xs text-blue-400"
                              : "rounded-md bg-purple-500/10 px-3 py-1 text-xs text-purple-400"
                        }
                      >
                        {admin.role}
                      </span>

                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">

                      <span
                        className={
                          admin.status === "Active"
                            ? "rounded-full bg-green-500/10 px-3 py-1 text-xs text-green-400"
                            : "rounded-full bg-red-500/10 px-3 py-1 text-xs text-red-400"
                        }
                      >
                        {admin.status}
                      </span>

                    </td>

                    {/* Last Login */}
                    <td className="px-5 py-4 text-sm text-gray-400">
                      {admin.lastLogin}
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

      {/* Add Admin Modal */}
      {showCreate && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-5">

          <div className="w-full max-w-xl rounded-xl border border-white/10 bg-[#151515]">

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 p-5">

              <div>

                <h2 className="text-xl font-semibold">
                  Add Admin
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Create a new admin or staff account.
                </p>

              </div>

              <button
                onClick={() => setShowCreate(false)}
                className="rounded-md px-3 py-2 text-gray-400 hover:bg-white/10 hover:text-white"
              >
                ✕
              </button>

            </div>

            {/* Form */}
            <div className="space-y-5 p-5">

              {/* Name */}
              <div>

                <label className="mb-2 block text-sm text-gray-400">
                  Full Name
                </label>

                <input
                  type="text"
                  placeholder="Enter full name"
                  className="w-full rounded-lg border border-white/10 bg-[#101010] px-4 py-3 text-sm outline-none placeholder:text-gray-600 focus:border-orange-500"
                />

              </div>

              {/* Email */}
              <div>

                <label className="mb-2 block text-sm text-gray-400">
                  Email
                </label>

                <input
                  type="email"
                  placeholder="admin@example.com"
                  className="w-full rounded-lg border border-white/10 bg-[#101010] px-4 py-3 text-sm outline-none placeholder:text-gray-600 focus:border-orange-500"
                />

              </div>

              {/* Role */}
              <div>

                <label className="mb-2 block text-sm text-gray-400">
                  Role
                </label>

                <select className="w-full rounded-lg border border-white/10 bg-[#101010] px-4 py-3 text-sm outline-none focus:border-orange-500">

                  <option>Super Admin</option>
                  <option>Tournament Manager</option>
                  <option>Support Staff</option>

                </select>

              </div>

              {/* Password */}
              <div>

                <label className="mb-2 block text-sm text-gray-400">
                  Temporary Password
                </label>

                <input
                  type="password"
                  placeholder="Enter temporary password"
                  className="w-full rounded-lg border border-white/10 bg-[#101010] px-4 py-3 text-sm outline-none placeholder:text-gray-600 focus:border-orange-500"
                />

              </div>

              {/* Permissions */}
              <div>

                <p className="mb-3 text-sm text-gray-400">
                  Permissions
                </p>

                <div className="grid grid-cols-2 gap-3">

                  <Permission label="Tournaments" />
                  <Permission label="Matches" />
                  <Permission label="Results" />
                  <Permission label="Announcements" />
                  <Permission label="Users" />
                  <Permission label="Settings" />

                </div>

              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 border-t border-white/10 pt-5">

                <button
                  onClick={() => setShowCreate(false)}
                  className="rounded-lg border border-white/10 px-5 py-3 text-sm text-gray-300 hover:bg-white/5"
                >
                  Cancel
                </button>

                <button className="rounded-lg bg-orange-500 px-5 py-3 text-sm font-semibold text-black hover:bg-orange-400">
                  Create Admin
                </button>

              </div>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

/* Stat Card */

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

/* Permission */

function Permission({
  label,
}: {
  label: string;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-white/10 bg-[#101010] p-3 hover:border-white/20">

      <input
        type="checkbox"
        className="h-4 w-4 accent-orange-500"
      />

      <span className="text-sm text-gray-300">
        {label}
      </span>

    </label>
  );
}