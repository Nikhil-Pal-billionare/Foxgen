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
} from "lucide-react";

export default function Sidebar({
  isInfluencer,
}: {
  isInfluencer: boolean;
}) {
  return (
    <aside className="w-64 bg-[#0b0f19] border-r border-white/10 p-4 flex flex-col">

      {/* Logo */}
      <div className="flex items-center gap-2 mb-8 px-2">
        <Image
          src="/demo/Foxgen-logo.png"
          alt="FoxGen Logo"
          width={28}
          height={28}
          priority
        />
        <span className="text-xl font-semibold">FoxGen</span>
      </div>

      {/* Navigation */}
      <nav className="space-y-1 flex-1">
        <SidebarItem
          icon={LayoutDashboard}
          label="Dashboard"
          href="/dashboard"
        />

        <SidebarItem
          icon={Package}
          label="Products"
          href="/dashboard/products"
        />

        <SidebarItem
          icon={ImageIcon}
          label="Images"
          href="/dashboard/image-generator"
        />

        <SidebarItem
          icon={Video}
          label="Videos"
          href="/dashboard/video-generator"
        />

        {/* 🧠 AI CUT EDITOR */}
        <SidebarItem
          icon={Scissors}
          label="AI Cut Editor"
          href="/dashboard/cut-editor"
        />

        <SidebarItem
          icon={CreditCard}
          label="Credits"
          href="/dashboard/credits"
        />

        <SidebarItem
          icon={CreditCard}
          label="Plans"
          href="/dashboard/plans"
        />

        <SidebarItem
          icon={History}
          label="History"
          href="/dashboard/history"
        />

        {/* Influencer Section */}
        {isInfluencer && (
          <>
            <div className="border-t border-white/10 my-4" />

            <SidebarItem
              icon={Star}
              label="Influencer"
              href="/dashboard/influencer"
            />
          </>
        )}
      </nav>
    </aside>
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
}: {
  icon: any;
  label: string;
  href: string;
  badge?: "NEW" | "BETA";
}) {
  return (
    <Link
      href={href}
      className="
        group
        flex items-center gap-3
        px-4 py-2
        rounded-lg
        text-gray-300
        hover:bg-white/10
        hover:text-white
        transition
        hover:scale-[1.02]
      "
    >
      <Icon size={18} className="shrink-0" />

      <span className="flex-1">{label}</span>

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
            group-hover:bg-red-600
            group-hover:text-white
            transition
          "
        >
          {badge}
        </span>
      )}
    </Link>
  );
}