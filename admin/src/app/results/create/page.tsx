"use client";

import Link from "next/link";
import { useState } from "react";
import AdminSidebar from "../../../components/AdminSidebar";

export default function CreateResultPage() {
  const [published, setPublished] = useState(false);

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white">
      <AdminSidebar />

      <main className="ml-64 p-8">

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link
              href="/results"
              className="text-sm text-gray-400 hover:text-white"
            >
              ← Back to Results
            </Link>

            <h1 className="mt-3 text-3xl font-bold">
              Add Match Result
            </h1>

            <p className="mt-2 text-gray-400">
              Enter match performance and publish the final result.
            </p>
          </div>

          <span
            className={
              published
                ? "rounded-full bg-green-500/10 px-4 py-2 text-sm text-green-400"
                : "rounded-full bg-yellow-500/10 px-4 py-2 text-sm text-yellow-400"
            }
          >
            {published ? "Published" : "Draft"}
          </span>
        </div>

        {/* Match Information */}
        <div className="mb-6 rounded-xl border border-white/10 bg-[#151515]">

          <div className="border-b border-white/10 p-5">
            <h2 className="text-lg font-semibold">
              Match Information
            </h2>

            <p className="mt-1 text-sm text-gray-400">
              Select the match for which you want to enter results.
            </p>
          </div>

          <div className="grid gap-5 p-5 md:grid-cols-2">

            <div>
              <label className="mb-2 block text-sm text-gray-400">
                Tournament
              </label>

              <select className="w-full rounded-lg border border-white/10 bg-[#101010] px-4 py-3 outline-none focus:border-orange-500">
                <option>BGMI Night Cup</option>
                <option>Free Fire Booyah Cup</option>
                <option>BGMI Pro Battle</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm text-gray-400">
                Match
              </label>

              <select className="w-full rounded-lg border border-white/10 bg-[#101010] px-4 py-3 outline-none focus:border-orange-500">
                <option>Match 1</option>
                <option>Match 2</option>
                <option>Final Match</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm text-gray-400">
                Game
              </label>

              <select className="w-full rounded-lg border border-white/10 bg-[#101010] px-4 py-3 outline-none focus:border-orange-500">
                <option>BGMI</option>
                <option>Free Fire</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm text-gray-400">
                Map
              </label>

              <input
                type="text"
                defaultValue="Erangel"
                className="w-full rounded-lg border border-white/10 bg-[#101010] px-4 py-3 outline-none focus:border-orange-500"
              />
            </div>

          </div>
        </div>

        {/* Winner */}
        <div className="mb-6 rounded-xl border border-white/10 bg-[#151515]">

          <div className="border-b border-white/10 p-5">
            <h2 className="text-lg font-semibold">
              Winner
            </h2>

            <p className="mt-1 text-sm text-gray-400">
              Select the winning team and prize.
            </p>
          </div>

          <div className="grid gap-5 p-5 md:grid-cols-3">

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm text-gray-400">
                Winning Team
              </label>

              <select className="w-full rounded-lg border border-white/10 bg-[#101010] px-4 py-3 outline-none focus:border-orange-500">
                <option>Select winning team</option>
                <option>Tech Warriors</option>
                <option>Shadow Squad</option>
                <option>Fire Kings</option>
                <option>Booyah Boys</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm text-gray-400">
                Prize
              </label>

              <input
                type="text"
                placeholder="₹2,500"
                className="w-full rounded-lg border border-white/10 bg-[#101010] px-4 py-3 outline-none placeholder:text-gray-600 focus:border-orange-500"
              />
            </div>

          </div>
        </div>

        {/* Leaderboard */}
        <div className="mb-6 rounded-xl border border-white/10 bg-[#151515]">

          <div className="border-b border-white/10 p-5">

            <h2 className="text-lg font-semibold">
              Match Leaderboard
            </h2>

            <p className="mt-1 text-sm text-gray-400">
              Enter the final performance of each team.
            </p>

          </div>

          <div className="overflow-x-auto">

            <table className="w-full text-left">

              <thead>
                <tr className="border-b border-white/10 text-sm text-gray-400">

                  <th className="px-5 py-4">
                    Position
                  </th>

                  <th className="px-5 py-4">
                    Team
                  </th>

                  <th className="px-5 py-4">
                    Kills
                  </th>

                  <th className="px-5 py-4">
                    Placement Points
                  </th>

                  <th className="px-5 py-4">
                    Total Points
                  </th>

                </tr>
              </thead>

              <tbody>

                <ResultRow
                  position="1"
                  team="Tech Warriors"
                />

                <ResultRow
                  position="2"
                  team="Shadow Squad"
                />

                <ResultRow
                  position="3"
                  team="Alpha Squad"
                />

                <ResultRow
                  position="4"
                  team="Fire Kings"
                />

              </tbody>

            </table>

          </div>
        </div>

        {/* Announcement */}
        <div className="mb-6 rounded-xl border border-white/10 bg-[#151515]">

          <div className="border-b border-white/10 p-5">

            <h2 className="text-lg font-semibold">
              Winner Announcement
            </h2>

            <p className="mt-1 text-sm text-gray-400">
              This message can be displayed on the user panel.
            </p>

          </div>

          <div className="p-5">

            <textarea
              rows={5}
              placeholder="🏆 Congratulations to the winning team..."
              className="w-full resize-none rounded-lg border border-white/10 bg-[#101010] px-4 py-3 outline-none placeholder:text-gray-600 focus:border-orange-500"
            />

          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">

          <Link href="/results">
            <button className="rounded-lg border border-white/10 px-6 py-3 font-medium text-gray-300 hover:bg-white/5">
              Cancel
            </button>
          </Link>

          <button className="rounded-lg border border-orange-500/30 bg-orange-500/10 px-6 py-3 font-medium text-orange-400 hover:bg-orange-500/20">
            Save Draft
          </button>

          <button
            onClick={() => setPublished(true)}
            className="rounded-lg bg-orange-500 px-6 py-3 font-semibold text-black hover:bg-orange-400"
          >
            Publish Result
          </button>

        </div>

      </main>
    </div>
  );
}

function ResultRow({
  position,
  team,
}: {
  position: string;
  team: string;
}) {
  return (
    <tr className="border-b border-white/5">

      <td className="px-5 py-4">
        <span className="font-semibold text-yellow-400">
          #{position}
        </span>
      </td>

      <td className="px-5 py-4 font-medium">
        {team}
      </td>

      <td className="px-5 py-4">
        <input
          type="number"
          defaultValue="0"
          min="0"
          className="w-24 rounded-md border border-white/10 bg-[#101010] px-3 py-2 outline-none focus:border-orange-500"
        />
      </td>

      <td className="px-5 py-4">
        <input
          type="number"
          defaultValue="0"
          min="0"
          className="w-32 rounded-md border border-white/10 bg-[#101010] px-3 py-2 outline-none focus:border-orange-500"
        />
      </td>

      <td className="px-5 py-4">
        <input
          type="number"
          defaultValue="0"
          min="0"
          className="w-28 rounded-md border border-white/10 bg-[#101010] px-3 py-2 outline-none focus:border-orange-500"
        />
      </td>

    </tr>
  );
}