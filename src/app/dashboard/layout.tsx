import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ReactNode } from "react";
import DashboardNav from "@/components/DashboardNav";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "merchant") {
    redirect("/login");
  }
  return (
    <div className="min-h-screen bg-orange-50 flex flex-col">
      <DashboardNav user={session.user as any} />
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
