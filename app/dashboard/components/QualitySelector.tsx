"use client";

export default function QualitySelector({
  value,
  onChangeAction,
}: {
  value: "480p" | "720p";
  onChangeAction: (v: "480p" | "720p") => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChangeAction(e.target.value as any)}
      className="bg-black border border-neutral-700 rounded px-3 py-2 text-white"
    >
      <option value="480p">480p</option>
      <option value="720p">720p</option>
    </select>
  );
}
