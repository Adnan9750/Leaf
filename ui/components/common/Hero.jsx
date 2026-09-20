"use client";

import { Button } from "@/components/ui/button";

export default function Hero() {
    return (
        <header className="py-16 md:py-24">
            <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-6 md:grid-cols-2 md:gap-16 md:px-8">
                {/* Left: copy */}
                <div>
                    <div className="mb-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-fern">
                        <span className="h-2 w-2 rounded-full bg-blight animate-pulse" />
                        AI-powered plant health
                    </div>

                    <h1 className="mb-6 font-display text-4xl font-semibold leading-[1.1] text-canopy md:text-5xl lg:text-6xl tracking-tight">
                        Every leaf tells a story.
                    </h1>

                    <p className="mb-9 max-w-md text-lg text-soil/90 leading-relaxed">
                        Upload a photo of your crop leaf. Get an instant diagnosis, treatment guidance, and the right medicine — delivered to your door.
                    </p>

                    <div className="flex flex-wrap items-center gap-4">
                        <Button className="bg-canopy text-husk hover:bg-canopy/90 px-6 py-2.5 h-auto rounded-xl gap-2 font-medium shadow-md transition-all">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                <path d="M4 7h3l2-3h6l2 3h3v12H4z" />
                                <circle cx="12" cy="13" r="3.5" />
                            </svg>
                            Scan a Leaf
                        </Button>
                        <Button variant="ghost" className="text-soil hover:text-canopy hover:bg-canopy/10 rounded-xl px-5 py-2.5 h-auto font-medium">
                            How it works ↓
                        </Button>
                    </div>
                </div>

                {/* Right: scan visual */}
                <div className="relative aspect-[1/1.05] overflow-hidden rounded-3xl border border-canopy/10 bg-gradient-to-br from-canopy/30 to-mist">
                    {/* corner brackets */}
                    <span className="absolute left-6 top-6 h-6 w-6 border-l-[2.5px] border-t-[2.5px] border-fern" />
                    <span className="absolute right-6 top-6 h-6 w-6 border-r-[2.5px] border-t-[2.5px] border-fern" />
                    <span className="absolute bottom-6 left-6 h-6 w-6 border-b-[2.5px] border-l-[2.5px] border-fern" />
                    <span className="absolute bottom-6 right-6 h-6 w-6 border-b-[2.5px] border-r-[2.5px] border-fern" />

                    {/* scan line */}
                    <div className="animate-scan absolute left-[8%] right-[8%] h-0.5 bg-gradient-to-r from-transparent via-[#7fffb0] to-transparent shadow-[0_0_14px_3px_rgba(127,255,176,0.7)]" />

                    {/* leaf illustration */}
                    <svg viewBox="0 0 200 240" className="absolute left-1/2 top-1/2 h-[62%] w-[62%] -translate-x-1/2 -translate-y-1/2" fill="none">
                        <path
                            d="M100 10C40 40 15 100 30 160c10 40 40 65 70 70 30-5 60-30 70-70 15-60-10-120-70-150z"
                            fill="#4A7C59"
                            opacity={0.9}
                        />
                        <path
                            d="M100 25v195M100 70c-20 10-32 25-38 40M100 100c22 8 36 22 44 38M100 140c-18 8-30 20-36 34"
                            stroke="#1B3A2B"
                            strokeWidth={2}
                            strokeLinecap="round"
                            opacity={0.55}
                        />
                        <ellipse cx="72" cy="120" rx="10" ry="7" fill="#C1502E" opacity={0.75} />
                        <ellipse cx="118" cy="160" rx="7" ry="5" fill="#C1502E" opacity={0.6} />
                    </svg>

                    {/* diagnosis tag */}
                    <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-canopy px-5 py-2.5 text-sm font-semibold text-husk shadow-xl backdrop-blur-sm border border-white/10 whitespace-nowrap">
                        <span className="h-2 w-2 rounded-full bg-[#7fffb0] animate-ping" />
                        Early Blight — 92% match
                    </div>
                </div>
            </div>
        </header>
    );
}