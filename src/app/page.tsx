"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import TournamentCard from "../components/TournamentCard";

// =========================================================
// API CONFIG
// =========================================================

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || ""
).replace(/\/$/, "");

// =========================================================
// TYPES
// =========================================================

interface Tournament {
  _id: string;
  name: string;
  game: "BGMI" | "Free Fire";
  prize: number;
  entryFee: number;
  maxTeams: number;
  registeredTeams: number;
  date: string;
  time: string;
  mode: string;
  map: string;
  status: "Upcoming" | "Live" | "Completed" | "Cancelled";
  description: string;
  rules: string[];
}

export default function Home() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [tournamentLoading, setTournamentLoading] = useState(false);
  const [error, setError] = useState("");
  const [authenticated, setAuthenticated] = useState(false);

  /* =========================================================
     AUTHENTICATION
  ========================================================= */

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        if (!API_URL) {
          console.error(
            "NEXT_PUBLIC_API_URL is not configured."
          );
          setAuthenticated(false);
          return;
        }

        const response = await fetch(
          `${API_URL}/api/auth/me`,
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          }
        );

        const data = await response.json();

        console.log("AUTH CHECK:", data);

        if (
          response.ok &&
          data.success &&
          data.authenticated
        ) {
          setAuthenticated(true);
        } else {
          setAuthenticated(false);
        }
      } catch (error) {
        console.error(
          "Authentication check error:",
          error
        );
        setAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuthentication();
  }, []);

  /* =========================================================
     TOURNAMENT DATA
  ========================================================= */

  useEffect(() => {
    if (!authenticated) {
      setTournaments([]);
      return;
    }

    const fetchTournaments = async () => {
      try {
        if (!API_URL) {
          throw new Error(
            "NEXT_PUBLIC_API_URL is not configured."
          );
        }

        setTournamentLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/tournaments`,
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error(
            "Failed to fetch tournaments"
          );
        }

        const data = await response.json();

        console.log(
          "Tournament API data:",
          data
        );

        const tournamentList = Array.isArray(data)
          ? data
          : data.tournaments || [];

        setTournaments(tournamentList);
      } catch (error) {
        console.error(
          "Tournament fetch error:",
          error
        );
        setError(
          "Unable to load tournaments."
        );
      } finally {
        setTournamentLoading(false);
      }
    };

    fetchTournaments();
  }, [authenticated]);

  /* =========================================================
     DERIVED DATA
  ========================================================= */

  const activeTournaments = useMemo(
    () =>
      tournaments.filter(
        (tournament) =>
          tournament.status === "Upcoming" ||
          tournament.status === "Live"
      ),
    [tournaments]
  );

  const featuredTournaments =
    activeTournaments.slice(0, 3);

  const liveTournaments = tournaments.filter(
    (tournament) =>
      tournament.status === "Live"
  );

  const bgmiCount = tournaments.filter(
    (tournament) =>
      tournament.game === "BGMI"
  ).length;

  const freeFireCount = tournaments.filter(
    (tournament) =>
      tournament.game === "Free Fire"
  ).length;

  const totalTeams = tournaments.reduce(
    (total, tournament) =>
      total +
      Number(
        tournament.registeredTeams || 0
      ),
    0
  );

  const totalPrize = tournaments.reduce(
    (total, tournament) =>
      total +
      Number(tournament.prize || 0),
    0
  );

  const liveTournament =
    liveTournaments.length > 0;

  return (
    <main className="min-h-screen overflow-hidden bg-[#070914] text-white">

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="relative min-h-[720px] border-b border-white/[0.06]">

        <div className="absolute inset-0">

          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('/images/gaming-hero.jpg')",
            }}
          />

          <div className="absolute inset-0 bg-[#050713]/80" />

          <div className="absolute inset-0 bg-gradient-to-r from-[#050713] via-[#080a18]/95 to-[#080a18]/35" />

          <div className="absolute inset-0 bg-gradient-to-t from-[#070914] via-transparent to-transparent" />

        </div>

        <div className="absolute left-[15%] top-[20%] h-64 w-64 rounded-full bg-indigo-600/10 blur-[120px]" />

        <div className="absolute right-[10%] top-[25%] h-80 w-80 rounded-full bg-violet-600/10 blur-[130px]" />

        <div className="relative z-10 mx-auto flex min-h-[720px] max-w-[1500px] items-center px-5 py-20 sm:px-8 lg:px-14">

          <div className="max-w-[720px]">

            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2">

              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  liveTournament
                    ? "bg-emerald-400 shadow-[0_0_10px_#34d399]"
                    : "bg-[#9b8cff] shadow-[0_0_10px_#8b5cf6]"
                }`}
              />

              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/55">
                {authenticated
                  ? liveTournament
                    ? "Live competitions available"
                    : "Competitions are open"
                  : "Competitive gaming platform"}
              </span>

            </div>

            <h1 className="text-5xl font-black leading-[0.96] tracking-[-0.055em] text-white sm:text-6xl md:text-7xl lg:text-[82px]">

              Compete with
              <br />

              purpose.

              <br />

              <span className="bg-gradient-to-r from-[#8178ff] via-[#9188ff] to-[#b0a8ff] bg-clip-text text-transparent">
                Play for the win.
              </span>

            </h1>

            <p className="mt-7 max-w-[650px] text-sm leading-7 text-white/55 sm:text-base">
              Compete in BGMI and Free Fire tournaments,
              build your squad, track your matches and climb
              the leaderboard — all from one place.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">

              <Link
                href={
                  authenticated
                    ? "/tournaments"
                    : "/register"
                }
                className="rounded-xl bg-[#6865ff] px-7 py-4 text-[11px] font-extrabold uppercase tracking-[0.12em] text-white shadow-[0_8px_30px_rgba(104,101,255,0.25)] transition duration-200 hover:bg-[#7774ff] hover:shadow-[0_10px_35px_rgba(104,101,255,0.35)]"
              >
                {authenticated
                  ? "Explore tournaments"
                  : "Create your account"}
              </Link>

              <Link
                href={
                  authenticated
                    ? "/leaderboard"
                    : "/login"
                }
                className="rounded-xl border border-white/10 bg-white/[0.035] px-7 py-4 text-[11px] font-bold uppercase tracking-[0.12em] text-white/75 transition hover:bg-white/[0.08] hover:text-white"
              >
                {authenticated
                  ? "View leaderboard"
                  : "Already registered? Login"}
              </Link>

            </div>

            <div className="mt-12 grid max-w-[570px] grid-cols-2 gap-3 sm:grid-cols-4">

              <HeroStat
                value={
                  authenticated
                    ? String(
                        activeTournaments.length
                      )
                    : "—"
                }
                label="Active"
              />

              <HeroStat
                value={
                  authenticated
                    ? String(
                        liveTournaments.length
                      )
                    : "—"
                }
                label="Live now"
              />

              <HeroStat
                value={
                  authenticated
                    ? String(bgmiCount)
                    : "—"
                }
                label="BGMI"
              />

              <HeroStat
                value={
                  authenticated
                    ? String(freeFireCount)
                    : "—"
                }
                label="Free Fire"
              />

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          LOGGED IN QUICK STATS
      ===================================================== */}

      {authenticated && (
        <section className="border-b border-white/[0.06] bg-[#090b17]">

          <div className="mx-auto grid max-w-[1500px] grid-cols-2 divide-x divide-white/[0.06] px-5 sm:px-8 md:grid-cols-4 lg:px-14">

            <DarkStat
              label="Active tournaments"
              value={String(
                activeTournaments.length
              )}
              detail="Open competitions"
            />

            <DarkStat
              label="Registered teams"
              value={String(totalTeams)}
              detail="Across tournaments"
            />

            <DarkStat
              label="Prize pool"
              value={`₹${totalPrize.toLocaleString(
                "en-IN"
              )}`}
              detail="Listed tournament prizes"
            />

            <DarkStat
              label="Live matches"
              value={String(
                liveTournaments.length
              )}
              detail="Currently active"
            />

          </div>

        </section>
      )}

      {/* =====================================================
          LOGGED IN EXPERIENCE
      ===================================================== */}

      {authenticated && (
        <div className="mx-auto max-w-[1500px] px-5 py-14 sm:px-8 lg:px-14">

          <section className="grid gap-5 lg:grid-cols-[1.5fr_0.5fr]">

            <DarkPanel>

              <PanelHeader
                eyebrow="MATCH CENTER"
                title="Live & upcoming"
                description="Find your next competitive match"
                href="/tournaments"
                link="View all →"
              />

              {tournamentLoading ? (
                <LoadingRows />
              ) : activeTournaments.length > 0 ? (
                <div className="divide-y divide-white/[0.06]">

                  {activeTournaments
                    .slice(0, 4)
                    .map((tournament) => (
                      <DarkTournament
                        key={tournament._id}
                        tournament={tournament}
                      />
                    ))}

                </div>
              ) : (
                <EmptyState dark />
              )}

            </DarkPanel>

            <DarkPanel>

              <PanelHeader
                eyebrow="GAMES"
                title="Choose your game"
                description="Explore competitions by game"
              />

              <div className="space-y-3 p-5">

                <GameChoiceDark
                  href="/tournaments?game=BGMI"
                  short="B"
                  title="BGMI"
                  subtitle={`${bgmiCount} tournaments`}
                  type="bgmi"
                />

                <GameChoiceDark
                  href="/tournaments?game=Free%20Fire"
                  short="F"
                  title="Free Fire"
                  subtitle={`${freeFireCount} tournaments`}
                  type="freefire"
                />

              </div>

            </DarkPanel>

          </section>

          <section className="mt-16">

            <SectionHeaderDark
              eyebrow="COMPETE"
              title="Featured tournaments"
              description="Choose an event, build your squad and enter the arena."
              href="/tournaments"
            />

            {tournamentLoading && (
              <div className="mt-7 grid gap-5 md:grid-cols-2 lg:grid-cols-3">

                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="h-72 animate-pulse rounded-2xl bg-[#101322]"
                  />
                ))}

              </div>
            )}

            {!tournamentLoading && error && (
              <div className="mt-7 rounded-xl border border-red-500/20 bg-red-500/10 p-5 text-sm text-red-300">
                {error}
              </div>
            )}

            {!tournamentLoading &&
              !error &&
              featuredTournaments.length === 0 && (
                <div className="mt-7">
                  <EmptyState
                    dark
                    large
                  />
                </div>
              )}

            {!tournamentLoading &&
              !error &&
              featuredTournaments.length > 0 && (
                <div className="mt-7 grid gap-5 md:grid-cols-2 lg:grid-cols-3">

                  {featuredTournaments.map(
                    (tournament) => (
                      <TournamentCard
                        key={tournament._id}
                        tournament={tournament}
                      />
                    )
                  )}

                </div>
              )}

          </section>

          <section className="mt-16">

            <SectionHeaderDark
              eyebrow="REWARDS"
              title="Win more than the match"
              description="Build your competitive profile and unlock valuable rewards."
            />

            <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

              <DarkReward
                icon="₹"
                title="Cash rewards"
                text="Compete for tournament prize pools and winnings."
                href="/wallet"
              />

              <DarkReward
                icon="GC"
                title="Gift cards"
                text="Redeem your rewards for popular gaming and digital gift cards."
                href="/wallet"
              />

              <DarkReward
                icon="V"
                title="Gaming vouchers"
                text="Use earned rewards toward gaming credits and vouchers."
                href="/wallet"
              />

              <DarkReward
                icon="GT"
                title="Gaming tools"
                text="Track matches, improve your setup and manage your competitive journey."
                href="/my-matches"
              />

            </div>

          </section>

          <section className="mt-16 grid gap-5 lg:grid-cols-2">

            <DarkPanel>

              <PanelHeader
                eyebrow="MATCH CENTER"
                title="Stay match-ready"
                description="Your matches, schedules and results"
                href="/my-matches"
                link="My matches →"
              />

              <div className="p-5">

                <div className="rounded-xl border border-white/[0.05] bg-[#0a0c17] p-6">

                  <div className="flex gap-4">

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#6865ff] text-xs font-black text-white shadow-[0_0_25px_rgba(104,101,255,0.18)]">
                      MC
                    </div>

                    <div>

                      <h4 className="text-sm font-bold text-white">
                        Your matches, all in one place
                      </h4>

                      <p className="mt-2 text-xs leading-6 text-white/40">
                        Check upcoming matches, schedules,
                        tournament participation and results
                        without losing track of your games.
                      </p>

                    </div>

                  </div>

                  <Link
                    href="/my-matches"
                    className="mt-6 inline-flex rounded-lg bg-white/[0.06] px-4 py-2.5 text-[10px] font-bold uppercase tracking-wide text-[#9c97ff] transition hover:bg-white/[0.1]"
                  >
                    Open match center
                  </Link>

                </div>

              </div>

            </DarkPanel>

            <DarkPanel>

              <PanelHeader
                eyebrow="RANKINGS"
                title="Competitive leaderboard"
                description="Follow your competitive journey"
                href="/leaderboard"
                link="View rankings →"
              />

              <div className="space-y-3 p-5">

                <LeaderboardPreviewDark
                  rank="01"
                  name="Top players"
                  detail="Climb the rankings"
                />

                <LeaderboardPreviewDark
                  rank="02"
                  name="Track your progress"
                  detail="Follow your competitive journey"
                />

                <LeaderboardPreviewDark
                  rank="03"
                  name="Compete consistently"
                  detail="Earn recognition through performance"
                />

              </div>

            </DarkPanel>

          </section>

          <section className="mt-16">

            <SectionHeaderDark
              eyebrow="TOOLS"
              title="Everything around your game"
              description="Useful features designed around the competitive gaming experience."
            />

            <div className="mt-7 grid gap-4 md:grid-cols-2 lg:grid-cols-4">

              <DarkTool
                number="01"
                title="Tournament tracking"
                text="Keep your active and upcoming competitions organized."
                href="/my-tournaments"
              />

              <DarkTool
                number="02"
                title="Match management"
                text="Review your registered matches and schedules."
                href="/my-matches"
              />

              <DarkTool
                number="03"
                title="Performance"
                text="Follow your competitive standing and leaderboard journey."
                href="/leaderboard"
              />

              <DarkTool
                number="04"
                title="Wallet"
                text="Manage tournament-related balances and rewards."
                href="/wallet"
              />

            </div>

          </section>

        </div>
      )}

      {/* =====================================================
          LOGGED OUT EXPERIENCE
      ===================================================== */}

      {!authenticated && !loading && (
        <div className="mx-auto max-w-[1500px] px-5 py-16 sm:px-8 lg:px-14">

          <section>

            <SectionHeaderDark
              eyebrow="WHY TOURNAMENT ARENA"
              title="Built around the way gamers compete"
              description="A focused competitive gaming experience for players who want more from every match."
            />

            <div className="mt-7 grid gap-4 md:grid-cols-3">

              <FeatureCardDark
                number="01"
                title="Competitive tournaments"
                text="Find BGMI and Free Fire competitions with different formats, entry options and prize pools."
              />

              <FeatureCardDark
                number="02"
                title="One gaming profile"
                text="Keep your tournament participation, matches and competitive progress connected."
              />

              <FeatureCardDark
                number="03"
                title="Rewards ecosystem"
                text="Turn competitive performance into access to prizes, vouchers, gift cards and gaming benefits."
              />

            </div>

          </section>

          <section className="mt-14 grid gap-5 md:grid-cols-2">

            <PublicGameCardDark
              title="BGMI"
              subtitle="Battle royale competitions"
              description="Find competitive events and take your squad into the arena."
              href="/register"
              short="B"
              type="bgmi"
            />

            <PublicGameCardDark
              title="Free Fire"
              subtitle="Fast-paced competitive matches"
              description="Compete for recognition, rewards and the next Booyah."
              href="/register"
              short="F"
              type="freefire"
            />

          </section>

        </div>
      )}

      {/* =====================================================
          HOW IT WORKS
      ===================================================== */}

      <section className="border-t border-white/[0.06]">

        <div className="mx-auto max-w-[1500px] px-5 py-16 sm:px-8 lg:px-14">

          <SectionHeaderDark
            eyebrow="HOW IT WORKS"
            title="From registration to reward"
            description="A simple competitive journey without unnecessary complexity."
          />

          <div className="mt-8 grid gap-4 md:grid-cols-4">

            <ProcessStepDark
              number="01"
              title="Create account"
              text="Set up your gaming profile and get ready to compete."
            />

            <ProcessStepDark
              number="02"
              title="Choose event"
              text="Find a BGMI or Free Fire tournament that suits you."
            />

            <ProcessStepDark
              number="03"
              title="Play"
              text="Join your match, compete with your squad and perform."
            />

            <ProcessStepDark
              number="04"
              title="Win & redeem"
              text="Earn recognition and access available rewards."
            />

          </div>

        </div>

      </section>

      {/* =====================================================
          FINAL CTA
      ===================================================== */}

      <section className="border-t border-white/[0.06] px-5 py-12 sm:px-8 lg:px-14">

        <div className="relative mx-auto max-w-[1500px] overflow-hidden rounded-3xl border border-white/[0.08] bg-[#101323]">

          <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-[#6865ff]/10 to-transparent" />

          <div className="relative flex flex-col justify-between gap-8 px-7 py-10 sm:px-10 lg:flex-row lg:items-center lg:px-12">

            <div className="max-w-2xl">

              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9b96ff]">
                Your next match starts here
              </p>

              <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
                Ready to compete?
              </h2>

              <p className="mt-3 text-sm leading-6 text-white/40">
                Join the arena, find your tournament and start
                building your competitive journey.
              </p>

            </div>

            <div className="flex shrink-0 flex-wrap gap-3">

              <Link
                href={
                  authenticated
                    ? "/tournaments"
                    : "/register"
                }
                className="rounded-xl bg-[#6865ff] px-6 py-3.5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-white transition hover:bg-[#7774ff]"
              >
                {authenticated
                  ? "Browse tournaments"
                  : "Create account"}
              </Link>

              <Link
                href="/leaderboard"
                className="rounded-xl border border-white/10 bg-white/[0.03] px-6 py-3.5 text-[10px] font-bold uppercase tracking-[0.12em] text-white/70 transition hover:bg-white/[0.08] hover:text-white"
              >
                Leaderboard
              </Link>

            </div>

          </div>

        </div>

      </section>

    </main>
  );
}

/* ============================================================
   HERO
============================================================ */

function HeroStat({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.045] px-4 py-3 backdrop-blur-sm">

      <p className="text-xl font-black tracking-tight text-white">
        {value}
      </p>

      <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.15em] text-white/35">
        {label}
      </p>

    </div>
  );
}

/* ============================================================
   DARK STAT
============================================================ */

function DarkStat({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="px-4 py-6 sm:px-7">

      <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/30">
        {label}
      </p>

      <p className="mt-2 text-2xl font-black tracking-tight text-white">
        {value}
      </p>

      <p className="mt-1 text-[10px] text-white/25">
        {detail}
      </p>

    </div>
  );
}

/* ============================================================
   PANEL
============================================================ */

function DarkPanel({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d101e]">
      {children}
    </div>
  );
}

function PanelHeader({
  eyebrow,
  title,
  description,
  href,
  link,
}: {
  eyebrow: string;
  title: string;
  description: string;
  href?: string;
  link?: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-5 sm:px-6">

      <div>

        <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#8e88ff]">
          {eyebrow}
        </p>

        <h2 className="mt-1 text-sm font-extrabold text-white">
          {title}
        </h2>

        <p className="mt-1 text-[10px] text-white/30">
          {description}
        </p>

      </div>

      {href && (
        <Link
          href={href}
          className="text-[10px] font-bold text-[#8e88ff] transition hover:text-[#b0acff]"
        >
          {link || "View all →"}
        </Link>
      )}

    </div>
  );
}

/* ============================================================
   TOURNAMENT
============================================================ */

function DarkTournament({
  tournament,
}: {
  tournament: Tournament;
}) {
  const isLive =
    tournament.status === "Live";

  return (
    <div className="group flex items-center gap-3 px-5 py-4 transition hover:bg-white/[0.025] sm:px-6">

      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-black ${
          tournament.game === "BGMI"
            ? "bg-[#6c63ff]/15 text-[#9690ff]"
            : "bg-orange-500/10 text-orange-400"
        }`}
      >
        {tournament.game === "BGMI"
          ? "B"
          : "F"}
      </div>

      <div className="min-w-0 flex-1">

        <div className="flex flex-wrap items-center gap-2">

          <h3 className="truncate text-xs font-bold text-white/85">
            {tournament.name}
          </h3>

          <span
            className={`rounded-full px-2 py-0.5 text-[8px] font-bold uppercase tracking-wide ${
              isLive
                ? "bg-emerald-500/10 text-emerald-400"
                : "bg-white/[0.06] text-white/35"
            }`}
          >
            {tournament.status}
          </span>

        </div>

        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[9px] text-white/25">

          <span>
            {tournament.mode}
          </span>

          <span>
            {tournament.map}
          </span>

          <span>
            {tournament.registeredTeams}/
            {tournament.maxTeams} teams
          </span>

        </div>

      </div>

      <div className="hidden text-right sm:block">

        <p className="text-[10px] font-bold text-white/75">
          ₹
          {Number(
            tournament.prize || 0
          ).toLocaleString("en-IN")}
        </p>

        <p className="mt-0.5 text-[8px] text-white/25">
          prize pool
        </p>

      </div>

      <Link
        href="/tournaments"
        className="rounded-lg border border-white/10 px-3 py-2 text-[9px] font-bold text-[#8e88ff] transition hover:bg-[#6865ff]/10"
      >
        View
      </Link>

    </div>
  );
}

/* ============================================================
   GAME CHOICE
============================================================ */

function GameChoiceDark({
  href,
  short,
  title,
  subtitle,
  type,
}: {
  href: string;
  short: string;
  title: string;
  subtitle: string;
  type: "bgmi" | "freefire";
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.015] p-3 transition hover:border-white/[0.13] hover:bg-white/[0.035]"
    >

      <div
        className={`flex h-10 w-10 items-center justify-center rounded-lg text-xs font-black ${
          type === "bgmi"
            ? "bg-[#6865ff]/15 text-[#9690ff]"
            : "bg-orange-500/10 text-orange-400"
        }`}
      >
        {short}
      </div>

      <div className="min-w-0 flex-1">

        <p className="text-xs font-bold text-white/80">
          {title}
        </p>

        <p className="mt-0.5 text-[9px] text-white/25">
          {subtitle}
        </p>

      </div>

      <span className="text-sm text-white/20 transition group-hover:translate-x-1 group-hover:text-[#8e88ff]">
        →
      </span>

    </Link>
  );
}

/* ============================================================
   SECTION HEADER
============================================================ */

function SectionHeaderDark({
  eyebrow,
  title,
  description,
  href,
}: {
  eyebrow: string;
  title: string;
  description: string;
  href?: string;
}) {
  return (
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">

      <div>

        <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-[#8e88ff]">
          {eyebrow}
        </p>

        <h2 className="mt-2 text-2xl font-black tracking-tight text-white sm:text-3xl">
          {title}
        </h2>

        <p className="mt-2 max-w-2xl text-xs leading-6 text-white/35 sm:text-sm">
          {description}
        </p>

      </div>

      {href && (
        <Link
          href={href}
          className="text-[10px] font-bold text-[#8e88ff] hover:text-[#b0acff]"
        >
          Explore all →
        </Link>
      )}

    </div>
  );
}

/* ============================================================
   REWARD
============================================================ */

function DarkReward({
  icon,
  title,
  text,
  href,
}: {
  icon: string;
  title: string;
  text: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-white/[0.08] bg-[#0d101e] p-5 transition duration-200 hover:-translate-y-1 hover:border-white/[0.14] hover:bg-[#101323]"
    >

      <div className="flex items-center justify-between">

        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#6865ff]/10 text-[10px] font-black text-[#9690ff]">
          {icon}
        </div>

        <span className="text-white/20 transition group-hover:text-[#8e88ff]">
          →
        </span>

      </div>

      <h3 className="mt-5 text-sm font-extrabold text-white/85">
        {title}
      </h3>

      <p className="mt-2 text-[11px] leading-5 text-white/30">
        {text}
      </p>

    </Link>
  );
}

/* ============================================================
   LEADERBOARD
============================================================ */

function LeaderboardPreviewDark({
  rank,
  name,
  detail,
}: {
  rank: string;
  name: string;
  detail: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.015] p-3">

      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.05] text-[9px] font-black text-white/35">
        {rank}
      </div>

      <div className="flex-1">

        <p className="text-xs font-bold text-white/75">
          {name}
        </p>

        <p className="mt-0.5 text-[9px] text-white/25">
          {detail}
        </p>

      </div>

      <span className="text-white/15">
        →
      </span>

    </div>
  );
}

/* ============================================================
   TOOLS
============================================================ */

function DarkTool({
  number,
  title,
  text,
  href,
}: {
  number: string;
  title: string;
  text: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-white/[0.08] bg-[#0d101e] p-5 transition hover:border-white/[0.14] hover:bg-[#101323]"
    >

      <div className="flex items-center justify-between">

        <span className="text-[9px] font-black tracking-[0.15em] text-[#8e88ff]">
          {number}
        </span>

        <span className="text-white/15 transition group-hover:text-[#8e88ff]">
          →
        </span>

      </div>

      <h3 className="mt-6 text-sm font-extrabold text-white/80">
        {title}
      </h3>

      <p className="mt-2 text-[11px] leading-5 text-white/30">
        {text}
      </p>

    </Link>
  );
}

/* ============================================================
   FEATURE
============================================================ */

function FeatureCardDark({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#0d101e] p-6 transition hover:border-white/[0.13]">

      <span className="text-[10px] font-black tracking-[0.15em] text-[#8e88ff]">
        {number}
      </span>

      <h3 className="mt-6 text-base font-extrabold text-white/90">
        {title}
      </h3>

      <p className="mt-2 text-xs leading-6 text-white/35">
        {text}
      </p>

    </div>
  );
}

/* ============================================================
   PUBLIC GAME CARD
============================================================ */

function PublicGameCardDark({
  title,
  subtitle,
  description,
  href,
  short,
  type,
}: {
  title: string;
  subtitle: string;
  description: string;
  href: string;
  short: string;
  type: "bgmi" | "freefire";
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d101e] p-7 transition hover:border-white/[0.14]">

      <div
        className={`absolute -right-16 -top-16 h-40 w-40 rounded-full blur-[80px] ${
          type === "bgmi"
            ? "bg-indigo-500/15"
            : "bg-orange-500/10"
        }`}
      />

      <div className="relative">

        <div className="flex items-start justify-between">

          <div
            className={`flex h-12 w-12 items-center justify-center rounded-xl text-sm font-black ${
              type === "bgmi"
                ? "bg-[#6865ff]/15 text-[#9b96ff]"
                : "bg-orange-500/10 text-orange-400"
            }`}
          >
            {short}
          </div>

          <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/20">
            Game
          </span>

        </div>

        <p className="mt-7 text-[9px] font-bold uppercase tracking-[0.18em] text-[#8e88ff]">
          {subtitle}
        </p>

        <h3 className="mt-2 text-3xl font-black tracking-tight text-white">
          {title}
        </h3>

        <p className="mt-3 max-w-lg text-xs leading-6 text-white/35">
          {description}
        </p>

        <Link
          href={href}
          className="mt-7 inline-flex rounded-lg bg-[#6865ff] px-5 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-white transition hover:bg-[#7774ff]"
        >
          Start playing →
        </Link>

      </div>

    </div>
  );
}

/* ============================================================
   PROCESS
============================================================ */

function ProcessStepDark({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#0d101e] p-5">

      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#6865ff]/10 text-[9px] font-black text-[#9690ff]">
        {number}
      </div>

      <h3 className="mt-5 text-sm font-extrabold text-white/80">
        {title}
      </h3>

      <p className="mt-2 text-[11px] leading-5 text-white/30">
        {text}
      </p>

    </div>
  );
}

/* ============================================================
   LOADING
============================================================ */

function LoadingRows() {
  return (
    <div className="space-y-3 p-5">

      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="h-[76px] animate-pulse rounded-xl bg-white/[0.035]"
        />
      ))}

    </div>
  );
}

/* ============================================================
   EMPTY
============================================================ */

function EmptyState({
  large = false,
  dark = false,
}: {
  large?: boolean;
  dark?: boolean;
}) {
  return (
    <div
      className={`text-center ${
        large
          ? `rounded-2xl border p-12 ${
              dark
                ? "border-white/[0.08] bg-[#0d101e]"
                : "border-gray-200 bg-white"
            }`
          : "p-10"
      }`}
    >

      <div
        className={`mx-auto flex h-11 w-11 items-center justify-center rounded-xl text-sm font-black ${
          dark
            ? "bg-white/[0.05] text-white/30"
            : "bg-gray-100 text-gray-500"
        }`}
      >
        —
      </div>

      <h3
        className={`mt-4 text-sm font-bold ${
          dark
            ? "text-white/70"
            : "text-gray-700"
        }`}
      >
        No tournaments available
      </h3>

      <p
        className={`mx-auto mt-2 max-w-sm text-[11px] leading-5 ${
          dark
            ? "text-white/25"
            : "text-gray-400"
        }`}
      >
        New competitions will appear here when they
        are created.
      </p>

      <Link
        href="/tournaments"
        className="mt-5 inline-flex rounded-lg border border-white/10 px-4 py-2.5 text-[10px] font-bold text-[#8e88ff]"
      >
        Browse tournaments
      </Link>

    </div>
  );
}