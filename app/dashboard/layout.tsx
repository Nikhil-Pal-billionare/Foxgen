"use client";

import { ReactNode } from "react";

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const TOTAL_CREDITS = 10000; // 🔒 TEMP (will come from Supabase later)

  return (
    <div className="flex min-h-screen bg-black text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-neutral-950 border-r border-neutral-800 p-6 flex flex-col justify-between">
        <div>
          <h1 className="text-2xl font-bold text-red-600 mb-8">Foxgen</h1>

          <nav className="space-y-3">
            <a href="/dashboard" className="block text-gray-300 hover:text-white">
              Dashboard
            </a>
            <a href="/dashboard/thumbnail" className="block text-gray-300 hover:text-white">
              Thumbnail Generator
            </a>
            <a href="/dashboard/video-generator" className="block text-gray-300 hover:text-white">
              AI Video Creator
            </a>
            <a href="/dashboard/results" className="block text-gray-300 hover:text-white">
              Results
            </a>
          </nav>
        </div>

        {/* Credits */}
        <div className="pt-6 border-t border-neutral-800">
          <p className="text-sm text-gray-400">Total Credits</p>
          <p className="text-xl font-semibold text-white">
            {TOTAL_CREDITS.toLocaleString()}
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
