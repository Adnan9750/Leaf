"use client";

import React from "react";
import Link from "next/link";
import {
    LayoutGrid,
    Users,
    Package,
    CheckSquare,
    Calendar,
    BarChart3,
    Users2,
    Settings,
    HelpCircle,
    LogOut,
    Leaf,
    X,
    Sparkles,
    FolderTree,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

export default function AdminSidebar({ isOpen, onClose }) {
    const currentPath = usePathname();
    const router = useRouter();
    const { user, logout } = useAuthStore();

    const isAdmin = Boolean(user?.is_superuser || user?.role === "admin");
    const isSuperAdmin = Boolean(user?.is_superuser || (user?.role === "admin" && !user?.company_name));

    const mainMenuItems = [
        {
            name: "Dashboard",
            href: "/admin/dashboard",
            icon: LayoutGrid,
            match: ["/admin", "/admin/dashboard"],
        },
        ...(isAdmin
            ? [
                {
                    name: "Vendors",
                    href: "/admin/vendors",
                    icon: Users,
                    badge: null,
                    match: ["/admin/vendors"],
                },

                {
                    name: "Categories",
                    href: "/admin/categories",
                    icon: FolderTree,
                    badge: null,
                    match: ["/admin/categories"],
                },
            ]
            : []),
        {
            name: "Products",
            href: "/admin/products",
            icon: Package,
            match: ["/admin/products"],
        },
    ];

    // const handleLogout = async () => {
    //     await logout();
    //     router.replace("/login");
    // };

    return (
        <>
            {/* Mobile Backdrop */}
            {isOpen && (
                <div
                    onClick={onClose}
                    className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs md:hidden"
                />
            )}

            {/* Sidebar Floating Card */}
            <aside
                className={`fixed md:sticky top-3 sm:top-5 lg:top-4 z-40 flex h-[calc(100vh-24px)] sm:h-[calc(100vh-40px)] lg:h-[calc(100vh-48px)] w-64 shrink-0 flex-col justify-between rounded-[28px] bg-white p-5 shadow-[0_4px_24px_rgba(0,0,0,0.03)] border border-black/[0.04] transition-transform duration-300 select-none overflow-y-auto ${isOpen
                    ? "translate-x-0 left-3"
                    : "-translate-x-full md:translate-x-0 left-0"
                    }`}
            >
                <div className="space-y-6">
                    {/* Brand Header */}
                    <div className="flex items-center justify-between px-1">
                        <Link
                            href="/admin/dashboard"
                            className="flex items-center gap-2.5 group"
                        >
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#10B981] text-white shadow-sm transition-transform group-hover:scale-105">
                                <Leaf className="h-5 w-5" />
                            </div>
                            <span className="font-display text-xl font-extrabold text-zinc-900 tracking-tight">
                                LeafLens
                            </span>
                        </Link>

                        {onClose && (
                            <button
                                onClick={onClose}
                                className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 md:hidden cursor-pointer"
                                aria-label="Close menu"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        )}
                    </div>

                    {/* MENU Section */}
                    <div>
                        <p className="px-3 text-[11px] font-bold tracking-wider text-zinc-400 uppercase mb-2">
                            Menu
                        </p>
                        <ul className="space-y-1">
                            {mainMenuItems.map((item) => {
                                const Icon = item.icon;
                                const isActive =
                                    item.match?.includes(currentPath) ||
                                    currentPath === item.href;

                                return (
                                    <li key={item.name} className="relative">
                                        {/* Active Left Indicator Bar */}
                                        {isActive && (
                                            <span className="absolute -left-5 top-1/2 -translate-y-1/2 h-6 w-1.5 rounded-r-full bg-[#10B981]" />
                                        )}

                                        <Link
                                            href={item.href}
                                            onClick={() => onClose?.()}
                                            className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs transition-all duration-150 ${isActive
                                                ? "font-bold text-zinc-900 bg-zinc-50/80"
                                                : "font-medium text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50/60"
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <Icon
                                                    className={`h-4 w-4 shrink-0 transition-colors ${isActive
                                                        ? "text-[#10B981]"
                                                        : "text-zinc-400 group-hover:text-zinc-700"
                                                        }`}
                                                />
                                                <span>{item.name}</span>
                                            </div>

                                            {item.badge && (
                                                <span className="rounded-full bg-[#10B981] px-2 py-0.5 text-[10px] font-bold text-white shadow-xs">
                                                    {item.badge}
                                                </span>
                                            )}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </div>

                {/* Bottom App Download Card Widget */}
                {/* <div className="relative mt-6 overflow-hidden rounded-2xl bg-gradient-to-br from-[#062c19] via-[#08331d] to-[#041a0f] p-4 text-white shadow-md">

                    <div className="absolute -right-6 -bottom-6 h-28 w-28 rounded-full bg-emerald-500/15 blur-xl pointer-events-none" />
                    <div className="absolute top-0 right-0 h-16 w-16 rounded-full bg-emerald-400/10 blur-lg pointer-events-none" />

                    <div className="relative z-10 space-y-3">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 backdrop-blur-md text-emerald-400">
                            <Sparkles className="h-3.5 w-3.5" />
                        </div>

                        <div>
                            <p className="text-xs font-bold text-white leading-snug">
                                Download our Mobile App
                            </p>
                            <p className="text-[10px] text-zinc-300/80 mt-0.5">
                                Get stay in another way
                            </p>
                        </div>

                        <button
                            type="button"
                            className="w-full rounded-xl bg-[#10B981] hover:bg-[#059669] py-2 px-3 text-center text-xs font-bold text-white shadow-sm transition-colors cursor-pointer"
                        >
                            Download
                        </button>
                    </div>
                </div> */}
            </aside>
        </>
    );
}