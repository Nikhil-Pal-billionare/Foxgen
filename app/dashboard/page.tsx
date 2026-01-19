"use client";

import { useState } from "react";
import Link from "next/link";
import PromptBox from "@/components/dashboard/PromptBox";
import ImageGrid from "@/components/dashboard/ImageGrid";
import { X } from "lucide-react";

export default function DashboardPage() {
  const [showBanner, setShowBanner] = useState(true);

  return (
    <div className="space-y-24">
      {/* 🔴 TOP NOTIFICATION BANNER */}
      {showBanner && (
        <div className="relative">
          <Link href="/dashboard/show-your-talent">
            <div className="cursor-pointer rounded-xl bg-red-600 px-6 py-4 text-center shadow-lg transition hover:bg-red-700">
              <p className="text-sm font-semibold text-white md:text-base">
                🎉 Show your talent & become a winner!
                <span className="block text-xs font-normal text-red-100 md:text-sm">
                  1 month me 3 baar winner banne par next month FREE 🔥  
                  (Scheme next month se start hogi — abhi sirf winners ke naam list honge)
                </span>
              </p>
            </div>
          </Link>

          {/* ❌ CLOSE BUTTON */}
          <button
            onClick={(e) => {
              e.stopPropagation(); // prevent link click
              setShowBanner(false);
            }}
            className="absolute right-3 top-3 rounded-full bg-red-700 p-1 text-white hover:bg-red-800"
            aria-label="Close banner"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* MAIN CONTENT */}
      <PromptBox />
      <ImageGrid />
    </div>
  );
}
