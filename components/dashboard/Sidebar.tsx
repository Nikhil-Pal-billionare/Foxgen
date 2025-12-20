import Image from "next/image";
import Link from "next/link";
import {
  LayoutDashboard,
  Image as ImageIcon,
  Video,
  CreditCard,
  History,
  Package,
} from "lucide-react";

export default function Sidebar() {
  return (
    <aside className="w-64 bg-[#0b0f19] border-r border-white/10 p-4">
      
      {/* Logo */}
      <div className="flex items-center gap-2 mb-8 px-2">
        <Image
          src="/demo/foxgen-logo.png"
          alt="FoxGen Logo"
          width={28}
          height={28}
          priority
        />
        <span className="text-xl font-semibold">FoxGen</span>
      </div>

      {/* Navigation */}
      <nav className="space-y-2">
        <SidebarItem
          icon={LayoutDashboard}
          label="Dashboard"
          href="/dashboard"
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

        <SidebarItem
          icon={CreditCard}
          label="Credits"
          href="/dashboard/credits"
        />

        <SidebarItem
          icon={History}
          label="History"
          href="/dashboard/history"
        />

        <SidebarItem
          icon={Package}
          label="Products"
          href="/dashboard/products"
        />
      </nav>
    </aside>
  );
}

function SidebarItem({
  icon: Icon,
  label,
  href,
}: {
  icon: any;
  label: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="
        flex items-center gap-3
        px-4 py-2
        rounded-lg
        text-gray-300
        hover:bg-white/10
        hover:text-white
        transition
      "
    >
      <Icon size={18} />
      <span>{label}</span>
    </Link>
  );
}
