"use client";

import { useCredits } from "@/providers/CreditsProvider";
import { Flame } from "lucide-react";

export default function FixedCreditChip() {
  const { credits } = useCredits();

  return (
    <div
      className="
        fixed
        bottom-6
        left-6
        z-50
        px-5
        py-2.5
        rounded-full
        bg-black/60
        backdrop-blur-xl
        border border-white/20
        shadow-lg
        flex items-center gap-2
        text-sm
        text-white
        hover:scale-105
        transition
      "
    >
      <Flame size={16} className="text-orange-400" />
      <span className="font-semibold">{credits}</span>
      <span className="text-gray-300">Credits</span>
    </div>
  );
}
