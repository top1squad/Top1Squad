"use client";

type GameBadgeProps = {
  game?: string | null;
  size?: "sm" | "md";
};

export default function GameBadge({
  game,
  size = "md",
}: GameBadgeProps) {
  const normalized = String(game || "")
    .trim()
    .toLowerCase();

  const isBgmi = normalized === "bgmi";
  const isFreeFire =
    normalized === "free fire" ||
    normalized === "freefire";

  const label = isBgmi
    ? "BGMI"
    : isFreeFire
    ? "Free Fire"
    : game || "Game";

  return (
    <span
      className={[
        "inline-flex items-center gap-2 rounded-full border font-bold tracking-wide",
        size === "sm"
          ? "px-2.5 py-1 text-[10px]"
          : "px-3 py-1.5 text-[11px]",
        isBgmi
          ? "border-blue-200 bg-blue-50 text-blue-700"
          : isFreeFire
          ? "border-sky-200 bg-sky-50 text-sky-700"
          : "border-slate-200 bg-slate-50 text-slate-600",
      ].join(" ")}
    >
      <span
        className={[
          "h-1.5 w-1.5 rounded-full",
          isBgmi
            ? "bg-blue-600"
            : isFreeFire
            ? "bg-sky-500"
            : "bg-slate-400",
        ].join(" ")}
      />

      {label}
    </span>
  );
}