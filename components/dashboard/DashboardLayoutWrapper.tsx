"use client";

import { useState } from "react";
import React from "react";
import Sidebar from "./Sidebar";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    <div className="flex min-h-screen bg-[#0D0D0D] text-white">
      {/* Mobile Hamburger Trigger */}
      <div className={`md:hidden fixed top-4 left-4 z-50 ${isMobileOpen ? "hidden" : "block"}`}>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMobileOpen(true)}
          className="bg-[#0b0f19] border border-white/10 text-white"
        >
          <Menu className="w-5 h-5" />
        </Button>
      </div>

      {/* Sidebar */}
      <Sidebar
        isInfluencer={isInfluencer}
        isCollapsed={isCollapsed}
        isMobileOpen={isMobileOpen}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto h-screen">
        {/* Top spacer for mobile to account for hamburger if needed, 
            but sidebar is overlaid so maybe just standard padding */}
        <div className="md:hidden h-12" /> 
        {children}
      </main>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/80 z-30 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </div>
  );
}
