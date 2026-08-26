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
// PRODUCTION API CONFIGURATION
// ======================================================
//
// IMPORTANT:
//
// Put your DEPLOYED EXPRESS BACKEND URL here.
//
// Example:
//
// const PRODUCTION_API_URL =
//   "https://top1squad-backend.onrender.com";
//
// Do NOT add /api at the end.
//
// Correct:
// https://your-backend.com
//
// Wrong:
// https://your-backend.com/api
//
// ======================================================

const PRODUCTION_API_URL =
  "https://YOUR-BACKEND-DOMAIN.com";

// ======================================================
// API URL
// ======================================================
//
// Priority:
//
// 1. NEXT_PUBLIC_API_URL
// 2. Production backend URL above
// 3. localhost only during local development
//
// ======================================================

function getApiUrl(): string {
  const environmentUrl =
    String(
      process.env.NEXT_PUBLIC_API_URL || ""
    ).trim();

  const productionUrl =
    String(
      PRODUCTION_API_URL || ""
    ).trim();

  const isBrowser =
    typeof window !== "undefined";

  const isProduction =
    process.env.NODE_ENV === "production";

  let selectedUrl = "";

  if (environmentUrl) {
    selectedUrl = environmentUrl;
  } else if (
    isProduction &&
    productionUrl &&
    !productionUrl.includes(
      "YOUR-BACKEND-DOMAIN"
    )
  ) {
    selectedUrl = productionUrl;
  } else if (!isProduction) {
    selectedUrl =
      "http://localhost:5001";
  } else {
    throw new Error(
      "Production backend URL is not configured."
    );
  }

  selectedUrl =
    selectedUrl
      .replace(/\/+$/, "")
      .replace(/\/api$/, "");

  // Prevent accidental frontend-relative API requests.
  if (
    isBrowser &&
    isProduction &&
    !selectedUrl.startsWith("http://") &&
    !selectedUrl.startsWith("https://")
  ) {
    throw new Error(
      "Invalid production backend URL."
    );
  }

  return selectedUrl;
}

const API_URL = getApiUrl();

// ======================================================
// API HELPER
// ======================================================

async function apiRequest<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<{
  response: Response;
  data: T | null;
}> {
  const cleanPath =
    path.startsWith("/")
      ? path
      : `/${path}`;

  const url =
    `${API_URL}${cleanPath}`;

  const headers = new Headers(
    options.headers || {}
  );

  headers.set(
    "Accept",
    "application/json"
  );

  if (
    options.body &&
    !headers.has("Content-Type")
  ) {
    headers.set(
      "Content-Type",
      "application/json"
    );
  }

  let response: Response;

  try {
    response = await fetch(
      url,
      {
        ...options,
        headers,
        credentials: "include",
        cache: "no-store",
      }
    );
  } catch (error) {
    console.error(
      "[API NETWORK ERROR]",
      {
        url,
        error,
      }
    );

    throw new Error(
      "Unable to connect to the server. Please check your internet connection or try again."
    );
  }

  const text =
    await response.text();

  let data: T | null = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      console.error(
        "[API NON-JSON RESPONSE]",
        {
          url,
          status:
            response.status,
          body: text.slice(
            0,
            500
          ),
        }
      );
    }
  }

  return {
    response,
    data,
  };
}

// ======================================================
// API ERROR MESSAGE
// ======================================================

function getApiErrorMessage(
  data: any,
  fallback: string
): string {
  return (
    data?.message ||
    data?.error ||
    data?.msg ||
    fallback
  );
}

// ======================================================
// REQUIRED IDS
// ======================================================

function getRequiredIds(
  mode: string
): number {
  const currentMode =
    String(mode || "")
      .toLowerCase()
      .trim();

  if (
    currentMode.includes(
      "solo"
    )
  ) {
    return 1;
  }

  if (
    currentMode.includes(
      "duo"
    )
  ) {
    return 2;
  }

  if (
    currentMode.includes(
      "squad"
    )
  ) {
    return 4;
  }

  return 1;
}

// ======================================================
// EMPTY VALIDATION
// ======================================================

const createEmptyValidation =
  (): PlayerValidation => ({
    checking: false,
    checked: false,
    valid: false,
    message: "",
    playerName: "",
    userId: "",
  });

// ======================================================
// EMPTY VALIDATED PLAYER
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
  if (
    game === "Free Fire"
  ) {
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
  const params =
    useParams();

  const router =
    useRouter();

  const searchParams =
    useSearchParams();

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
    searchParams?.get(
      "tournamentId"
    ) ||
    searchParams?.get("id") ||
    "";

  const tournamentId =
    String(
      routeTournamentId ||
        queryTournamentId ||
        ""
    ).trim();

  // ====================================================
  // STATE
  // ====================================================

  const [
    tournament,
    setTournament,
  ] =
    useState<Tournament | null>(
      null
    );

  const [
    user,
    setUser,
  ] =
    useState<User | null>(
      null
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState("");

  const [
    playerTeamName,
    setPlayerTeamName,
  ] =
    useState("");

  const [
    players,
    setPlayers,
  ] =
    useState<string[]>([
      "",
    ]);

  const [
    validatedPlayers,
    setValidatedPlayers,
  ] =
    useState<ValidatedPlayer[]>([
      createEmptyValidatedPlayer(),
    ]);

  const [
    validation,
    setValidation,
  ] =
    useState<PlayerValidation[]>([
      createEmptyValidation(),
    ]);

  const [
    agreed,
    setAgreed,
  ] =
    useState(false);

  const [
    submitting,
    setSubmitting,
  ] =
    useState(false);

  const [
    message,
    setMessage,
  ] =
    useState("");

  const [
    submitError,
    setSubmitError,
  ] =
    useState("");

  // ====================================================
  // CONFIRMATION POPUP
  // ====================================================

  const [
    showPopup,
    setShowPopup,
  ] =
    useState(false);

  const [
    levelConfirmed,
    setLevelConfirmed,
  ] =
    useState(false);

  // ====================================================
  // ALREADY REGISTERED
  // ====================================================

  const [
    alreadyRegistered,
    setAlreadyRegistered,
  ] =
    useState(false);

  // ====================================================
  // PAYMENT MODAL
  // ====================================================

  const [
    showPaymentModal,
    setShowPaymentModal,
  ] =
    useState(false);

  // ====================================================
  // UTR
  // ====================================================

  const [
    utr,
    setUtr,
  ] =
    useState("");

  // ====================================================
  // REQUIRED IDS
  // ====================================================

  const requiredIds =
    tournament
      ? getRequiredIds(
          tournament.mode
        )
      : 1;

  // ====================================================
  // GAME
  // ====================================================

  const game:
    | "BGMI"
    | "Free Fire" =
    tournament?.game ===
    "Free Fire"
      ? "Free Fire"
      : "BGMI";

  // ====================================================
  // LOAD TOURNAMENT + USER
  // ====================================================

  useEffect(() => {
    if (!tournamentId) {
      setError(
        "Invalid tournament ID."
      );

      setLoading(false);

      return;
    }

    let cancelled = false;

    const loadData =
      async () => {
        try {
          setLoading(true);
          setError("");

          // ==========================================
          // TOURNAMENT
          // ==========================================

          const {
            response:
              tournamentResponse,
            data:
              tournamentData,
          } =
            await apiRequest(
              `/api/tournaments/${encodeURIComponent(
                tournamentId
              )}`,
              {
                method: "GET",
              }
            );

          if (
            !tournamentResponse.ok
          ) {
            throw new Error(
              getApiErrorMessage(
                tournamentData,
                "Tournament not found."
              )
            );
          }

          const tournamentInfo =
            tournamentData?.tournament ||
            tournamentData?.data?.tournament ||
            tournamentData?.data ||
            tournamentData;

          if (
            !tournamentInfo?._id
          ) {
            throw new Error(
              "Tournament information was not returned by the server."
            );
          }

          if (cancelled) {
            return;
          }

          setTournament(
            tournamentInfo
          );

          // ==========================================
          // CURRENT USER
          // ==========================================

          const {
            response:
              userResponse,
            data:
              userData,
          } =
            await apiRequest(
              "/api/auth/me",
              {
                method: "GET",
              }
            );

          if (
            !userResponse.ok
          ) {
            throw new Error(
              getApiErrorMessage(
                userData,
                "Please login before registering."
              )
            );
          }

          const currentUser =
            userData?.user ||
            userData?.data?.user ||
            userData?.data ||
            userData;

          if (!currentUser) {
            throw new Error(
              "User information was not returned by the server."
            );
          }

          if (cancelled) {
            return;
          }

          setUser(
            currentUser
          );

          // ==========================================
          // SAVED GAME UID
          // ==========================================

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
            setPlayers(
              Array.from(
                {
                  length:
                    required,
                },
                (_, index) =>
                  index === 0
                    ? savedUid
                    : ""
              )
            );
          } else {
            setPlayers(
              Array.from(
                {
                  length:
                    required,
                },
                () => ""
              )
            );

            setError(
              `Please add your ${tournamentInfo.game} UID in Settings first.`
            );
          }

          setValidatedPlayers(
            Array.from(
              {
                length:
                  required,
              },
              () =>
                createEmptyValidatedPlayer()
            )
          );

          setValidation(
            Array.from(
              {
                length:
                  required,
              },
              () =>
                createEmptyValidation()
            )
          );
        } catch (err) {
          console.error(
            "[REGISTRATION PAGE ERROR]",
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
  // CHANGE PLAYER COUNT
  // ====================================================

  useEffect(() => {
    if (!tournament) {
      return;
    }

    const required =
      getRequiredIds(
        tournament.mode
      );

    setPlayers(
      (currentPlayers) => {
        const updated = [
          ...currentPlayers,
        ];

        while (
          updated.length <
          required
        ) {
          updated.push("");
        }

        if (
          updated.length >
          required
        ) {
          updated.length =
            required;
        }

        if (user) {
          const primaryUid =
            getSavedGameUid(
              user,
              tournament.game
            );

          if (primaryUid) {
            updated[0] =
              primaryUid;
          }
        }

        return updated;
      }
    );

    setValidation(
      (current) => {
        const updated = [
          ...current,
        ];

        while (
          updated.length <
          required
        ) {
          updated.push(
            createEmptyValidation()
          );
        }

        if (
          updated.length >
          required
        ) {
          updated.length =
            required;
        }

        return updated;
      }
    );

    setValidatedPlayers(
      (current) => {
        const updated = [
          ...current,
        ];

        while (
          updated.length <
          required
        ) {
          updated.push(
            createEmptyValidatedPlayer()
          );
        }

        if (
          updated.length >
          required
        ) {
          updated.length =
            required;
        }

        return updated;
      }
    );
  }, [
    tournament,
    user,
  ]);

  // ====================================================
  // VALIDATE PLAYER UID
  // ====================================================

  const validatePlayerUid =
    useCallback(
      async (
        index: number,
        uid: string
      ): Promise<{
        valid: boolean;
        player?: ValidatedPlayer;
        message?: string;
      }> => {
        const cleanUid =
          String(
            uid || ""
          ).trim();

        if (!cleanUid) {
          const result = {
            valid: false,
            message:
              `${game} ID is required.`,
          };

          setValidation(
            (old) => {
              const next = [
                ...old,
              ];

              next[index] = {
                checking:
                  false,
                checked:
                  true,
                valid:
                  false,
                message:
                  result.message,
                playerName: "",
                userId: "",
              };

              return next;
            }
          );

          setValidatedPlayers(
            (old) => {
              const next = [
                ...old,
              ];

              next[index] =
                createEmptyValidatedPlayer();

              return next;
            }
          );

          return result;
        }

        // ==========================================
        // CHECKING
        // ==========================================

        setValidation(
          (old) => {
            const next = [
              ...old,
            ];

            next[index] = {
              checking:
                true,
              checked:
                false,
              valid:
                false,
              message:
                `Checking ${game} ID...`,
              playerName: "",
              userId: "",
            };

            return next;
          }
        );

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

          const {
            response,
            data,
          } =
            await apiRequest(
              `/api/registrations/validate-player-uid?${query.toString()}`,
              {
                method: "GET",
              }
            );

          console.log(
            "[PLAYER UID VALIDATION]",
            {
              index:
                index + 1,
              game,
              uid:
                cleanUid,
              status:
                response.status,
              data,
            }
          );

          if (
            !response.ok
          ) {
            throw new Error(
              getApiErrorMessage(
                data,
                "Player ID is not registered."
              )
            );
          }

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
            !String(
              userId
            ).trim()
          ) {
            throw new Error(
              getApiErrorMessage(
                data,
                "This Game ID is not registered in the users database."
              )
            );
          }

          const normalizedPlayer: ValidatedPlayer =
            {
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
                String(
                  userId
                ).trim(),
            };

          // ========================================
          // SAVE VALIDATED PLAYER
          // ========================================

          setValidatedPlayers(
            (old) => {
              const next = [
                ...old,
              ];

              next[index] =
                normalizedPlayer;

              return next;
            }
          );

          // ========================================
          // SAVE VALIDATION
          // ========================================

          setValidation(
            (old) => {
              const next = [
                ...old,
              ];

              next[index] = {
                checking:
                  false,
                checked:
                  true,
                valid:
                  true,
                message:
                  `Valid player: ${normalizedPlayer.playerName}`,
                playerName:
                  normalizedPlayer.playerName,
                userId:
                  normalizedPlayer.user,
              };

              return next;
            }
          );

          return {
            valid: true,
            player:
              normalizedPlayer,
          };
        } catch (err) {
          console.error(
            "[PLAYER UID VALIDATION ERROR]",
            err
          );

          const errorMessage =
            err instanceof Error
              ? err.message
              : `Player ${index + 1} ${game} ID is not registered.`;

          setValidation(
            (old) => {
              const next = [
                ...old,
              ];

              next[index] = {
                checking:
                  false,
                checked:
                  true,
                valid:
                  false,
                message:
                  errorMessage,
                playerName: "",
                userId: "",
              };

              return next;
            }
          );

          setValidatedPlayers(
            (old) => {
              const next = [
                ...old,
              ];

              next[index] =
                createEmptyValidatedPlayer();

              return next;
            }
          );

          return {
            valid: false,
            message:
              errorMessage,
          };
        }
      },
      [
        game,
      ]
    );

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
  }, [
    players[0],
    game,
    tournamentId,
    tournament,
    validatePlayerUid,
  ]);

  // ====================================================
  // PLAYER ID CHANGE
  // ====================================================

  const handlePlayerChange =
    (
      index: number,
      value: string
    ) => {
      // Player 1 belongs to logged-in user.
      if (index === 0) {
        return;
      }

      setPlayers(
        (currentPlayers) => {
          const updated = [
            ...currentPlayers,
          ];

          updated[index] =
            value;

          return updated;
        }
      );

      setValidation(
        (old) => {
          const next = [
            ...old,
          ];

          next[index] =
            createEmptyValidation();

          return next;
        }
      );

      setValidatedPlayers(
        (old) => {
          const next = [
            ...old,
          ];

          next[index] =
            createEmptyValidatedPlayer();

          return next;
        }
      );

      setSubmitError("");
      setMessage("");
    };

  // ====================================================
  // ALL PLAYERS VALID
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
        players.every(
          (id) =>
            Boolean(
              String(
                id || ""
              ).trim()
            )
        );

      const allValid =
        validation.every(
          (item) =>
            item.checked &&
            item.valid &&
            Boolean(
              String(
                item.userId ||
                  ""
              ).trim()
            )
        );

      const allValidated =
        validatedPlayers.every(
          (player) =>
            Boolean(
              String(
                player.gameUid ||
                  ""
              ).trim()
            ) &&
            Boolean(
              String(
                player.user ||
                  ""
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

      if (alreadyRegistered) {
        setSubmitError(
          "You are already registered for this tournament."
        );

        return;
      }

      if (
        !playerTeamName.trim()
      ) {
        setSubmitError(
          "Please enter player/team name."
        );

        return;
      }

      if (!tournament) {
        return;
      }

      if (!user) {
        setSubmitError(
          "Please login before registering."
        );

        return;
      }

      // ==========================================
      // PLAYER IDS
      // ==========================================

      const ids =
        players
          .slice(
            0,
            requiredIds
          )
          .map(
            (id) =>
              String(
                id || ""
              ).trim()
          );

      if (
        ids.length !==
        requiredIds ||
        ids.some(
          (id) => !id
        )
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

      // ==========================================
      // DUPLICATES
      // ==========================================

      const uniqueIds =
        new Set(
          ids.map(
            (id) =>
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

      // ==========================================
      // PRIMARY UID
      // ==========================================

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
        ids[0] !==
        primaryUid.trim()
      ) {
        setSubmitError(
          `Player 1 must be your saved ${tournament.game} UID.`
        );

        return;
      }

      // ==========================================
      // TERMS
      // ==========================================

      if (!agreed) {
        setSubmitError(
          "Please agree to the tournament rules."
        );

        return;
      }

      // ==========================================
      // VALIDATE EVERY PLAYER
      //
      // IMPORTANT:
      // Use local results instead of immediately
      // reading React state after setState().
      // ==========================================

      setSubmitError("");

      const freshValidatedPlayers: ValidatedPlayer[] =
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

        if (
          !result.valid ||
          !result.player
        ) {
          setSubmitError(
            result.message ||
              `Player ${index + 1} ${tournament.game} ID could not be verified.`
          );

          return;
        }

        freshValidatedPlayers.push(
          result.player
        );
      }

      // ==========================================
      // EXACT VALIDATION COUNT
      // ==========================================

      if (
        freshValidatedPlayers.length !==
        requiredIds
      ) {
        setSubmitError(
          `Exactly ${requiredIds} validated players are required.`
        );

        return;
      }

      // ==========================================
      // OPEN POPUP
      // ==========================================

      setLevelConfirmed(
        false
      );

      setShowPopup(
        true
      );
    };

  // ====================================================
  // CONFIRM REGISTRATION
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

      setShowPopup(
        false
      );

      setLevelConfirmed(
        false
      );

      setUtr("");

      setShowPaymentModal(
        true
      );
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

      // ==========================================
      // UTR
      // ==========================================

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

      // ==========================================
      // PLAYER IDS
      // ==========================================

      const ids =
        players
          .slice(
            0,
            requiredIds
          )
          .map(
            (id) =>
              String(
                id || ""
              ).trim()
          );

      if (
        ids.length !==
          requiredIds ||
        ids.some(
          (id) => !id
        )
      ) {
        setSubmitError(
          `Exactly ${requiredIds} ${tournament.game} IDs are required.`
        );

        return;
      }

      // ==========================================
      // DUPLICATES
      // ==========================================

      const uniqueIds =
        new Set(
          ids.map(
            (id) =>
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

      // ==========================================
      // PRIMARY UID CHECK
      // ==========================================

      const primaryUid =
        getSavedGameUid(
          user,
          tournament.game
        );

      if (
        !primaryUid ||
        ids[0] !==
          primaryUid.trim()
      ) {
        setSubmitError(
          `Player 1 must be your saved ${tournament.game} UID.`
        );

        return;
      }

      setSubmitting(
        true
      );

      setSubmitError("");
      setMessage("");

      try {
        // ==========================================
        // FINAL SERVER VALIDATION
        //
        // Do not trust old browser state.
        // ==========================================

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

          if (
            !result.valid ||
            !result.player
          ) {
            throw new Error(
              result.message ||
                `Player ${index + 1} ${tournament.game} ID could not be verified.`
            );
          }

          finalValidatedPlayers.push(
            result.player
          );
        }

        // ==========================================
        // FINAL COUNT
        // ==========================================

        if (
          finalValidatedPlayers.length !==
          requiredIds
        ) {
          throw new Error(
            `Exactly ${requiredIds} validated players are required.`
          );
        }

        // ==========================================
        // DUPLICATE VALIDATED IDS
        // ==========================================

        const validatedIds =
          finalValidatedPlayers.map(
            (player) =>
              player.gameUid
                .trim()
                .toLowerCase()
          );

        const uniqueValidatedIds =
          new Set(
            validatedIds
          );

        if (
          uniqueValidatedIds.size !==
          validatedIds.length
        ) {
          throw new Error(
            "The same game ID cannot be used more than once."
          );
        }

        // ==========================================
        // CREATE REGISTRATION
        // ==========================================

        const {
          response,
          data,
        } =
          await apiRequest(
            "/api/registrations",
            {
              method: "POST",

              body: JSON.stringify({
                tournament:
                  tournamentId,

                playerTeamName:
                  playerTeamName.trim(),

                // Main/leader UID
                gameUid:
                  finalValidatedPlayers[0]
                    .gameUid,

                // All verified player UIDs
                players:
                  finalValidatedPlayers.map(
                    (player) =>
                      player.gameUid
                  ),

                // UTR
                utr:
                  cleanUtr,
              }),
            }
          );

        console.log(
          "[REGISTRATION RESPONSE]",
          {
            status:
              response.status,
            data,
          }
        );

        // ==========================================
        // ALREADY REGISTERED
        // ==========================================

        if (
          response.status ===
            400 ||
          response.status ===
            409
        ) {
          const backendMessage =
            getApiErrorMessage(
              data,
              ""
            );

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

        // ==========================================
        // OTHER BACKEND ERROR
        // ==========================================

        if (
          !response.ok
        ) {
          throw new Error(
            getApiErrorMessage(
              data,
              "Registration failed."
            )
          );
        }

        // ==========================================
        // SUCCESS
        // ==========================================

        setShowPaymentModal(
          false
        );

        setShowPopup(
          false
        );

        setUtr("");

        setLevelConfirmed(
          false
        );

        setMessage(
          "Payment submitted successfully. Your registration is pending admin verification."
        );

        // ==========================================
        // REDIRECT
        // ==========================================

        window.setTimeout(
          () => {
            router.push(
              "/my-tournaments"
            );
          },
          1500
        );
      } catch (err) {
        console.error(
          "[REGISTRATION ERROR]",
          err
        );

        setSubmitError(
          err instanceof Error
            ? err.message
            : "Registration failed."
        );
      } finally {
        setSubmitting(
          false
        );
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
                  maxLength={100}
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
                    (
                      player,
                      index
                    ) => {

                      const itemValidation =
                        validation[
                          index
                        ];

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
                            value={
                              player
                            }
                            onChange={(e) =>
                              handlePlayerChange(
                                index,
                                e.target.value
                              )
                            }
                            readOnly={
                              index ===
                                0 &&
                              !!player
                            }
                            disabled={
                              alreadyRegistered
                            }
                            autoComplete="off"
                            placeholder={
                              index ===
                              0
                                ? `Your ${tournament.game} UID`
                                : `Enter Player ${
                                    index +
                                    1
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
                              index ===
                                0 &&
                              player
                                ? "cursor-not-allowed"
                                : ""
                            }`}
                          />

                          {/* VALIDATING */}

                          {itemValidation?.checking && (
                            <p className="mt-2 text-xs text-blue-700">
                              ⏳{" "}
                              {itemValidation.message}
                            </p>
                          )}

                          {/* VALID */}

                          {itemValidation?.checked &&
                            itemValidation.valid && (
                              <div className="mt-2 rounded-lg border border-green-500/20 bg-blue-600/5 px-3 py-2">

                                <p className="text-xs font-semibold text-green-400">
                                  ✓{" "}
                                  {
                                    itemValidation.message
                                  }
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                  User ID:{" "}
                                  {
                                    itemValidation.userId
                                  }
                                </p>

                              </div>
                            )}

                          {/* INVALID */}

                          {itemValidation?.checked &&
                            !itemValidation.valid && (
                              <p className="mt-2 text-xs text-red-400">
                                ✕{" "}
                                {
                                  itemValidation.message
                                }
                              </p>
                            )}

                          {/* NO UID */}

                          {index ===
                            0 &&
                            !player && (
                              <p className="mt-2 text-xs text-blue-600">

                                Your{" "}
                                {
                                  tournament.game
                                }{" "}
                                UID is not
                                available.{" "}

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
                    checked={
                      agreed
                    }
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
                            .length >
                          0
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
                    {
                      tournament.entryFee
                    }
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
                    {
                      tournament.game
                    }
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
                    (
                      id,
                      index
                    ) => {

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
                              {
                                index +
                                1
                              }
                            </span>

                            <span className="font-mono text-sm font-bold text-slate-900">
                              {id}
                            </span>

                          </div>

                          {item?.playerName && (
                            <p className="mt-2 text-xs text-green-400">
                              ✓{" "}
                              {
                                item.playerName
                              }
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
                  {
                    tournament.entryFee
                  }
                </p>

              </div>

              {/* QR */}

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
                    {
                      tournament.entryFee
                    }.
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
                  value={
                    utr
                  }
                  onChange={(e) => {
                    setUtr(
                      e.target.value
                    );

                    if (
                      submitError
                    ) {
                      setSubmitError(
                        ""
                      );
                    }
                  }}
                  placeholder="Enter your UTR / Transaction ID"
                  autoComplete="off"
                  maxLength={100}
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

                    if (
                      submitting
                    ) {
                      return;
                    }

                    setShowPaymentModal(
                      false
                    );

                    setUtr("");

                    setSubmitError(
                      ""
                    );
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