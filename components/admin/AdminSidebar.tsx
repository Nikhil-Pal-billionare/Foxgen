"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { name: "Overview", href: "/admin" },
  { name: "Users", href: "/admin/users" },
  { name: "Usage", href: "/admin/usage" },
  { name: "Revenue", href: "/admin/revenue" },
  { name: "Referrals", href: "/admin/referrals" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-neutral-900 border-r border-neutral-800 p-6">
      <h2 className="text-xl font-bold mb-8">Admin Panel</h2>

      <nav className="space-y-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`block px-4 py-2 rounded ${
              pathname === link.href
                ? "bg-blue-600"
                : "hover:bg-neutral-800"
            }`}
          >
            {link.name}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
