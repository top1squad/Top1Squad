import Link from "next/link";

export default function RegisterSuccessPage() {
  return (
    <main className="min-h-screen bg-[#f5f7fb] text-[#172033]">

      {/* Header */}
      <header className="border-b border-[#e6e9f0] bg-white">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8">

          <Link
            href="/"
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#4f46e5] text-lg shadow-sm">
              🎮
            </div>

            <div>
              <p className="text-[15px] font-extrabold tracking-tight text-[#172033]">
                Tournament Arena
              </p>

              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#6366f1]">
                Competitive Gaming
              </p>
            </div>
          </Link>

          <Link
            href="/"
            className="text-sm font-medium text-[#7a8498] transition hover:text-[#4f46e5]"
          >
            Home
          </Link>

        </div>
      </header>

      {/* Main */}
      <div className="flex min-h-[calc(100vh-72px)] items-center justify-center px-4 py-10 sm:px-6">

        <div className="w-full max-w-2xl">

          {/* Success Card */}
          <div className="overflow-hidden rounded-2xl border border-[#e2e6ee] bg-white shadow-[0_12px_40px_rgba(25,35,55,0.07)]">

            {/* Top accent */}
            <div className="h-1.5 w-full bg-[#4f46e5]" />

            <div className="p-6 sm:p-9">

              {/* Success Icon */}
              <div className="flex justify-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#ecfdf3]">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#22c55e] text-2xl font-bold text-white shadow-sm">
                    ✓
                  </div>
                </div>
              </div>

              {/* Title */}
              <div className="mt-6 text-center">

                <div className="mb-3 flex items-center justify-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e]" />

                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#16a34a]">
                    Registration complete
                  </span>

                  <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e]" />
                </div>

                <h1 className="text-2xl font-extrabold tracking-tight text-[#172033] sm:text-3xl">
                  Your account is ready!
                </h1>

                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#7a8498]">
                  Your mobile number has been verified and
                  your Tournament Arena account has been
                  created successfully.
                </p>

              </div>

              {/* Status */}
              <div className="mt-7 rounded-xl border border-[#dcefe4] bg-[#f5fcf7] p-4">

                <div className="flex items-center gap-3">

                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#dcfce7] text-[#16a34a]">
                    ✓
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#166534]">
                      Account successfully verified
                    </p>

                    <p className="mt-0.5 text-[11px] text-[#6b8a76]">
                      You can now access your player profile
                      and tournaments.
                    </p>
                  </div>

                  <span className="ml-auto shrink-0 rounded-full bg-[#dcfce7] px-2.5 py-1 text-[10px] font-bold text-[#15803d]">
                    VERIFIED
                  </span>

                </div>

              </div>

              {/* What's next */}
              <div className="mt-7">

                <div className="mb-4 flex items-center gap-3">

                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#eef2ff] text-xs font-bold text-[#4f46e5]">
                    1
                  </div>

                  <div>
                    <h2 className="text-sm font-bold text-[#293247]">
                      What would you like to do?
                    </h2>

                    <p className="text-[11px] text-[#929bad]">
                      Choose where you want to go next.
                    </p>
                  </div>

                </div>

                {/* Options */}
                <div className="grid gap-3 sm:grid-cols-2">

                  {/* Profile */}
                  <Link
                    href="/profile"
                    className="group rounded-xl border border-[#dce1ea] bg-[#fafbfc] p-4 transition hover:border-[#6366f1] hover:bg-[#f7f7ff] hover:shadow-sm"
                  >

                    <div className="flex items-start justify-between">

                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#e8eaff] text-lg">
                        👤
                      </div>

                      <svg
                        className="text-[#a0a7b5] transition group-hover:translate-x-0.5 group-hover:text-[#4f46e5]"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M5 12h14" />
                        <path d="m13 6 6 6-6 6" />
                      </svg>

                    </div>

                    <h3 className="mt-4 text-sm font-bold text-[#293247]">
                      View my profile
                    </h3>

                    <p className="mt-1 text-[11px] leading-5 text-[#8992a4]">
                      Manage your player information and
                      account settings.
                    </p>

                  </Link>

                  {/* Tournaments */}
                  <Link
                    href="/tournaments"
                    className="group rounded-xl border border-[#dce1ea] bg-[#fafbfc] p-4 transition hover:border-[#6366f1] hover:bg-[#f7f7ff] hover:shadow-sm"
                  >

                    <div className="flex items-start justify-between">

                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#e8eaff] text-lg">
                        🏆
                      </div>

                      <svg
                        className="text-[#a0a7b5] transition group-hover:translate-x-0.5 group-hover:text-[#4f46e5]"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M5 12h14" />
                        <path d="m13 6 6 6-6 6" />
                      </svg>

                    </div>

                    <h3 className="mt-4 text-sm font-bold text-[#293247]">
                      Explore tournaments
                    </h3>

                    <p className="mt-1 text-[11px] leading-5 text-[#8992a4]">
                      Find upcoming tournaments and start
                      competing.
                    </p>

                  </Link>

                </div>

              </div>

              {/* Primary CTA */}
              <Link
                href="/tournaments"
                className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#4f46e5] px-5 text-sm font-bold text-white shadow-[0_6px_18px_rgba(79,70,229,0.22)] transition hover:bg-[#4338ca] hover:shadow-[0_8px_22px_rgba(79,70,229,0.28)]"
              >
                Browse Tournaments

                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M5 12h14" />
                  <path d="m13 6 6 6-6 6" />
                </svg>

              </Link>

              {/* Footer */}
              <div className="mt-7 border-t border-[#edf0f4] pt-5 text-center">

                <p className="text-[11px] text-[#9aa2b2]">
                  Welcome to Tournament Arena.
                  <span className="ml-1">
                    Good luck and have fun!
                  </span>
                </p>

              </div>

            </div>

          </div>

          {/* Back Home */}
          <div className="mt-5 text-center">

            <Link
              href="/"
              className="text-xs font-semibold text-[#8b94a6] transition hover:text-[#4f46e5]"
            >
              ← Back to Home
            </Link>

          </div>

        </div>

      </div>

    </main>
  );
}