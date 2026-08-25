"use client";

import { useState } from "react";
import AdminSidebar from "../../components/AdminSidebar";

const announcements = [
  {
    id: 1,
    title: "BGMI Night Cup Registration Open",
    type: "Tournament",
    audience: "All Users",
    date: "11 Aug 2026",
    status: "Published",
  },
  {
    id: 2,
    title: "Match 1 Room Details Released",
    type: "Match",
    audience: "Registered Players",
    date: "15 Aug 2026",
    status: "Published",
  },
  {
    id: 3,
    title: "Congratulations Tech Warriors!",
    type: "Winner",
    audience: "All Users",
    date: "15 Aug 2026",
    status: "Published",
  },
  {
    id: 4,
    title: "Free Fire Booyah Cup Registration",
    type: "Tournament",
    audience: "All Users",
    date: "20 Aug 2026",
    status: "Draft",
  },
];

export default function AnnouncementsPage() {
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white">
      <AdminSidebar />

      <main className="ml-64 p-8">

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">

          <div>
            <h1 className="text-3xl font-bold">
              Announcements
            </h1>

            <p className="mt-2 text-gray-400">
              Manage tournament, match and winner announcements.
            </p>
          </div>

          <button
            onClick={() => setShowCreate(true)}
            className="rounded-lg bg-orange-500 px-5 py-3 font-semibold text-black hover:bg-orange-400"
          >
            + Create Announcement
          </button>

        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-4">

          <StatCard
            title="Total"
            value="24"
          />

          <StatCard
            title="Published"
            value="21"
            color="text-green-400"
          />

          <StatCard
            title="Drafts"
            value="3"
            color="text-yellow-400"
          />

          <StatCard
            title="Winner Announcements"
            value="8"
            color="text-orange-400"
          />

        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-3">

          <input
            type="text"
            placeholder="Search announcement..."
            className="w-80 rounded-lg border border-white/10 bg-[#151515] px-4 py-3 text-sm outline-none placeholder:text-gray-500 focus:border-orange-500"
          />

          <select className="rounded-lg border border-white/10 bg-[#151515] px-4 py-3 text-sm outline-none">
            <option>All Types</option>
            <option>Tournament</option>
            <option>Match</option>
            <option>Winner</option>
            <option>Important</option>
            <option>General</option>
          </select>

          <select className="rounded-lg border border-white/10 bg-[#151515] px-4 py-3 text-sm outline-none">
            <option>All Status</option>
            <option>Published</option>
            <option>Draft</option>
          </select>

        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-white/10 bg-[#151515]">

          <div className="border-b border-white/10 p-5">

            <h2 className="text-lg font-semibold">
              All Announcements
            </h2>

            <p className="mt-1 text-sm text-gray-400">
              {announcements.length} announcements shown
            </p>

          </div>

          <div className="overflow-x-auto">

            <table className="w-full text-left">

              <thead>

                <tr className="border-b border-white/10 text-sm text-gray-400">

                  <th className="px-5 py-4">
                    Announcement
                  </th>

                  <th className="px-5 py-4">
                    Type
                  </th>

                  <th className="px-5 py-4">
                    Audience
                  </th>

                  <th className="px-5 py-4">
                    Date
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

                {announcements.map((announcement) => (

                  <tr
                    key={announcement.id}
                    className="border-b border-white/5 hover:bg-white/[0.03]"
                  >

                    {/* Announcement */}
                    <td className="px-5 py-4">

                      <p className="font-medium">
                        {announcement.title}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        Announcement #{announcement.id}
                      </p>

                    </td>

                    {/* Type */}
                    <td className="px-5 py-4">

                      <span
                        className={
                          announcement.type === "Winner"
                            ? "rounded-md bg-yellow-500/10 px-3 py-1 text-xs text-yellow-400"
                            : announcement.type === "Match"
                              ? "rounded-md bg-blue-500/10 px-3 py-1 text-xs text-blue-400"
                              : announcement.type === "Tournament"
                                ? "rounded-md bg-orange-500/10 px-3 py-1 text-xs text-orange-400"
                                : "rounded-md bg-purple-500/10 px-3 py-1 text-xs text-purple-400"
                        }
                      >
                        {announcement.type}
                      </span>

                    </td>

                    {/* Audience */}
                    <td className="px-5 py-4 text-sm text-gray-400">
                      {announcement.audience}
                    </td>

                    {/* Date */}
                    <td className="px-5 py-4 text-sm text-gray-400">
                      {announcement.date}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">

                      <span
                        className={
                          announcement.status === "Published"
                            ? "rounded-full bg-green-500/10 px-3 py-1 text-xs text-green-400"
                            : "rounded-full bg-yellow-500/10 px-3 py-1 text-xs text-yellow-400"
                        }
                      >
                        {announcement.status}
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

      {/* Create Announcement Modal */}
      {showCreate && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-5">

          <div className="w-full max-w-2xl rounded-xl border border-white/10 bg-[#151515]">

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 p-5">

              <div>

                <h2 className="text-xl font-semibold">
                  Create Announcement
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Create a message for users.
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

              {/* Title */}
              <div>

                <label className="mb-2 block text-sm text-gray-400">
                  Announcement Title
                </label>

                <input
                  type="text"
                  placeholder="Enter announcement title"
                  className="w-full rounded-lg border border-white/10 bg-[#101010] px-4 py-3 outline-none placeholder:text-gray-600 focus:border-orange-500"
                />

              </div>

              {/* Type + Audience */}
              <div className="grid gap-5 md:grid-cols-2">

                <div>

                  <label className="mb-2 block text-sm text-gray-400">
                    Type
                  </label>

                  <select className="w-full rounded-lg border border-white/10 bg-[#101010] px-4 py-3 outline-none focus:border-orange-500">

                    <option>Tournament</option>
                    <option>Match</option>
                    <option>Winner</option>
                    <option>Important</option>
                    <option>General</option>

                  </select>

                </div>

                <div>

                  <label className="mb-2 block text-sm text-gray-400">
                    Audience
                  </label>

                  <select className="w-full rounded-lg border border-white/10 bg-[#101010] px-4 py-3 outline-none focus:border-orange-500">

                    <option>All Users</option>
                    <option>Registered Players</option>
                    <option>Tournament Players</option>

                  </select>

                </div>

              </div>

              {/* Related Tournament */}
              <div>

                <label className="mb-2 block text-sm text-gray-400">
                  Related Tournament
                </label>

                <select className="w-full rounded-lg border border-white/10 bg-[#101010] px-4 py-3 outline-none focus:border-orange-500">

                  <option>None</option>
                  <option>BGMI Night Cup</option>
                  <option>Free Fire Booyah Cup</option>
                  <option>BGMI Pro Battle</option>

                </select>

              </div>

              {/* Message */}
              <div>

                <label className="mb-2 block text-sm text-gray-400">
                  Message
                </label>

                <textarea
                  rows={6}
                  placeholder="Write your announcement..."
                  className="w-full resize-none rounded-lg border border-white/10 bg-[#101010] px-4 py-3 outline-none placeholder:text-gray-600 focus:border-orange-500"
                />

              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 border-t border-white/10 pt-5">

                <button
                  onClick={() => setShowCreate(false)}
                  className="rounded-lg border border-white/10 px-5 py-3 text-sm text-gray-300 hover:bg-white/5"
                >
                  Cancel
                </button>

                <button className="rounded-lg border border-orange-500/30 bg-orange-500/10 px-5 py-3 text-sm text-orange-400 hover:bg-orange-500/20">
                  Save Draft
                </button>

                <button className="rounded-lg bg-orange-500 px-5 py-3 text-sm font-semibold text-black hover:bg-orange-400">
                  Publish
                </button>

              </div>

            </div>

          </div>

        </div>

      )}

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