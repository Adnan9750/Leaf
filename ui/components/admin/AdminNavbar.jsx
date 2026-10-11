"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import {
    Search,
    SlidersHorizontal,
    Mail,
    Bell,
    Menu,
    LogOut,
    ChevronDown,
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function AdminNavbar({ onMenuClick }) {
    const router = useRouter();
    const { user, logout } = useAuthStore();
    const [isLoggingOut, setIsLoggingOut] = React.useState(false);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await logout();
        } finally {
            router.replace("/login");
        }
    };

    const initials = user?.first_name
        ? (user.first_name[0] + (user.last_name?.[0] || "")).toUpperCase()
        : user?.company_name
            ? user.company_name.substring(0, 2).toUpperCase()
            : user?.email
                ? user.email.substring(0, 2).toUpperCase()
                : "AH";

    const displayName = user?.company_name
        ? user.company_name
        : user?.first_name
            ? `${user.first_name} ${user.last_name || ""}`.trim()
            : "Super Admin";

    const displayEmail = user?.email;

    return (
        <header className="flex items-center justify-between gap-4 select-none sticky top-0 z-50 w-full bg-white shadow-md rounded-xl py-2 px-4">
            {/* Left side: Mobile Menu Button & Search Bar */}
            <div className="flex items-center gap-3 flex-1 max-w-md">
                {onMenuClick && (
                    <button
                        onClick={onMenuClick}
                        className="rounded-2xl bg-white p-2.5 text-zinc-500 hover:text-zinc-900 border border-black/[0.04] shadow-[0_4px_24px_rgba(0,0,0,0.02)] md:hidden cursor-pointer"
                        aria-label="Open sidebar"
                    >
                        <Menu className="h-5 w-5" />
                    </button>
                )}

                {/* Floating Search Pill Input */}
                {/* <div className="relative w-full flex items-center">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none">
                        <Search className="h-4 w-4" />
                    </div>

                    <input
                        type="text"
                        placeholder="Search Task..."
                        className="w-full h-11 pl-10 pr-10 text-xs rounded-2xl bg-white border border-black/[0.04] shadow-[0_4px_24px_rgba(0,0,0,0.02)] text-zinc-800 placeholder:text-zinc-400 outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    />

                    <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer"
                        title="Search filters"
                    >
                        <SlidersHorizontal className="h-3.5 w-3.5" />
                    </button>
                </div> */}
            </div>

            {/* Right side: Quick Action Buttons & Profile Card */}
            <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">

                {/* Bell Notification Button */}
                {/* <button
                    type="button"
                    className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-white border border-black/[0.04] shadow-[0_4px_24px_rgba(0,0,0,0.02)] text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 transition-colors cursor-pointer"
                    title="Notifications"
                >
                    <Bell className="h-4 w-4" />
                    <span className="absolute top-3 right-3 h-2 w-2 rounded-full bg-[#10B981] ring-2 ring-white" />
                </button> */}

                {/* User Profile Pill Card */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-2.5 rounded-2xl bg-white border border-black/[0.04] shadow-[0_4px_24px_rgba(0,0,0,0.02)] p-1.5 pr-3 hover:bg-zinc-50 transition-colors outline-none cursor-pointer">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-xs font-bold text-white overflow-hidden shadow-xs">
                                {initials}
                            </div>

                            <div className="hidden sm:flex flex-col text-left">
                                <span className="text-xs font-bold text-zinc-900 leading-tight">
                                    {displayName}
                                </span>
                                <span className="text-[10px] text-zinc-400 leading-tight mt-0.5">
                                    {displayEmail}
                                </span>
                            </div>

                            <ChevronDown className="h-3 w-3 text-zinc-400 ml-0.5 hidden sm:block" />
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