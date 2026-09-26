"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/common/Navbar";

export default function NavbarWrapper() {
    const pathname = usePathname();

    // Hide the public navbar on all /admin routes (admin has its own AdminNavbar)
    if (pathname.startsWith("/admin")) {
        return null;
    }

    return <Navbar />;
}