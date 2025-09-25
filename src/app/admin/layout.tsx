"use client";

import RequireAdmin from "@/components/auth/RequireAdmin";
import { Sidebar } from "@/components/admin/Sidebar";
import { Topbar } from "@/components/admin/Topbar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAdmin>
      <div className="grid md:grid-cols-[16rem_1fr] min-h-screen">
        <Sidebar />
        <div className="flex flex-col">
          <Topbar />
          <main className="p-4">{children}</main>
        </div>
      </div>
    </RequireAdmin>
  );
}