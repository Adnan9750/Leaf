"use client";

import { useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import CartDrawer from "@/components/cart/CartDrawer";

const emptySubscribe = () => () => {};

function useMounted() {
  return useSyncExternalStore(emptySubscribe, () => true, () => false);
}

const navLinks = [
    { name: "Detect", href: "/detect" },
    { name: "Products", href: "/products" },
    { name: "Diseases", href: "#" },
    { name: "Chatbot", href: "#" },
];

export default function Navbar() {
    const openCart = useCartStore((state) => state.openCart);
    const items = useCartStore((state) => state.items);
    const mounted = useMounted();

    // Calculate total count reactively from cart items
    const totalCount = mounted
        ? items.reduce((sum, item) => sum + (item.quantity || 1), 0)
        : 0;

    return (
        <>
            <nav className="sticky top-0 z-40 border-b border-canopy/10 bg-husk/90 backdrop-blur-md">
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

                    {/* Actions: Cart + Guest vs Logged-In */}
                    <div className="flex items-center gap-3">
                        {/* Cart Button with ShoppingCart icon and live item count badge */}
                        <button
                            type="button"
                            onClick={openCart}
                            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-canopy/20 bg-white text-canopy shadow-2xs hover:border-fern hover:bg-emerald-50/50 hover:text-fern transition-all cursor-pointer"
                            aria-label="Open cart"
                            title="Shopping Cart"
                        >
                            <ShoppingCart className="h-5 w-5" />
                            {totalCount > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-blight px-1 text-[11px] font-extrabold text-white shadow-xs ring-2 ring-white animate-in zoom-in-75">
                                    {totalCount > 99 ? "99+" : totalCount}
                                </span>
                            )}
                        </button>

                        <div className="flex items-center gap-2.5">
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

            {/* Global Cart Slideover */}
            <CartDrawer />
        </>
    );
}
