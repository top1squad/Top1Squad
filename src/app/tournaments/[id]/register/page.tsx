"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";

// ======================================================
// TYPES
// ======================================================

type Tournament = {
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
  status: string;
  description?: string;
  rules?: string[];
  paymentQr?: string;
  qrCode?: string;
  upiQr?: string;
  qrImage?: string;
};

type User = {
  id?: string;
  _id?: string;
  username?: string;
  fullName?: string;
  name?: string;
  email?: string;
  mobile?: string;

  game?: "BGMI" | "Free Fire" | string;

  gameUid?: string;

  bgmiUid?: string;
  pubgUid?: string;
  pubgLevelId?: string;

  freeFireUid?: string;
  freefireUid?: string;
  freefireLevelId?: string;

  role?: "user" | "admin";
};

type ValidatedPlayer = {
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
// API
// ======================================================

const RAW_API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5001";

const API_URL = RAW_API_URL
  .replace(/\/+$/, "")
  .replace(/\/api$/, "");

// ======================================================
// HELPERS
// ======================================================

function getRequiredIds(mode: string): number {
  const normalized = String(mode || "")
    .trim()
    .toLowerCase()
    .replace(/[_-]/g, " ");

  if (normalized === "solo") return 1;
  if (normalized === "duo") return 2;
  if (normalized === "squad") return 4;

  return 1;
}

function createEmptyValidation(): PlayerValidation {
  return {
    checking: false,
    checked: false,
    valid: false,
    message: "",
    playerName: "",
    userId: "",
  };
}

function createEmptyValidatedPlayer(): ValidatedPlayer {
  return {
    gameUid: "",
    playerName: "",
    user: "",
  };
}

function getSavedGameUid(
  user: User,
  game: "BGMI" | "Free Fire"
): string {
  if (game === "Free Fire") {
    return String(
      user.freeFireUid ||
        user.freefireUid ||
        user.freefireLevelId ||
        user.gameUid ||
        ""
    ).trim();
  }

  return String(
    user.bgmiUid ||
      user.pubgUid ||
      user.pubgLevelId ||
      user.gameUid ||
      ""
  ).trim();
}

function extractValidatedPlayer(
  data: any,
  fallbackUid: string
): ValidatedPlayer | null {
  const player =
    data?.user ||
    data?.player ||
    data?.data?.user ||
    data?.data?.player ||
    data?.data ||
    null;

  const playerName =
    player?.playerName ||
    player?.name ||
    player?.username ||
    player?.fullName ||
    "";

  const userId =
    player?.userId ||
    player?.user?._id ||
    player?.user?.id ||
    player?.user ||
    player?._id ||
    player?.id ||
    "";

  const returnedUid =
    player?.gameUid ||
    player?.uid ||
    player?.gameId ||
    fallbackUid;

  const valid =
    data?.valid === true ||
    data?.success === true ||
    Boolean(player);

  if (!valid || !String(userId).trim()) {
    return null;
  }

  return {
    gameUid: String(returnedUid).trim(),
    playerName:
      String(playerName || "Registered Player").trim(),
    user: String(userId).trim(),
  };
}

// ======================================================
// PAGE
// ======================================================

export default function TournamentRegisterPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const routeTournamentId =
    typeof params?.id === "string"
      ? params.id
      : Array.isArray(params?.id)
      ? params.id[0]
      : "";

  const queryTournamentId =
    searchParams?.get("tournamentId") ||
    searchParams?.get("id") ||
    "";

  const tournamentId = String(
    routeTournamentId || queryTournamentId || ""
  ).trim();

  // ====================================================
  // STATE
  // ====================================================

  const [tournament, setTournament] =
    useState<Tournament | null>(null);

  const [user, setUser] =
    useState<User | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [playerTeamName, setPlayerTeamName] =
    useState("");

  const [players, setPlayers] =
    useState<string[]>([""]);

  const [validatedPlayers, setValidatedPlayers] =
    useState<ValidatedPlayer[]>([
      createEmptyValidatedPlayer(),
    ]);

  const [validation, setValidation] =
    useState<PlayerValidation[]>([
      createEmptyValidation(),
    ]);

  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [message, setMessage] = useState("");
  const [submitError, setSubmitError] = useState("");

  const [showPopup, setShowPopup] = useState(false);
  const [levelConfirmed, setLevelConfirmed] =
    useState(false);

  const [alreadyRegistered, setAlreadyRegistered] =
    useState(false);

  const [showPaymentModal, setShowPaymentModal] =
    useState(false);

  const [utr, setUtr] = useState("");

  // ====================================================
  // REQUIRED
  // ====================================================

  const requiredIds = tournament
    ? getRequiredIds(tournament.mode)
    : 1;

  const game: "BGMI" | "Free Fire" =
    tournament?.game === "Free Fire"
      ? "Free Fire"
      : "BGMI";

  // ====================================================
  // LOAD DATA
  // ====================================================

  useEffect(() => {
    if (!tournamentId) {
      setError("Invalid tournament ID.");
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const tournamentResponse = await fetch(
          `${API_URL}/api/tournaments/${encodeURIComponent(
            tournamentId
          )}`,
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
            headers: {
              Accept: "application/json",
            },
          }
        );

        const tournamentText =
          await tournamentResponse.text();

        let tournamentData: any = {};

        try {
          tournamentData =
            JSON.parse(tournamentText);
        } catch {
          console.error(
            "Tournament API returned non JSON:",
            tournamentText
          );
        }

        if (!tournamentResponse.ok) {
          throw new Error(
            tournamentData?.message ||
              tournamentData?.error ||
              "Tournament not found."
          );
        }

        const tournamentInfo =
          tournamentData?.tournament ||
          tournamentData?.data?.tournament ||
          tournamentData?.data ||
          tournamentData;

        if (!tournamentInfo?._id) {
          throw new Error(
            "Tournament information was not returned."
          );
        }

        if (cancelled) return;

        setTournament(tournamentInfo);

        // USER

        const userResponse = await fetch(
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

        const userText =
          await userResponse.text();

        let userData: any = {};

        try {
          userData = JSON.parse(userText);
        } catch {
          console.error(
            "User API returned non JSON:",
            userText
          );
        }

        if (!userResponse.ok) {
          throw new Error(
            userData?.message ||
              userData?.error ||
              "Please login before registering."
          );
        }

        const currentUser =
          userData?.user ||
          userData?.data?.user ||
          userData?.data ||
          userData;

        if (!currentUser) {
          throw new Error(
            "User information was not returned."
          );
        }

        if (cancelled) return;

        setUser(currentUser);

        const savedUid = getSavedGameUid(
          currentUser,
          tournamentInfo.game
        );

        const count = getRequiredIds(
          tournamentInfo.mode
        );

        setPlayers(
          Array.from(
            { length: count },
            (_, index) =>
              index === 0 ? savedUid : ""
          )
        );

        setValidation(
          Array.from(
            { length: count },
            () => createEmptyValidation()
          )
        );

        setValidatedPlayers(
          Array.from(
            { length: count },
            () => createEmptyValidatedPlayer()
          )
        );

        if (!savedUid) {
          setError(
            `Please add your ${tournamentInfo.game} UID in Settings first.`
          );
        }
      } catch (err) {
        console.error(
          "Registration page error:",
          err
        );

        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load registration page."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, [tournamentId]);

  // ====================================================
  // SYNC PLAYER COUNT
  // ====================================================

  useEffect(() => {
    if (!tournament) return;

    const count = getRequiredIds(
      tournament.mode
    );

    setPlayers((current) => {
      const next = [...current];

      while (next.length < count) {
        next.push("");
      }

      if (next.length > count) {
        next.length = count;
      }

      if (user) {
        const primaryUid = getSavedGameUid(
          user,
          tournament.game
        );

        if (primaryUid) {
          next[0] = primaryUid;
        }
      }

      return next;
    });

    setValidation((current) => {
      const next = [...current];

      while (next.length < count) {
        next.push(createEmptyValidation());
      }

      if (next.length > count) {
        next.length = count;
      }

      return next;
    });

    setValidatedPlayers((current) => {
      const next = [...current];

      while (next.length < count) {
        next.push(
          createEmptyValidatedPlayer()
        );
      }

      if (next.length > count) {
        next.length = count;
      }

      return next;
    });
  }, [tournament, user]);

  // ====================================================
  // VALIDATE UID
  // ====================================================

  const validatePlayerUid = useCallback(
    async (
      index: number,
      uid: string
    ): Promise<ValidatedPlayer | null> => {
      const cleanUid =
        String(uid || "").trim();

      if (!cleanUid) {
        const empty =
          createEmptyValidation();

        empty.checked = true;
        empty.message =
          `${game} ID is required.`;

        setValidation((old) => {
          const next = [...old];
          next[index] = empty;
          return next;
        });

        setValidatedPlayers((old) => {
          const next = [...old];
          next[index] =
            createEmptyValidatedPlayer();
          return next;
        });

        return null;
      }

      setValidation((old) => {
        const next = [...old];

        next[index] = {
          checking: true,
          checked: false,
          valid: false,
          message: `Checking ${game} ID...`,
          playerName: "",
          userId: "",
        };

        return next;
      });

      try {
        const query =
          new URLSearchParams();

        query.set("uid", cleanUid);
        query.set("game", game);

        const response = await fetch(
          `${API_URL}/api/registrations/validate-player-uid?${query.toString()}`,
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
          data = JSON.parse(text);
        } catch {
          console.error(
            "UID validation returned non JSON:",
            text
          );
        }

        if (!response.ok) {
          throw new Error(
            data?.message ||
              data?.error ||
              "This player ID is not registered."
          );
        }

        const validated =
          extractValidatedPlayer(
            data,
            cleanUid
          );

        if (!validated) {
          throw new Error(
            data?.message ||
              "This Game ID is not registered."
          );
        }

        setValidatedPlayers((old) => {
          const next = [...old];
          next[index] = validated;
          return next;
        });

        setValidation((old) => {
          const next = [...old];

          next[index] = {
            checking: false,
            checked: true,
            valid: true,
            message: `Verified: ${validated.playerName}`,
            playerName:
              validated.playerName,
            userId: validated.user,
          };

          return next;
        });

        return validated;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : `Player ${index + 1} ID is not registered.`;

        setValidation((old) => {
          const next = [...old];

          next[index] = {
            checking: false,
            checked: true,
            valid: false,
            message: errorMessage,
            playerName: "",
            userId: "",
          };

          return next;
        });

        setValidatedPlayers((old) => {
          const next = [...old];

          next[index] =
            createEmptyValidatedPlayer();

          return next;
        });

        return null;
      }
    },
    [game]
  );

  // ====================================================
  // AUTO VALIDATE PLAYER 1
  // ====================================================

  useEffect(() => {
    const uid =
      players[0]?.trim();

    if (
      !uid ||
      !tournament ||
      !tournamentId
    ) {
      return;
    }

    validatePlayerUid(0, uid);
  }, [
    players[0],
    tournament,
    tournamentId,
    validatePlayerUid,
  ]);

  // ====================================================
  // PLAYER CHANGE
  // ====================================================

  const handlePlayerChange = (
    index: number,
    value: string
  ) => {
    if (index === 0) return;

    setPlayers((current) => {
      const next = [...current];
      next[index] = value;
      return next;
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
        createEmptyValidatedPlayer();

      return next;
    });

    setSubmitError("");
    setMessage("");
  };

  const handlePlayerBlur = async (
    index: number
  ) => {
    const uid =
      players[index]?.trim();

    if (!uid) return;

    await validatePlayerUid(
      index,
      uid
    );
  };

  // ====================================================
  // VALIDATION
  // ====================================================

  const allPlayersValid =
    useMemo(() => {
      if (
        players.length !== requiredIds ||
        validation.length !== requiredIds ||
        validatedPlayers.length !==
          requiredIds
      ) {
        return false;
      }

      for (
        let i = 0;
        i < requiredIds;
        i++
      ) {
        const uid =
          String(
            players[i] || ""
          ).trim();

        const item =
          validation[i];

        const validated =
          validatedPlayers[i];

        if (!uid) return false;

        if (
          !item?.checked ||
          !item?.valid ||
          !item?.userId
        ) {
          return false;
        }

        if (
          !validated?.gameUid ||
          !validated?.user
        ) {
          return false;
        }
      }

      return true;
    }, [
      players,
      validation,
      validatedPlayers,
      requiredIds,
    ]);

  const verifiedCount =
    validation
      .slice(0, requiredIds)
      .filter(
        (item) =>
          item.checked &&
          item.valid &&
          Boolean(item.userId)
      ).length;

  // ====================================================
  // REGISTER CLICK
  // ====================================================

  const handleRegisterClick =
    async () => {
      setSubmitError("");
      setMessage("");

      if (alreadyRegistered) {
        setSubmitError(
          "You are already registered for this tournament."
        );
        return;
      }

      if (!tournament) {
        setSubmitError(
          "Tournament information is unavailable."
        );
        return;
      }

      const cleanTeamName =
        playerTeamName.trim();

      if (!cleanTeamName) {
        setSubmitError(
          "Please enter player/team name."
        );
        return;
      }

      if (cleanTeamName.length < 2) {
        setSubmitError(
          "Player/team name must contain at least 2 characters."
        );
        return;
      }

      const ids = players
        .slice(0, requiredIds)
        .map((id) =>
          String(id || "").trim()
        );

      if (
        ids.length !== requiredIds ||
        ids.some((id) => !id)
      ) {
        setSubmitError(
          `${tournament.mode} requires exactly ${requiredIds} ${tournament.game} ID${
            requiredIds > 1 ? "s" : ""
          }.`
        );
        return;
      }

      const uniqueIds =
        new Set(
          ids.map((id) =>
            id.toLowerCase()
          )
        );

      if (
        uniqueIds.size !== ids.length
      ) {
        setSubmitError(
          "The same game ID cannot be used more than once."
        );
        return;
      }

      if (!user) {
        setSubmitError(
          "Please login before registering."
        );
        return;
      }

      const primaryUid =
        getSavedGameUid(
          user,
          tournament.game
        );

      if (!primaryUid) {
        setSubmitError(
          `Please add your ${tournament.game} UID in Settings first.`
        );
        return;
      }

      if (
        ids[0].toLowerCase() !==
        primaryUid
          .trim()
          .toLowerCase()
      ) {
        setSubmitError(
          `Player 1 must be your saved ${tournament.game} UID.`
        );
        return;
      }

      if (!agreed) {
        setSubmitError(
          "Please agree to the tournament rules."
        );
        return;
      }

      const verifiedPlayers: ValidatedPlayer[] =
        [];

      for (
        let index = 0;
        index < requiredIds;
        index++
      ) {
        const result =
          await validatePlayerUid(
            index,
            ids[index]
          );

        if (!result) {
          setSubmitError(
            `Player ${index + 1} could not be verified.`
          );
          return;
        }

        verifiedPlayers.push(result);
      }

      if (
        verifiedPlayers.length !==
        requiredIds
      ) {
        setSubmitError(
          `Exactly ${requiredIds} verified players are required.`
        );
        return;
      }

      const verifiedUidSet =
        new Set(
          verifiedPlayers.map(
            (player) =>
              player.gameUid.toLowerCase()
          )
        );

      if (
        verifiedUidSet.size !==
        requiredIds
      ) {
        setSubmitError(
          "Duplicate player IDs were detected."
        );
        return;
      }

      setValidatedPlayers(
        verifiedPlayers
      );

      setValidation(
        verifiedPlayers.map(
          (player) => ({
            checking: false,
            checked: true,
            valid: true,
            message:
              `Verified: ${player.playerName}`,
            playerName:
              player.playerName,
            userId: player.user,
          })
        )
      );

      setLevelConfirmed(false);
      setShowPopup(true);
    };

  // ====================================================
  // CONFIRM
  // ====================================================

  const handleConfirmRegistration =
    () => {
      if (!levelConfirmed) return;

      if (!tournament) return;

      if (!allPlayersValid) {
        setSubmitError(
          "Please verify all players first."
        );
        return;
      }

      setSubmitError("");
      setMessage("");

      setShowPopup(false);
      setLevelConfirmed(false);
      setUtr("");
      setShowPaymentModal(true);
    };

  // ====================================================
  // PAYMENT
  // ====================================================

  const handlePaymentSubmit =
    async () => {
      if (
        !tournament ||
        !user ||
        submitting
      ) {
        return;
      }

      const cleanUtr =
        utr.trim();

      if (!cleanUtr) {
        setSubmitError(
          "Please enter your UTR / Transaction ID."
        );
        return;
      }

      if (cleanUtr.length < 6) {
        setSubmitError(
          "UTR / Transaction ID must contain at least 6 characters."
        );
        return;
      }

      const ids = players
        .slice(0, requiredIds)
        .map((id) =>
          String(id || "").trim()
        );

      if (
        ids.length !== requiredIds ||
        ids.some((id) => !id)
      ) {
        setSubmitError(
          `Exactly ${requiredIds} ${tournament.game} IDs are required.`
        );
        return;
      }

      const uniqueIds =
        new Set(
          ids.map((id) =>
            id.toLowerCase()
          )
        );

      if (
        uniqueIds.size !== ids.length
      ) {
        setSubmitError(
          "Duplicate player IDs are not allowed."
        );
        return;
      }

      const primaryUid =
        getSavedGameUid(
          user,
          tournament.game
        );

      if (!primaryUid) {
        setSubmitError(
          `Please add your ${tournament.game} UID in Settings first.`
        );
        return;
      }

      if (
        ids[0].toLowerCase() !==
        primaryUid.toLowerCase()
      ) {
        setSubmitError(
          `Player 1 must be your saved ${tournament.game} UID.`
        );
        return;
      }

      setSubmitting(true);
      setSubmitError("");
      setMessage("");

      try {
        const finalValidatedPlayers: ValidatedPlayer[] =
          [];

        for (
          let index = 0;
          index < requiredIds;
          index++
        ) {
          const result =
            await validatePlayerUid(
              index,
              ids[index]
            );

          if (!result) {
            throw new Error(
              `Player ${index + 1} could not be verified.`
            );
          }

          finalValidatedPlayers.push(
            result
          );
        }

        const finalUniqueIds =
          new Set(
            finalValidatedPlayers.map(
              (player) =>
                player.gameUid.toLowerCase()
            )
          );

        if (
          finalUniqueIds.size !==
          requiredIds
        ) {
          throw new Error(
            "Duplicate player IDs were detected."
          );
        }

        const payload = {
          tournament: tournamentId,

          playerTeamName:
            playerTeamName.trim(),

          gameUid:
            finalValidatedPlayers[0]
              .gameUid,

          players:
            finalValidatedPlayers.map(
              (player) =>
                player.gameUid
            ),

          utr: cleanUtr,
        };

        const response =
          await fetch(
            `${API_URL}/api/registrations`,
            {
              method: "POST",
              headers: {
                "Content-Type":
                  "application/json",
                Accept:
                  "application/json",
              },
              credentials: "include",
              body:
                JSON.stringify(payload),
            }
          );

        const responseText =
          await response.text();

        let data: any = null;

        try {
          data =
            JSON.parse(responseText);
        } catch {
          console.error(
            "Registration API returned non JSON:",
            responseText
          );
        }

        if (
          response.status === 400 ||
          response.status === 409
        ) {
          const backendMessage =
            data?.message ||
            data?.error ||
            "";

          if (
            backendMessage
              .toLowerCase()
              .includes(
                "already registered"
              )
          ) {
            setAlreadyRegistered(true);
            setShowPaymentModal(false);
            setShowPopup(false);
            setLevelConfirmed(false);
            setUtr("");
            setSubmitError("");
            setMessage(
              "You are already registered for this tournament."
            );
            return;
          }
        }

        if (!response.ok) {
          throw new Error(
            data?.message ||
              data?.error ||
              "Registration failed."
          );
        }

        setShowPaymentModal(false);
        setShowPopup(false);
        setUtr("");
        setLevelConfirmed(false);

        setMessage(
          "Payment submitted successfully. Registration is pending admin verification."
        );

        setTimeout(() => {
          router.push(
            "/my-tournaments"
          );
        }, 1500);
      } catch (err) {
        console.error(
          "Registration error:",
          err
        );

        setSubmitError(
          err instanceof Error
            ? err.message
            : "Registration failed."
        );
      } finally {
        setSubmitting(false);
      }
    };

  // ====================================================
  // LOADING
  // ====================================================

  if (loading) {
    return (
      <main className="min-h-screen bg-zinc-950 text-white">
        <div className="flex min-h-screen items-center justify-center px-5">
          <div className="w-full max-w-sm text-center">
            <div className="mx-auto mb-5 h-10 w-10 animate-spin rounded-full border-2 border-zinc-700 border-t-orange-500" />

            <p className="text-sm font-medium text-zinc-400">
              Loading tournament...
            </p>
          </div>
        </div>
      </main>
    );
  }

  // ====================================================
  // ERROR
  // ====================================================

  if (error || !tournament) {
    return (
      <main className="min-h-screen bg-zinc-950 px-5 text-white">
        <div className="flex min-h-screen items-center justify-center">
          <div className="w-full max-w-sm text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 text-2xl">
              !
            </div>

            <h2 className="mt-5 text-xl font-black">
              Unable to open tournament
            </h2>

            <p className="mt-2 text-sm leading-6 text-zinc-500">
              {error ||
                "Tournament information is unavailable."}
            </p>

            <Link
              href="/tournaments"
              className="mt-6 block rounded-xl bg-orange-500 px-5 py-3.5 text-sm font-bold text-black"
            >
              Back to Tournaments
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const qrCode =
    tournament.paymentQr ||
    tournament.qrCode ||
    tournament.upiQr ||
    tournament.qrImage ||
    "/payment/upi-qr.png";

  const enteredCount =
    players.filter(
      (id) => id.trim().length > 0
    ).length;

  // ====================================================
  // UI
  // ====================================================

  return (
    <main className="min-h-screen bg-zinc-950 pb-28 text-white">
      {/* ==================================================
          MOBILE/DESKTOP HEADER
      ================================================== */}

      <header className="border-b border-zinc-800 bg-zinc-950">
        <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6 sm:py-6">
          <Link
            href={`/tournaments/${tournament._id}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-white"
          >
            <span className="text-lg">‹</span>
            Tournament
          </Link>

          <div className="mt-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
                  Register
                </h1>

                <p className="mt-1 text-sm text-zinc-500">
                  Complete your registration below.
                </p>
              </div>

              <div className="shrink-0 rounded-xl bg-orange-500/10 px-3 py-2 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-orange-400">
                  Fee
                </p>

                <p className="text-lg font-black text-orange-500">
                  ₹{tournament.entryFee}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ==================================================
          CONTENT
      ================================================== */}

      <section className="mx-auto max-w-5xl px-4 py-5 sm:px-6 sm:py-8">
        <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
          {/* ==================================================
              MAIN FORM
          ================================================== */}

          <div className="space-y-4">
            {/* TOURNAMENT CARD */}

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 sm:p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-xl">
                  🎮
                </div>

                <div className="min-w-0 flex-1">
                  <h2 className="truncate font-bold">
                    {tournament.name}
                  </h2>

                  <p className="mt-1 text-xs text-zinc-500">
                    {tournament.game} •{" "}
                    {tournament.mode} •{" "}
                    {tournament.map}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                <InfoBox
                  label="Prize"
                  value={`₹${tournament.prize}`}
                />

                <InfoBox
                  label="Date"
                  value={tournament.date}
                />

                <InfoBox
                  label="Time"
                  value={tournament.time}
                />
              </div>
            </div>

            {/* ALREADY REGISTERED */}

            {alreadyRegistered && (
              <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-5">
                <div className="flex gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-500/10 text-green-400">
                    ✓
                  </div>

                  <div>
                    <h3 className="font-bold text-green-400">
                      Already Registered
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-zinc-500">
                      You are already registered
                      for this tournament.
                    </p>
                  </div>
                </div>

                <Link
                  href="/my-tournaments"
                  className="mt-4 block rounded-xl bg-green-500 px-4 py-3 text-center text-sm font-bold text-black"
                >
                  View My Tournament
                </Link>
              </div>
            )}

            {/* PLAYER / TEAM NAME */}

            {!alreadyRegistered && (
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 sm:p-6">
                <SectionTitle
                  number="01"
                  title="Player / Team"
                />

                <label
                  htmlFor="teamName"
                  className="mt-5 block text-xs font-bold uppercase tracking-wider text-zinc-500"
                >
                  Name
                </label>

                <input
                  id="teamName"
                  type="text"
                  value={playerTeamName}
                  onChange={(e) => {
                    setPlayerTeamName(
                      e.target.value
                    );
                    setSubmitError("");
                    setMessage("");
                  }}
                  placeholder="Enter player or team name"
                  className="mt-2 h-12 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-orange-500"
                />
              </div>
            )}

            {/* PLAYERS */}

            {!alreadyRegistered && (
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <SectionTitle
                    number="02"
                    title="Players"
                  />

                  <div
                    className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                      allPlayersValid
                        ? "bg-green-500/10 text-green-400"
                        : "bg-zinc-800 text-zinc-400"
                    }`}
                  >
                    {verifiedCount}/{requiredIds}
                  </div>
                </div>

                <p className="mt-2 text-xs leading-5 text-zinc-600">
                  Enter exactly {requiredIds}{" "}
                  {tournament.game} ID
                  {requiredIds > 1
                    ? "s"
                    : ""}.
                </p>

                <div className="mt-5 space-y-3">
                  {players.map(
                    (player, index) => {
                      const item =
                        validation[index];

                      return (
                        <PlayerCard
                          key={`player-${index}`}
                          index={index}
                          player={player}
                          game={tournament.game}
                          validation={item}
                          disabled={
                            alreadyRegistered
                          }
                          onChange={(value) =>
                            handlePlayerChange(
                              index,
                              value
                            )
                          }
                          onBlur={() =>
                            handlePlayerBlur(
                              index
                            )
                          }
                        />
                      );
                    }
                  )}
                </div>
              </div>
            )}

            {/* VERIFICATION */}

            {!alreadyRegistered && (
              <div
                className={`rounded-2xl border p-4 ${
                  allPlayersValid
                    ? "border-green-500/20 bg-green-500/5"
                    : "border-zinc-800 bg-zinc-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      allPlayersValid
                        ? "bg-green-500/10 text-green-400"
                        : "bg-zinc-800 text-zinc-500"
                    }`}
                  >
                    {allPlayersValid
                      ? "✓"
                      : "!"}
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-bold">
                      {allPlayersValid
                        ? "All players verified"
                        : "Player verification"}
                    </p>

                    <p className="mt-1 text-xs text-zinc-500">
                      {allPlayersValid
                        ? "You can continue to payment."
                        : `${verifiedCount} of ${requiredIds} players verified.`}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TERMS */}

            {!alreadyRegistered && (
              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) =>
                    setAgreed(
                      e.target.checked
                    )
                  }
                  className="mt-0.5 h-5 w-5 shrink-0 accent-orange-500"
                />

                <span className="text-xs leading-5 text-zinc-500">
                  I confirm that all player
                  information is correct and I
                  agree to the tournament rules.
                </span>
              </label>
            )}

            {/* ERROR */}

            {submitError &&
              !showPaymentModal && (
                <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4 text-sm leading-6 text-red-400">
                  {submitError}
                </div>
              )}

            {/* SUCCESS */}

            {message &&
              !alreadyRegistered && (
                <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-4 text-sm leading-6 text-green-400">
                  {message}
                </div>
              )}
          </div>

          {/* ==================================================
              DESKTOP SUMMARY
          ================================================== */}

          <aside className="hidden lg:block">
            <div className="sticky top-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
              <h2 className="font-black">
                Registration Summary
              </h2>

              <div className="mt-4 rounded-xl bg-zinc-950 p-4">
                <p className="font-bold">
                  {tournament.name}
                </p>

                <p className="mt-1 text-xs text-zinc-500">
                  {tournament.game} •{" "}
                  {tournament.mode}
                </p>
              </div>

              <div className="mt-5 space-y-3 text-sm">
                <SummaryRow
                  label="Required IDs"
                  value={String(requiredIds)}
                />

                <SummaryRow
                  label="Entered"
                  value={`${enteredCount}/${requiredIds}`}
                />

                <SummaryRow
                  label="Verified"
                  value={`${verifiedCount}/${requiredIds}`}
                  green={allPlayersValid}
                />
              </div>

              <div className="my-5 border-t border-zinc-800" />

              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-500">
                  Entry Fee
                </span>

                <span className="text-2xl font-black text-orange-500">
                  ₹{tournament.entryFee}
                </span>
              </div>

              {!alreadyRegistered && (
                <button
                  type="button"
                  onClick={
                    handleRegisterClick
                  }
                  disabled={
                    submitting ||
                    !allPlayersValid ||
                    !agreed
                  }
                  className="mt-5 w-full rounded-xl bg-orange-500 px-4 py-3.5 text-sm font-black text-black transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Continue to Payment
                </button>
              )}

              <p className="mt-3 text-center text-[11px] leading-5 text-zinc-600">
                Player IDs are verified before
                payment.
              </p>
            </div>
          </aside>
        </div>
      </section>

      {/* ==================================================
          MOBILE BOTTOM CTA
      ================================================== */}

      {!alreadyRegistered && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-800 bg-zinc-950/95 px-4 py-3 backdrop-blur-md lg:hidden">
          <div className="mx-auto flex max-w-5xl items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-600">
                Entry Fee
              </p>

              <p className="text-lg font-black text-orange-500">
                ₹{tournament.entryFee}
              </p>
            </div>

            <button
              type="button"
              onClick={
                handleRegisterClick
              }
              disabled={
                submitting ||
                !allPlayersValid ||
                !agreed
              }
              className="min-h-12 flex-1 rounded-xl bg-orange-500 px-4 py-3 text-sm font-black text-black disabled:cursor-not-allowed disabled:opacity-40 sm:max-w-xs"
            >
              {submitting
                ? "Processing..."
                : allPlayersValid
                ? "Continue to Payment"
                : `${verifiedCount}/${requiredIds} Verified`}
            </button>
          </div>
        </div>
      )}

      {/* ==================================================
          CONFIRMATION MODAL
      ================================================== */}

      {showPopup &&
        !alreadyRegistered && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 sm:items-center sm:px-5">
            <div className="max-h-[90vh] w-full overflow-y-auto rounded-t-3xl border border-zinc-800 bg-zinc-900 p-5 sm:max-w-lg sm:rounded-2xl sm:p-6">
              <div className="mx-auto mb-5 h-1.5 w-12 rounded-full bg-zinc-700 sm:hidden" />

              <h2 className="text-xl font-black">
                Confirm Players
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                Check your player details before
                payment.
              </p>

              <div className="mt-5 rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4">
                <p className="text-sm font-bold text-yellow-400">
                  Important
                </p>

                <p className="mt-1 text-xs leading-5 text-zinc-500">
                  Make sure every {tournament.game}{" "}
                  ID belongs to the correct
                  registered player.
                </p>
              </div>

              <div className="mt-5 space-y-2">
                {players
                  .slice(0, requiredIds)
                  .map((id, index) => {
                    const item =
                      validatedPlayers[
                        index
                      ];

                    return (
                      <div
                        key={`confirm-${index}`}
                        className="rounded-xl bg-zinc-950 p-3"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-xs text-zinc-600">
                            Player {index + 1}
                          </span>

                          <span className="font-mono text-sm font-bold">
                            {id}
                          </span>
                        </div>

                        {item?.playerName && (
                          <p className="mt-1 text-xs text-green-400">
                            ✓ {item.playerName}
                          </p>
                        )}
                      </div>
                    );
                  })}
              </div>

              <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl border border-zinc-800 bg-zinc-950 p-4">
                <input
                  type="checkbox"
                  checked={
                    levelConfirmed
                  }
                  onChange={(e) =>
                    setLevelConfirmed(
                      e.target.checked
                    )
                  }
                  className="mt-0.5 h-5 w-5 shrink-0 accent-orange-500"
                />

                <span className="text-xs leading-5 text-zinc-500">
                  I confirm that all IDs are
                  correct and belong to the
                  intended players.
                </span>
              </label>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowPopup(false);
                    setLevelConfirmed(
                      false
                    );
                    setSubmitError("");
                  }}
                  disabled={submitting}
                  className="min-h-12 rounded-xl border border-zinc-700 px-4 text-sm font-bold text-zinc-300"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={
                    handleConfirmRegistration
                  }
                  disabled={
                    !levelConfirmed ||
                    !allPlayersValid ||
                    submitting
                  }
                  className="min-h-12 rounded-xl bg-orange-500 px-4 text-sm font-black text-black disabled:opacity-40"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        )}

      {/* ==================================================
          PAYMENT MODAL
      ================================================== */}

      {showPaymentModal &&
        !alreadyRegistered && (
          <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/80 sm:items-center sm:px-5">
            <div className="max-h-[94vh] w-full overflow-y-auto rounded-t-3xl border border-zinc-800 bg-zinc-900 p-5 sm:max-w-lg sm:rounded-2xl sm:p-7">
              <div className="mx-auto mb-5 h-1.5 w-12 rounded-full bg-zinc-700 sm:hidden" />

              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10 text-xl">
                  ₹
                </div>

                <h2 className="mt-4 text-xl font-black">
                  Complete Payment
                </h2>

                <p className="mt-1 text-xs leading-5 text-zinc-500">
                  Pay the entry fee and submit
                  your transaction ID.
                </p>
              </div>

              {/* AMOUNT */}

              <div className="mt-5 rounded-2xl bg-orange-500/5 p-4 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                  Amount to Pay
                </p>

                <p className="mt-1 text-3xl font-black text-orange-500">
                  ₹{tournament.entryFee}
                </p>
              </div>

              {/* QR */}

              <div className="mt-5 rounded-2xl bg-white p-4">
                <p className="text-center text-xs font-bold text-black">
                  Scan & Pay
                </p>

                <div className="mt-3 flex justify-center">
                  <img
                    src={qrCode}
                    alt="Tournament payment UPI QR code"
                    className="h-56 w-56 max-w-full rounded-xl object-contain sm:h-64 sm:w-64"
                  />
                </div>
              </div>

              {/* INSTRUCTIONS */}

              <div className="mt-4 rounded-2xl bg-zinc-950 p-4">
                <p className="text-sm font-bold">
                  How to pay
                </p>

                <div className="mt-3 space-y-2">
                  <PaymentStep text="Scan the QR code using your UPI app." />
                  <PaymentStep
                    text={`Pay exactly ₹${tournament.entryFee}.`}
                  />
                  <PaymentStep text="Wait for payment success." />
                  <PaymentStep text="Open the transaction details." />
                  <PaymentStep text="Copy your UTR / Transaction ID." />
                </div>
              </div>

              {/* UTR */}

              <div className="mt-5">
                <label
                  htmlFor="utr"
                  className="text-xs font-bold uppercase tracking-wider text-zinc-500"
                >
                  UTR / Transaction ID
                </label>

                <input
                  id="utr"
                  type="text"
                  value={utr}
                  onChange={(e) => {
                    setUtr(
                      e.target.value
                    );

                    if (submitError) {
                      setSubmitError("");
                    }
                  }}
                  placeholder="Enter transaction ID"
                  autoComplete="off"
                  className="mt-2 h-12 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-orange-500"
                />

                <p className="mt-2 text-[11px] leading-5 text-zinc-600">
                  Your registration will remain
                  pending until the admin verifies
                  the payment.
                </p>
              </div>

              {submitError && (
                <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/5 p-3 text-xs leading-5 text-red-400">
                  {submitError}
                </div>
              )}

              {/* BUTTONS */}

              <div className="mt-5 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (submitting) return;

                    setShowPaymentModal(
                      false
                    );
                    setUtr("");
                    setSubmitError("");
                  }}
                  disabled={submitting}
                  className="min-h-12 rounded-xl border border-zinc-700 px-4 text-sm font-bold text-zinc-300 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={
                    handlePaymentSubmit
                  }
                  disabled={
                    submitting ||
                    !utr.trim() ||
                    !allPlayersValid
                  }
                  className="min-h-12 rounded-xl bg-orange-500 px-3 text-sm font-black text-black disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {submitting
                    ? "Submitting..."
                    : "Submit Payment"}
                </button>
              </div>
            </div>
          </div>
        )}
    </main>
  );
}

// ======================================================
// SMALL COMPONENTS
// ======================================================

function InfoBox({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0 rounded-xl bg-zinc-950 p-3">
      <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-600">
        {label}
      </p>

      <p className="mt-1 truncate text-xs font-bold text-zinc-300">
        {value}
      </p>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  green = false,
}: {
  label: string;
  value: string;
  green?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-zinc-500">
        {label}
      </span>

      <span
        className={
          green
            ? "font-bold text-green-400"
            : "font-bold"
        }
      >
        {value}
      </span>
    </div>
  );
}

function SectionTitle({
  number,
  title,
}: {
  number: string;
  title: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10 text-[10px] font-black text-orange-500">
        {number}
      </span>

      <h2 className="text-base font-black">
        {title}
      </h2>
    </div>
  );
}

function PaymentStep({
  text,
}: {
  text: string;
}) {
  return (
    <div className="flex gap-2.5 text-xs leading-5 text-zinc-500">
      <span className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-[9px] text-zinc-400">
        ✓
      </span>

      <span>{text}</span>
    </div>
  );
}

function PlayerCard({
  index,
  player,
  game,
  validation,
  disabled,
  onChange,
  onBlur,
}: {
  index: number;
  player: string;
  game: "BGMI" | "Free Fire";
  validation?: PlayerValidation;
  disabled: boolean;
  onChange: (value: string) => void;
  onBlur: () => void;
}) {
  const isValid =
    validation?.checked &&
    validation.valid;

  const isInvalid =
    validation?.checked &&
    !validation.valid;

  const isChecking =
    validation?.checking;

  return (
    <div
      className={`rounded-2xl border p-3 transition-colors ${
        isValid
          ? "border-green-500/20 bg-green-500/[0.03]"
          : isInvalid
          ? "border-red-500/20 bg-red-500/[0.03]"
          : "border-zinc-800 bg-zinc-950"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-black ${
              index === 0
                ? "bg-orange-500/10 text-orange-400"
                : "bg-zinc-800 text-zinc-400"
            }`}
          >
            {index + 1}
          </div>

          <div className="min-w-0">
            <p className="text-sm font-bold">
              Player {index + 1}
            </p>

            {index === 0 && (
              <p className="text-[10px] font-semibold text-orange-400">
                Your account
              </p>
            )}
          </div>
        </div>

        {isValid && (
          <span className="shrink-0 text-xs font-bold text-green-400">
            ✓ Verified
          </span>
        )}

        {isChecking && (
          <span className="shrink-0 text-[10px] font-bold text-yellow-400">
            Checking...
          </span>
        )}

        {isInvalid && (
          <span className="shrink-0 text-xs font-bold text-red-400">
            Invalid
          </span>
        )}
      </div>

      <input
        type="text"
        value={player}
        onChange={(e) =>
          onChange(e.target.value)
        }
        onBlur={onBlur}
        readOnly={
          index === 0 && Boolean(player)
        }
        disabled={disabled}
        placeholder={
          index === 0
            ? `Your ${game} UID`
            : `Enter Player ${index + 1} UID`
        }
        className={`mt-3 h-12 w-full rounded-xl border bg-zinc-900 px-3.5 text-sm text-white outline-none placeholder:text-zinc-700 focus:border-orange-500 disabled:cursor-not-allowed disabled:opacity-50 ${
          isValid
            ? "border-green-500/30"
            : isInvalid
            ? "border-red-500/30"
            : "border-zinc-800"
        }`}
      />

      {isValid && (
        <div className="mt-2 rounded-lg bg-green-500/5 px-3 py-2">
          <p className="text-xs font-semibold text-green-400">
            {validation?.playerName}
          </p>
        </div>
      )}

      {isInvalid && (
        <p className="mt-2 text-[11px] leading-5 text-red-400">
          {validation?.message}
        </p>
      )}

      {index === 0 && !player && (
        <p className="mt-2 text-[11px] leading-5 text-orange-400">
          Add your {game} UID in{" "}
          <Link
            href="/settings"
            className="font-bold underline"
          >
            Settings
          </Link>
          .
        </p>
      )}
    </div>
  );
}