"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");

  const checkAuth = async () => {
    try {
      const response = await fetch(
        "http://localhost:5001/api/auth/me",
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (
        response.ok &&
        data.success === true &&
        data.authenticated === true
      ) {
        setIsLoggedIn(true);

        // Pull the registered name for the profile avatar initial.
        // Adjust the field path below if your /auth/me payload nests
        // the user object differently (e.g. data.data.user.name).
        const registeredName =
          data?.user?.name ||
          data?.user?.username ||
          data?.user?.fullName ||
          "";

        setUserName(registeredName);
      } else {
        setIsLoggedIn(false);
        setUserName("");
      }
    } catch (error) {
      console.error("Auth check error:", error);
      setIsLoggedIn(false);
      setUserName("");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, [pathname]);

  const handleLogout = async () => {
    try {
      const response = await fetch(
        "http://localhost:5001/api/auth/logout",
        {
          method: "POST",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setIsLoggedIn(false);
        setMenuOpen(false);

        router.replace("/");
        router.refresh();
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const closeMobileMenu = () => {
    setMenuOpen(false);
  };

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  // Avatar initial derived from the registered name — falls back to "U"
  // if the name hasn't loaded yet.
  const avatarInitial = userName.trim().charAt(0).toUpperCase() || "U";

  const navItems = [
    {
      href: "/tournaments",
      label: "Tournaments",
      icon: "🏆",
    },
    {
      href: "/tdm",
      label: "TDM / Clash",
      icon: "⚔",
    },
    {
      href: "/my-tournaments",
      label: "My Games",
      icon: "🎮",
    },
    {
      href: "/leaderboard",
      label: "Leaderboard",
      icon: "♛",
    },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-[#080A10]/90 backdrop-blur-xl">
        <nav className="mx-auto flex h-[72px] max-w-[1400px] items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* =====================================================
              BRAND
          ====================================================== */}

          <Link href="/" className="group flex shrink-0 items-center">
            <span className="text-[19px] font-black uppercase tracking-[0.02em] text-white transition-opacity duration-200 group-hover:opacity-90">
              Top1
              <span className="bg-gradient-to-r from-indigo-400 to-cyan-300 bg-clip-text text-transparent">
                Squad
              </span>
            </span>
          </Link>

          {/* =====================================================
              DESKTOP NAV
          ====================================================== */}

          <div className="ml-8 hidden h-full items-center gap-1 lg:flex">
            <Link
              href="/"
              className={`relative flex h-full items-center px-3 text-[12px] font-semibold tracking-wide transition ${
                isActive("/")
                  ? "text-white"
                  : "text-slate-400 hover:text-slate-100"
              }`}
            >
              Home
              {isActive("/") && (
                <span className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full bg-gradient-to-r from-indigo-400 to-cyan-300" />
              )}
            </Link>

            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex h-full items-center gap-1.5 px-3 text-[12px] font-semibold tracking-wide transition ${
                  isActive(item.href)
                    ? "text-white"
                    : "text-slate-400 hover:text-slate-100"
                }`}
              >
                <span className="text-[11px] opacity-70">{item.icon}</span>
                {item.label}

                {isActive(item.href) && (
                  <span className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full bg-gradient-to-r from-indigo-400 to-cyan-300" />
                )}
              </Link>
            ))}
          </div>

          {/* =====================================================
              RIGHT ACTIONS
          ====================================================== */}

          <div className="hidden items-center gap-2 md:flex">
            {/* Search */}
            <button
              type="button"
              aria-label="Search"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-slate-400 transition hover:border-white/20 hover:text-white"
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-4-4" />
              </svg>
            </button>

            {/* Notifications */}
            {isLoggedIn && (
              <Link
                href="/notifications"
                aria-label="Notifications"
                className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-slate-400 transition hover:border-white/20 hover:text-white"
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
                  <path d="M10 21h4" />
                </svg>

                <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-indigo-400" />
              </Link>
            )}

            {/* Divider */}
            <div className="mx-1 h-7 w-px bg-white/10" />

            {/* Auth */}
            {!loading && !isLoggedIn && (
              <>
                <Link
                  href="/login"
                  className="rounded-lg px-3.5 py-2 text-[12px] font-bold text-slate-300 transition hover:bg-white/5 hover:text-white"
                >
                  Login
                </Link>

                <Link
                  href="/register"
                  className="rounded-lg bg-gradient-to-r from-indigo-500 to-indigo-600 px-4 py-2.5 text-[12px] font-bold text-white shadow-[0_0_0_1px_rgba(255,255,255,0.06)] transition hover:from-indigo-400 hover:to-indigo-500"
                >
                  Create Account
                </Link>
              </>
            )}

            {!loading && isLoggedIn && (
              <>
                <Link
                  href="/profile"
                  title="Profile"
                  className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white/10 bg-gradient-to-br from-indigo-500 to-cyan-400 text-[11px] font-extrabold text-white transition hover:border-white/30"
                >
                  {avatarInitial}
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-lg border border-white/10 px-3 py-2 text-[11px] font-bold text-slate-400 transition hover:border-red-400/30 hover:bg-red-500/5 hover:text-red-400"
                >
                  Logout
                </button>
              </>
            )}
          </div>

          {/* =====================================================
              MOBILE MENU BUTTON
          ====================================================== */}

          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation"
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-slate-200 transition hover:border-white/20 lg:hidden"
          >
            {menuOpen ? (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M6 6l12 12" />
                <path d="M18 6 6 18" />
              </svg>
            ) : (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M4 7h16" />
                <path d="M4 12h16" />
                <path d="M4 17h16" />
              </svg>
            )}
          </button>
        </nav>

        {/* =====================================================
            MOBILE NAVIGATION
        ====================================================== */}

        {menuOpen && (
          <div className="border-t border-white/10 bg-[#080A10] px-4 py-4 shadow-lg lg:hidden">
            <div className="mx-auto max-w-[1400px]">
              {/* Mobile profile summary */}
              {isLoggedIn && (
                <div className="mb-3 flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <Link
                    href="/profile"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-cyan-400 text-xs font-bold text-white">
                      {avatarInitial}
                    </div>

                    <div>
                      <p className="text-xs font-bold text-white">
                        Your Profile
                      </p>
                      <p className="text-[10px] text-slate-500">
                        View account
                      </p>
                    </div>
                  </Link>
                </div>
              )}

              {/* Navigation links */}
              <div className="grid gap-1">
                <Link
                  href="/"
                  onClick={closeMobileMenu}
                  className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
                    isActive("/")
                      ? "bg-white/[0.06] text-white"
                      : "text-slate-400 hover:bg-white/[0.03]"
                  }`}
                >
                  Home
                </Link>

                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMobileMenu}
                    className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition ${
                      isActive(item.href)
                        ? "bg-white/[0.06] text-white"
                        : "text-slate-400 hover:bg-white/[0.03]"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span className="text-sm">{item.icon}</span>
                      {item.label}
                    </span>

                    <span className="text-slate-600">→</span>
                  </Link>
                ))}

                {isLoggedIn && (
                  <Link
                    href="/notifications"
                    onClick={closeMobileMenu}
                    className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold text-slate-400 transition hover:bg-white/[0.03]"
                  >
                    <span className="flex items-center gap-3">
                      <span>🔔</span>
                      Notifications
                    </span>

                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                  </Link>
                )}
              </div>

              {/* Bottom actions */}
              <div className="mt-3 border-t border-white/10 pt-3">
                {!loading && !isLoggedIn && (
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href="/login"
                      onClick={closeMobileMenu}
                      className="rounded-xl border border-white/10 px-4 py-3 text-center text-sm font-bold text-slate-300"
                    >
                      Login
                    </Link>

                    <Link
                      href="/register"
                      onClick={closeMobileMenu}
                      className="rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 px-4 py-3 text-center text-sm font-bold text-white"
                    >
                      Create Account
                    </Link>
                  </div>
                )}

                {!loading && isLoggedIn && (
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full rounded-xl border border-red-400/20 bg-red-500/5 px-4 py-3 text-left text-sm font-bold text-red-400"
                  >
                    Sign out
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
