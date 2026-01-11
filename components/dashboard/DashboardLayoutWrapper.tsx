"use client";

import { useState } from "react";
import React from "react";
import Sidebar from "./Sidebar";
import FixedCreditChip from "./FixedCreditChip"; // ✅ ADD THIS

export default function DashboardLayoutWrapper({
  children,
  isInfluencer,
}: {
  children: React.ReactNode;
  isInfluencer: boolean;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="relative flex flex-col md:flex-row min-h-screen bg-[#0D0D0D] text-white">
      
      {/* Sidebar */}
      <Sidebar
        isInfluencer={isInfluencer}
        isCollapsed={isCollapsed}
        isMobileOpen={isMobileOpen}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        onOpenMobile={() => setIsMobileOpen(true)}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto h-screen">
        {children}
      </main>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/80 z-30 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* 🔥 GLOBAL REAL-TIME CREDIT CHIP (BOTTOM-LEFT) */}
      <FixedCreditChip />
    </div>
  );
}
