"use client";

import React, { useState } from "react";
import DropzoneUpload from "@/components/detect/DropzoneUpload";
import DiagnosisResult from "@/components/detect/DiagnosisResult";

export default function DetectPage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileSelect = (file) => {
    if (!file) return;
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setError("Please select a valid image file (JPG, PNG, or WEBP).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image file size exceeds 5 MB.");
      return;
    }
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError(null);
    setResult(null);
  };

  const handleClear = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
  };

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
      const res = await fetch(`${apiUrl}/api/predict/`, { method: "POST", body: formData });
      const resData = await res.json();
      if (!res.ok || resData.success === false) {
        throw new Error(resData.error || "Failed to analyze leaf image.");
      }
      setTimeout(() => setResult(resData), 400);
    } catch (err) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-husk">
      <div className="mx-auto max-w-6xl px-6 py-10 md:px-8 md:py-12">
        {/* ── Page Header ── */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-fern mb-3">
            <span className="h-2 w-2 rounded-full bg-blight animate-pulse" />
            AI-powered plant health
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-semibold leading-[1.1] text-canopy tracking-tight">
            Detect Plant Diseases
          </h1>
          <p className="mt-2 text-soil/80 max-w-2xl">
            Upload a photo of your crop leaf to get an instant diagnosis, treatment guidance, and medicine recommendations.
          </p>
        </div>

        {/* ── Two-Column Layout ── */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-start">
          {/* Left: Upload / Image column */}
          <div className="space-y-6">
            <DropzoneUpload
              selectedFile={selectedFile}
              previewUrl={previewUrl}
              onFileSelect={handleFileSelect}
              onClear={handleClear}
              onAnalyze={handleAnalyze}
              isLoading={isLoading}
              error={error}
            />

            {/* How it works — only shown before analysis */}
            {!previewUrl && !result && (
              <div className="rounded-2xl border border-canopy/10 bg-white/60 p-6">
                <h3 className="font-display text-lg font-semibold text-canopy mb-4">
                  How it works
                </h3>
                <ol className="space-y-4">
                  <li className="flex items-start gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-canopy text-husk text-xs font-bold">
                      1
                    </span>
                    <div>
                      <p className="text-sm font-medium text-canopy">Upload a leaf photo</p>
                      <p className="text-xs text-soil/60">JPG, PNG or WEBP — max 5 MB</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-canopy text-husk text-xs font-bold">
                      2
                    </span>
                    <div>
                      <p className="text-sm font-medium text-canopy">Our AI analyzes the image</p>
                      <p className="text-xs text-soil/60">Deep learning model scans for disease patterns</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-canopy text-husk text-xs font-bold">
                      3
                    </span>
                    <div>
                      <p className="text-sm font-medium text-canopy">Get diagnosis & treatment</p>
                      <p className="text-xs text-soil/60">Symptoms, causes, and prevention tips</p>
                    </div>
                  </li>
                </ol>
              </div>
            )}
          </div>

          {/* Right: Results column */}
          <div className="lg:sticky lg:top-24">
            <DiagnosisResult
              result={result}
              previewUrl={previewUrl}
              onReset={handleClear}
            />
          </div>
        </div>
      </div>
    </div>
  );
}