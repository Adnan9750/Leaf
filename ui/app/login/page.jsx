
"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
    Mail,
    Lock,
    Eye,
    EyeOff,
    ArrowRight,
    CheckCircle2,
    AlertCircle,
    ShieldCheck,
    Store,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function LoginPage() {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [loginSuccess, setLoginSuccess] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        if (errorMessage) {
            setErrorMessage("");
        }

        if (loginSuccess) {
            setLoginSuccess(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        setErrorMessage("");
        setLoginSuccess(false);

        if (!formData.email.trim() || !formData.password) {
            setErrorMessage("Please enter both email and password.");
            return;
        }

        // UI only — no API call
        setLoginSuccess(true);
    };

    return (
        <div className="min-h-screen bg-husk flex flex-col justify-between selection:bg-fern/20 selection:text-canopy">

            <main className="flex-1 flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-md">

                    {/* Login Card */}
                    <div className="relative rounded-3xl border border-canopy/15 bg-white/85 p-8 sm:p-10 shadow-xl shadow-canopy/5 backdrop-blur-xl transition-all">

                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-fern/10 border border-fern/20 text-xs font-semibold text-fern mb-3">
                                <Store className="w-3.5 h-3.5" />
                                <span>Vendor & Admin Portal</span>
                            </div>

                            <h1 className="font-display text-3xl font-semibold text-canopy tracking-tight">
                                Welcome back
                            </h1>

                            <p className="text-sm text-soil/80 mt-1.5">
                                Sign in to manage your vendor inventory, treatments, and orders.
                            </p>
                        </div>

                        {/* Error Message */}
                        {errorMessage && (
                            <Alert className="mb-6 border-red-300 bg-red-50 text-red-800 animate-in fade-in zoom-in-95">
                                <AlertCircle className="h-4 w-4 text-red-600" />

                                <AlertTitle>
                                    Sign In Failed
                                </AlertTitle>

                                <AlertDescription>
                                    {errorMessage}
                                </AlertDescription>
                            </Alert>
                        )}

                        {/* Success Message */}
                        {loginSuccess && (
                            <Alert className="mb-6 border-fern/30 bg-fern/10 text-canopy animate-in fade-in zoom-in-95">
                                <CheckCircle2 className="h-4 w-4 text-fern" />

                                <AlertTitle>
                                    Login Successful
                                </AlertTitle>

                                <AlertDescription>
                                    Welcome back! You have successfully signed in.
                                </AlertDescription>
                            </Alert>
                        )}

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-5">

                            {/* Email */}
                            <div className="space-y-1.5">
                                <Label htmlFor="email">
                                    Email Address
                                </Label>

                                <div className="relative">
                                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-soil/40 pointer-events-none" />

                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        placeholder="vendor@farmco.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="pl-10 h-11 bg-white/80 border-canopy/20 focus-visible:border-fern focus-visible:ring-1 focus-visible:ring-fern/30 text-canopy placeholder:text-soil/40 transition-all"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password">
                                        Password
                                    </Label>

                                    <span className="text-xs text-fern hover:underline cursor-pointer opacity-80">
                                        Forgot password?
                                    </span>
                                </div>

                                <div className="relative">
                                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-soil/40 pointer-events-none" />

                                    <Input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        autoComplete="current-password"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="pl-10 pr-10 h-11 bg-white/80 border-canopy/20 focus-visible:border-fern focus-visible:ring-1 focus-visible:ring-fern/30 text-canopy placeholder:text-soil/40 transition-all"
                                    />

                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-soil/40 hover:text-canopy transition-colors cursor-pointer"
                                        tabIndex={-1}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Sign In Button */}
                            <Button
                                type="submit"
                                className="w-full h-11 text-base font-semibold bg-canopy text-husk hover:bg-canopy/90 shadow-md shadow-canopy/20 cursor-pointer"
                            >
                                <span>Sign In</span>
                                <ArrowRight className="w-4 h-4" />
                            </Button>
                        </form>

                        {/* Divider */}
                        <div className="relative my-8 text-center">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-canopy/10" />
                            </div>

                            <span className="relative bg-white/90 px-3 text-xs uppercase tracking-wider text-soil/60 font-semibold">
                                New to LeafLens?
                            </span>
                        </div>

                        {/* Register Button */}
                        <div className="rounded-2xl p-4 text-center">
                            <Link href="/signup" className="block">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full text-xs font-semibold"
                                >
                                    Register as Vendor
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Security Info */}
                    <div className="mt-6 flex items-center justify-center gap-2 text-xs text-soil/60">
                        <ShieldCheck className="w-4 h-4 text-fern" />

                        <span>
                            Secure 256-bit encrypted authentication
                        </span>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="py-4 text-center text-xs text-soil/60 border-t border-canopy/10 bg-husk/50">
                © {new Date().getFullYear()} LeafLens. All rights reserved.
            </footer>
        </div>
    );
}