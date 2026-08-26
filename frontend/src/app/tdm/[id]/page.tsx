"use client";

import React, {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useParams, useRouter } from "next/navigation";

// ======================================================
// API
// ======================================================

const RAW_API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

const API_URL = RAW_API_URL
  .trim()
  .replace(/\/+$/, "")
  .replace(/\/api$/, "");

// ======================================================
// TYPES
// ======================================================

type Match = {
  _id: string;

  name?: string;
  title?: string;
  type?: string;
  mode?: string;

  game?: "BGMI" | "Free Fire" | string;

  prize?: number;
  entryFee?: number;

  date?: string;
  time?: string;

  maxTeams?: number;
  registeredTeams?: number;

  status?: string;
  map?: string;

  paymentQr?: string;
  qrCode?: string;
  upiQr?: string;
  qrImage?: string;
};

type User = {
  _id?: string;
  id?: string;

  username?: string;
  name?: string;
  fullName?: string;
  email?: string;

  gameUid?: string;

  bgmiUid?: string;
  pubgUid?: string;
  pubgLevelId?: string;

  freeFireUid?: string;
  freefireUid?: string;
  freefireLevelId?: string;
};

type Player = {
  gameUid: string;
  playerName: string;
  user: string;
};

type PlayerValidation = {
  checking: boolean;
  checked: boolean;
  valid: boolean;

  message: string;
  playerName: string;
  userId: string;
};

// ======================================================
// HELPERS
// ======================================================

const createEmptyPlayer = (): Player => ({
  gameUid: "",
  playerName: "",
  user: "",
});

const createEmptyValidation = (): PlayerValidation => ({
  checking: false,
  checked: false,
  valid: false,
  message: "",
  playerName: "",
  userId: "",
});

// ======================================================
// PAGE
// ======================================================

export default function TDMRegistrationPage() {
  const params = useParams();
  const router = useRouter();

  const tournamentId = useMemo(() => {
    const value = params?.id;

    if (typeof value === "string") {
      return value.trim();
    }

    if (Array.isArray(value) && value.length > 0) {
      return String(value[0]).trim();
    }

    return "";
  }, [params]);

  // ====================================================
  // STATE
  // ====================================================

  const [match, setMatch] = useState<Match | null>(null);
  const [loadingMatch, setLoadingMatch] = useState(true);

  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const [teamName, setTeamName] = useState("");

  const [teamSlot] = useState<"A" | "B">("A");

  const [players, setPlayers] = useState<string[]>([
    "",
    "",
    "",
    "",
  ]);

  const [validatedPlayers, setValidatedPlayers] = useState<Player[]>([
    createEmptyPlayer(),
    createEmptyPlayer(),
    createEmptyPlayer(),
    createEmptyPlayer(),
  ]);

  const [validation, setValidation] = useState<PlayerValidation[]>([
    createEmptyValidation(),
    createEmptyValidation(),
    createEmptyValidation(),
    createEmptyValidation(),
  ]);

  const [utr, setUtr] = useState("");

  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ====================================================
  // GAME
  // ====================================================

  const game =
    match?.game === "Free Fire"
      ? "Free Fire"
      : "BGMI";

  const matchName =
    match?.name ||
    match?.title ||
    "TDM Tournament";

  const qrCode =
    match?.paymentQr ||
    match?.qrCode ||
    match?.upiQr ||
    match?.qrImage ||
    "/payment/upi-qr.png";

  // ====================================================
  // LOAD MATCH
  // ====================================================

  useEffect(() => {
    if (!tournamentId) {
      setLoadingMatch(false);
      setError("Invalid tournament ID.");
      return;
    }

    let cancelled = false;

    const loadMatch = async () => {
      try {
        setLoadingMatch(true);
        setError("");

        const url =
          `${API_URL}/api/squad-clash-tdm/${encodeURIComponent(
            tournamentId
          )}`;

        const response = await fetch(url, {
          method: "GET",
          credentials: "include",
          cache: "no-store",
          headers: {
            Accept: "application/json",
          },
        });

        const text = await response.text();

        let data: any = {};

        try {
          data = text ? JSON.parse(text) : {};
        } catch {
          console.error(
            "Invalid match response:",
            text
          );
        }

        if (!response.ok) {
          throw new Error(
            data?.message ||
              data?.error ||
              `Tournament request failed (${response.status}).`
          );
        }

        const matchData =
          data?.match ||
          data?.tournament ||
          data?.data?.match ||
          data?.data?.tournament ||
          data?.data ||
          data;

        if (!matchData?._id) {
          throw new Error(
            "Tournament information was not returned by the server."
          );
        }

        if (!cancelled) {
          setMatch(matchData);
        }
      } catch (err: any) {
        console.error(
          "Tournament load error:",
          err
        );

        if (!cancelled) {
          setMatch(null);

          setError(
            err?.message ||
              "Unable to load tournament."
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingMatch(false);
        }
      }
    };

    loadMatch();

    return () => {
      cancelled = true;
    };
  }, [tournamentId]);

  // ====================================================
  // LOAD USER
  // ====================================================

  useEffect(() => {
    if (!match?.game) return;

    let cancelled = false;

    const loadUser = async () => {
      try {
        setLoadingUser(true);

        const response = await fetch(
          `${API_URL}/api/auth/me`,
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
            headers: {
              Accept: "application/json",
            },
          }
        );

        const text = await response.text();

        let data: any = {};

        try {
          data = text ? JSON.parse(text) : {};
        } catch {
          console.error(
            "Invalid user response:",
            text
          );
        }

        if (!response.ok) {
          throw new Error(
            data?.message ||
              data?.error ||
              "Please login before registering."
          );
        }

        const currentUser =
          data?.user ||
          data?.data?.user ||
          data?.data ||
          data;

        if (!currentUser) {
          throw new Error(
            "User information was not returned."
          );
        }

        if (cancelled) return;

        setUser(currentUser);

        const savedUid =
          match.game === "Free Fire"
            ? currentUser?.freeFireUid ||
              currentUser?.freefireUid ||
              currentUser?.freefireLevelId ||
              currentUser?.gameUid ||
              ""
            : currentUser?.bgmiUid ||
              currentUser?.pubgUid ||
              currentUser?.pubgLevelId ||
              currentUser?.gameUid ||
              "";

        const cleanUid = String(
          savedUid || ""
        ).trim();

        if (cleanUid) {
          setPlayers((old) => {
            const next = [...old];

            next[0] = cleanUid;

            return next.slice(0, 4);
          });
        } else {
          setError(
            `Please add your ${match.game} UID in your profile first.`
          );
        }
      } catch (err: any) {
        console.error(
          "User load error:",
          err
        );

        if (!cancelled) {
          setUser(null);

          setError(
            err?.message ||
              "Please login before registering."
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingUser(false);
        }
      }
    };

    loadUser();

    return () => {
      cancelled = true;
    };
  }, [match?.game]);

  // ====================================================
  // VALIDATION RESPONSE
  // ====================================================

  const processValidationResponse = (
    data: any,
    cleanUid: string
  ) => {
    const player =
      data?.player ||
      data?.data?.player ||
      data?.data?.user ||
      data?.user ||
      data?.data ||
      null;

    const playerName =
      player?.playerName ||
      player?.name ||
      player?.username ||
      player?.fullName ||
      data?.playerName ||
      data?.username ||
      "";

    const userId =
      player?.userId ||
      player?.user?._id ||
      player?.user?.id ||
      player?.user ||
      player?._id ||
      player?.id ||
      data?.userId ||
      data?.user?._id ||
      data?.user?.id ||
      "";

    const returnedUid =
      player?.gameUid ||
      player?.uid ||
      player?.gameId ||
      data?.gameUid ||
      data?.uid ||
      cleanUid;

    const valid =
      data?.valid === true ||
      data?.success === true ||
      Boolean(player && userId);

    return {
      valid,

      playerName: String(
        playerName || "Registered Player"
      ).trim(),

      userId: String(
        userId || ""
      ).trim(),

      gameUid: String(
        returnedUid || cleanUid
      ).trim(),

      message:
        data?.message ||
        data?.error ||
        "",
    };
  };

  // ====================================================
  // VALIDATION API
  // ====================================================

  const validatePlayerUid = async (
    index: number,
    uid: string
  ): Promise<boolean> => {
    const cleanUid = String(
      uid || ""
    ).trim();

    if (!cleanUid) {
      setValidation((old) => {
        const next = [...old];

        next[index] = {
          ...createEmptyValidation(),

          checked: true,

          message:
            `${game} ID is required.`,
        };

        return next;
      });

      setValidatedPlayers((old) => {
        const next = [...old];

        next[index] =
          createEmptyPlayer();

        return next;
      });

      return false;
    }

    if (!tournamentId) {
      setValidation((old) => {
        const next = [...old];

        next[index] = {
          ...createEmptyValidation(),

          checked: true,

          message:
            "Invalid tournament ID.",
        };

        return next;
      });

      return false;
    }

    setValidation((old) => {
      const next = [...old];

      next[index] = {
        checking: true,
        checked: false,
        valid: false,
        message: "",
        playerName: "",
        userId: "",
      };

      return next;
    });

    try {
      const query = new URLSearchParams();

      query.set(
        "tournamentId",
        tournamentId
      );

      query.set(
        "uid",
        cleanUid
      );

      query.set(
        "game",
        game
      );

      const url =
        `${API_URL}/api/squad-clash-tdm/registrations/validate-player-uid?${query.toString()}`;

      const response = await fetch(
        url,
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
          headers: {
            Accept: "application/json",
          },
        }
      );

      const text =
        await response.text();

      let data: any = {};

      try {
        data = text
          ? JSON.parse(text)
          : {};
      } catch {
        console.error(
          "Invalid validation response:",
          text
        );
      }

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            `Player validation failed (${response.status}).`
        );
      }

      const parsed =
        processValidationResponse(
          data,
          cleanUid
        );

      if (
        parsed.valid &&
        parsed.userId
      ) {
        const normalizedPlayer: Player = {
          gameUid:
            parsed.gameUid,

          playerName:
            parsed.playerName ||
            "Registered Player",

          user:
            parsed.userId,
        };

        setValidatedPlayers(
          (old) => {
            const next = [...old];

            next[index] =
              normalizedPlayer;

            return next;
          }
        );

        setValidation((old) => {
          const next = [...old];

          next[index] = {
            checking: false,
            checked: true,
            valid: true,

            message:
              "Player verified successfully.",

            playerName:
              normalizedPlayer.playerName,

            userId:
              normalizedPlayer.user,
          };

          return next;
        });

        return true;
      }

      throw new Error(
        parsed.message ||
          "This Game ID is not registered."
      );
    } catch (err: any) {
      console.error(
        "Player validation error:",
        err
      );

      setValidation((old) => {
        const next = [...old];

        next[index] = {
          checking: false,
          checked: true,
          valid: false,

          message:
            err?.message ||
            `${game} ID is not registered.`,

          playerName: "",
          userId: "",
        };

        return next;
      });

      setValidatedPlayers((old) => {
        const next = [...old];

        next[index] =
          createEmptyPlayer();

        return next;
      });

      return false;
    }
  };

  // ====================================================
  // AUTO VERIFY PLAYER 1
  // ====================================================

  useEffect(() => {
    const uid =
      players[0]?.trim();

    if (
      !uid ||
      !match ||
      !tournamentId
    ) {
      return;
    }

    validatePlayerUid(
      0,
      uid
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    players[0],
    game,
    tournamentId,
    match?._id,
  ]);

  // ====================================================
  // UPDATE PLAYER
  // ====================================================

  const updatePlayer = (
    index: number,
    value: string
  ) => {
    if (index === 0) return;

    setPlayers((old) => {
      const next = [...old];

      next[index] = value;

      return next.slice(0, 4);
    });

    setValidation((old) => {
      const next = [...old];

      next[index] =
        createEmptyValidation();

      return next;
    });

    setValidatedPlayers((old) => {
      const next = [...old];

      next[index] =
        createEmptyPlayer();

      return next;
    });

    setError("");
    setSuccess("");
  };

  // ====================================================
  // ALL VALID
  // ====================================================

  const allPlayersValid = useMemo(() => {
    if (
      players.length !== 4 ||
      validation.length !== 4 ||
      validatedPlayers.length !== 4
    ) {
      return false;
    }

    return players.every(
      (id, index) => {
        const cleanId =
          String(id || "").trim();

        const v =
          validation[index];

        const p =
          validatedPlayers[index];

        return (
          Boolean(cleanId) &&
          v.checked &&
          v.valid &&
          Boolean(
            v.userId.trim()
          ) &&
          Boolean(
            p.gameUid.trim()
          ) &&
          Boolean(
            p.user.trim()
          )
        );
      }
    );
  }, [
    players,
    validation,
    validatedPlayers,
  ]);

  const verifiedCount =
    validation.filter(
      (v) =>
        v.checked &&
        v.valid
    ).length;

  // ====================================================
  // SUBMIT
  // ====================================================

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!match?._id) {
      setError(
        "Tournament information is missing."
      );

      return;
    }

    if (!user) {
      setError(
        "Please login before registering."
      );

      return;
    }

    const cleanTeamName =
      teamName.trim();

    if (
      cleanTeamName.length < 2
    ) {
      setError(
        "Please enter a team name."
      );

      return;
    }

    const cleanPlayers =
      players
        .slice(0, 4)
        .map((id) =>
          String(id || "").trim()
        );

    if (
      cleanPlayers.length !== 4 ||
      cleanPlayers.some(
        (id) => !id
      )
    ) {
      setError(
        `Please enter all 4 ${game} IDs.`
      );

      return;
    }

    const uniqueIds =
      new Set(
        cleanPlayers.map(
          (id) =>
            id.toLowerCase()
        )
      );

    if (
      uniqueIds.size !== 4
    ) {
      setError(
        "Each player must have a different Game ID."
      );

      return;
    }

    const savedUserUid =
      game === "BGMI"
        ? user.bgmiUid ||
          user.pubgUid ||
          user.pubgLevelId ||
          user.gameUid ||
          ""
        : user.freeFireUid ||
          user.freefireUid ||
          user.freefireLevelId ||
          user.gameUid ||
          "";

    if (
      !String(
        savedUserUid
      ).trim()
    ) {
      setError(
        `Your ${game} ID is not saved in your profile.`
      );

      return;
    }

    if (
      cleanPlayers[0]
        .toLowerCase() !==
      String(savedUserUid)
        .trim()
        .toLowerCase()
    ) {
      setError(
        `Player 1 must use your saved ${game} ID.`
      );

      return;
    }

    if (!allPlayersValid) {
      setError(
        `Please verify all 4 ${game} IDs first.`
      );

      return;
    }

    const cleanUtr =
      utr.trim().toUpperCase();

    if (!cleanUtr) {
      setError(
        "Please enter your payment UTR / transaction ID."
      );

      return;
    }

    const playerObjects: Player[] =
      cleanPlayers.map(
        (gameUid, index) => ({
          gameUid,

          playerName:
            validatedPlayers[
              index
            ].playerName.trim(),

          user:
            validatedPlayers[
              index
            ].user.trim(),
        })
      );

    const requestBody = {
      tournamentId:
        match._id,

      teamSlot,

      teamName:
        cleanTeamName,

      leaderGameUid:
        cleanPlayers[0],

      players:
        playerObjects,

      utr:
        cleanUtr,
    };

    try {
      setSubmitting(true);

      const response =
        await fetch(
          `${API_URL}/api/squad-clash-tdm/registrations`,
          {
            method: "POST",

            credentials:
              "include",

            headers: {
              "Content-Type":
                "application/json",

              Accept:
                "application/json",
            },

            body:
              JSON.stringify(
                requestBody
              ),
          }
        );

      const responseText =
        await response.text();

      let data: any = {};

      try {
        data =
          responseText
            ? JSON.parse(
                responseText
              )
            : {};
      } catch {
        console.error(
          "Invalid registration response:",
          responseText
        );
      }

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            `Registration failed (${response.status}).`
        );
      }

      setSuccess(
        data?.message ||
          "Your team has been registered successfully!"
      );

      setTimeout(() => {
        router.push(
          "/my-tournaments"
        );

        router.refresh();
      }, 1200);
    } catch (err: any) {
      console.error(
        "Registration error:",
        err
      );

      setError(
        err?.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ====================================================
  // LOADING
  // ====================================================

  if (
    loadingMatch ||
    loadingUser
  ) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black px-5 text-white">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-gray-800 border-t-orange-500" />

          <p className="mt-4 text-sm text-gray-400">
            Getting your tournament ready...
          </p>
        </div>
      </main>
    );
  }

  // ====================================================
  // NOT FOUND
  // ====================================================

  if (!match) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black px-5 text-white">
        <div className="w-full max-w-sm rounded-3xl border border-gray-800 bg-[#151515] p-7 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 text-2xl">
            !
          </div>

          <h1 className="mt-5 text-xl font-bold">
            Tournament not found
          </h1>

          <p className="mt-3 text-sm leading-6 text-gray-500">
            {error ||
              "We couldn't load this tournament."}
          </p>

          <button
            type="button"
            onClick={() =>
              router.back()
            }
            className="mt-6 w-full rounded-xl bg-white px-4 py-3 text-sm font-bold text-black"
          >
            Go Back
          </button>
        </div>
      </main>
    );
  }

  // ====================================================
  // RENDER
  // ====================================================

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto w-full max-w-2xl px-4 pb-12 pt-4 sm:px-6 sm:pt-8">

        {/* TOP BAR */}

        <div className="mb-6 flex items-center gap-3">
          <button
            type="button"
            onClick={() =>
              router.back()
            }
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-800 bg-[#151515] text-lg text-gray-300"
          >
            ←
          </button>

          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
              Registration
            </p>

            <h1 className="text-lg font-bold">
              TDM Team
            </h1>
          </div>
        </div>

        {/* TOURNAMENT HERO */}

        <section className="relative overflow-hidden rounded-3xl border border-gray-800 bg-gradient-to-br from-[#21170e] via-[#151515] to-[#101010] p-5 sm:p-6">
          <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-orange-500/10 blur-3xl" />

          <div className="relative">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <span className="inline-flex rounded-lg bg-orange-500/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-orange-500">
                  {game} • TDM
                </span>

                <h2 className="mt-3 text-2xl font-black leading-tight sm:text-3xl">
                  {matchName}
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                  Team of 4 players
                </p>
              </div>

              <div className="shrink-0 text-right">
                <p className="text-[10px] uppercase tracking-wider text-gray-500">
                  Entry
                </p>

                <p className="mt-1 text-2xl font-black text-orange-500">
                  ₹
                  {Number(
                    match.entryFee ||
                      0
                  ).toLocaleString(
                    "en-IN"
                  )}
                </p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-2">
              <MiniInfo
                label="Prize"
                value={`₹${Number(
                  match.prize || 0
                ).toLocaleString(
                  "en-IN"
                )}`}
              />

              <MiniInfo
                label="Date"
                value={formatDate(
                  match.date
                )}
              />

              <MiniInfo
                label="Time"
                value={
                  match.time ||
                  "--"
                }
              />
            </div>
          </div>
        </section>

        {/* PROGRESS */}

        <div className="my-6 flex items-center gap-2">
          <Step
            active
            number="1"
            label="Team"
          />

          <div className="h-px flex-1 bg-gray-800" />

          <Step
            active={Boolean(
              teamName.trim()
            )}
            number="2"
            label="Players"
          />

          <div className="h-px flex-1 bg-gray-800" />

          <Step
            active={
              allPlayersValid
            }
            number="3"
            label="Verify"
          />

          <div className="h-px flex-1 bg-gray-800" />

          <Step
            active={Boolean(
              utr.trim()
            )}
            number="4"
            label="Pay"
          />
        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-5 flex gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-500 text-xs font-black text-black">
              !
            </div>

            <p className="text-sm leading-6 text-red-300">
              {error}
            </p>
          </div>
        )}

        {/* SUCCESS */}

        {success && (
          <div className="mb-5 rounded-2xl border border-green-500/20 bg-green-500/10 p-4">
            <p className="font-bold text-green-400">
              ✓ Registration successful
            </p>

            <p className="mt-1 text-sm text-green-500/70">
              Taking you to your tournaments...
            </p>
          </div>
        )}

        {/* FORM */}

        <form
          onSubmit={
            handleSubmit
          }
          className="space-y-5"
        >

          {/* TEAM */}

          <section className="rounded-3xl border border-gray-800 bg-[#151515] p-5 sm:p-6">
            <SectionTitle
              number="01"
              title="Create your team"
              subtitle="Choose a name your squad will be known by."
            />

            <div className="mt-5">
              <label className="mb-2 block text-sm font-semibold text-gray-300">
                Team name
              </label>

              <input
                type="text"
                value={teamName}
                onChange={(e) =>
                  setTeamName(
                    e.target.value
                  )
                }
                placeholder="e.g. Team Phoenix"
                maxLength={50}
                className="w-full rounded-2xl border border-gray-700 bg-black px-4 py-4 text-base text-white outline-none placeholder:text-gray-700 focus:border-orange-500"
                required
              />

              <div className="mt-2 flex justify-between text-[11px] text-gray-600">
                <span>
                  Minimum 2 characters
                </span>

                <span>
                  {teamName.length}/50
                </span>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between rounded-2xl border border-orange-500/20 bg-orange-500/5 p-4">
              <div>
                <p className="text-xs text-gray-500">
                  Team slot
                </p>

                <p className="mt-1 font-black text-orange-500">
                  Team {teamSlot}
                </p>
              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-500/10 text-orange-500">
                ✓
              </div>
            </div>
          </section>

          {/* PLAYERS */}

          <section className="rounded-3xl border border-gray-800 bg-[#151515] p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <SectionTitle
                number="02"
                title="Add your squad"
                subtitle={`Enter the ${game} ID of each player.`}
              />

              <div className="shrink-0 rounded-full bg-gray-900 px-3 py-1 text-xs font-bold text-gray-400">
                {verifiedCount}/4
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {Array.from({
                length: 4,
              }).map(
                (_, index) => {
                  const item =
                    validation[
                      index
                    ];

                  const playerInfo =
                    validatedPlayers[
                      index
                    ];

                  const isLeader =
                    index === 0;

                  return (
                    <div
                      key={index}
                      className={`rounded-2xl border p-4 transition ${
                        item.valid
                          ? "border-green-500/20 bg-green-500/[0.03]"
                          : isLeader
                          ? "border-orange-500/20 bg-orange-500/[0.03]"
                          : "border-gray-800 bg-black/30"
                      }`}
                    >

                      {/* PLAYER TOP */}

                      <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-black ${
                              isLeader
                                ? "bg-orange-500 text-black"
                                : "bg-gray-900 text-gray-400"
                            }`}
                          >
                            {index + 1}
                          </div>

                          <div>
                            <p className="text-sm font-bold">
                              Player {index + 1}

                              {isLeader && (
                                <span className="ml-2 text-[10px] font-bold uppercase text-orange-500">
                                  Leader
                                </span>
                              )}
                            </p>

                            <p className="text-[11px] text-gray-600">
                              {isLeader
                                ? "Your account"
                                : "Team member"}
                            </p>
                          </div>
                        </div>

                        {item.checking && (
                          <span className="text-[10px] font-bold text-yellow-500">
                            CHECKING
                          </span>
                        )}

                        {!item.checking &&
                          item.valid && (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-green-500">
                              <span>
                                ✓
                              </span>

                              VERIFIED
                            </span>
                          )}

                        {!item.checking &&
                          item.checked &&
                          !item.valid && (
                            <span className="text-[10px] font-bold text-red-500">
                              INVALID
                            </span>
                          )}
                      </div>

                      {/* INPUT */}

                      <div className="relative">
                        <input
                          type="text"
                          value={
                            players[
                              index
                            ] || ""
                          }
                          onChange={(e) =>
                            updatePlayer(
                              index,
                              e.target.value
                            )
                          }
                          onBlur={() => {
                            if (
                              index === 0
                            ) {
                              return;
                            }

                            const value =
                              players[
                                index
                              ] || "";

                            if (
                              value.trim()
                            ) {
                              validatePlayerUid(
                                index,
                                value
                              );
                            }
                          }}
                          disabled={
                            isLeader &&
                            Boolean(
                              players[0]
                            )
                          }
                          placeholder={
                            isLeader
                              ? `Your ${game} ID`
                              : `Enter ${game} ID`
                          }
                          className={`w-full rounded-xl border bg-black px-4 py-3.5 pr-12 text-sm text-white outline-none placeholder:text-gray-700 ${
                            item.valid
                              ? "border-green-500/40"
                              : item.checked &&
                                !item.valid
                              ? "border-red-500/50"
                              : isLeader
                              ? "border-orange-500/30"
                              : "border-gray-700"
                          } ${
                            isLeader
                              ? "cursor-not-allowed opacity-80"
                              : ""
                          }`}
                          required
                        />

                        {item.checking && (
                          <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-700 border-t-orange-500" />
                          </div>
                        )}

                        {!item.checking &&
                          item.valid && (
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-lg font-black text-green-500">
                              ✓
                            </span>
                          )}

                        {!item.checking &&
                          item.checked &&
                          !item.valid && (
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-lg font-black text-red-500">
                              ×
                            </span>
                          )}
                      </div>

                      {/* VERIFIED PLAYER */}

                      {item.valid &&
                        playerInfo.playerName && (
                          <div className="mt-3 flex items-center gap-3 rounded-xl bg-green-500/5 px-3 py-2.5">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/10 text-green-500">
                              ✓
                            </div>

                            <div>
                              <p className="text-[10px] uppercase tracking-wider text-gray-600">
                                Registered player
                              </p>

                              <p className="text-sm font-bold text-green-400">
                                {
                                  playerInfo.playerName
                                }
                              </p>
                            </div>
                          </div>
                        )}

                      {/* ERROR */}

                      {item.checked &&
                        !item.valid && (
                          <p className="mt-2 text-xs leading-5 text-red-400">
                            {item.message ||
                              "This Game ID could not be verified."}
                          </p>
                        )}
                    </div>
                  );
                }
              )}
            </div>

            {/* VERIFICATION */}

            <div
              className={`mt-5 rounded-2xl p-4 ${
                allPlayersValid
                  ? "bg-green-500/5"
                  : "bg-gray-900/60"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold">
                    Squad verification
                  </p>

                  <p className="mt-1 text-xs text-gray-600">
                    All 4 players must be registered.
                  </p>
                </div>

                <div
                  className={`text-sm font-black ${
                    allPlayersValid
                      ? "text-green-500"
                      : "text-gray-500"
                  }`}
                >
                  {verifiedCount}/4
                </div>
              </div>

              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-gray-800">
                <div
                  className="h-full rounded-full bg-green-500 transition-all"
                  style={{
                    width: `${verifiedCount * 25}%`,
                  }}
                />
              </div>
            </div>
          </section>

          {/* PAYMENT */}

          <section className="rounded-3xl border border-gray-800 bg-[#151515] p-5 sm:p-6">
            <SectionTitle
              number="03"
              title="Complete payment"
              subtitle="Pay the entry fee and enter your UTR."
            />

            {/* FEE */}

            <div className="mt-5 flex items-center justify-between rounded-2xl bg-orange-500/10 p-4">
              <div>
                <p className="text-xs text-gray-500">
                  Entry fee
                </p>

                <p className="mt-1 text-2xl font-black text-orange-500">
                  ₹
                  {Number(
                    match.entryFee ||
                      0
                  ).toLocaleString(
                    "en-IN"
                  )}
                </p>
              </div>

              <div className="text-right">
                <p className="text-xs text-gray-600">
                  Prize pool
                </p>

                <p className="mt-1 font-bold text-white">
                  ₹
                  {Number(
                    match.prize ||
                      0
                  ).toLocaleString(
                    "en-IN"
                  )}
                </p>
              </div>
            </div>

            {/* QR */}

            <div className="mt-5 rounded-2xl border border-gray-800 bg-black p-5">
              <div className="text-center">
                <p className="font-bold">
                  Scan to pay
                </p>

                <p className="mt-1 text-xs text-gray-600">
                  Use any UPI app
                </p>
              </div>

              <div className="mx-auto mt-5 w-fit rounded-2xl bg-white p-3">
                <img
                  src={qrCode}
                  alt="UPI Payment QR Code"
                  className="h-52 w-52 object-contain sm:h-64 sm:w-64"
                />
              </div>
            </div>

            {/* UTR */}

            <div className="mt-5">
              <label className="mb-2 block text-sm font-semibold">
                UTR / Transaction ID
              </label>

              <input
                type="text"
                value={utr}
                onChange={(e) =>
                  setUtr(
                    e.target.value
                  )
                }
                placeholder="Enter UTR after payment"
                className="w-full rounded-2xl border border-gray-700 bg-black px-4 py-4 text-sm uppercase text-white outline-none placeholder:text-gray-700 focus:border-orange-500"
                required
              />

              <p className="mt-2 text-[11px] leading-5 text-gray-600">
                You can find the UTR in your UPI payment history.
              </p>
            </div>
          </section>

          {/* FINAL SUMMARY */}

          <section className="rounded-3xl border border-gray-800 bg-[#151515] p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Ready to register?
            </p>

            <div className="mt-4 space-y-3">
              <SummaryRow
                label="Team"
                value={
                  teamName.trim() ||
                  "Not entered"
                }
                good={Boolean(
                  teamName.trim()
                )}
              />

              <SummaryRow
                label="Players"
                value={`${verifiedCount}/4 verified`}
                good={
                  allPlayersValid
                }
              />

              <SummaryRow
                label="Payment"
                value={
                  utr.trim()
                    ? "UTR added"
                    : "Not added"
                }
                good={Boolean(
                  utr.trim()
                )}
              />
            </div>
          </section>

          {/* SUBMIT */}

          <button
            type="submit"
            disabled={
              submitting ||
              !allPlayersValid ||
              !teamName.trim() ||
              !utr.trim()
            }
            className="sticky bottom-4 w-full rounded-2xl bg-orange-500 px-5 py-4 text-base font-black text-black shadow-2xl shadow-orange-500/10 transition active:scale-[0.98] hover:bg-orange-400 disabled:cursor-not-allowed disabled:bg-gray-800 disabled:text-gray-500"
          >
            {submitting
              ? "Registering your team..."
              : "Register Team →"}
          </button>

          <p className="px-5 text-center text-[11px] leading-5 text-gray-700">
            By registering, you confirm that all
            player IDs belong to the respective
            registered users.
          </p>
        </form>
      </div>
    </main>
  );
}

// ======================================================
// STEP
// ======================================================

function Step({
  number,
  label,
  active = false,
}: {
  number: string;
  label: string;
  active?: boolean;
}) {
  return (
    <div className="flex min-w-0 flex-col items-center gap-1.5">
      <div
        className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-black ${
          active
            ? "bg-orange-500 text-black"
            : "bg-gray-900 text-gray-600"
        }`}
      >
        {number}
      </div>

      <span
        className={`text-[9px] font-bold uppercase tracking-wider ${
          active
            ? "text-gray-300"
            : "text-gray-700"
        }`}
      >
        {label}
      </span>
    </div>
  );
}

// ======================================================
// SECTION TITLE
// ======================================================

function SectionTitle({
  number,
  title,
  subtitle,
}: {
  number: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-500/10 text-[10px] font-black text-orange-500">
        {number}
      </div>

      <div>
        <h3 className="text-lg font-black">
          {title}
        </h3>

        <p className="mt-1 text-xs leading-5 text-gray-600">
          {subtitle}
        </p>
      </div>
    </div>
  );
}

// ======================================================
// MINI INFO
// ======================================================

function MiniInfo({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-black/40 p-3">
      <p className="text-[9px] uppercase tracking-wider text-gray-600">
        {label}
      </p>

      <p className="mt-1 truncate text-xs font-bold text-gray-300">
        {value}
      </p>
    </div>
  );
}

// ======================================================
// SUMMARY ROW
// ======================================================

function SummaryRow({
  label,
  value,
  good,
}: {
  label: string;
  value: string;
  good: boolean;
}) {
  return (
    <div className="flex items-center justify-between border-b border-gray-800 pb-3 last:border-0 last:pb-0">
      <span className="text-sm text-gray-500">
        {label}
      </span>

      <span
        className={`flex items-center gap-1.5 text-sm font-bold ${
          good
            ? "text-green-500"
            : "text-gray-600"
        }`}
      >
        {good && "✓"}

        {value}
      </span>
    </div>
  );
}

// ======================================================
// DATE
// ======================================================

function formatDate(
  value?: string
): string {
  if (!value) {
    return "--";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
    }
  );
}