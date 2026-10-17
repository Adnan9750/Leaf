"use client";

import React, { useState } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminNavbar from "@/components/admin/AdminNavbar";

export default function AdminLayout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[#ECEEF0] text-zinc-900 p-3 sm:p-5 lg:p-4 flex flex-col md:flex-row gap-4 sm:gap-5 lg:gap-6 selection:bg-emerald-500/20 selection:text-emerald-950 font-sans">
            {/* Floating Left Sidebar */}
            <AdminSidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            {/* Right Main Content Area */}
            <div className="flex-1 flex flex-col gap-4 sm:gap-5 min-w-0">
                {/* Top Floating Navbar */}
                <AdminNavbar onMenuClick={() => setSidebarOpen(true)} />

                {/* Page Content View */}
                <main className="flex-1 min-w-0 ">
                    {children}
                </main>
            </div>
        </div>
    );
}