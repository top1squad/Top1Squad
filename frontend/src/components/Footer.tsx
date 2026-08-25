import Link from "next/link";
import { Rajdhani, JetBrains_Mono } from "next/font/google";

/* ============================================================
   FONTS — display face for the HUD/wordmark feel,
   mono face for eyebrow labels & stats
============================================================ */

const rajdhani = Rajdhani({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
});

export default function Footer() {
  return (
    <footer
      id="top"
      className={`${rajdhani.variable} ${jetbrainsMono.variable} relative overflow-hidden border-t border-white/10 bg-[#05070C] text-slate-200`}
    >
      {/* =====================================================
          AMBIENT BACKGROUND — grid + glow + scanline
      ===================================================== */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* HUD grid */}
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #4C8DFF 1px, transparent 1px), linear-gradient(to bottom, #4C8DFF 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />

        {/* Glow blobs */}
        <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-blue-600/10 blur-[100px]" />
        <div className="absolute -left-40 bottom-0 h-80 w-80 rounded-full bg-cyan-500/10 blur-[100px]" />

        {/* Top scanline sweep */}
        <div className="absolute inset-x-0 top-0 h-px overflow-hidden">
          <div className="h-full w-1/3 animate-[scan_6s_linear_infinite] bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
        </div>
      </div>

      {/* Top hairline gradient */}
      <div className="relative h-px w-full bg-gradient-to-r from-transparent via-blue-500/60 to-transparent" />

      <div className="relative mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        {/* =====================================================
            MAIN FOOTER
        ===================================================== */}

        <div className="grid gap-14 py-16 md:grid-cols-2 lg:grid-cols-[1.6fr_0.8fr_0.8fr_1fr] lg:gap-12 lg:py-20">
          {/* =====================================================
              BRAND
          ===================================================== */}

          <div className="max-w-md">
            <Link href="/" className="group inline-flex items-center">
              {/* Brand — wordmark only, no logo */}
              <span
                className="font-display text-2xl font-bold uppercase tracking-wide text-white transition-opacity duration-200 group-hover:opacity-90"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Top1
                <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  Squad
                </span>
              </span>
            </Link>

            <p className="mt-5 max-w-sm text-sm leading-7 text-slate-400">
              India&apos;s competitive gaming platform for BGMI and Free Fire
              players. Join tournaments, build your squad, compete with
              players and climb the leaderboard.
            </p>

            {/* Platform status */}
            <div
              className="mt-6 inline-flex items-center gap-2 border border-cyan-400/20 bg-cyan-400/[0.06] px-3.5 py-2"
              style={{ clipPath: "polygon(8px 0,100% 0,100% 100%,0 100%,0 8px)" }}
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>

              <span
                className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-300"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Competitive gaming platform
              </span>
            </div>

            {/* Social buttons */}
            <div className="mt-7 flex items-center gap-3">
              <SocialIconButton
                href="https://www.instagram.com/top1squad/"
                label="Top1Squad Instagram"
                hoverClass="hover:border-pink-400/40 hover:shadow-[0_0_20px_-4px_rgba(236,72,153,0.5)]"
              >
                <InstagramIcon />
              </SocialIconButton>

              <SocialIconButton
                href="https://www.youtube.com/@Top1_Squad"
                label="Top1Squad YouTube"
                hoverClass="hover:border-red-400/40 hover:shadow-[0_0_20px_-4px_rgba(248,113,113,0.5)]"
              >
                <YouTubeIcon />
              </SocialIconButton>

              <SocialIconButton
                href="https://x.com/top1squad"
                label="Top1Squad on X"
                hoverClass="hover:border-slate-300/40 hover:shadow-[0_0_20px_-4px_rgba(255,255,255,0.35)]"
              >
                <XIcon />
              </SocialIconButton>

              <span
                className="ml-1 text-[10px] font-medium uppercase tracking-widest text-slate-500"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Follow us
              </span>
            </div>
          </div>

          {/* =====================================================
              PLATFORM
          ===================================================== */}

          <FooterColumn title="Platform">
            <FooterLink href="/tournaments" text="Tournaments" />
            <FooterLink href="/leaderboard" text="Leaderboard" />
            <FooterLink href="/matches" text="Matches" />
            <FooterLink href="/my-tournaments" text="My Tournaments" />
          </FooterColumn>

          {/* =====================================================
              COMPANY
          ===================================================== */}

          <FooterColumn title="Company">
            <FooterLink href="/about" text="About Us" />
            <FooterLink href="/help" text="Help" />
            <FooterLink href="/profile" text="Profile" />
            <FooterLink href="/my-matches" text="My Matches" />
          </FooterColumn>

          {/* =====================================================
              CONNECT
          ===================================================== */}

          <div>
            <h3
              className="text-xs font-bold uppercase tracking-[0.18em] text-white"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Connect With Us
            </h3>

            <p className="mt-4 text-xs leading-6 text-slate-500">
              Stay updated with new tournaments, events and gaming
              announcements.
            </p>

            {/* Social cards */}
            <div className="mt-5 space-y-2.5">
              <SocialCard
                href="https://www.youtube.com/@Top1_Squad"
                iconBg="bg-red-500/10"
                name="YouTube"
                handle="@Top1_Squad"
                hoverClass="hover:border-red-400/30"
                arrowHoverClass="group-hover:text-red-400"
              >
                <YouTubeIcon />
              </SocialCard>

              <SocialCard
                href="https://www.instagram.com/top1squad/"
                iconBg="bg-pink-500/10"
                name="Instagram"
                handle="@top1squad"
                hoverClass="hover:border-pink-400/30"
                arrowHoverClass="group-hover:text-pink-400"
              >
                <InstagramIcon />
              </SocialCard>

              <SocialCard
                href="https://x.com/top1squad"
                iconBg="bg-slate-100/10"
                name="X (Twitter)"
                handle="@top1squad"
                hoverClass="hover:border-slate-300/30"
                arrowHoverClass="group-hover:text-slate-200"
              >
                <XIcon />
              </SocialCard>
            </div>
          </div>
        </div>

        {/* =====================================================
            SUPPORTED GAMES
        ===================================================== */}

        <div className="border-y border-white/10 py-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p
                className="text-[9px] font-bold uppercase tracking-[0.28em] text-slate-500"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Supported Games
              </p>

              <div className="mt-3 flex items-center gap-2.5">
                <GameBadge label="BGMI" glow="shadow-[0_0_18px_-6px_rgba(76,141,255,0.7)]" />
                <GameBadge label="FREE FIRE" glow="shadow-[0_0_18px_-6px_rgba(56,225,255,0.6)]" />
              </div>
            </div>

            <div className="max-w-md sm:text-right">
              <p className="text-xs font-semibold text-slate-300">
                Built for competitive gamers.
              </p>
              <p className="mt-1 text-[10px] leading-5 text-slate-500">
                More games and competitive experiences are coming to
                Top1Squad as the community grows.
              </p>
            </div>
          </div>
        </div>

        {/* =====================================================
            BOTTOM BAR
        ===================================================== */}

        <div className="flex flex-col gap-5 py-7 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-500">
              © 2026{" "}
              <span
                className="font-bold text-slate-200"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Top1Squad
              </span>
              . All rights reserved.
            </p>

            <p
              className="mt-1 text-[9px] uppercase tracking-[0.14em] text-slate-600"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Compete. Conquer. Become Top1.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-5">
            <FooterBottomLink href="/" text="Home" />
            <FooterBottomLink href="/tournaments" text="Tournaments" />
            <FooterBottomLink href="/leaderboard" text="Leaderboard" />
            <FooterBottomLink href="/profile" text="Profile" />

            {/* Back to top */}
            <a
              href="#top"
              className="group flex items-center gap-2 border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-[10px] font-bold uppercase tracking-wide text-slate-400 transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan-400/30 hover:text-cyan-300"
              style={{
                fontFamily: "var(--font-mono)",
                clipPath: "polygon(8px 0,100% 0,100% 100%,0 100%,0 8px)",
              }}
            >
              Back to top
              <span className="transition-transform duration-200 group-hover:-translate-y-0.5">
                ↑
              </span>
            </a>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scan {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
      `}</style>
    </footer>
  );
}

/* ============================================================
   GAME BADGE
============================================================ */

function GameBadge({ label, glow }: { label: string; glow: string }) {
  return (
    <span
      className={`border border-white/10 bg-white/[0.04] px-3.5 py-2 text-[10px] font-bold tracking-wide text-white ${glow}`}
      style={{
        fontFamily: "var(--font-mono)",
        clipPath: "polygon(6px 0,100% 0,100% 100%,0 100%,0 6px)",
      }}
    >
      {label}
    </span>
  );
}

/* ============================================================
   SOCIAL ICON BUTTON (top row)
============================================================ */

function SocialIconButton({
  href,
  label,
  hoverClass,
  children,
}: {
  href: string;
  label: string;
  hoverClass: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className={`group relative flex h-11 w-11 items-center justify-center border border-white/10 bg-white/[0.03] transition-all duration-200 hover:-translate-y-1 ${hoverClass}`}
      style={{ clipPath: "polygon(8px 0,100% 0,100% 100%,0 100%,0 8px)" }}
    >
      <span className="h-5 w-5 transition-transform duration-200 group-hover:scale-110">
        {children}
      </span>
    </a>
  );
}

/* ============================================================
   SOCIAL CARD (Connect column)
============================================================ */

function SocialCard({
  href,
  iconBg,
  name,
  handle,
  hoverClass,
  arrowHoverClass,
  children,
}: {
  href: string;
  iconBg: string;
  name: string;
  handle: string;
  hoverClass: string;
  arrowHoverClass: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`group flex items-center gap-3 border border-white/10 bg-white/[0.02] p-3 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/[0.04] ${hoverClass}`}
      style={{ clipPath: "polygon(10px 0,100% 0,100% 100%,0 100%,0 10px)" }}
    >
      <span className={`flex h-9 w-9 items-center justify-center ${iconBg}`}>
        <span className="h-4.5 w-4.5">{children}</span>
      </span>

      <span className="flex flex-col">
        <span className="text-[11px] font-bold text-slate-200">{name}</span>
        <span
          className="text-[10px] text-slate-500"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {handle}
        </span>
      </span>

      <span
        className={`ml-auto text-slate-600 transition-transform group-hover:translate-x-1 ${arrowHoverClass}`}
      >
        →
      </span>
    </a>
  );
}

/* ============================================================
   ICONS
============================================================ */

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id="igGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f58529" />
          <stop offset="45%" stopColor="#dd2a7b" />
          <stop offset="75%" stopColor="#8134af" />
          <stop offset="100%" stopColor="#515bd4" />
        </linearGradient>
      </defs>
      <rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="url(#igGrad)" strokeWidth="2" />
      <circle cx="12" cy="12" r="4" fill="none" stroke="url(#igGrad)" strokeWidth="2" />
      <circle cx="17.5" cy="6.5" r="1.2" fill="#dd2a7b" />
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-full w-full" aria-hidden="true">
      <rect x="3" y="6" width="18" height="12" rx="4" fill="#FF0000" />
      <path d="M10 9L16 12L10 15V9Z" fill="white" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-full w-full" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" fill="#000000" />
      <path
        d="M7 7L17 17M17 7L7 17"
        stroke="white"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ============================================================
   FOOTER COLUMN
============================================================ */

function FooterColumn({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3
        className="text-xs font-bold uppercase tracking-[0.18em] text-white"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {title}
      </h3>

      <div className="mt-5 flex flex-col gap-3.5">{children}</div>
    </div>
  );
}

/* ============================================================
   FOOTER LINK
============================================================ */

function FooterLink({ href, text }: { href: string; text: string }) {
  return (
    <Link
      href={href}
      className="group flex w-fit items-center gap-1.5 text-[13px] font-medium text-slate-400 transition-all duration-200 hover:translate-x-0.5 hover:text-cyan-300"
    >
      <span>{text}</span>
      <span className="text-[10px] text-transparent transition-colors group-hover:text-cyan-400">
        →
      </span>
    </Link>
  );
}

/* ============================================================
   BOTTOM LINK
============================================================ */

function FooterBottomLink({ href, text }: { href: string; text: string }) {
  return (
    <Link
      href={href}
      className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 transition-colors hover:text-cyan-300"
      style={{ fontFamily: "var(--font-mono)" }}
    >
      {text}
    </Link>
  );
}
