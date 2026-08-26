"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";

// ======================================================
// API
// ======================================================

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || ""
).replace(/\/$/, "");

// ======================================================
// TYPES
// ======================================================

type TournamentType =
  | "normal"
  | "tdm"
  | "clash"
  | "unknown";

type Player = {
  _id?: string;
  user?: string | null;
  userId?: string | null;
  slot?: number;
  uid?: string;
  gameUid?: string;
  name?: string;
  playerName?: string;
  verified?: boolean;
};