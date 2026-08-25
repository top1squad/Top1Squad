export default function GameBadge({ game }) {
  const isBgmi = game === "BGMI";

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
        isBgmi
          ? "border-blue-200 bg-blue-50 text-blue-600"
          : "border-sky-200 bg-sky-50 text-sky-600"
      }`}
    >
      {game}
    </span>
  );
}