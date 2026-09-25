// d:/Leaf/ui/components/admin/AdminNavbar.jsx
"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import axiosInstance from "@/utils/axiosInstance";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, LogOut, ChevronDown, ShieldCheck } from "lucide-react";

export default function AdminNavbar({ onMenuClick }) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  // Placeholder for any CSRF fetch if needed
  useEffect(() => { }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await axiosInstance.post("/auth/logout", {});
    } catch (e) {
      // ignore errors
    } finally {
      logout();
      router.replace("/login");
    }
  };

  const initials = user?.first_name
    ? user.first_name.substring(0, 2).toUpperCase()
    : user?.email
      ? user.email.substring(0, 2).toUpperCase()
      : "AD";

  const displayName = user?.first_name
    ? `${user.first_name} ${user.last_name || ""}`.trim()
    : user?.email?.split("@")[0] || "Administrator";

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-zinc-200 bg-white px-4 sm:px-6 shadow-xs">
      {/* Left side */}
      <div className="flex items-center gap-3">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 md:hidden"
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        {/* <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span className="text-xs font-semibold text-zinc-600 uppercase tracking-wider">
            Admin Portal
          </span>
        </div> */}
      </div>

      {/* Right side - user menu */}
      <div className="flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2.5 rounded-full border border-zinc-200 bg-zinc-50/80 hover:bg-zinc-100 hover:border-zinc-300 py-1 pl-1 pr-3 text-sm font-medium text-zinc-800 transition-all outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 cursor-pointer">
              <div className="relative">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-xs font-medium text-white shadow-xs">
                  {initials}
                </span>
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-bold text-zinc-900 leading-tight">
                  {displayName}
                </span>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56 p-1.5 rounded-xl bg-white shadow-lg text-zinc-800 border-none ring-1 ring-zinc-200"
          >
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer gap-2 rounded-xl py-2 px-2.5 text-xs font-semibold text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4 text-red-600" />
                <span>{isLoggingOut ? "Signing out..." : "Sign Out"}</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
