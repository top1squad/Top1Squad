"use client";

import Link from "next/link";
import { useState } from "react";
import AdminSidebar from "../../components/AdminSidebar";

export default function CreateTournamentPage() {
  const [formData, setFormData] = useState({
    name: "",
    game: "",
    mode: "",
    map: "",
    maxTeams: "",
    date: "",
    time: "",
    prize: "",
    entryFee: "",
    roomId: "",
    roomPassword: "",
    status: "Upcoming",
    description: "",
    rules: "",
  });

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");


  // =====================================================
  // HANDLE INPUT CHANGE
  // =====================================================

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement |
        HTMLSelectElement |
        HTMLTextAreaElement
    >
  ) {
    const {
      name,
      value,
    } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }


  // =====================================================
  // SUBMIT
  // =====================================================

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setLoading(true);
    setError("");
    setSuccess("");


    try {

      // =================================================
      // RULES
      // =================================================

      const rulesArray =
        formData.rules
          .split("\n")
          .map((rule) =>
            rule.trim()
          )
          .filter(
            (rule) =>
              rule.length > 0
          );


      // =================================================
      // PAYLOAD
      // =================================================

      const payload = {
        name:
          formData.name.trim(),

        game:
          formData.game,

        mode:
          formData.mode,

        map:
          formData.map,

        maxTeams:
          Number(
            formData.maxTeams
          ),

        date:
          formData.date,

        time:
          formData.time,

        prize:
          Number(
            formData.prize
          ),

        entryFee:
          Number(
            formData.entryFee
          ),

        // ===============================================
        // ROOM DETAILS
        // ===============================================

        roomId:
          formData.roomId.trim(),

        roomPassword:
          formData.roomPassword.trim(),

        status:
          formData.status,

        description:
          formData.description.trim(),

        rules:
          rulesArray,
      };


      console.log(
        "Sending tournament:",
        payload
      );


      // =================================================
      // CREATE TOURNAMENT
      // =================================================

      const response =
        await fetch(
          "http://localhost:5000/api/tournaments",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            credentials: "include",

            body:
              JSON.stringify(
                payload
              ),
          }
        );


      const data =
        await response.json();


      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to create tournament"
        );
      }


      // =================================================
      // SUCCESS
      // =================================================

      setSuccess(
        "Tournament created successfully!"
      );


      // =================================================
      // RESET FORM
      // =================================================

      setFormData({
        name: "",
        game: "",
        mode: "",
        map: "",
        maxTeams: "",
        date: "",
        time: "",
        prize: "",
        entryFee: "",
        roomId: "",
        roomPassword: "",
        status: "Upcoming",
        description: "",
        rules: "",
      });

    } catch (error) {

      console.error(
        "Create tournament error:",
        error
      );


      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong"
      );

    } finally {

      setLoading(false);

    }
  }


  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white">

      <AdminSidebar />


      <main className="ml-64 p-8">


        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-8">

          <Link
            href="/tournaments"
            className="mb-5 inline-block text-sm text-gray-500 hover:text-white"
          >
            ← Back to tournaments
          </Link>


          <h1 className="text-3xl font-bold">
            Create Tournament
          </h1>


          <p className="mt-2 text-gray-400">
            Create a new BGMI or Free Fire tournament.
          </p>

        </div>


        {/* =================================================
            SUCCESS
        ================================================= */}

        {success && (

          <div className="mb-6 rounded-xl border border-green-500/20 bg-green-500/10 p-4 text-sm text-green-400">
            {success}
          </div>

        )}


        {/* =================================================
            ERROR
        ================================================= */}

        {error && (

          <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
            {error}
          </div>

        )}


        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >


          {/* =================================================
              BASIC INFORMATION
          ================================================= */}

          <div className="rounded-xl border border-white/10 bg-[#151515] p-7">

            <div className="mb-6">

              <h2 className="text-xl font-semibold">
                Basic Information
              </h2>


              <p className="mt-1 text-sm text-gray-500">
                Enter the main tournament details.
              </p>

            </div>


            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">


              {/* Tournament Name */}

              <div className="md:col-span-2">

                <label className="mb-2 block text-sm text-gray-300">
                  Tournament Name
                </label>


                <input
                  type="text"
                  name="name"
                  value={
                    formData.name
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="e.g. BGMI Night Cup"
                  required
                  className="w-full rounded-lg border border-white/10 bg-[#0b0b0b] px-4 py-3 outline-none placeholder:text-gray-600 focus:border-orange-500"
                />

              </div>


              {/* Game */}

              <div>

                <label className="mb-2 block text-sm text-gray-300">
                  Game
                </label>


                <select
                  name="game"
                  value={
                    formData.game
                  }
                  onChange={
                    handleChange
                  }
                  required
                  className="w-full rounded-lg border border-white/10 bg-[#0b0b0b] px-4 py-3 outline-none focus:border-orange-500"
                >

                  <option value="">
                    Select Game
                  </option>


                  <option value="BGMI">
                    BGMI
                  </option>


                  <option value="Free Fire">
                    Free Fire
                  </option>

                </select>

              </div>


              {/* Mode */}

              <div>

                <label className="mb-2 block text-sm text-gray-300">
                  Mode
                </label>


                <select
                  name="mode"
                  value={
                    formData.mode
                  }
                  onChange={
                    handleChange
                  }
                  required
                  className="w-full rounded-lg border border-white/10 bg-[#0b0b0b] px-4 py-3 outline-none focus:border-orange-500"
                >

                  <option value="">
                    Select Mode
                  </option>


                  <option value="Solo">
                    Solo
                  </option>


                  <option value="Duo">
                    Duo
                  </option>


                  <option value="Squad">
                    Squad
                  </option>

                </select>

              </div>


              {/* Map */}

              <div>

                <label className="mb-2 block text-sm text-gray-300">
                  Map
                </label>


                <select
                  name="map"
                  value={
                    formData.map
                  }
                  onChange={
                    handleChange
                  }
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
                  value={
                    formData.maxTeams
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="64"
                  min="1"
                  required
                  className="w-full rounded-lg border border-white/10 bg-[#0b0b0b] px-4 py-3 outline-none placeholder:text-gray-600 focus:border-orange-500"
                />


                <p className="mt-2 text-xs text-gray-600">
                  Registered teams will automatically start from 0.
                </p>

              </div>

            </div>

          </div>


          {/* =================================================
              TOURNAMENT SCHEDULE
          ================================================= */}

          <div className="rounded-xl border border-white/10 bg-[#151515] p-7">

            <div className="mb-6">

              <h2 className="text-xl font-semibold">
                Tournament Schedule
              </h2>


              <p className="mt-1 text-sm text-gray-500">
                Set the tournament date and starting time.
              </p>

            </div>


            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">


              {/* Date */}

              <div>

                <label className="mb-2 block text-sm text-gray-300">
                  Tournament Date
                </label>


                <input
                  type="date"
                  name="date"
                  value={
                    formData.date
                  }
                  onChange={
                    handleChange
                  }
                  required
                  className="w-full rounded-lg border border-white/10 bg-[#0b0b0b] px-4 py-3 outline-none focus:border-orange-500"
                />

              </div>


              {/* Time */}

              <div>

                <label className="mb-2 block text-sm text-gray-300">
                  Tournament Time
                </label>


                <input
                  type="time"
                  name="time"
                  value={
                    formData.time
                  }
                  onChange={
                    handleChange
                  }
                  required
                  className="w-full rounded-lg border border-white/10 bg-[#0b0b0b] px-4 py-3 outline-none focus:border-orange-500"
                />

              </div>

            </div>

          </div>


          {/* =================================================
              PRIZE & ENTRY
          ================================================= */}

          <div className="rounded-xl border border-white/10 bg-[#151515] p-7">

            <div className="mb-6">

              <h2 className="text-xl font-semibold">
                Prize & Entry
              </h2>


              <p className="mt-1 text-sm text-gray-500">
                Configure prize money and registration fee.
              </p>

            </div>


            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">


              {/* Prize */}

              <div>

                <label className="mb-2 block text-sm text-gray-300">
                  Prize Pool
                </label>


                <input
                  type="number"
                  name="prize"
                  value={
                    formData.prize
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="10000"
                  min="0"
                  required
                  className="w-full rounded-lg border border-white/10 bg-[#0b0b0b] px-4 py-3 outline-none placeholder:text-gray-600 focus:border-orange-500"
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
                  value={
                    formData.entryFee
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="50"
                  min="0"
                  required
                  className="w-full rounded-lg border border-white/10 bg-[#0b0b0b] px-4 py-3 outline-none placeholder:text-gray-600 focus:border-orange-500"
                />

              </div>


              {/* Status */}

              <div>

                <label className="mb-2 block text-sm text-gray-300">
                  Status
                </label>


                <select
                  name="status"
                  value={
                    formData.status
                  }
                  onChange={
                    handleChange
                  }
                  required
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


          {/* =================================================
              ROOM DETAILS
          ================================================= */}

          <div className="rounded-xl border border-white/10 bg-[#151515] p-7">

            <div className="mb-6">

              <h2 className="text-xl font-semibold">
                Room Details
              </h2>


              <p className="mt-1 text-sm text-gray-500">
                Add the BGMI or Free Fire room credentials.
                Registered users will be able to access them
                when the tournament is Live.
              </p>

            </div>


            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">


              {/* Room ID */}

              <div>

                <label className="mb-2 block text-sm text-gray-300">
                  Room ID
                </label>


                <input
                  type="text"
                  name="roomId"
                  value={
                    formData.roomId
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Enter room ID"
                  className="w-full rounded-lg border border-white/10 bg-[#0b0b0b] px-4 py-3 outline-none placeholder:text-gray-600 focus:border-orange-500"
                />

              </div>


              {/* Room Password */}

              <div>

                <label className="mb-2 block text-sm text-gray-300">
                  Room Password
                </label>


                <input
                  type="text"
                  name="roomPassword"
                  value={
                    formData.roomPassword
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Enter room password"
                  className="w-full rounded-lg border border-white/10 bg-[#0b0b0b] px-4 py-3 outline-none placeholder:text-gray-600 focus:border-orange-500"
                />

              </div>

            </div>

          </div>


          {/* =================================================
              DESCRIPTION
          ================================================= */}

          <div className="rounded-xl border border-white/10 bg-[#151515] p-7">

            <div className="mb-6">

              <h2 className="text-xl font-semibold">
                Description
              </h2>


              <p className="mt-1 text-sm text-gray-500">
                Add tournament information for players.
              </p>

            </div>


            <textarea
              name="description"
              value={
                formData.description
              }
              onChange={
                handleChange
              }
              rows={5}
              placeholder="Write tournament details..."
              className="w-full resize-none rounded-lg border border-white/10 bg-[#0b0b0b] px-4 py-3 outline-none placeholder:text-gray-600 focus:border-orange-500"
            />

          </div>


          {/* =================================================
              RULES
          ================================================= */}

          <div className="rounded-xl border border-white/10 bg-[#151515] p-7">

            <div className="mb-6">

              <h2 className="text-xl font-semibold">
                Tournament Rules
              </h2>


              <p className="mt-1 text-sm text-gray-500">
                Enter one rule per line.
              </p>

            </div>


            <textarea
              name="rules"
              value={
                formData.rules
              }
              onChange={
                handleChange
              }
              rows={6}
              placeholder={`No hacking or cheating
Players must join before match time
No abusive behaviour
Follow tournament instructions`}
              className="w-full resize-none rounded-lg border border-white/10 bg-[#0b0b0b] px-4 py-3 outline-none placeholder:text-gray-600 focus:border-orange-500"
            />

          </div>


          {/* =================================================
              BUTTONS
          ================================================= */}

          <div className="flex justify-end gap-3 pb-8">

            <Link
              href="/tournaments"
              className="rounded-lg border border-white/10 px-6 py-3 text-sm font-medium hover:bg-white/5"
            >
              Cancel
            </Link>


            <button
              type="submit"
              disabled={
                loading
              }
              className="rounded-lg bg-orange-500 px-7 py-3 text-sm font-semibold text-black transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Creating..."
                : "Create Tournament"}
            </button>

          </div>

        </form>

      </main>

    </div>
  );
}