"use client";

import Link from "next/link";

export default function AdminSidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 border-r border-white/10 bg-[#111111] p-5 text-white">

      <div className="mb-8">
        <h1 className="text-xl font-bold">
          TOURNAMENT<span className="text-orange-500">ARENA</span>
        </h1>

        <p className="mt-1 text-xs text-gray-500">
          Admin Panel
        </p>
      </div>

      <nav className="space-y-2">

        <Link
          href="/"
          className="block rounded-lg px-4 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-white"
        >
          Dashboard
        </Link>

        <Link
          href="/tournaments"
          className="block rounded-lg px-4 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-white"
        >
          Tournaments
        </Link>

        <Link
          href="/matches"
          className="block rounded-lg px-4 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-white"
        >
          Matches
        </Link>

        <Link
          href="/teams"
          className="block rounded-lg px-4 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-white"
        >
          Teams
        </Link>

        <Link
          href="/users"
          className="block rounded-lg px-4 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-white"
        >
          Users
        </Link>

      </nav>

    </aside>
  );
}