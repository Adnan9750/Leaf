"use client";

import React from "react";
import { useLoaderStore } from "@/store/loaderStore";

/**
 * High-definition botanical leaf graphic
 */
export function LeafIcon({ className = "w-16 h-16" }) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        {/* Rich vibrant botanical green gradient */}
        <linearGradient id="vibrantLeafGrad" x1="12%" y1="8%" x2="88%" y2="92%">
          <stop offset="0%" stopColor="#86EFAC" />
          <stop offset="20%" stopColor="#4ADE80" />
          <stop offset="55%" stopColor="#22C55E" />
          <stop offset="80%" stopColor="#16A34A" />
          <stop offset="100%" stopColor="#14532D" />
        </linearGradient>

        {/* 3D Depth Shade */}
        <linearGradient id="leaf3DShade" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#052E16" stopOpacity="0.35" />
          <stop offset="50%" stopColor="#052E16" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#052E16" stopOpacity="0" />
        </linearGradient>

        {/* Bright luminous veins */}
        <linearGradient id="luminousVeinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F0FDF4" stopOpacity="0.95" />
          <stop offset="50%" stopColor="#BBF7D0" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#86EFAC" stopOpacity="0.6" />
        </linearGradient>

        {/* Natural soft shadow */}
        <filter id="naturalLeafGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#14532D" floodOpacity="0.35" />
        </filter>
      </defs>

      {/* Stem Base */}
      <path
        d="M 59 116 C 58 108 58 98 60 92 C 60 90 57 90 56 92 C 54 98 53 108 54 116 Z"
        fill="#15803D"
      />

      {/* Main Organic Botanical Leaf Blade */}
      <path
        d="M 60,6
           C 88,18 110,46 104,74
           C 100,90 84,98 62,94
           C 58,93 57,96 55,100
           C 53,96 50,93 46,92
           C 24,86 10,68 12,44
           C 14,22 34,10 60,6 Z"
        fill="url(#vibrantLeafGrad)"
        filter="url(#naturalLeafGlow)"
      />

      {/* 3D Curved Surface Depth Shadow on Right Wing */}
      <path
        d="M 60,6
           C 88,18 110,46 104,74
           C 100,90 84,98 60,94
           C 60,60 60,30 60,6 Z"
        fill="url(#leaf3DShade)"
      />

      {/* Central Stem Midrib */}
      <path
        d="M 60,8 C 60,35 59,68 55,96"
        stroke="url(#luminousVeinGrad)"
        strokeWidth="3.2"
        strokeLinecap="round"
      />

      {/* Secondary Lateral Veins - Right Side */}
      <path d="M 60,24 C 74,28 86,36 92,42" stroke="url(#luminousVeinGrad)" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M 60,40 C 76,46 86,56 90,64" stroke="url(#luminousVeinGrad)" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M 59,56 C 72,64 80,72 84,80" stroke="url(#luminousVeinGrad)" strokeWidth="2" strokeLinecap="round" />
      <path d="M 58,72 C 67,78 72,83 75,87" stroke="url(#luminousVeinGrad)" strokeWidth="1.8" strokeLinecap="round" />

      {/* Secondary Lateral Veins - Left Side */}
      <path d="M 60,18 C 45,22 33,30 24,38" stroke="url(#luminousVeinGrad)" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M 60,32 C 43,38 30,48 22,58" stroke="url(#luminousVeinGrad)" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M 59,48 C 45,56 34,66 28,74" stroke="url(#luminousVeinGrad)" strokeWidth="2" strokeLinecap="round" />
      <path d="M 57,64 C 47,72 40,78 36,82" stroke="url(#luminousVeinGrad)" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Inline 3D 360 Rotating Leaf Spinner
 */
export function LeafSpinner({ size = "md", className = "" }) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-14 h-14",
    lg: "w-20 h-20",
    xl: "w-28 h-28",
  };

  return (
    <div className={`relative flex items-center justify-center [perspective:800px] ${className}`}>
      {/* Outer Pulse Ring */}
      <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-lg animate-ping opacity-75" />

      {/* 3D 360-degree Y-Axis Spinning Leaf */}
      <div className="relative animate-leaf-360 [transform-style:preserve-3d]">
        <LeafIcon className={sizeClasses[size] || sizeClasses.md} />
      </div>

      <style jsx>{`
        @keyframes leafSpin3D {
          0% {
            transform: perspective(700px) rotateY(0deg) scale(0.95);
          }
          50% {
            transform: perspective(700px) rotateY(180deg) scale(1.08);
          }
          100% {
            transform: perspective(700px) rotateY(360deg) scale(0.95);
          }
        }
        .animate-leaf-360 {
          animation: leafSpin3D 2.4s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
        }
      `}</style>
    </div>
  );
}

/**
 * Fullscreen Global Modal Loader with 3D 360° Rotating Leaf
 */
export default function GlobalLoader() {
  const { isLoading, message } = useLoaderStore();

  if (!isLoading) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Loading"
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-canopy/40 backdrop-blur-md transition-all animate-in fade-in duration-300"
    >
      {/* Glassmorphism Modal Card */}
      <div className="relative mx-4 flex w-full max-w-xs flex-col items-center justify-center rounded-3xl border border-white/50 bg-white/95 p-8 shadow-2xl shadow-canopy/25 backdrop-blur-2xl text-center animate-in zoom-in-95 duration-200 sm:max-w-sm">
        
        {/* Ambient Emerald Aura */}
        <div className="absolute -top-12 h-36 w-36 rounded-full bg-emerald-500/25 blur-3xl pointer-events-none" />

        {/* Orbit Ring & 3D 360° Rotating Leaf Container */}
        <div className="relative mb-6 flex h-28 w-28 items-center justify-center [perspective:1000px]">
          {/* Outer Dashed Orbit Ring */}
          <div className="absolute inset-0 rounded-full border-2 border-dashed border-emerald-400/40 animate-spin [animation-duration:12s]" />

          {/* Glowing Inner Core */}
          <div className="absolute h-20 w-20 rounded-full bg-emerald-500/15 ring-4 ring-emerald-400/20 blur-[1px] animate-pulse" />

          {/* 3D 360° Spinning Botanical Leaf */}
          <div className="relative animate-leaf-360 [transform-style:preserve-3d] flex items-center justify-center">
            <LeafIcon className="h-16 w-16 drop-shadow-xl" />
          </div>
        </div>

        {/* Heading */}
        <h3 className="font-display text-lg font-bold text-canopy tracking-tight">
          {message || "Loading..."}
        </h3>

        {/* Animated Typing/Bounce Dots */}
        <p className="mt-1.5 text-xs text-soil/75 font-medium flex items-center justify-center gap-1.5">
          <span>Processing request</span>
          <span className="inline-flex gap-1">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-600 animate-bounce [animation-delay:0ms]" />
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-600 animate-bounce [animation-delay:150ms]" />
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-600 animate-bounce [animation-delay:300ms]" />
          </span>
        </p>
      </div>

      <style jsx>{`
        @keyframes leafSpin3D {
          0% {
            transform: perspective(800px) rotateY(0deg) scale(0.96);
          }
          50% {
            transform: perspective(800px) rotateY(180deg) scale(1.08);
          }
          100% {
            transform: perspective(800px) rotateY(360deg) scale(0.96);
          }
        }
        .animate-leaf-360 {
          animation: leafSpin3D 2.2s cubic-bezier(0.42, 0, 0.58, 1) infinite;
        }
      `}</style>
    </div>
  );
}
