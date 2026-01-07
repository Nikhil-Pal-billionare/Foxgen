import {
  LayoutDashboard,
  Image as ImageIcon,
  Video,
  CreditCard,
  History,
  Package,
  Star,
  Wallet,
  Scissors,
  Menu,
  X,
  Film,
} from "lucide-react";

/* =========================
   TYPES
========================= */
type SidebarProps = {
  isInfluencer: boolean;
  isCollapsed: boolean;
  isMobileOpen: boolean;
  onToggleCollapse: () => void;
  onCloseMobile: () => void;
};

type SidebarItemProps = {
  icon: any;
  label: string;
  href: string;
  badge?: "NEW" | "BETA";
  onClick?: () => void;
};

/* =========================
   SIDEBAR
========================= */
export default function Sidebar({
  isInfluencer,
  isCollapsed,
  isMobileOpen,
  onToggleCollapse,
  onCloseMobile,
}: SidebarProps) {
  return (
    <>
      {/* =========================
          MOBILE TOP BAR
      ========================= */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-[#0b0f19] border-b border-white/10">
        <div className="flex items-center gap-2">
          <Image
            src="/demo/Foxgen-logo.png"
            alt="FoxGen"
            width={24}
            height={24}
          />
          <span className="font-semibold">FoxGen</span>
        </div>

        <button onClick={onToggleCollapse}>
          <Menu />
        </button>
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
          <Image
            src="/demo/Foxgen-logo.png"
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
          />

          <SidebarItem
            icon={Package}
            label="Products"
            href="/dashboard/products"
            onClick={onCloseMobile}
          />

          <SidebarItem
            icon={Film}
            label="B-Roll Library"
            href="/dashboard/broll"
            onClick={onCloseMobile}
          />

          <SidebarItem
            icon={ImageIcon}
            label="Images"
            href="/dashboard/image-generator"
            onClick={onCloseMobile}
          />

          <SidebarItem
            icon={Video}
            label="Videos"
            href="/dashboard/video-generator"
            onClick={onCloseMobile}
          />

          <SidebarItem
            icon={CreditCard}
            label="Credits"
            href="/dashboard/credits"
            onClick={onCloseMobile}
          />

          <SidebarItem
            icon={Wallet}
            label="Plans"
            href="/dashboard/plans"
            onClick={onCloseMobile}
          />

          <SidebarItem
            icon={History}
            label="History"
            href="/dashboard/history"
            onClick={onCloseMobile}
          />

          {isInfluencer && (
            <>
              <div className="border-t border-white/10 my-4" />
              <SidebarItem
                icon={Star}
                label="Influencer"
                href="/dashboard/influencer"
                onClick={onCloseMobile}
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
        className="
          flex-1
          whitespace-nowrap
          transition-opacity
          opacity-100 md:opacity-0
          md:group-hover:opacity-100
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

