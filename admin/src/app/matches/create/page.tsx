"use client";

import Link from "next/link";
import { useState } from "react";
import AdminSidebar from "../../../components/AdminSidebar";

export default function CreateMatchPage() {
  const [formData, setFormData] = useState({
    tournament: "",
    matchName: "",
    map: "",
    date: "",
    time: "",
    roomId: "",
    roomPassword: "",
    maxTeams: "16",
    status: "Upcoming",
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    console.log("Match:", formData);

    alert("Match created successfully!");
  }

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white">
      <AdminSidebar />

      <main className="ml-64 p-8">

        {/* Header */}
        <div className="mb-8">
          <Link
            href="/matches"
            className="text-sm text-gray-400 hover:text-orange-400"
          >
            ← Back to Matches
          </Link>

          <h1 className="mt-4 text-3xl font-bold">
            Create Match
          </h1>

          <p className="mt-2 text-gray-400">
            Create a new match inside an existing tournament.
          </p>
        </div>

        <form onSubmit={handleSubmit}>

          {/* Match Information */}
          <div className="rounded-xl border border-white/10 bg-[#151515] p-6">

            <h2 className="mb-6 text-xl font-semibold">
              Match Information
            </h2>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

              {/* Tournament */}
              <div>
                <label className="mb-2 block text-sm text-gray-300">
                  Tournament
                </label>

                <select
                  name="tournament"
                  value={formData.tournament}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-white/10 bg-[#0b0b0b] px-4 py-3 outline-none focus:border-orange-500"
                >
                  <option value="">
                    Select Tournament
                  </option>

                  <option value="BGMI Night Cup">
                    BGMI Night Cup
                  </option>

                  <option value="Free Fire Booyah Cup">
                    Free Fire Booyah Cup
                  </option>

                  <option value="BGMI Pro Battle">
                    BGMI Pro Battle
                  </option>

                  <option value="Free Fire Weekend War">
                    Free Fire Weekend War
                  </option>
                </select>
              </div>

              {/* Match Name */}
              <div>
                <label className="mb-2 block text-sm text-gray-300">
                  Match Name
                </label>

                <input
                  type="text"
                  name="matchName"
                  value={formData.matchName}
                  onChange={handleChange}
                  placeholder="Example: Match 1"
                  required
                  className="w-full rounded-lg border border-white/10 bg-[#0b0b0b] px-4 py-3 outline-none placeholder:text-gray-600 focus:border-orange-500"
                />
              </div>

              {/* Map */}
              <div>
                <label className="mb-2 block text-sm text-gray-300">
                  Map
                </label>

                <select
                  name="map"
                  value={formData.map}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-white/10 bg-[#0b0b0b] px-4 py-3 outline-none focus:border-orange-500"
                >
                  <option value="">
                    Select Map
                  </option>

                  <option value="Erangel">
                    Erangel
                  </option>

                  <option value="Miramar">
                    Miramar
                  </option>

                  <option value="Sanhok">
                    Sanhok
                  </option>

                  <option value="Vikendi">
                    Vikendi
                  </option>

                  <option value="Bermuda">
                    Bermuda
                  </option>
                </select>
              </div>

              {/* Maximum Teams */}
              <div>
                <label className="mb-2 block text-sm text-gray-300">
                  Maximum Teams
                </label>

                <input
                  type="number"
                  name="maxTeams"
                  value={formData.maxTeams}
                  onChange={handleChange}
                  min="1"
                  max="100"
                  required
                  className="w-full rounded-lg border border-white/10 bg-[#0b0b0b] px-4 py-3 outline-none focus:border-orange-500"
                />
              </div>

              {/* Status */}
              <div>
                <label className="mb-2 block text-sm text-gray-300">
                  Match Status
                </label>

                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-white/10 bg-[#0b0b0b] px-4 py-3 outline-none focus:border-orange-500"
                >
                  <option value="Upcoming">
                    Upcoming
                  </option>

                  <option value="Live">
                    Live
                  </option>

                  <option value="Completed">
                    Completed
                  </option>

                  <option value="Cancelled">
                    Cancelled
                  </option>
                </select>
              </div>

            </div>
          </div>

          {/* Schedule */}
          <div className="mt-6 rounded-xl border border-white/10 bg-[#151515] p-6">

            <h2 className="mb-6 text-xl font-semibold">
              Match Schedule
            </h2>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

              {/* Date */}
              <div>
                <label className="mb-2 block text-sm text-gray-300">
                  Match Date
                </label>

                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-white/10 bg-[#0b0b0b] px-4 py-3 outline-none focus:border-orange-500"
                />
              </div>

              {/* Time */}
              <div>
                <label className="mb-2 block text-sm text-gray-300">
                  Start Time
                </label>

                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-white/10 bg-[#0b0b0b] px-4 py-3 outline-none focus:border-orange-500"
                />
              </div>

            </div>
          </div>

          {/* Room Details */}
          <div className="mt-6 rounded-xl border border-white/10 bg-[#151515] p-6">

            <h2 className="mb-2 text-xl font-semibold">
              Room Details
            </h2>

            <p className="mb-6 text-sm text-gray-500">
              Room information is manually entered by the admin.
            </p>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

              {/* Room ID */}
              <div>
                <label className="mb-2 block text-sm text-gray-300">
                  Room ID
                </label>

                <input
                  type="text"
                  name="roomId"
                  value={formData.roomId}
                  onChange={handleChange}
                  placeholder="Enter room ID"
                  className="w-full rounded-lg border border-white/10 bg-[#0b0b0b] px-4 py-3 font-mono outline-none placeholder:text-gray-600 focus:border-orange-500"
                />
              </div>

              {/* Password */}
              <div>
                <label className="mb-2 block text-sm text-gray-300">
                  Room Password
                </label>

                <input
                  type="text"
                  name="roomPassword"
                  value={formData.roomPassword}
                  onChange={handleChange}
                  placeholder="Enter room password"
                  className="w-full rounded-lg border border-white/10 bg-[#0b0b0b] px-4 py-3 font-mono outline-none placeholder:text-gray-600 focus:border-orange-500"
                />
              </div>

            </div>

            {/* Warning */}
            <div className="mt-6 rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-4">
              <p className="text-sm text-yellow-400">
                ⚠ Room ID and password should only be shared with
                registered teams when the admin is ready.
              </p>
            </div>

          </div>

          {/* Buttons */}
          <div className="mt-6 flex justify-end gap-3">

            <Link
              href="/matches"
              className="rounded-lg border border-white/10 px-6 py-3 text-sm font-medium hover:bg-white/5"
            >
              Cancel
            </Link>

            <button
              type="submit"
              className="rounded-lg bg-orange-500 px-6 py-3 text-sm font-semibold text-black hover:bg-orange-400"
            >
              Create Match
            </button>

          </div>

        </form>
      </main>
    </div>
  );
}