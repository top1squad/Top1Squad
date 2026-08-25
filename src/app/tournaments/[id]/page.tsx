"use client";

import { useEffect, useMemo, useState } from "react";
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
// REQUIRED IDS
// ======================================================

function getRequiredIds(mode: string): number {
  const currentMode = String(mode || "")
    .toLowerCase()
    .trim();

  if (currentMode.includes("solo")) {
    return 1;
  }

  if (currentMode.includes("duo")) {
    return 2;
  }

  if (currentMode.includes("squad")) {
    return 4;
  }

  return 1;
}

// ======================================================
// EMPTY VALIDATION
// ======================================================

const createEmptyValidation = (): PlayerValidation => ({
  checking: false,
  checked: false,
  valid: false,
  message: "",
  playerName: "",
  userId: "",
});

// ======================================================
// EMPTY PLAYER
// ======================================================

const createEmptyValidatedPlayer =
  (): ValidatedPlayer => ({
    gameUid: "",
    playerName: "",
    user: "",
  });

// ======================================================
// GET USER SAVED UID
// ======================================================

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

// ======================================================
// PAGE
// ======================================================

export default function TournamentRegisterPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  // ====================================================
  // TOURNAMENT ID
  // ====================================================

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

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [playerTeamName, setPlayerTeamName] =
    useState("");

  const [players, setPlayers] =
    useState<string[]>([""]);

  // ====================================================
  // NEW: VALIDATED PLAYERS
  // ====================================================

  const [validatedPlayers, setValidatedPlayers] =
    useState<ValidatedPlayer[]>([
      createEmptyValidatedPlayer(),
    ]);

  const [validation, setValidation] =
    useState<PlayerValidation[]>([
      createEmptyValidation(),
    ]);

  // ====================================================
  // OTHER STATE
  // ====================================================

  const [agreed, setAgreed] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [submitError, setSubmitError] =
    useState("");

  // ====================================================
  // CONFIRMATION POPUP
  // ====================================================

  const [showPopup, setShowPopup] =
    useState(false);

  const [levelConfirmed, setLevelConfirmed] =
    useState(false);

  // ====================================================
  // ALREADY REGISTERED
  // ====================================================

  const [alreadyRegistered, setAlreadyRegistered] =
    useState(false);

  // ====================================================
  // PAYMENT MODAL
  // ====================================================

  const [showPaymentModal, setShowPaymentModal] =
    useState(false);

  // ====================================================
  // UTR
  // ====================================================

  const [utr, setUtr] =
    useState("");

  // ====================================================
  // REQUIRED IDS
  // ====================================================

  const requiredIds = tournament
    ? getRequiredIds(tournament.mode)
    : 1;

  // ====================================================
  // GAME
  // ====================================================

  const game: "BGMI" | "Free Fire" =
    tournament?.game === "Free Fire"
      ? "Free Fire"
      : "BGMI";

  // ====================================================
  // LOAD TOURNAMENT + USER
  // ====================================================

  useEffect(() => {
    if (!tournamentId) {
      setError("Invalid tournament ID.");
      setLoading(false);
      return;
    }

    let cancelled = false;

    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        // ============================================
        // TOURNAMENT
        // ============================================

        const tournamentResponse =
          await fetch(
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
            "Tournament information was not returned by the server."
          );
        }

        if (cancelled) {
          return;
        }

        setTournament(tournamentInfo);

        // ============================================
        // CURRENT USER
        // ============================================

        const userResponse =
          await fetch(
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
          userData =
            JSON.parse(userText);
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

        if (cancelled) {
          return;
        }

        setUser(currentUser);

        // ============================================
        // SAVED GAME UID
        // ============================================

        const savedUid =
          getSavedGameUid(
            currentUser,
            tournamentInfo.game
          );

        const required =
          getRequiredIds(
            tournamentInfo.mode
          );

        if (savedUid) {
          const initialPlayers =
            Array.from(
              { length: required },
              (_, index) =>
                index === 0
                  ? savedUid
                  : ""
            );

          setPlayers(initialPlayers);

          setValidatedPlayers(
            Array.from(
              { length: required },
              (_, index) =>
                index === 0
                  ? createEmptyValidatedPlayer()
                  : createEmptyValidatedPlayer()
            )
          );

          setValidation(
            Array.from(
              { length: required },
              () => createEmptyValidation()
            )
          );
        } else {
          setPlayers(
            Array.from(
              { length: required },
              () => ""
            )
          );

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
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, [tournamentId]);

  // ====================================================
  // CHANGE NUMBER OF PLAYER ID FIELDS
  // ====================================================

  useEffect(() => {
    if (!tournament) {
      return;
    }

    const required =
      getRequiredIds(tournament.mode);

    setPlayers((currentPlayers) => {
      const updated = [
        ...currentPlayers,
      ];

      while (
        updated.length < required
      ) {
        updated.push("");
      }

      if (
        updated.length > required
      ) {
        updated.length = required;
      }

      if (user) {
        const primaryUid =
          getSavedGameUid(
            user,
            tournament.game
          );

        if (primaryUid) {
          updated[0] = primaryUid;
        }
      }

      return updated;
    });

    setValidation((current) => {
      const updated = [...current];

      while (
        updated.length < required
      ) {
        updated.push(
          createEmptyValidation()
        );
      }

      if (
        updated.length > required
      ) {
        updated.length = required;
      }

      return updated;
    });

    setValidatedPlayers((current) => {
      const updated = [...current];

      while (
        updated.length < required
      ) {
        updated.push(
          createEmptyValidatedPlayer()
        );
      }

      if (
        updated.length > required
      ) {
        updated.length = required;
      }

      return updated;
    });
  }, [tournament, user]);

  // ====================================================
  // VALIDATE PLAYER UID
  // ====================================================

  const validatePlayerUid = async (
    index: number,
    uid: string
  ): Promise<boolean> => {
    const cleanUid =
      String(uid || "").trim();

    if (!cleanUid) {
      setValidation((old) => {
        const next = [...old];

        next[index] = {
          checking: false,
          checked: true,
          valid: false,
          message:
            `${game} ID is required.`,
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

      return false;
    }

    // ================================================
    // CHECKING
    // ================================================

    setValidation((old) => {
      const next = [...old];

      next[index] = {
        checking: true,
        checked: false,
        valid: false,
        message:
          `Checking ${game} ID...`,
        playerName: "",
        userId: "",
      };

      return next;
    });

    try {
      const query =
        new URLSearchParams();

      query.set(
        "uid",
        cleanUid
      );

      query.set(
        "game",
        game
      );

      const validationUrl =
        `${API_URL}/api/registrations/validate-player-uid?${query.toString()}`;

      console.log(
        "[MAIN TOURNAMENT] VALIDATE PLAYER:",
        {
          index: index + 1,
          tournamentId,
          game,
          uid: cleanUid,
          url: validationUrl,
        }
      );

      const response =
        await fetch(
          validationUrl,
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
            headers: {
              Accept:
                "application/json",
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

      console.log(
        "[MAIN TOURNAMENT] UID VALIDATION RESPONSE:",
        response.status,
        data
      );

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Player ID is not registered."
        );
      }

      // ================================================
      // RESPONSE PLAYER
      // ================================================

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
        cleanUid;

      const valid =
        data?.valid === true ||
        data?.success === true ||
        Boolean(player);

      if (
        !valid ||
        !String(userId).trim()
      ) {
        throw new Error(
          data?.message ||
            "This Game ID is not registered in the users database."
        );
      }

      // ================================================
      // NORMALIZE
      // ================================================

      const normalizedPlayer: ValidatedPlayer = {
        gameUid:
          String(
            returnedUid
          ).trim(),

        playerName:
          String(
            playerName ||
              "Registered Player"
          ).trim(),

        user:
          String(userId).trim(),
      };

      // ================================================
      // SAVE VALIDATED PLAYER
      // ================================================

      setValidatedPlayers((old) => {
        const next = [...old];

        next[index] =
          normalizedPlayer;

        return next;
      });

      // ================================================
      // SAVE VALIDATION
      // ================================================

      setValidation((old) => {
        const next = [...old];

        next[index] = {
          checking: false,
          checked: true,
          valid: true,
          message:
            `Valid player: ${normalizedPlayer.playerName}`,
          playerName:
            normalizedPlayer.playerName,
          userId:
            normalizedPlayer.user,
        };

        return next;
      });

      return true;
    } catch (err) {
      console.error(
        "Player UID validation error:",
        err
      );

      setValidation((old) => {
        const next = [...old];

        next[index] = {
          checking: false,
          checked: true,
          valid: false,
          message:
            err instanceof Error
              ? err.message
              : `Player ${index + 1} ${game} ID is not registered.`,
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

      return false;
    }
  };

  // ====================================================
  // AUTOMATICALLY VALIDATE PLAYER 1
  // ====================================================

  useEffect(() => {
    const leaderUid =
      players[0]?.trim();

    if (
      !leaderUid ||
      !tournament ||
      !tournamentId
    ) {
      return;
    }

    validatePlayerUid(
      0,
      leaderUid
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    players[0],
    game,
    tournamentId,
    tournament?._id,
  ]);

  // ====================================================
  // PLAYER ID CHANGE
  // ====================================================

  const handlePlayerChange = (
    index: number,
    value: string
  ) => {
    // Player 1 belongs to logged-in user
    if (index === 0) {
      return;
    }

    setPlayers((currentPlayers) => {
      const updated = [
        ...currentPlayers,
      ];

      updated[index] = value;

      return updated;
    });

    // Clear previous validation
    setValidation((old) => {
      const next = [...old];

      next[index] =
        createEmptyValidation();

      return next;
    });

    // Clear previous validated player
    setValidatedPlayers((old) => {
      const next = [...old];

      next[index] =
        createEmptyValidatedPlayer();

      return next;
    });

    setSubmitError("");
    setMessage("");
  };

  // ====================================================
  // ALL REQUIRED PLAYERS VALID
  // ====================================================

  const allPlayersValid =
    useMemo(() => {
      if (
        players.length !==
        requiredIds
      ) {
        return false;
      }

      if (
        validation.length !==
        requiredIds
      ) {
        return false;
      }

      if (
        validatedPlayers.length !==
        requiredIds
      ) {
        return false;
      }

      const allIdsPresent =
        players.every((id) =>
          Boolean(
            String(id || "").trim()
          )
        );

      const allValid =
        validation.every(
          (item) =>
            item.checked &&
            item.valid &&
            Boolean(
              String(
                item.userId || ""
              ).trim()
            )
        );

      const allValidated =
        validatedPlayers.every(
          (player) =>
            Boolean(
              String(
                player.gameUid || ""
              ).trim()
            ) &&
            Boolean(
              String(
                player.user || ""
              ).trim()
            )
        );

      return (
        allIdsPresent &&
        allValid &&
        allValidated
      );
    }, [
      players,
      validation,
      validatedPlayers,
      requiredIds,
    ]);

  // ====================================================
  // OPEN CONFIRMATION POPUP
  // ====================================================

  const handleRegisterClick =
    async () => {
      setSubmitError("");
      setMessage("");

      // ==============================================
      // ALREADY REGISTERED
      // ==============================================

      if (alreadyRegistered) {
        setSubmitError(
          "You are already registered for this tournament."
        );

        return;
      }

      // ==============================================
      // TEAM NAME
      // ==============================================

      if (!playerTeamName.trim()) {
        setSubmitError(
          "Please enter player/team name."
        );

        return;
      }

      if (!tournament) {
        return;
      }

      // ==============================================
      // IDS
      // ==============================================

      const ids =
        players
          .map((id) =>
            id.trim()
          )
          .filter(Boolean);

      // ==============================================
      // EXACT COUNT
      // ==============================================

      if (
        ids.length !==
        requiredIds
      ) {
        setSubmitError(
          `${tournament.mode} tournament requires exactly ${requiredIds} game ID${
            requiredIds > 1
              ? "s"
              : ""
          }.`
        );

        return;
      }

      // ==============================================
      // DUPLICATES
      // ==============================================

      const uniqueIds =
        new Set(
          ids.map((id) =>
            id.toLowerCase()
          )
        );

      if (
        uniqueIds.size !==
        ids.length
      ) {
        setSubmitError(
          "The same game ID cannot be used more than once."
        );

        return;
      }

      // ==============================================
      // USER
      // ==============================================

      if (!user) {
        setSubmitError(
          "Please login before registering."
        );

        return;
      }

      // ==============================================
      // PRIMARY USER UID
      // ==============================================

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

      // ==============================================
      // PLAYER 1 MUST BE USER
      // ==============================================

      if (
        ids[0] !==
        primaryUid.trim()
      ) {
        setSubmitError(
          `Player 1 must be your saved ${tournament.game} UID.`
        );

        return;
      }

      // ==============================================
      // TERMS
      // ==============================================

      if (!agreed) {
        setSubmitError(
          "Please agree to the tournament rules."
        );

        return;
      }

      // ==============================================
      // VALIDATE ALL PLAYERS
      // ==============================================

      setSubmitError("");

      for (
        let index = 0;
        index < requiredIds;
        index++
      ) {
        const valid =
          await validatePlayerUid(
            index,
            ids[index]
          );

        if (!valid) {
          setSubmitError(
            validation[index]
              ?.message ||
              `Player ${index + 1} ${tournament.game} ID could not be verified.`
          );

          return;
        }
      }

      // ==============================================
      // IMPORTANT:
      // State updates are asynchronous.
      // Re-check validation directly from the
      // server results is safer by validating again
      // through current player data below.
      // ==============================================

      const currentValidated =
        validatedPlayers.slice(
          0,
          requiredIds
        );

      const currentValidation =
        validation.slice(
          0,
          requiredIds
        );

      // If state has not caught up yet, do one
      // more validation pass before opening popup.
      if (
        currentValidated.length !==
          requiredIds ||
        currentValidation.length !==
          requiredIds ||
        currentValidation.some(
          (item) =>
            !item.checked ||
            !item.valid
        )
      ) {
        // The server validations above have already
        // completed. Give React state one tick.
        await new Promise(
          (resolve) =>
            setTimeout(resolve, 0)
        );
      }

      // ==============================================
      // OPEN POPUP
      // ==============================================

      setLevelConfirmed(false);
      setShowPopup(true);
    };

  // ====================================================
  // CONFIRM REGISTRATION
  // ONLY OPENS PAYMENT
  // ====================================================

  const handleConfirmRegistration =
    () => {
      if (!levelConfirmed) {
        return;
      }

      if (!tournament) {
        return;
      }

      if (!allPlayersValid) {
        setSubmitError(
          "Please wait until all player IDs are successfully verified."
        );

        return;
      }

      setSubmitError("");
      setMessage("");

      setShowPopup(false);
      setLevelConfirmed(false);

      setUtr("");
      setSubmitError("");
      setMessage("");

      setShowPaymentModal(true);
    };

  // ====================================================
  // FINAL PAYMENT + REGISTRATION
  // ====================================================

  const handlePaymentSubmit =
    async () => {
      if (
        !tournament ||
        !user
      ) {
        return;
      }

      if (submitting) {
        return;
      }

      // ==============================================
      // UTR
      // ==============================================

      const cleanUtr =
        utr.trim();

      if (!cleanUtr) {
        setSubmitError(
          "Please enter your UTR / Transaction ID."
        );

        return;
      }

      if (
        cleanUtr.length < 6
      ) {
        setSubmitError(
          "UTR / Transaction ID must contain at least 6 characters."
        );

        return;
      }

      // ==============================================
      // FINAL PLAYER CHECK
      // ==============================================

      const ids =
        players
          .slice(0, requiredIds)
          .map((id) =>
            String(id || "").trim()
          );

      if (
        ids.length !==
          requiredIds ||
        ids.some((id) => !id)
      ) {
        setSubmitError(
          `Exactly ${requiredIds} ${tournament.game} IDs are required.`
        );

        return;
      }

      // ==============================================
      // DUPLICATE CHECK
      // ==============================================

      const uniqueIds =
        new Set(
          ids.map((id) =>
            id.toLowerCase()
          )
        );

      if (
        uniqueIds.size !==
        ids.length
      ) {
        setSubmitError(
          "The same game ID cannot be used more than once."
        );

        return;
      }

      // ==============================================
      // RE-VALIDATE BEFORE PAYMENT SUBMIT
      //
      // This prevents modified/stale IDs from being
      // submitted after the confirmation popup.
      // ==============================================

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
          const valid =
            await validatePlayerUid(
              index,
              ids[index]
            );

          if (!valid) {
            throw new Error(
              `Player ${index + 1} ${tournament.game} ID could not be verified.`
            );
          }

          // ==========================================
          // The validation endpoint has returned the
          // player. Read it from the latest state is
          // asynchronous, so perform a direct request
          // here to get the exact server result.
          // ==========================================

          const query =
            new URLSearchParams();

          query.set(
            "uid",
            ids[index]
          );

          query.set(
            "game",
            game
          );

          const validationResponse =
            await fetch(
              `${API_URL}/api/registrations/validate-player-uid?${query.toString()}`,
              {
                method: "GET",
                credentials: "include",
                cache: "no-store",
                headers: {
                  Accept:
                    "application/json",
                },
              }
            );

          const validationText =
            await validationResponse.text();

          let validationData: any =
            {};

          try {
            validationData =
              JSON.parse(
                validationText
              );
          } catch {
            // handled below
          }

          if (
            !validationResponse.ok
          ) {
            throw new Error(
              validationData?.message ||
                validationData?.error ||
                `Player ${index + 1} validation failed.`
            );
          }

          const player =
            validationData?.user ||
            validationData?.player ||
            validationData?.data?.user ||
            validationData?.data?.player ||
            validationData?.data ||
            null;

          const playerName =
            player?.playerName ||
            player?.name ||
            player?.username ||
            player?.fullName ||
            "Registered Player";

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
            ids[index];

          const validResponse =
            validationData?.valid === true ||
            validationData?.success === true ||
            Boolean(player);

          if (
            !validResponse ||
            !String(userId).trim()
          ) {
            throw new Error(
              validationData?.message ||
                `Player ${index + 1} is not registered in the users database.`
            );
          }

          finalValidatedPlayers.push({
            gameUid:
              String(
                returnedUid
              ).trim(),

            playerName:
              String(
                playerName
              ).trim(),

            user:
              String(
                userId
              ).trim(),
          });
        }

        // ==============================================
        // FINAL VALIDATED PLAYER COUNT
        // ==============================================

        if (
          finalValidatedPlayers.length !==
          requiredIds
        ) {
          throw new Error(
            `Exactly ${requiredIds} validated players are required.`
          );
        }

        // ==============================================
        // CREATE REGISTRATION
        // ==============================================

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

              body: JSON.stringify({
                tournament:
                  tournamentId,

                playerTeamName:
                  playerTeamName.trim(),

                // Keep original main feature
                gameUid:
                  ids[0],

                // ======================================
                // NEW:
                // SEND VALIDATED PLAYER OBJECTS
                // ======================================

                players:
                  finalValidatedPlayers.map(
                    (player) => player.gameUid
                  ),

                // ======================================
                // UTR
                // ======================================

                utr:
                  cleanUtr,
              }),
            }
          );

        const data =
          await response
            .json()
            .catch(
              () => null
            );

        console.log(
          "[MAIN TOURNAMENT] REGISTRATION RESPONSE:",
          response.status,
          data
        );

        // ==============================================
        // ALREADY REGISTERED
        // ==============================================

        if (
          response.status === 400 ||
          response.status === 409
        ) {
          const backendMessage =
            data?.message ||
            "";

          if (
            backendMessage
              .toLowerCase()
              .includes(
                "already registered"
              )
          ) {
            setAlreadyRegistered(
              true
            );

            setShowPaymentModal(
              false
            );

            setShowPopup(
              false
            );

            setLevelConfirmed(
              false
            );

            setUtr("");

            setSubmitError("");

            setMessage(
              "You are already registered for this tournament."
            );

            return;
          }
        }

        // ==============================================
        // OTHER BACKEND ERROR
        // ==============================================

        if (!response.ok) {
          throw new Error(
            data?.message ||
              data?.error ||
              "Registration failed."
          );
        }

        // ==============================================
        // SUCCESS
        // ==============================================

        setShowPaymentModal(
          false
        );

        setUtr("");

        setLevelConfirmed(
          false
        );

        setMessage(
          "Payment submitted successfully. Your registration is pending admin verification."
        );

        // ==============================================
        // REDIRECT
        // ==============================================

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
      <main className="min-h-screen bg-slate-50 text-slate-900">
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-slate-500">
            Loading tournament...
          </p>
        </div>
      </main>
    );
  }

  // ====================================================
  // ERROR
  // ====================================================

  if (
    error ||
    !tournament
  ) {
    return (
      <main className="min-h-screen bg-slate-50 text-slate-900">
        <div className="flex min-h-screen items-center justify-center px-5">
          <div className="text-center">
            <div className="text-4xl">
              ⚠️
            </div>

            <h2 className="mt-4 text-xl font-bold">
              Tournament not found
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              {error ||
                "Unable to load this tournament."}
            </p>

            <Link
              href="/tournaments"
              className="mt-5 inline-block rounded-xl bg-blue-600 px-5 py-3 font-bold text-black"
            >
              Back to Tournaments
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // ====================================================
  // QR
  // ====================================================

  const qrCode =
    tournament.paymentQr ||
    tournament.qrCode ||
    tournament.upiQr ||
    tournament.qrImage ||
    "/payment/upi-qr.png";

  // ====================================================
  // RENDER
  // ====================================================

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">

      {/* =================================================
          HEADER
      ================================================= */}

      <section className="border-b border-slate-200">
        <div className="mx-auto max-w-5xl px-5 py-8">

          <Link
            href={`/tournaments/${tournament._id}`}
            className="text-sm text-slate-500 hover:text-slate-900"
          >
            ← Back to Tournament
          </Link>

          <h1 className="mt-5 text-3xl font-black">
            Tournament Registration
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Complete your details to join the tournament.
          </p>

        </div>
      </section>

      {/* =================================================
          CONTENT
      ================================================= */}

      <section className="mx-auto max-w-5xl px-5 py-8">

        <div className="grid gap-6 lg:grid-cols-3">

          {/* =================================================
              FORM
          ================================================= */}

          <div className="lg:col-span-2">

            <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">

              <h2 className="text-xl font-black">
                Player Details
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {tournament.mode} tournament requires{" "}
                {requiredIds} game ID
                {requiredIds > 1
                  ? "s"
                  : ""}.
              </p>

              {/* =================================================
                  ALREADY REGISTERED
              ================================================= */}

              {alreadyRegistered && (
                <div className="mt-6 rounded-2xl border border-green-500/30 bg-blue-600/10 p-5">

                  <div className="flex items-start gap-4">

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600/20 text-xl">
                      ✓
                    </div>

                    <div>

                      <h3 className="font-bold text-green-400">
                        Already Registered
                      </h3>

                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        You are already registered
                        for this tournament. You
                        cannot register again with
                        the same account.
                      </p>

                    </div>

                  </div>

                  <Link
                    href="/my-tournaments"
                    className="mt-5 inline-block rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-black transition hover:bg-blue-700"
                  >
                    View My Tournaments
                  </Link>

                </div>
              )}

              {/* =================================================
                  PLAYER / TEAM NAME
              ================================================= */}

              <div className="mt-7">

                <label
                  htmlFor="teamName"
                  className="text-sm font-semibold text-slate-700"
                >
                  Player / Team Name
                </label>

                <input
                  id="teamName"
                  type="text"
                  value={
                    playerTeamName
                  }
                  onChange={(e) =>
                    setPlayerTeamName(
                      e.target.value
                    )
                  }
                  disabled={
                    alreadyRegistered
                  }
                  placeholder="Enter player or team name"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                />

              </div>

              {/* =================================================
                  GAME IDS
              ================================================= */}

              <div className="mt-8">

                <h3 className="text-lg font-bold">
                  {tournament.game} IDs
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Enter exactly {requiredIds}{" "}
                  {tournament.game} ID
                  {requiredIds > 1
                    ? "s"
                    : ""}.
                </p>

                <div className="mt-4 space-y-4">

                  {players.map(
                    (player, index) => {

                      const itemValidation =
                        validation[index];

                      return (
                        <div
                          key={index}
                        >

                          <label
                            htmlFor={`player-${index}`}
                            className="text-sm font-semibold text-slate-700"
                          >
                            Player{" "}
                            {index + 1}
                          </label>

                          <input
                            id={`player-${index}`}
                            type="text"
                            value={player}
                            onChange={(e) =>
                              handlePlayerChange(
                                index,
                                e.target.value
                              )
                            }
                            readOnly={
                              index === 0 &&
                              !!player
                            }
                            disabled={
                              alreadyRegistered
                            }
                            placeholder={
                              index === 0
                                ? `Your ${tournament.game} UID`
                                : `Enter Player ${
                                    index + 1
                                  } ${tournament.game} UID`
                            }
                            className={`mt-2 w-full rounded-xl border px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50 ${
                              itemValidation?.valid
                                ? "border-green-500/50 bg-green-950/20"
                                : itemValidation?.checked &&
                                  !itemValidation.valid
                                ? "border-red-500/50 bg-red-950/20"
                                : "border-slate-200 bg-slate-50"
                            } ${
                              index === 0 &&
                              player
                                ? "cursor-not-allowed"
                                : ""
                            }`}
                          />

                          {/* =====================================
                              VALIDATION STATUS
                          ===================================== */}

                          {itemValidation?.checking && (
                            <p className="mt-2 text-xs text-blue-700">
                              ⏳{" "}
                              {itemValidation.message}
                            </p>
                          )}

                          {itemValidation?.checked &&
                            itemValidation.valid && (
                              <div className="mt-2 rounded-lg border border-green-500/20 bg-blue-600/5 px-3 py-2">

                                <p className="text-xs font-semibold text-green-400">
                                  ✓{" "}
                                  {itemValidation.message}
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                  User ID:{" "}
                                  {itemValidation.userId}
                                </p>

                              </div>
                            )}

                          {itemValidation?.checked &&
                            !itemValidation.valid && (
                              <p className="mt-2 text-xs text-red-400">
                                ✕{" "}
                                {itemValidation.message}
                              </p>
                            )}

                          {index === 0 &&
                            !player && (
                              <p className="mt-2 text-xs text-blue-600">

                                Your{" "}
                                {tournament.game} UID
                                is not available.{" "}

                                <Link
                                  href="/settings"
                                  className="font-bold underline"
                                >
                                  Add it in Settings
                                </Link>

                                .

                              </p>
                            )}

                        </div>
                      );
                    }
                  )}

                </div>

              </div>

              {/* =================================================
                  VALIDATION SUMMARY
              ================================================= */}

              {!alreadyRegistered && (
                <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">

                  <div className="flex items-center justify-between">

                    <span className="text-sm font-semibold text-slate-600">
                      Player verification
                    </span>

                    <span
                      className={`text-sm font-bold ${
                        allPlayersValid
                          ? "text-green-400"
                          : "text-slate-500"
                      }`}
                    >
                      {
                        validation.filter(
                          (item) =>
                            item.checked &&
                            item.valid
                        ).length
                      }{" "}
                      /{" "}
                      {requiredIds} verified
                    </span>

                  </div>

                  {!allPlayersValid && (
                    <p className="mt-2 text-xs text-slate-400">
                      All player IDs must be verified before continuing to payment.
                    </p>
                  )}

                  {allPlayersValid && (
                    <p className="mt-2 text-xs text-green-400">
                      ✓ All player IDs have been successfully verified.
                    </p>
                  )}

                </div>
              )}

              {/* =================================================
                  RULE CHECKBOX
              ================================================= */}

              {!alreadyRegistered && (
                <div className="mt-6 flex items-start gap-3">

                  <input
                    id="terms"
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) =>
                      setAgreed(
                        e.target.checked
                      )
                    }
                    className="mt-1 h-4 w-4 accent-blue-600"
                  />

                  <label
                    htmlFor="terms"
                    className="text-xs leading-5 text-slate-500"
                  >
                    I confirm that the information
                    provided is correct and I agree
                    to the tournament rules.
                  </label>

                </div>
              )}

              {/* =================================================
                  ERROR
              ================================================= */}

              {submitError &&
                !showPaymentModal && (
                  <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-400">
                    {submitError}
                  </div>
                )}

              {/* =================================================
                  SUCCESS
              ================================================= */}

              {message &&
                !alreadyRegistered && (
                  <div className="mt-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-400">
                    {message}
                  </div>
                )}

            </div>
          </div>

          {/* =================================================
              SUMMARY
          ================================================= */}

          <div>

            <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-6">

              <h2 className="text-lg font-black">
                Registration Summary
              </h2>

              <div className="mt-5 rounded-xl bg-slate-50 p-4">

                <p className="font-bold">
                  {tournament.name}
                </p>

                <p className="mt-2 text-sm text-slate-500">
                  {tournament.game} •{" "}
                  {tournament.mode}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  {tournament.date} •{" "}
                  {tournament.time}
                </p>

              </div>

              {/* REQUIRED IDS */}

              <div className="mt-6 space-y-3 text-sm">

                <div className="flex justify-between">

                  <span className="text-slate-500">
                    Required IDs
                  </span>

                  <span className="font-bold">
                    {requiredIds}
                  </span>

                </div>

                <div className="flex justify-between">

                  <span className="text-slate-500">
                    Entered IDs
                  </span>

                  <span className="font-bold">
                    {
                      players.filter(
                        (id) =>
                          id.trim()
                            .length > 0
                      ).length
                    }{" "}
                    /{" "}
                    {requiredIds}
                  </span>

                </div>

                <div className="flex justify-between">

                  <span className="text-slate-500">
                    Verified IDs
                  </span>

                  <span
                    className={
                      allPlayersValid
                        ? "font-bold text-green-400"
                        : "font-bold"
                    }
                  >
                    {
                      validation.filter(
                        (item) =>
                          item.checked &&
                          item.valid
                      ).length
                    }{" "}
                    /{" "}
                    {requiredIds}
                  </span>

                </div>

              </div>

              {/* ENTRY FEE */}

              <div className="mt-6 border-t border-slate-200 pt-5">

                <div className="flex justify-between">

                  <span className="text-slate-500">
                    Entry Fee
                  </span>

                  <span className="text-xl font-black text-blue-600">
                    ₹
                    {tournament.entryFee}
                  </span>

                </div>

              </div>

              {/* REGISTER */}

              {alreadyRegistered ? (
                <Link
                  href="/my-tournaments"
                  className="mt-7 block w-full rounded-xl bg-blue-600 px-5 py-3.5 text-center font-bold text-black transition hover:bg-blue-700"
                >
                  View My Tournament
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={
                    handleRegisterClick
                  }
                  disabled={
                    submitting
                  }
                  className="mt-7 w-full rounded-xl bg-blue-600 px-5 py-3.5 font-bold text-black hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting
                    ? "Processing..."
                    : "Register & Join Tournament"}
                </button>
              )}

              <p className="mt-4 text-center text-xs leading-5 text-slate-400">
                All player IDs are verified
                before payment. After
                confirmation, you will complete
                payment using the UPI QR code and
                submit your UTR.
              </p>

            </div>
          </div>

        </div>
      </section>

      {/* =================================================
          CONFIRMATION POPUP
      ================================================= */}

      {showPopup &&
        !alreadyRegistered && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-5 backdrop-blur-sm">

            <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6">

              <h2 className="text-xl font-black">
                Confirm Registration
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Please confirm the following before
                continuing to payment.
              </p>

              {/* IMPORTANT */}

              <div className="mt-5 rounded-xl border border-blue-200 bg-blue-50 p-4">

                <p className="text-sm font-bold text-blue-700">
                  Important
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-600">

                  All submitted{" "}
                  <span className="font-bold text-slate-900">
                    {tournament.game}
                  </span>{" "}
                  IDs must belong to registered
                  player accounts and satisfy the
                  tournament requirements.

                </p>

                <p className="mt-3 text-sm font-bold leading-6 text-red-400">
                  If any ID is invalid, incorrect,
                  or does not meet the tournament
                  requirements, the registration may
                  be rejected.
                </p>

              </div>

              {/* VERIFIED IDS */}

              <div className="mt-5">

                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Verified Game IDs
                </p>

                <div className="mt-3 space-y-2">

                  {players.map(
                    (id, index) => {

                      const item =
                        validatedPlayers[
                          index
                        ];

                      return (
                        <div
                          key={index}
                          className="rounded-lg bg-slate-50 px-4 py-3"
                        >

                          <div className="flex items-center justify-between">

                            <span className="text-sm text-slate-500">
                              Player{" "}
                              {index + 1}
                            </span>

                            <span className="font-mono text-sm font-bold text-slate-900">
                              {id}
                            </span>

                          </div>

                          {item?.playerName && (
                            <p className="mt-2 text-xs text-green-400">
                              ✓{" "}
                              {item.playerName}
                            </p>
                          )}

                        </div>
                      );
                    }
                  )}

                </div>
              </div>

              {/* CONFIRM */}

              <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">

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
                  className="mt-1 h-4 w-4 accent-blue-600"
                />

                <span className="text-xs leading-5 text-slate-500">
                  I confirm that all game IDs are
                  correct and belong to the intended
                  registered players. I understand
                  that invalid information can result
                  in registration rejection.
                </span>

              </label>

              {/* BUTTONS */}

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  onClick={() => {
                    setShowPopup(
                      false
                    );

                    setLevelConfirmed(
                      false
                    );

                    setSubmitError("");
                  }}
                  disabled={
                    submitting
                  }
                  className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-100"
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
                  className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-black hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Continue to Payment
                </button>

              </div>

            </div>
          </div>
        )}

      {/* =================================================
          PAYMENT MODAL
      ================================================= */}

      {showPaymentModal &&
        !alreadyRegistered && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 px-5 py-6 backdrop-blur-sm">

            <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-8">

              {/* HEADER */}

              <div className="text-center">

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-2xl">
                  💳
                </div>

                <h2 className="mt-4 text-2xl font-black">
                  Complete Payment
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Pay the tournament entry fee,
                  then enter your UTR below.
                </p>

              </div>

              {/* AMOUNT */}

              <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-5 text-center">

                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Tournament Entry Fee
                </p>

                <p className="mt-2 text-3xl font-black text-blue-600">
                  ₹
                  {tournament.entryFee}
                </p>

              </div>

              {/* QR CODE */}

              <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">

                <p className="text-center text-sm font-bold text-black">
                  Scan & Pay
                </p>

                <div className="mt-4 flex justify-center">

                  <img
                    src={qrCode}
                    alt="Tournament payment UPI QR code"
                    className="h-64 w-64 rounded-xl object-contain"
                  />

                </div>

              </div>

              {/* PAYMENT INSTRUCTIONS */}

              <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">

                <p className="text-sm font-bold text-slate-900">
                  Payment Instructions
                </p>

                <ol className="mt-3 space-y-2 text-xs leading-5 text-slate-500">

                  <li>
                    1. Scan the QR code using any UPI app.
                  </li>

                  <li>
                    2. Pay exactly ₹
                    {tournament.entryFee}.
                  </li>

                  <li>
                    3. Wait until the payment is successful.
                  </li>

                  <li>
                    4. Open your payment transaction details.
                  </li>

                  <li>
                    5. Copy the UTR / Transaction ID.
                  </li>

                  <li>
                    6. Enter the UTR below.
                  </li>

                </ol>

              </div>

              {/* UTR */}

              <div className="mt-6">

                <label
                  htmlFor="utr"
                  className="text-sm font-semibold text-slate-700"
                >
                  UTR / Transaction ID

                  <span className="ml-1 text-red-500">
                    *
                  </span>

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
                  placeholder="Enter your UTR / Transaction ID"
                  autoComplete="off"
                  required
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500"
                />

                <p className="mt-2 text-xs leading-5 text-slate-400">
                  UTR is mandatory. Your payment
                  will remain pending until the admin
                  verifies the transaction.
                </p>

              </div>

              {/* ERROR */}

              {submitError && (
                <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-400">
                  {submitError}
                </div>
              )}

              {/* BUTTONS */}

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  onClick={() => {

                    if (submitting) {
                      return;
                    }

                    setShowPaymentModal(
                      false
                    );

                    setUtr("");

                    setSubmitError("");
                  }}
                  disabled={
                    submitting
                  }
                  className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
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
                  className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-black hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {submitting
                    ? "Submitting..."
                    : "Submit Payment & Registration"}
                </button>

              </div>

            </div>
          </div>
        )}

    </main>
  );
}