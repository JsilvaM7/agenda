"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Calendar, Settings, LogOut, LayoutDashboard, ExternalLink } from "lucide-react";

interface NavProps {
  user: { name?: string | null; email?: string | null; businessSlug?: string };
}

export default function DashboardNav({ user }: NavProps) {
  const pathname = usePathname();

  const links = [
    { href: "/dashboard", label: "Visão Geral", icon: <LayoutDashboard className="w-4 h-4" /> },
    { href: "/dashboard/settings", label: "Configurações", icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <nav className="bg-white border-b border-orange-100 shadow-sm sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 flex-shrink-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
            <Calendar className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-orange-600 hidden sm:block">Agenda</span>
        </Link>

        {/* Links */}
        <div className="flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition ${
                pathname === l.href
                  ? "bg-orange-50 text-orange-600"
                  : "text-gray-500 hover:text-orange-500 hover:bg-orange-50"
              }`}
            >
              {l.icon}
              <span className="hidden sm:block">{l.label}</span>
            </Link>
          ))}

          {user.businessSlug && (
            <Link
              href={`/b/${user.businessSlug}`}
              target="_blank"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-gray-500 hover:text-orange-500 hover:bg-orange-50 transition"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="hidden sm:block">Minha Página</span>
            </Link>
          )}
        </div>

        {/* User + logout */}
        <div className="flex items-center gap-2">
          <div className="hidden md:block text-right">
            <p className="text-sm font-semibold text-gray-700 leading-none">{user.name}</p>
            <p className="text-xs text-gray-400">{user.email}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition"
            title="Sair"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </nav>
  );
}
