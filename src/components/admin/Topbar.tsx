"use client";

import LogoutButton from "../auth/SignOutButton";

export function Topbar() {
  return (
    <header className="h-14 border-b flex items-center px-3 gap-2">
      <div className="font-semibold">TransporteG4 — Admin</div>
      <div className="ml-auto">
        <LogoutButton />
      </div>
    </header>
  );
}