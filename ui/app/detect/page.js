"use client";

import React, { useState, useRef, useEffect } from "react";
import DropzoneUpload from "@/components/detect/DropzoneUpload";
import DiagnosisResult from "@/components/detect/DiagnosisResult";
import { Sparkles, Shield, Sprout, Zap, Leaf, ScanLine, Target } from "lucide-react";

export default function DetectPage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const resultsRef = useRef(null);

  // Handle local file selection and create object URL
  const handleFileSelect = (file) => {
    if (!file) return;

    // Validate type
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setError("Please select a valid image file (JPG, PNG, or WEBP).");
      return;
    }

    // Validate size (5 MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image file size exceeds 5 MB. Please choose a smaller photo.");
      return;
    }

    // Clean up previous preview URL to avoid memory leaks
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError(null);
    setResult(null);
  };

  // Clear current selection
  const handleClear = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
  };

  // Submit image to prediction API
  const handleAnalyze = async () => {
    if (!selectedFile) {
      setError("Please select or capture a plant leaf image first.");
      return;
    }

    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("image", selectedFile);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8001";
      const res = await fetch(`${apiUrl}/api/predict/`, {
        method: "POST",
        body: formData,
      });

      const resData = await res.json();

      if (!res.ok || resData.success === false) {
        throw new Error(resData.error || "Failed to analyze leaf image.");
      }

      setResult(resData);

      // Smooth scroll to results
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 150);
    } catch (err) {
      console.error("Diagnosis error:", err);
      setError(err.message || "An unexpected error occurred during analysis. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Clean up preview URL on component unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const FEATURES = [
    { icon: Zap, label: "Instant Detection", sub: "Results in seconds" },
    { icon: Target, label: "High Accuracy", sub: "AI-powered analysis" },
    { icon: Shield, label: "Expert Guidance", sub: "Treatment & prevention" },
  ];

  return (
    <div className="min-h-screen bg-husk/60">
      {/* ─────────────────────────────────────────────────
          HERO BANNER — Green gradient with leaf pattern
      ───────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-canopy via-canopy/95 to-fern text-white">
        {/* Decorative leaf silhouettes */}
        <div className="absolute inset-0 opacity-[0.06]">
          <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-56 h-56 rounded-full bg-white/15 blur-2xl" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white/15 backdrop-blur-sm border border-white/20 mb-5">
            <Leaf className="h-3.5 w-3.5" />
            <span>AI Plant Disease Detection</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div className="max-w-lg">
              <h1 className="font-display text-3xl sm:text-4xl lg:text-[2.75rem] font-bold tracking-tight leading-tight">
                Detect Plant Diseases
                <br />
                with AI
              </h1>
              <p className="mt-3 text-sm sm:text-base text-white/75 leading-relaxed max-w-md">
                Upload a leaf image, and get instant results with treatment recommendations powered by deep learning.
              </p>
            </div>

            {/* Feature badges row */}
            <div className="flex flex-wrap gap-3">
              {FEATURES.map((f) => (
                <div
                  key={f.label}
                  className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15 hover:bg-white/15 transition-colors"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15">
                    <f.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold leading-tight">{f.label}</p>
                    <p className="text-[11px] text-white/60">{f.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────
          MAIN CONTENT — Two-column step layout
      ───────────────────────────────────────────────── */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className={`grid gap-6 ${result ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-[1fr]"}`}>

          {/* ====== STEP 1: Upload Image ====== */}
          <section className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm overflow-hidden">
            {/* Step header */}
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-zinc-100 bg-zinc-50/50">
              <div className="flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-canopy text-white text-xs font-bold">
                  1
                </span>
                <div>
                  <h2 className="text-sm font-bold text-zinc-900">Upload Image</h2>
                  <p className="text-[11px] text-zinc-500">Choose or drag and drop a leaf image</p>
                </div>
              </div>
            </div>

            {/* Upload body */}
            <div className="p-5 sm:p-6">
              <DropzoneUpload
                selectedFile={selectedFile}
                previewUrl={previewUrl}
                onFileSelect={handleFileSelect}
                onClear={handleClear}
                onAnalyze={handleAnalyze}
                isLoading={isLoading}
                error={error}
              />
            </div>
          </section>

          {/* ====== STEP 2: Detection Result ====== */}
          {result && (
            <section ref={resultsRef} className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Step header */}
              <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-zinc-100 bg-zinc-50/50">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-canopy text-white text-xs font-bold">
                    2
                  </span>
                  <div>
                    <h2 className="text-sm font-bold text-zinc-900">Detection Result</h2>
                    <p className="text-[11px] text-zinc-500">Here is what we found in your image</p>
                  </div>
                </div>
                {result?.data && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Analysis completed
                  </span>
                )}
              </div>

              {/* Results body */}
              <div className="p-5 sm:p-6">
                <DiagnosisResult
                  result={result}
                  previewUrl={previewUrl}
                  onReset={handleClear}
                />
              </div>
            </section>
          )}
        </div>

        {/* ─────────────────────────────────────────────────
            BOTTOM: Trust & Capabilities
        ───────────────────────────────────────────────── */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              icon: ScanLine,
              title: "AI Vision Engine",
              desc: "Deep learning model trained on validated field imagery for fast, high-accuracy inference.",
              color: "bg-emerald-50 text-emerald-700 border-emerald-200",
            },
            {
              icon: Shield,
              title: "Agronomic Guidance",
              desc: "Field-proven treatment protocols curated by agriculture experts for verified results.",
              color: "bg-blue-50 text-blue-700 border-blue-200",
            },
            {
              icon: Sprout,
              title: "Preventive Care",
              desc: "Long-term crop rotation, seed treatment, and soil nutrition management strategies.",
              color: "bg-amber-50 text-amber-700 border-amber-200",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="p-5 rounded-2xl bg-white border border-zinc-200/80 shadow-sm flex items-start gap-3.5 hover:shadow-md transition-shadow"
            >
              <div className={`p-2.5 rounded-xl border ${item.color} shrink-0`}>
                <item.icon className="h-4.5 w-4.5" />
              </div>
              <div>
                <p className="text-sm font-bold text-zinc-900">{item.title}</p>
                <p className="text-xs text-zinc-500 mt-1 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
