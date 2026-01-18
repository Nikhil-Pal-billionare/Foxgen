import {
  LayoutDashboard,
  Image as ImageIcon,
  Video,
  CreditCard,
  History,
  Package,
  Star,
  Wallet,
  Menu,
  X,
  Film,
} from "lucide-react";
import Link from "next/link";

/* =========================
   TYPES
========================= */
type SidebarProps = {
  isInfluencer: boolean;
  isCollapsed: boolean;
  isMobileOpen: boolean;
  onToggleCollapse: () => void;
  onOpenMobile: () => void;
  onCloseMobile: () => void;
};

type SidebarItemProps = {
  icon: any;
  label: string;
  href: string;
  badge?: "NEW" | "BETA";
  onClick?: () => void;
  isCollapsed: boolean;
};

/* =========================
   SIDEBAR
========================= */
export default function Sidebar({
  isInfluencer,
  isCollapsed,
  isMobileOpen,
  onToggleCollapse,
  onOpenMobile,
  onCloseMobile,
}: SidebarProps) {
  return (
    <>
      {/* =========================
          MOBILE TOP BAR
      ========================= */}
      <div className="md:hidden flex items-center px-4 py-3 bg-[#0b0f19] border-b border-white/10 gap-4">
        <button onClick={onOpenMobile}>
          <Menu />
        </button>
        <div className="flex items-center gap-2">
          <img
            src="/demo/foxgen-logo.png"
            alt="FoxGen"
            width={24}
            height={24}
          />
          <span className="font-semibold">FoxGen</span>
        </div>
      </div>

      {/* =========================
          MOBILE OVERLAY
      ========================= */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={onCloseMobile}
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
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
          ${isCollapsed ? "md:w-[72px]" : "md:w-64"}
          w-64
          group
        `}
      >
        {/* =========================
            HEADER
        ========================= */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-white/10">
          <img
            src="/demo/foxgen-logo.png"
            alt="FoxGen Logo"
            width={28}
            height={28}
          />

          <span
            className={`
              text-lg font-semibold
              transition-opacity
              whitespace-nowrap
              ${isCollapsed ? "md:opacity-0" : "opacity-100"}
              md:group-hover:opacity-100
            `}
          >
            FoxGen
          </span>

          <button className="ml-auto md:hidden" onClick={onCloseMobile}>
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
            onClick={onCloseMobile}
            isCollapsed={isCollapsed}
          />

          <SidebarItem
            icon={Package}
            label="Products"
            href="/dashboard/products"
            onClick={onCloseMobile}
            isCollapsed={isCollapsed}
          />

          <SidebarItem
            icon={Film}
            label="B-Roll Library"
            href="/dashboard/broll"
            onClick={onCloseMobile}
            isCollapsed={isCollapsed}
          />

          <SidebarItem
            icon={ImageIcon}
            label="Image Generator"
            href="/dashboard/image-generator"
            onClick={onCloseMobile}
            isCollapsed={isCollapsed}
          />

          <SidebarItem
            icon={Star}
            label="Show Your Talent"
            href="/dashboard/show-your-talent"
            onClick={onCloseMobile}
            isCollapsed={isCollapsed}
          />


          <SidebarItem
            icon={Video}
            label="Videos"
            href="/dashboard/video-generator"
            onClick={onCloseMobile}
            isCollapsed={isCollapsed}
          />

          <SidebarItem
            icon={CreditCard}
            label="Credits"
            href="/dashboard/credits"
            onClick={onCloseMobile}
            isCollapsed={isCollapsed}
          />

          <SidebarItem
            icon={Wallet}
            label="Plans"
            href="/dashboard/plans"
            onClick={onCloseMobile}
            isCollapsed={isCollapsed}
          />

          <SidebarItem
            icon={History}
            label="History"
            href="/dashboard/history"
            onClick={onCloseMobile}
            isCollapsed={isCollapsed}
          />

          {isInfluencer && (
            <>
              <div className="border-t border-white/10 my-4" />
              <SidebarItem
                icon={Star}
                label="Influencer"
                href="/dashboard/influencer"
                onClick={onCloseMobile}
                isCollapsed={isCollapsed}
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
  isCollapsed,
}: SidebarItemProps) {
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
        className={`
          flex-1
          whitespace-nowrap
          transition-opacity
          ${isCollapsed ? "md:opacity-0" : "opacity-100"}
          md:group-hover:opacity-100
        `}
      >
        {label}
      </span>

      {badge && (
        <span
          className={`
            text-[10px]
            px-2 py-0.5
            rounded-full
            bg-blue-600/20
            text-blue-400
            border border-blue-600/30
            font-semibold
            transition-opacity
            ${isCollapsed ? "md:opacity-0" : "opacity-100"}
            md:group-hover:opacity-100
          `}
        >
          {badge}
        </span>
      )}
    </Link>
  );
}

