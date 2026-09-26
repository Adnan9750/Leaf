"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
    LayoutDashboard,
    Users,
    Leaf,
    LogOut,
    PanelLeftClose,
    PanelLeft,
    X,
} from "lucide-react";
import { usePathname } from "next/navigation";

const navItems = [
    {
        name: "Dashboard",
        href: "/admin/dashboard",
        icon: LayoutDashboard,
        description: "Overview and statistics",
    },
    {
        name: "Vendors",
        href: "/admin/vendors",
        icon: Users,
        description: "Manage vendor accounts",
    },
];

export default function AdminSidebar({
    isOpen,
    onClose,
    collapsed: externalCollapsed,
    setCollapsed: externalSetCollapsed,
}) {
    const [internalCollapsed, setInternalCollapsed] = useState(false);
    const currentPath = usePathname();

    // const [currentPath, setCurrentPath] = useState("/admin/dashboard");

    const isCollapsed =
        externalCollapsed !== undefined
            ? externalCollapsed
            : internalCollapsed;

    const toggleCollapsed = () => {
        if (externalSetCollapsed) {
            externalSetCollapsed(!isCollapsed);
        } else {
            setInternalCollapsed(!isCollapsed);
        }
    };

    const handleNavigation = (href) => {
        // setCurrentPath(href);

        if (onClose) {
            onClose();
        }
    };

    // UI-only demo user
    const user = {
        first_name: "Admin",
        last_name: "User",
        email: "admin@example.com",
    };

    const initials = user.first_name
        ? user.first_name.substring(0, 2).toUpperCase()
        : user.email
            ? user.email.substring(0, 2).toUpperCase()
            : "AD";

    const displayName = user.first_name
        ? `${user.first_name} ${user.last_name || ""}`.trim()
        : user.email?.split("@")[0] || "Administrator";

    const handleLogout = () => {
        // UI only — no API call
        console.log("Sign out clicked");
    };

    return (
        <>
            {/* Mobile Backdrop */}
            {isOpen && (
                <div
                    onClick={onClose}
                    className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs md:hidden"
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-40 flex h-screen flex-col transition-all duration-300 ease-in-out select-none border-r border-zinc-200 bg-white text-zinc-800 ${isCollapsed ? "w-[72px]" : "w-[260px]"
                    } ${isOpen
                        ? "translate-x-0"
                        : "-translate-x-full md:translate-x-0"
                    }`}
            >
                {/* Brand Header */}
                <div
                    className={`relative border-b border-zinc-100 ${isCollapsed ? "px-3 py-5" : "px-5 py-5"
                        }`}
                >
                    <div
                        className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"
                            }`}
                    >
                        {/* Logo */}
                        <Link
                            href="/admin/dashboard"
                            onClick={() => handleNavigation("/admin/dashboard")}
                            className="relative group shrink-0"
                        >
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-canopy text-white shadow-xs group-hover:opacity-95 transition-all">
                                <Leaf className="h-5 w-5" />
                            </div>
                        </Link>

                        {!isCollapsed && (
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                    <p className="font-display text-base font-bold text-zinc-900 tracking-tight">
                                        LeafLens
                                    </p>

                                    <span className="rounded-md bg-zinc-100 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-600 border border-zinc-200 uppercase">
                                        Admin
                                    </span>
                                </div>

                                <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                                    Admin Dashboard
                                </p>
                            </div>
                        )}

                        {/* Mobile Close */}
                        {onClose && (
                            <button
                                onClick={onClose}
                                className="ml-auto rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 md:hidden cursor-pointer"
                                aria-label="Close sidebar"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Collapse / Expand */}
                <button
                    onClick={toggleCollapsed}
                    className="hidden md:flex absolute -right-3 top-18 z-50 h-6 w-6 items-center justify-center rounded-full bg-canopy text-white shadow-md hover:bg-canopy/90 transition-all cursor-pointer border border-black/10"
                    title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    {isCollapsed ? (
                        <PanelLeft className="h-3 w-3 text-white" />
                    ) : (
                        <PanelLeftClose className="h-3 w-3 text-white" />
                    )}
                </button>

                {/* Main Navigation */}
                <nav
                    className={`flex-1 overflow-y-auto py-5 ${isCollapsed ? "px-2" : "px-3"
                        }`}
                >
                    {!isCollapsed && (
                        <div className="mb-2 px-3">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                                Menu
                            </span>
                        </div>
                    )}

                    <ul className="space-y-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;

                            const isActive =
                                currentPath === item.href ||
                                (item.href === "/admin/dashboard" &&
                                    currentPath === "/admin");

                            return (
                                <li key={item.name}>
                                    <Link
                                        href={item.href}
                                        onClick={() => handleNavigation(item.href)}
                                        className={`group relative flex items-center rounded-xl transition-all duration-200 ${isCollapsed
                                            ? "justify-center px-0 py-3"
                                            : "gap-3 px-3.5 py-2.5"
                                            } ${isActive
                                                ? "bg-canopy text-white font-semibold shadow-sm"
                                                : "text-zinc-600 hover:bg-zinc-100/80 hover:text-zinc-900 border border-transparent"
                                            }`}
                                        title={isCollapsed ? item.name : undefined}
                                    >
                                        <Icon
                                            className={`h-4 w-4 shrink-0 transition-colors ${isActive
                                                ? "text-white"
                                                : "text-zinc-400 group-hover:text-zinc-700"
                                                }`}
                                        />

                                        {!isCollapsed && (
                                            <span className="text-xs font-medium">
                                                {item.name}
                                            </span>
                                        )}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* Bottom User Card */}
                <div
                    className={`border-t border-zinc-100 bg-zinc-50/50 ${isCollapsed ? "p-2" : "p-3"
                        }`}
                >
                    {isCollapsed ? (
                        <div className="flex flex-col items-center gap-2">
                            {/* Avatar */}
                            <div
                                className="relative shrink-0 cursor-pointer"
                                title={`${displayName} (${user.email})`}
                            >
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-canopy text-xs font-medium text-white shadow-xs">
                                    {initials}
                                </div>

                                <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-white bg-emerald-500" />
                            </div>

                            {/* Logout */}
                            <button
                                onClick={handleLogout}
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:text-red-600 hover:bg-zinc-100 transition-colors cursor-pointer"
                                title="Sign Out"
                            >
                                <LogOut className="h-4 w-4" />
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2.5 rounded-xl border border-zinc-200/80 bg-white p-2.5 shadow-xs">
                            {/* Avatar */}
                            <div className="relative shrink-0">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-canopy text-xs font-medium text-white shadow-xs">
                                    {initials}
                                </div>

                                <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-white bg-emerald-500" />
                            </div>

                            {/* User Info */}
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-xs font-semibold text-zinc-900">
                                    {displayName}
                                </p>

                                <p className="truncate text-[10px] text-zinc-500">
                                    {user.email}
                                </p>
                            </div>

                            {/* Logout */}
                            <button
                                onClick={handleLogout}
                                className="shrink-0 p-1.5 text-zinc-400 hover:text-red-600 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer"
                                title="Sign Out"
                            >
                                <LogOut className="h-4 w-4" />
                            </button>
                        </div>
                    )}
                </div>
            </aside>
        </>
    );
}