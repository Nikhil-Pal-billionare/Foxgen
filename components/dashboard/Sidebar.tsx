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
  Menu,
  X,
  Film,
} from "lucide-react";

export default function Sidebar({
  isInfluencer,
}: {
  isInfluencer: boolean;
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

/* =========================
   SIDEBAR ITEM
========================= */
function SidebarItem({
  icon: Icon,
  label,
  href,
  badge,
  onClick,
}: {
  icon: any;
  label: string;
  href: string;
  badge?: "NEW" | "BETA";
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="
        group/item
        flex items-center gap-3
        px-4 py-2
        rounded-lg
        text-gray-300
        hover:bg-white/10
        hover:text-white
        transition
        mx-2
      "
    >
      <Icon size={18} className="shrink-0" />

      <span
        className="
          flex-1
          whitespace-nowrap
          opacity-100 md:opacity-0
          md:group-hover:opacity-100
          transition-opacity
        "
      >
        {label}
      </span>

      {badge && (
        <span
          className="
            text-[10px]
            px-2 py-0.5
            rounded-full
            bg-red-600/20
            text-red-400
            border border-red-600/30
            font-semibold
            opacity-100 md:opacity-0
            md:group-hover:opacity-100
            transition-opacity
          "
        >
          {badge}
        </span>
      )}
    </Link>
  );
}