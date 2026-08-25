"use client";

import Link from "next/link";
import { useState } from "react";
import AdminSidebar from "../../components/AdminSidebar";

export default function EditTournamentPage() {
  const [formData, setFormData] = useState({
    name: "BGMI Night Cup",
    game: "BGMI",
    type: "Squad",
    map: "Erangel",
    maxTeams: "64",
    date: "2026-08-15",
    startTime: "20:00",
    registrationDeadline: "2026-08-14",
    prizePool: "10000",
    entryFee: "50",
    status: "upcoming",
    description:
      "BGMI Night Cup tournament. Follow all tournament rules and instructions.",
  });

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    console.log("Updated Tournament:", formData);

    alert("Tournament updated successfully!");
  }

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white">
      <AdminSidebar />

      <main className="ml-64 p-8">

        {/* Header */}
        <div className="mb-8">
          <div className="mb-3">
            <Link
              href="/tournaments"
              className="text-sm text-gray-400 hover:text-orange-400"
            >
              ← Back to Tournaments
            </Link>
          </div>

          <h1 className="text-3xl font-bold">
            Edit Tournament
          </h1>

          <p className="mt-2 text-gray-400">
            Update tournament information and settings.
          </p>
        </div>

        <form onSubmit={handleSubmit}>

          {/* Basic Information */}
          <div className="rounded-xl border border-white/10 bg-[#151515] p-6">

            <h2 className="mb-6 text-xl font-semibold">
              Basic Information
            </h2>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

              {/* Tournament Name */}
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm text-gray-300">
                  Tournament Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-white/10 bg-[#0b0b0b] px-4 py-3 outline-none focus:border-orange-500"
                />
              </div>

              {/* Game */}
              <div>
                <label className="mb-2 block text-sm text-gray-300">
                  Game
                </label>

                <select
                  name="game"
                  value={formData.game}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-white/10 bg-[#0b0b0b] px-4 py-3 outline-none focus:border-orange-500"
                >
                  <option value="BGMI">BGMI</option>
                  <option value="Free Fire">Free Fire</option>
                </select>
              </div>

              {/* Type */}
              <div>
                <label className="mb-2 block text-sm text-gray-300">
                  Tournament Type
                </label>

                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-white/10 bg-[#0b0b0b] px-4 py-3 outline-none focus:border-orange-500"
                >
                  <option value="Solo">Solo</option>
                  <option value="Duo">Duo</option>
                  <option value="Squad">Squad</option>
                </select>
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
                  className="w-full rounded-lg border border-white/10 bg-[#0b0b0b] px-4 py-3 outline-none focus:border-orange-500"
                >
                  <option value="Erangel">Erangel</option>
                  <option value="Miramar">Miramar</option>
                  <option value="Sanhok">Sanhok</option>
                  <option value="Vikendi">Vikendi</option>
                  <option value="Bermuda">Bermuda</option>
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
                  required
                  className="w-full rounded-lg border border-white/10 bg-[#0b0b0b] px-4 py-3 outline-none focus:border-orange-500"
                />
              </div>

            </div>
          </div>

          {/* Schedule */}
          <div className="mt-6 rounded-xl border border-white/10 bg-[#151515] p-6">

            <h2 className="mb-6 text-xl font-semibold">
              Schedule
            </h2>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">

              {/* Date */}
              <div>
                <label className="mb-2 block text-sm text-gray-300">
                  Tournament Date
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
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-white/10 bg-[#0b0b0b] px-4 py-3 outline-none focus:border-orange-500"
                />
              </div>

              {/* Registration Deadline */}
              <div>
                <label className="mb-2 block text-sm text-gray-300">
                  Registration Deadline
                </label>

                <input
                  type="date"
                  name="registrationDeadline"
                  value={formData.registrationDeadline}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-white/10 bg-[#0b0b0b] px-4 py-3 outline-none focus:border-orange-500"
                />
              </div>

            </div>
          </div>

          {/* Prize and Entry */}
          <div className="mt-6 rounded-xl border border-white/10 bg-[#151515] p-6">

            <h2 className="mb-6 text-xl font-semibold">
              Prize & Entry
            </h2>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">

              {/* Prize Pool */}
              <div>
                <label className="mb-2 block text-sm text-gray-300">
                  Prize Pool
                </label>

                <input
                  type="number"
                  name="prizePool"
                  value={formData.prizePool}
                  onChange={handleChange}
                  min="0"
                  required
                  className="w-full rounded-lg border border-white/10 bg-[#0b0b0b] px-4 py-3 outline-none focus:border-orange-500"
                />
              </div>

              {/* Entry Fee */}
              <div>
                <label className="mb-2 block text-sm text-gray-300">
                  Entry Fee
                </label>

                <input
                  type="number"
                  name="entryFee"
                  value={formData.entryFee}
                  onChange={handleChange}
                  min="0"
                  required
                  className="w-full rounded-lg border border-white/10 bg-[#0b0b0b] px-4 py-3 outline-none focus:border-orange-500"
                />
              </div>

              {/* Status */}
              <div>
                <label className="mb-2 block text-sm text-gray-300">
                  Status
                </label>

                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-white/10 bg-[#0b0b0b] px-4 py-3 outline-none focus:border-orange-500"
                >
                  <option value="draft">Draft</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="live">Live</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

            </div>
          </div>

          {/* Description */}
          <div className="mt-6 rounded-xl border border-white/10 bg-[#151515] p-6">

            <h2 className="mb-6 text-xl font-semibold">
              Description & Rules
            </h2>

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={7}
              className="w-full resize-none rounded-lg border border-white/10 bg-[#0b0b0b] px-4 py-3 outline-none placeholder:text-gray-600 focus:border-orange-500"
            />

          </div>

          {/* Actions */}
          <div className="mt-6 flex justify-end gap-3">

            <Link
              href="/tournaments"
              className="rounded-lg border border-white/10 px-6 py-3 text-sm font-medium hover:bg-white/5"
            >
              Cancel
            </Link>

            <button
              type="submit"
              className="rounded-lg bg-orange-500 px-6 py-3 text-sm font-semibold text-black hover:bg-orange-400"
            >
              Save Changes
            </button>

          </div>

        </form>
      </main>
    </div>
  );
}