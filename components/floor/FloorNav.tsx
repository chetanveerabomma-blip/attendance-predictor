"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Box, Database, LayoutGrid, Search, ShieldCheck } from "lucide-react";

const links = [
  { href: "/rooms", label: "3D MAP", icon: Box },
  { href: "/grid", label: "ROOM GRID", icon: LayoutGrid },
  { href: "/finder", label: "AI FINDER", icon: Search },
  { href: "/data", label: "DATA AUDIT", icon: Database },
  { href: "/floor-admin", label: "FLOOR ADMIN", icon: ShieldCheck },
];

export function FloorNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Floor system" className="flex flex-wrap gap-2 border-b-2 border-black pb-3">
      {links.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`inline-flex items-center gap-1.5 border-2 border-black px-3 py-1.5 font-heading text-xs font-black uppercase ${
              active ? "bg-[#FFD93D] shadow-[2px_2px_0px_#0A0A0A]" : "bg-white hover:bg-gray-100"
            }`}
          >
            <Icon size={14} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}