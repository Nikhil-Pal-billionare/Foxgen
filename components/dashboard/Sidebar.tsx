"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  LayoutDashboard,
  Image as ImageIcon,
  Video,
  CreditCard,
  History,
  Package,
  Star,
  Scissors,
  ChevronLeft,
  Menu,
  X,
  Film,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

interface SidebarProps {
  isInfluencer: boolean;
  isCollapsed: boolean;
  isMobileOpen: boolean;
  onToggleCollapse: () => void;
  onCloseMobile: () => void;
}

export default function Sidebar({
  isInfluencer,
  isCollapsed,
  isMobileOpen,
  onToggleCollapse,
  onCloseMobile
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside 
      className={cn(
        "bg-[#0b0f19] border-r border-white/10 flex flex-col transition-all duration-300 ease-in-out fixed md:relative z-40 h-full",
        // Mobile styles:
        isMobileOpen ? "translate-x-0 w-64 shadow-2xl" : "-translate-x-full md:translate-x-0",
        // Desktop styles (override mobile hidden state):
        isCollapsed ? "md:w-20" : "md:w-64"
      )}
    >

      {/* Header */}
      <div className={cn("flex items-center gap-3 p-4 mb-2 h-16", isCollapsed ? "justify-center" : "justify-between")}>
        <div className={cn("flex items-center gap-2 overflow-hidden transition-all", isCollapsed ? "w-0 opacity-0 md:hidden" : "w-auto opacity-100")}>
           <div className="shrink-0">
            <Image
              src="/demo/Foxgen-logo.png"
              alt="FoxGen"
              width={28}
              height={28}
              priority
            />
           </div>
           
           <span className="text-xl font-semibold whitespace-nowrap">
             FoxGen
           </span>
        </div>

        {/* Logo when collapsed (centered) */}
        {isCollapsed && (
          <div className="hidden md:block shrink-0">
             <Image
              src="/demo/Foxgen-logo.png"
              alt="FoxGen"
              width={24}
              height={24}
              priority
            />
          </div>
        )}

        {/* Desktop Collapse Trigger */}
        <button 
          onClick={onToggleCollapse} 
          className="hidden md:flex text-gray-400 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-md"
        >
          {isCollapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
        </button>

         {/* Mobile Close Trigger */}
         <button 
          onClick={onCloseMobile} 
          className="md:hidden text-gray-400 hover:text-white ml-auto"
        >
          <X size={20} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="space-y-1 flex-1 px-3 overflow-y-auto overflow-x-hidden">
        <SidebarItem icon={LayoutDashboard} label="Dashboard" href="/dashboard" isCollapsed={isCollapsed} active={pathname === "/dashboard"} />
        <SidebarItem icon={Package} label="Products" href="/dashboard/products" isCollapsed={isCollapsed} active={pathname.startsWith("/dashboard/products")} />
        <SidebarItem icon={ImageIcon} label="Images" href="/dashboard/image-generator" isCollapsed={isCollapsed} active={pathname.startsWith("/dashboard/image-generator")} />
        <SidebarItem icon={Video} label="Videos" href="/dashboard/video-generator" isCollapsed={isCollapsed} active={pathname.startsWith("/dashboard/video-generator")} />
        <SidebarItem icon={Scissors} label="AI Cut Editor" href="/dashboard/cut-editor" isCollapsed={isCollapsed} active={pathname.startsWith("/dashboard/cut-editor")} />
        <SidebarItem icon={CreditCard} label="Credits" href="/dashboard/credits" isCollapsed={isCollapsed} active={pathname.startsWith("/dashboard/credits")} />
        <SidebarItem icon={CreditCard} label="Plans" href="/dashboard/plans" isCollapsed={isCollapsed} active={pathname.startsWith("/dashboard/plans")} />
        <SidebarItem icon={History} label="History" href="/dashboard/history" isCollapsed={isCollapsed} active={pathname.startsWith("/dashboard/history")} />

        {/* Influencer Section */}
        {isInfluencer && (
          <>
            <div className="border-t border-white/10 my-4 mx-2" />
            <SidebarItem icon={Star} label="Influencer" href="/dashboard/influencer" isCollapsed={isCollapsed} active={pathname.startsWith("/dashboard/influencer")} />
          </>
        )}
      </nav>
    </aside>
}) {
  const [open, setOpen] = useState(false);

  const closeSidebar = () => setOpen(false);

  return (
    <>
      {/* =========================
          MOBILE TOP BAR
      ========================= */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-[#0b0f19] border-b border-white/10">
        <div className="flex items-center gap-2">
          <Image src="/demo/Foxgen-logo.png" alt="FoxGen" width={24} height={24} />
          <span className="font-semibold">FoxGen</span>
        </div>

        <button onClick={() => setOpen(true)}>
          <Menu />
        </button>
      </div>

      {/* =========================
          MOBILE OVERLAY
      ========================= */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={closeSidebar}
          aria-hidden
        />
      )}

      {/* =========================
          SIDEBAR
      ========================= */}
      <aside
        className={`
          fixed md:static z-50
          h-screen
          bg-[#0b0f19]
          border-r border-white/10
          flex flex-col
          transition-all duration-300 ease-in-out

          ${open ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0

          w-64 md:w-[72px]
          md:hover:w-64
          group
        `}
      >
        {/* =========================
            HEADER
        ========================= */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-white/10">
          <Image
            src="/demo/Foxgen-logo.png"
            alt="FoxGen Logo"
            width={28}
            height={28}
          />

          <span
            className="
              text-lg font-semibold
              opacity-100 md:opacity-0
              md:group-hover:opacity-100
              transition-opacity
              whitespace-nowrap
            "
          >
            FoxGen
          </span>

          <button className="ml-auto md:hidden" onClick={closeSidebar}>
            <X />
          </button>
        </div>

        {/* =========================
            NAV
        ========================= */}
        <nav className="flex-1 py-4 space-y-1">
          <SidebarItem
            icon={LayoutDashboard}
            label="Dashboard"
            href="/dashboard"
            onClick={closeSidebar}
          />

          <SidebarItem
            icon={Package}
            label="Products"
            href="/dashboard/products"
            onClick={closeSidebar}
          />

          <SidebarItem
            icon={Film}
            label="B-Roll Library"
            href="/dashboard/broll"
            badge="NEW"
            onClick={closeSidebar}
          />

          <SidebarItem
            icon={ImageIcon}
            label="Images"
            href="/dashboard/image-generator"
            onClick={closeSidebar}
          />

          <SidebarItem
            icon={Video}
            label="Videos"
            href="/dashboard/video-generator"
            onClick={closeSidebar}
          />

          <SidebarItem
            icon={Scissors}
            label="AI Cut Editor"
            href="/dashboard/cut-editor"
            badge="NEW"
            onClick={closeSidebar}
          />

          <SidebarItem
            icon={CreditCard}
            label="Credits"
            href="/dashboard/credits"
            onClick={closeSidebar}
          />

          <SidebarItem
            icon={CreditCard}
            label="Plans"
            href="/dashboard/plans"
            onClick={closeSidebar}
          />

          <SidebarItem
            icon={History}
            label="History"
            href="/dashboard/history"
            onClick={closeSidebar}
          />

          {isInfluencer && (
            <>
              <div className="border-t border-white/10 my-4" />
              <SidebarItem
                icon={Star}
                label="Influencer"
                href="/dashboard/influencer"
                onClick={closeSidebar}
              />
            </>
          )}
        </nav>
      </aside>
    </>
  );
}

function SidebarItem({
  icon: Icon,
  label,
  href,
  badge,
  isCollapsed,
  active
}: {
  icon: any;
  label: string;
  href: string;
  badge?: "NEW" | "BETA";
  isCollapsed: boolean;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      title={isCollapsed ? label : undefined}
      className={cn(
        "group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 min-h-[44px]",
        active 
          ? "bg-gradient-to-r from-violet-600/10 to-indigo-600/10 text-violet-400 border border-violet-500/20 shadow-[0_0_20px_-5px_rgba(139,92,246,0.3)]" 
          : "text-gray-400 hover:bg-white/5 hover:text-gray-200",
        isCollapsed ? "justify-center" : ""
      )}
    >
      <Icon 
        size={20} 
        className={cn(
          "shrink-0 transition-transform duration-200", 
          isCollapsed ? "group-hover:scale-110" : ""
        )} 
      />

      <span className={cn(
        "whitespace-nowrap overflow-hidden transition-all duration-300 origin-left",
        isCollapsed ? "w-0 opacity-0 scale-0" : "flex-1 w-auto opacity-100 scale-100 text-sm font-medium"
      )}>
        {label}
      </span>

      {!isCollapsed && badge && (
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white border border-white/10 shadow-lg shadow-violet-500/20">
          {badge}
        </span>
      )}
    </Link>
  );
}
