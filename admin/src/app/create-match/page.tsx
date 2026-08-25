"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AdminSidebar from "../../components/AdminSidebar";

type Tournament = {
  _id: string;
  name: string;
  game: "BGMI" | "Free Fire";
};

export default function CreateMatchPage() {

  const [tournaments, setTournaments] =
    useState<Tournament[]>([]);

  const [formData, setFormData] = useState({
    tournament: "",
    matchName: "",
    game: "",
    map: "",
    date: "",
    startTime: "",
    maxTeams: "16",
    roomId: "",
    roomPassword: "",
    status: "upcoming",
    roomVisible: "hidden",
  });

  const [loading, setLoading] =
    useState(false);

  const [loadingTournaments, setLoadingTournaments] =
    useState(true);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");


  // =================================================
  // GET TOURNAMENTS FROM EXPRESS
  // =================================================

  useEffect(() => {

    async function fetchTournaments() {

      try {

        const response =
          await fetch(
            "http://localhost:5000/api/tournaments"
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to load tournaments"
          );
        }

        setTournaments(
          data.data
        );

      } catch (error) {

        setError(
          error instanceof Error
            ? error.message
            : "Failed to load tournaments"
        );

      } finally {

        setLoadingTournaments(false);

      }
    }

    fetchTournaments();

  }, []);


  // =================================================
  // HANDLE INPUT
  // =================================================

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement |
      HTMLSelectElement
    >
  ) {

    const {
      name,
      value,
    } = e.target;

    setFormData(
      (previous) => ({
        ...previous,
        [name]: value,
      })
    );

  }


  // =================================================
  // CREATE MATCH
  // =================================================

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {

    e.preventDefault();

    setLoading(true);
    setError("");
    setSuccess("");

    try {

      const response =
        await fetch(
          "http://localhost:5000/api/matches",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({

              tournament:
                formData.tournament,

              matchName:
                formData.matchName,

              game:
                formData.game,

              map:
                formData.map,

              date:
                formData.date,

              startTime:
                formData.startTime,

              maxTeams:
                Number(
                  formData.maxTeams
                ),

              roomId:
                formData.roomId,

              roomPassword:
                formData.roomPassword,

              status:
                formData.status,

              roomVisible:
                formData.roomVisible ===
                "visible",

            }),
          }
        );


      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(
          data.message ||
            "Failed to create match"
        );

      }


      setSuccess(
        "Match created successfully!"
      );


      // Clear form

      setFormData({
        tournament: "",
        matchName: "",
        game: "",
        map: "",
        date: "",
        startTime: "",
        maxTeams: "16",
        roomId: "",
        roomPassword: "",
        status: "upcoming",
        roomVisible: "hidden",
      });


    } catch (error) {

      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong"
      );

    } finally {

      setLoading(false);

    }

  }


  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white">

      <AdminSidebar />

      <main className="ml-64 p-8">

        {/* =========================================
            HEADER
        ========================================== */}

        <div className="mb-8">

          <Link
            href="/matches"
            className="text-sm text-gray-400 hover:text-orange-400"
          >
            ← Back to Matches
          </Link>

          <h1 className="mt-3 text-3xl font-bold">
            Create Match
          </h1>

          <p className="mt-2 text-gray-400">
            Manually create and configure a tournament match.
          </p>

        </div>


        {/* ERROR */}

        {error && (
          <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
            {error}
          </div>
        )}


        {/* SUCCESS */}

        {success && (
          <div className="mb-6 rounded-lg border border-green-500/20 bg-green-500/10 p-4 text-sm text-green-400">
            {success}
          </div>
        )}


        <form onSubmit={handleSubmit}>

          {/* =========================================
              MATCH INFORMATION
          ========================================== */}

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
                  disabled={
                    loadingTournaments
                  }
                  className="w-full rounded-lg border border-white/10 bg-[#0b0b0b] px-4 py-3 outline-none focus:border-orange-500 disabled:opacity-50"
                >

                  <option value="">
                    {loadingTournaments
                      ? "Loading tournaments..."
                      : "Select Tournament"}
                  </option>


                  {tournaments.map(
                    (tournament) => (

                      <option
                        key={tournament._id}
                        value={tournament._id}
                      >
                        {tournament.name}
                      </option>

                    )
                  )}

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
                  placeholder="e.g. Match 1"
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
                  value={formData.game}
                  onChange={handleChange}
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

                  <option value="upcoming">
                    Upcoming
                  </option>

                  <option value="live">
                    Live
                  </option>

                  <option value="completed">
                    Completed
                  </option>

                  <option value="cancelled">
                    Cancelled
                  </option>

                </select>

              </div>

            </div>

          </div>


          {/* =========================================
              SCHEDULE
          ========================================== */}

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
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-white/10 bg-[#0b0b0b] px-4 py-3 outline-none focus:border-orange-500"
                />

              </div>

            </div>

          </div>


          {/* =========================================
              ROOM DETAILS
          ========================================== */}

          <div className="mt-6 rounded-xl border border-white/10 bg-[#151515] p-6">

            <div className="mb-6">

              <h2 className="text-xl font-semibold">
                Room Details
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                These details are entered manually by the admin.
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
                  value={formData.roomId}
                  onChange={handleChange}
                  placeholder="Enter room ID"
                  className="w-full rounded-lg border border-white/10 bg-[#0b0b0b] px-4 py-3 font-mono outline-none placeholder:text-gray-600 focus:border-orange-500"
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
                  value={formData.roomPassword}
                  onChange={handleChange}
                  placeholder="Enter room password"
                  className="w-full rounded-lg border border-white/10 bg-[#0b0b0b] px-4 py-3 font-mono outline-none placeholder:text-gray-600 focus:border-orange-500"
                />

              </div>


              {/* Room Visibility */}

              <div>

                <label className="mb-2 block text-sm text-gray-300">
                  Room Details Visibility
                </label>

                <select
                  name="roomVisible"
                  value={formData.roomVisible}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-white/10 bg-[#0b0b0b] px-4 py-3 outline-none focus:border-orange-500"
                >

                  <option value="hidden">
                    Hidden
                  </option>

                  <option value="visible">
                    Visible to Registered Teams
                  </option>

                </select>

              </div>

            </div>


            {/* Notice */}

            <div className="mt-6 rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-4">

              <p className="text-sm text-yellow-400">
                ⚠ Room ID and password should only
                be published when the admin is ready.
              </p>

            </div>

          </div>


          {/* =========================================
              BUTTONS
          ========================================== */}

          <div className="mt-6 flex justify-end gap-3">

            <Link
              href="/matches"
              className="rounded-lg border border-white/10 px-6 py-3 text-sm font-medium hover:bg-white/5"
            >
              Cancel
            </Link>


            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-orange-500 px-6 py-3 text-sm font-semibold text-black hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Creating..."
                : "Create Match"}
            </button>

          </div>

        </form>

      </main>
    </div>
  );
}