"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
    Building2,
    Mail,
    Lock,
    Eye,
    EyeOff,
    User,
    Phone,
    MapPin,
    Home as HomeIcon,
    CheckCircle2,
    AlertCircle,
    Clock,
    ArrowRight,
    ArrowLeft,
    ShieldCheck,
    Store,
    Check,
    Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import axiosInstance from "@/utils/axiosInstance";
// import Navbar from "@/components/Navbar";

export default function SignupPage() {
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [generalError, setGeneralError] = useState("");

    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        confirm_password: "",
        company_name: "",
        phone_number: "",
        city: "",
        address: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});
    const [isSuccess, setIsSuccess] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        if (fieldErrors[name]) {
            setFieldErrors((prev) => {
                const next = { ...prev };
                delete next[name];
                return next;
            });
        }
    };

    const handleStep1Next = (e) => {
        e.preventDefault();
        setCurrentStep(2);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleStep2Next = (e) => {
        e.preventDefault();
        setCurrentStep(3);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleStep2Back = () => {
        setCurrentStep(1);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleStep3Back = () => {
        setCurrentStep(2);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        setGeneralError("");
        setFieldErrors({});

        try {
            const res = await axiosInstance.post("/auth/signup", formData);
            if (res.status === 201) {
                setIsSuccess(true);
            }
        } catch (err) {
            if (err.response && err.response.data) {
                const data = err.response.data;
                if (typeof data === "object" && !data.error) {
                    const errors = {};
                    let stepToJump = null;

                    for (const [key, val] of Object.entries(data)) {
                        const message = Array.isArray(val) ? val[0] : val;
                        errors[key] = message;

                        if (["first_name", "last_name", "email", "phone_number"].includes(key) && !stepToJump) {
                            stepToJump = 1;
                        } else if (["company_name", "city", "address"].includes(key) && (!stepToJump || stepToJump > 2)) {
                            stepToJump = 2;
                        } else if (["password", "confirm_password"].includes(key) && !stepToJump) {
                            stepToJump = 3;
                        }
                    }
                    setFieldErrors(errors);
                    if (stepToJump && stepToJump !== 3) {
                        setCurrentStep(stepToJump);
                    }
                } else {
                    setGeneralError(err.response.data.error || "An error occurred during registration.");
                }
            } else {
                setGeneralError("Network error. Please try again later.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-husk flex flex-col justify-between selection:bg-fern/20 selection:text-canopy">
            {/* Public Navbar */}
            {/* <Navbar /> */}

            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-2xl">
                    {/* Success State Screen */}
                    {isSuccess ? (
                        <div className="rounded-3xl border border-fern/30 bg-white/90 p-8 sm:p-12 shadow-xl shadow-canopy/5 backdrop-blur-xl text-center animate-in fade-in zoom-in-95">
                            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-fern/10 border-2 border-fern/30 text-fern mb-6 shadow-inner">
                                <CheckCircle2 className="h-10 w-10 text-fern" />
                            </div>

                            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-bold text-amber-800 mb-4">
                                <Clock className="w-3.5 h-3.5" />
                                <span>STATUS: PENDING ADMIN APPROVAL</span>
                            </div>

                            <h1 className="font-display text-3xl sm:text-4xl font-semibold text-canopy tracking-tight mb-3">
                                Application Received!
                            </h1>

                            <p className="text-base text-soil/80 max-w-lg mx-auto mb-8">
                                Thank you for applying to partner with LeafLens. Your vendor account for{" "}
                                <strong className="text-canopy font-semibold">
                                    {formData.company_name}
                                </strong>{" "}
                                has been registered with email{" "}
                                <span className="font-mono text-sm text-fern font-medium">
                                    {formData.email}
                                </span>
                                .
                            </p>

                            {/* Info Box */}
                            <div className="rounded-2xl border border-canopy/10 bg-mist/30 p-6 text-left max-w-lg mx-auto mb-8 space-y-3">
                                <div className="flex items-start gap-3">
                                    <ShieldCheck className="w-5 h-5 text-fern shrink-0 mt-0.5" />
                                    <div className="text-xs text-soil/90 leading-relaxed">
                                        <strong className="text-canopy block font-semibold mb-0.5">
                                            Verification in Progress
                                        </strong>
                                        To maintain high agricultural standards, our admin team reviews vendor credentials before account activation.
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 pt-2 border-t border-canopy/10">
                                    <Mail className="w-5 h-5 text-fern shrink-0 mt-0.5" />
                                    <div className="text-xs text-soil/90 leading-relaxed">
                                        <strong className="text-canopy block font-semibold mb-0.5">
                                            Email Notification
                                        </strong>
                                        You will receive confirmation once your account is verified and ready for login.
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Link href="/login" className="w-full sm:w-auto">
                                    <Button className="w-full sm:w-auto">
                                        <span>Go to Login Portal</span>
                                        <ArrowRight className="w-4 h-4 ml-1.5" />
                                    </Button>
                                </Link>
                                <Link href="/" className="w-full sm:w-auto">
                                    <Button variant="outline" className="w-full sm:w-auto">
                                        Back to Home
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    ) : (
                        /* Signup Form Container */
                        <div className="relative rounded-3xl border border-canopy/15 bg-white/85 p-8 sm:p-12 shadow-xl shadow-canopy/5 backdrop-blur-xl transition-all">
                            {/* Header Badge & Title */}
                            <div className="text-center mb-6">
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-fern/10 border border-fern/20 text-xs font-semibold text-fern mb-3">
                                    <Store className="w-3.5 h-3.5" />
                                    <span>Certified Vendor Onboarding</span>
                                </div>
                                <h1 className="font-display text-3xl sm:text-4xl font-semibold text-canopy tracking-tight">
                                    Register Your Agri-Store
                                </h1>
                                <p className="text-sm text-soil/80 mt-2 max-w-md mx-auto">
                                    {currentStep === 1
                                        ? "Enter your personal details to begin registration."
                                        : currentStep === 2
                                            ? "Provide your company and store location details."
                                            : "Create a secure password to protect your vendor account."}
                                </p>
                            </div>

                            {/* ── Three-Step Wizard Progress Indicator ── */}
                            <div className="mb-8 max-w-md mx-auto">
                                <div className="flex items-center justify-between relative">
                                    {/* Background Track */}
                                    <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-canopy/10 -translate-y-1/2 z-0" />
                                    {/* Filled Track */}
                                    <div
                                        className={`absolute top-1/2 left-0 h-0.5 bg-fern -translate-y-1/2 z-0 transition-all duration-300 ${currentStep === 1
                                            ? "w-0"
                                            : currentStep === 2
                                                ? "w-1/2"
                                                : "w-full"
                                            }`}
                                    />

                                    {/* Step 1 Circle: User Details */}
                                    <div className="relative z-10 flex flex-col items-center gap-1.5">
                                        <button
                                            type="button"
                                            onClick={() => setCurrentStep(1)}
                                            className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold transition-all ${currentStep === 1
                                                ? "bg-canopy text-husk ring-4 ring-fern/20 shadow-md cursor-default"
                                                : "bg-fern text-husk cursor-pointer hover:opacity-90"
                                                }`}
                                        >
                                            {currentStep > 1 ? <Check className="w-4 h-4" /> : "1"}
                                        </button>
                                        <span
                                            className={`text-xs font-semibold ${currentStep === 1 ? "text-canopy font-bold" : "text-fern"
                                                }`}
                                        >
                                            User Detail
                                        </span>
                                    </div>

                                    {/* Step 2 Circle: Company */}
                                    <div className="relative z-10 flex flex-col items-center gap-1.5">
                                        <button
                                            type="button"
                                            onClick={() => setCurrentStep(2)}
                                            className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold transition-all ${currentStep === 2
                                                ? "bg-canopy text-husk ring-4 ring-fern/20 shadow-md cursor-default"
                                                : currentStep > 2
                                                    ? "bg-fern text-husk cursor-pointer hover:opacity-90"
                                                    : "bg-mist text-soil/60 border border-canopy/15 cursor-pointer hover:text-canopy"
                                                }`}
                                        >
                                            {currentStep > 2 ? <Check className="w-4 h-4" /> : "2"}
                                        </button>
                                        <span
                                            className={`text-xs font-semibold ${currentStep === 2
                                                ? "text-canopy font-bold"
                                                : currentStep > 2
                                                    ? "text-fern"
                                                    : "text-soil/50"
                                                }`}
                                        >
                                            Company
                                        </span>
                                    </div>

                                    {/* Step 3 Circle: Password */}
                                    <div className="relative z-10 flex flex-col items-center gap-1.5">
                                        <button
                                            type="button"
                                            onClick={() => setCurrentStep(3)}
                                            className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold transition-all ${currentStep === 3
                                                ? "bg-canopy text-husk ring-4 ring-fern/20 shadow-md cursor-default"
                                                : "bg-mist text-soil/60 border border-canopy/15 cursor-pointer hover:text-canopy"
                                                }`}
                                        >
                                            <Lock className="w-4 h-4" />
                                        </button>
                                        <span
                                            className={`text-xs font-semibold ${currentStep === 3 ? "text-canopy font-bold" : "text-soil/50"
                                                }`}
                                        >
                                            Password
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* ──────────────── STEP 1: User Details ──────────────── */}
                            {currentStep === 1 && (
                                <form onSubmit={handleStep1Next} className="space-y-6 animate-in fade-in slide-in-from-left-2 duration-200">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {/* First Name */}
                                        <div className="space-y-1.5">
                                            <Label htmlFor="first_name">
                                                First Name
                                            </Label>
                                            <div className="relative">
                                                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-soil/40 pointer-events-none" />
                                                <Input
                                                    id="first_name"
                                                    name="first_name"
                                                    placeholder="Muhammad"
                                                    value={formData.first_name}
                                                    onChange={handleChange}
                                                    error={!!fieldErrors.first_name}
                                                    className="pl-10"
                                                />
                                            </div>
                                            {fieldErrors.first_name && (
                                                <p className="text-xs text-blight font-medium flex items-center gap-1 mt-1">
                                                    <AlertCircle className="w-3 h-3 shrink-0" />
                                                    {fieldErrors.first_name}
                                                </p>
                                            )}
                                        </div>

                                        {/* Last Name */}
                                        <div className="space-y-1.5">
                                            <Label htmlFor="last_name">
                                                Last Name
                                            </Label>
                                            <div className="relative">
                                                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-soil/40 pointer-events-none" />
                                                <Input
                                                    id="last_name"
                                                    name="last_name"
                                                    placeholder="Ali"
                                                    value={formData.last_name}
                                                    onChange={handleChange}
                                                    error={!!fieldErrors.last_name}
                                                    className="pl-10"
                                                />
                                            </div>
                                            {fieldErrors.last_name && (
                                                <p className="text-xs text-blight font-medium flex items-center gap-1 mt-1">
                                                    <AlertCircle className="w-3 h-3 shrink-0" />
                                                    {fieldErrors.last_name}
                                                </p>
                                            )}
                                        </div>

                                        {/* Email */}
                                        <div className="sm:col-span-2 space-y-1.5">
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
                                                    placeholder="vendor@agristore.pk"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    error={!!fieldErrors.email}
                                                    className="pl-10"
                                                />
                                            </div>
                                            {fieldErrors.email && (
                                                <p className="text-xs text-blight font-medium flex items-center gap-1 mt-1">
                                                    <AlertCircle className="w-3 h-3 shrink-0" />
                                                    {fieldErrors.email}
                                                </p>
                                            )}
                                        </div>

                                        {/* Phone Number */}
                                        <div className="sm:col-span-2 space-y-1.5">
                                            <Label htmlFor="phone_number">
                                                Contact Phone Number
                                            </Label>
                                            <div className="relative">
                                                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-soil/40 pointer-events-none" />
                                                <Input
                                                    id="phone_number"
                                                    name="phone_number"
                                                    type="tel"
                                                    placeholder="+92 300 1234567"
                                                    value={formData.phone_number}
                                                    onChange={handleChange}
                                                    error={!!fieldErrors.phone_number}
                                                    className="pl-10"
                                                />
                                            </div>
                                            {fieldErrors.phone_number && (
                                                <p className="text-xs text-blight font-medium flex items-center gap-1 mt-1">
                                                    <AlertCircle className="w-3 h-3 shrink-0" />
                                                    {fieldErrors.phone_number}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Next Button */}
                                    <div className="pt-2">
                                        <Button
                                            type="submit"
                                            className="w-full h-12 text-base font-semibold bg-canopy text-husk hover:bg-canopy/90  shadow-canopy/20 cursor-pointe"
                                        >
                                            <span>Next</span>
                                            <ArrowRight className="w-5 h-5 ml-1" />
                                        </Button>
                                        {/* <Button
                                            type="submit"
                                            className="w-full h-12 text-base font-semibold shadow-lg shadow-canopy/20"
                                        >
                                            <span>Next</span>
                                            <ArrowRight className="w-5 h-5 ml-1" />
                                        </Button> */}
                                    </div>
                                </form>
                            )}

                            {/* ──────────────── STEP 2: Company Details ──────────────── */}
                            {currentStep === 2 && (
                                <form onSubmit={handleStep2Next} className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-200">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {/* Company / Store Name */}
                                        <div className="sm:col-span-2 space-y-1.5">
                                            <Label htmlFor="company_name">
                                                Company / Store Name
                                            </Label>
                                            <div className="relative">
                                                <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-soil/40 pointer-events-none" />
                                                <Input
                                                    id="company_name"
                                                    name="company_name"
                                                    placeholder="e.g. Kisan Zarai Markaz & Seeds"
                                                    value={formData.company_name}
                                                    onChange={handleChange}
                                                    error={!!fieldErrors.company_name}
                                                    className="pl-10"
                                                />
                                            </div>
                                            {fieldErrors.company_name && (
                                                <p className="text-xs text-blight font-medium flex items-center gap-1 mt-1">
                                                    <AlertCircle className="w-3 h-3 shrink-0" />
                                                    {fieldErrors.company_name}
                                                </p>
                                            )}
                                        </div>

                                        {/* City */}
                                        <div className="sm:col-span-2 space-y-1.5">
                                            <Label htmlFor="city">
                                                City / District
                                            </Label>
                                            <div className="relative">
                                                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-soil/40 pointer-events-none" />
                                                <Input
                                                    id="city"
                                                    name="city"
                                                    placeholder="e.g. Multan, Faisalabad, Lahore"
                                                    value={formData.city}
                                                    onChange={handleChange}
                                                    error={!!fieldErrors.city}
                                                    className="pl-10"
                                                />
                                            </div>
                                            {fieldErrors.city && (
                                                <p className="text-xs text-blight font-medium flex items-center gap-1 mt-1">
                                                    <AlertCircle className="w-3 h-3 shrink-0" />
                                                    {fieldErrors.city}
                                                </p>
                                            )}
                                        </div>

                                        {/* Physical Address */}
                                        <div className="sm:col-span-2 space-y-1.5">
                                            <Label htmlFor="address">
                                                Complete Store / Warehouse Address
                                            </Label>
                                            <div className="relative">
                                                <HomeIcon className="absolute left-3.5 top-3 h-4 w-4 text-soil/40 pointer-events-none" />
                                                <textarea
                                                    id="address"
                                                    name="address"
                                                    rows={3}
                                                    placeholder="Shop #12, Grain Market, Zarai Road"
                                                    value={formData.address}
                                                    onChange={handleChange}
                                                    className={`flex w-full rounded-xl border bg-white/80 pl-10 pr-4 py-2.5 text-sm text-canopy shadow-sm transition-all duration-200 placeholder:text-soil/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 ${fieldErrors.address
                                                        ? "border-blight/70 focus-visible:border-blight focus-visible:ring-blight/30 bg-blight/[0.02]"
                                                        : "border-canopy/20 hover:border-canopy/40 focus-visible:border-fern focus-visible:ring-fern/30"
                                                        }`}
                                                />
                                            </div>
                                            {fieldErrors.address && (
                                                <p className="text-xs text-blight font-medium flex items-center gap-1 mt-1">
                                                    <AlertCircle className="w-3 h-3 shrink-0" />
                                                    {fieldErrors.address}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="pt-2 flex items-center gap-3">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={handleStep2Back}
                                            className="h-12 px-5 font-semibold text-sm"
                                        >
                                            <ArrowLeft className="w-4 h-4 mr-1" />
                                            <span>Back</span>
                                        </Button>

                                        <Button
                                            type="submit"
                                            className="flex-1 h-12 text-base font-semibold bg-canopy text-husk hover:bg-canopy/90  shadow-canopy/20 cursor-pointe"
                                        >
                                            <span>Next</span>
                                            <ArrowRight className="w-5 h-5 ml-1" />
                                        </Button>
                                    </div>
                                </form>
                            )}

                            {/* ──────────────── STEP 3: Password & Submit ──────────────── */}
                            {currentStep === 3 && (
                                <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-200">
                                    {/* Account Summary Chip */}
                                    {(formData.first_name || formData.company_name) && (
                                        <div className="rounded-2xl border border-canopy/10 bg-mist/30 p-4 flex items-center justify-between">
                                            <div className="space-y-0.5">
                                                <p className="text-xs font-bold text-canopy">
                                                    {formData.first_name} {formData.last_name} {formData.company_name ? `• ${formData.company_name}` : ""}
                                                </p>
                                                <p className="text-xs text-soil/70">{formData.email}</p>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setCurrentStep(1)}
                                                className="text-xs text-fern underline-offset-2 hover:underline border-none p-0 h-auto"
                                            >
                                                Edit Info
                                            </Button>
                                        </div>
                                    )}

                                    {/* Password Field */}
                                    <div className="space-y-1.5">
                                        <Label htmlFor="password">
                                            Create Password
                                        </Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-soil/40 pointer-events-none" />
                                            <Input
                                                id="password"
                                                name="password"
                                                type={showPassword ? "text" : "password"}
                                                autoComplete="new-password"
                                                placeholder="At least 8 characters"
                                                value={formData.password}
                                                onChange={handleChange}
                                                error={!!fieldErrors.password}
                                                className="pl-10 pr-10"
                                                autoFocus
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-soil/40 hover:text-canopy transition-colors"
                                                tabIndex={-1}
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="h-4 w-4" />
                                                ) : (
                                                    <Eye className="h-4 w-4" />
                                                )}
                                            </button>
                                        </div>

                                        {fieldErrors.password && (
                                            <p className="text-xs text-blight font-medium flex items-center gap-1 mt-1">
                                                <AlertCircle className="w-3 h-3 shrink-0" />
                                                {fieldErrors.password}
                                            </p>
                                        )}
                                    </div>

                                    {/* Confirm Password Field */}
                                    <div className="space-y-1.5">
                                        <Label htmlFor="confirm_password">
                                            Confirm Password
                                        </Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-soil/40 pointer-events-none" />
                                            <Input
                                                id="confirm_password"
                                                name="confirm_password"
                                                type={showConfirmPassword ? "text" : "password"}
                                                autoComplete="new-password"
                                                placeholder="Re-enter your password"
                                                value={formData.confirm_password}
                                                onChange={handleChange}
                                                error={!!fieldErrors.confirm_password}
                                                className="pl-10 pr-10"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-soil/40 hover:text-canopy transition-colors"
                                                tabIndex={-1}
                                            >
                                                {showConfirmPassword ? (
                                                    <EyeOff className="h-4 w-4" />
                                                ) : (
                                                    <Eye className="h-4 w-4" />
                                                )}
                                            </button>
                                        </div>
                                        {fieldErrors.confirm_password && (
                                            <p className="text-xs text-blight font-medium flex items-center gap-1 mt-1">
                                                <AlertCircle className="w-3 h-3 shrink-0" />
                                                {fieldErrors.confirm_password}
                                            </p>
                                        )}
                                    </div>

                                    {generalError && (
                                        <div className="p-3 rounded-xl bg-blight/10 border border-blight/20 text-blight text-xs flex items-center gap-2">
                                            <AlertCircle className="w-4 h-4 shrink-0" />
                                            <span>{generalError}</span>
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="pt-3 flex items-center gap-3">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={handleStep3Back}
                                            disabled={loading}
                                            className="h-12 px-5 font-semibold text-sm"
                                        >
                                            <ArrowLeft className="w-4 h-4 mr-1" />
                                            <span>Back</span>
                                        </Button>

                                        <Button
                                            type="submit"
                                            disabled={loading}
                                            className="flex-1 h-12 text-base font-semibold bg-canopy text-husk hover:bg-canopy/90  shadow-canopy/20 cursor-pointer"
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                                    <span>Registering...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span>Register</span>
                                                    <CheckCircle2 className="w-5 h-5 ml-1" />
                                                </>
                                            )}
                                        </Button>
                                    </div>

                                    <p className="text-[11px] text-soil/70 text-center leading-relaxed">
                                        By submitting, you agree to LeafLens vendor terms and verify that all store details and agricultural permits are authentic.
                                    </p>
                                </form>
                            )}

                            {/* Already have an account? */}
                            <div className="mt-8 pt-6 border-t border-canopy/10 text-center">
                                <p className="text-sm text-soil/80">
                                    Already registered or have an account?{" "}
                                    <Link
                                        href="/login"
                                        className="font-semibold text-canopy hover:text-fern underline underline-offset-4"
                                    >
                                        Sign in to your portal
                                    </Link>
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Footer */}
            <footer className="py-4 text-center text-xs text-soil/60 border-t border-canopy/10 bg-husk/50">
                © {new Date().getFullYear()} LeafLens. All rights reserved.
            </footer>
        </div>
    );
}