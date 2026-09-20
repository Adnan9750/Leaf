"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

const navLinks = [
    { name: "Detect", href: "/detect" },
    { name: "Diseases", href: "#" },
    { name: "Medicines", href: "#" },
    { name: "Chatbot", href: "#" },
];

export default function Navbar() {

    return (
        <nav className="sticky top-0 z-50 border-b border-canopy/10 bg-husk/90 backdrop-blur-md">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 md:px-8">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2.5 font-display text-xl font-bold text-canopy hover:opacity-90 transition-opacity">
                    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none">
                        <path
                            d="M12 2C7 2 3 6 3 12c0 5 4 9 9 10 5-1 9-5 9-10 0-6-4-10-9-10z"
                            fill="#4A7C59"
                        />
                        <path
                            d="M12 6v12M8 10c1 2 2.5 3 4 3M16 8c-1 2-2.5 3-4 3"
                            stroke="#E9F1E7"
                            strokeWidth={1.3}
                            strokeLinecap="round"
                        />
                    </svg>
                    <span>LeafLens</span>
                </Link>

                {/* Links */}
                <div className="hidden items-center gap-9 text-sm font-medium md:flex">
                    {navLinks.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className="text-canopy/85 hover:text-canopy transition-colors font-medium"
                        >
                            {item.name}
                        </Link>
                    ))}
                </div>

                {/* Actions: Guest vs Logged-In */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-3">
                        <Link href="/login" className="hidden sm:inline-block">
                            <Button variant="outline" size="sm" className="text-xs font-semibold border-canopy/20 text-canopy hover:bg-canopy/5">
                                Sign In
                            </Button>
                        </Link>
                        <Link href="/detect">
                            <Button size="sm" className="bg-canopy text-husk hover:bg-canopy/90 text-xs font-semibold shadow-sm">
                                Detect Now
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}


