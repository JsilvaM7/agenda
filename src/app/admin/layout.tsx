import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ReactNode } from "react";
import Link from "next/link";
import { Calendar, Users, LogOut, Shield } from "lucide-react";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    redirect("/admin/login");
  }
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="bg-gray-900 text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-orange-500 flex items-center justify-center">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold">Agenda — Admin</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/admin" className="text-gray-300 hover:text-white text-sm flex items-center gap-1.5">
            <Users className="w-4 h-4" /> Comerciantes
          </Link>
          <Link href="/admin/bookings" className="text-gray-300 hover:text-white text-sm flex items-center gap-1.5">
            <Calendar className="w-4 h-4" /> Agendamentos
          </Link>
          <Link href="/admin/invoices" className="text-gray-300 hover:text-white text-sm flex items-center gap-1.5">
            💳 Faturas
          </Link>
          <Link href="/api/auth/signout?callbackUrl=/" className="text-gray-400 hover:text-red-400 text-sm flex items-center gap-1">
            <LogOut className="w-4 h-4" />
          </Link>
        </div>
      </nav>
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">{children}</main>
    </div>
  );
}
