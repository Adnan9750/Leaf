"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import {
  UploadCloud,
  Camera,
  Image as ImageIcon,
  X,
  Sparkles,
  AlertCircle,
  Scan,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const SUPPORTED_CROPS = [
  { name: "Wheat", icon: "🌾", diseases: "Rusts, Blight, Smut, Mildew" },
  { name: "Corn (Maize)", icon: "🌽", diseases: "Leaf Blight, Rust, Gray Spot" },
  { name: "Cotton", icon: "🌱", diseases: "Bacterial Blight, Fusarium, Wilt" },
];

export default function DropzoneUpload({
  selectedFile,
  previewUrl,
  onFileSelect,
  onClear,
  onAnalyze,
  isLoading,
  error,
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      const files = e.dataTransfer.files;
      if (files && files[0]) {
        onFileSelect(files[0]);
      }
    },
    [onFileSelect]
  );

  useEffect(() => {
    const handlePaste = (e) => {
      if (e.clipboardData && e.clipboardData.files.length > 0) {
        const file = e.clipboardData.files[0];
        if (file.type.startsWith("image/")) {
          onFileSelect(file);
        }
      }
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [onFileSelect]);

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div className="w-full space-y-5">
      {/* Hidden inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileInputChange}
        className="hidden"
        id="leaf-file-input"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileInputChange}
        className="hidden"
        id="leaf-camera-input"
      />

      {/* ─── Dropzone Surface ─── */}
      <div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative rounded-xl border-2 border-dashed transition-all duration-200 ${
          isDragOver
            ? "border-canopy bg-emerald-50/60 scale-[1.005]"
            : previewUrl
              ? "border-transparent bg-zinc-50"
              : "border-zinc-300 bg-zinc-50/50 hover:border-canopy/40 hover:bg-emerald-50/20"
        }`}
      >
        {!previewUrl ? (
          /* ─── Empty State ─── */
          <div className="py-14 px-6 text-center flex flex-col items-center justify-center">
            {/* Upload icon */}
            <div className={`relative mb-5 flex h-16 w-16 items-center justify-center rounded-2xl transition-colors ${
              isDragOver ? "bg-canopy text-white" : "bg-canopy/10 text-canopy"
            }`}>
              <UploadCloud className="h-7 w-7" />
            </div>

            <h3 className="text-base sm:text-lg font-bold text-zinc-800 mb-1">
              Drag & drop your image here
            </h3>
            <p className="text-sm text-zinc-500 mb-6">or</p>

            {/* CTA Button */}
            <Button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="h-11 px-6 rounded-xl bg-canopy hover:bg-canopy/90 text-white text-sm font-semibold gap-2.5 shadow-sm transition-all active:scale-[0.98] cursor-pointer"
            >
              <ImageIcon className="h-4 w-4" />
              <span>Choose Image</span>
            </Button>

            {/* Camera option on mobile */}
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="mt-3 text-xs text-canopy/70 hover:text-canopy font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Camera className="h-3.5 w-3.5" />
              <span>or use camera</span>
            </button>

            {/* Format hint */}
            <p className="mt-5 text-xs text-zinc-400">
              Supported formats: JPG, PNG &nbsp;|&nbsp; Max size: 5MB
            </p>
          </div>
        ) : (
          /* ─── Preview State ─── */
          <div className="p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row gap-5 items-start">
              {/* Image thumbnail */}
              <div className="relative w-full sm:w-48 h-44 rounded-xl overflow-hidden bg-zinc-900 shrink-0 group border border-zinc-200">
                <img
                  src={previewUrl}
                  alt="Leaf Specimen"
                  className="w-full h-full object-contain"
                />

                {/* Scan animation overlay */}
                {isLoading && (
                  <>
                    <div className="absolute inset-0 bg-canopy/20 pointer-events-none" />
                    <div className="animate-scan absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-[#7fffb0] to-transparent shadow-[0_0_14px_3px_rgba(127,255,176,0.8)] z-20 pointer-events-none" />
                    <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-20 bg-black/80 backdrop-blur-md text-[#7fffb0] px-3 py-1 rounded-full text-[11px] font-bold border border-[#7fffb0]/30 flex items-center gap-1.5 whitespace-nowrap">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#7fffb0] animate-ping" />
                      Analyzing...
                    </div>
                  </>
                )}

                {/* Close */}
                {!isLoading && (
                  <button
                    type="button"
                    onClick={onClear}
                    title="Remove image"
                    className="absolute top-2 right-2 h-7 w-7 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition-all cursor-pointer z-30 opacity-0 group-hover:opacity-100"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* File info + action */}
              <div className="flex-1 w-full space-y-3">
                {/* File meta */}
                <div className="flex items-start gap-3 p-3 rounded-lg bg-white border border-zinc-200/80">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100 shrink-0">
                    <ImageIcon className="h-4 w-4 text-zinc-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-zinc-800 truncate">
                      {selectedFile?.name || "Uploaded Photo"}
                    </p>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {selectedFile?.size
                        ? `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`
                        : "Ready to analyze"}
                    </p>
                  </div>
                  {!isLoading && (
                    <button
                      type="button"
                      onClick={onClear}
                      className="p-1 text-zinc-400 hover:text-zinc-700 transition-colors cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Detect Disease CTA */}
                <Button
                  type="button"
                  onClick={onAnalyze}
                  disabled={isLoading}
                  className="w-full h-11 rounded-xl bg-canopy hover:bg-canopy/90 text-white text-sm font-semibold gap-2.5 shadow-sm cursor-pointer transition-all active:scale-[0.98] disabled:opacity-60"
                >
                  {isLoading ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Detecting Disease...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      <span>Detect Disease</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>

                {/* Change photo link */}
                {!isLoading && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs text-zinc-500 hover:text-canopy font-medium cursor-pointer transition-colors"
                  >
                    Change photo
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error alert */}
      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm flex items-start gap-2.5 animate-in fade-in duration-200">
          <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-800">Unable to analyze</p>
            <p className="text-red-600 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* ─── Supported Crops ─── */}
      <div className="pt-2">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-2.5">
          Supported Crops
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {SUPPORTED_CROPS.map((crop) => (
            <div
              key={crop.name}
              className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/70 flex items-center gap-2.5 hover:bg-white hover:border-zinc-300 transition-colors"
            >
              <span className="text-lg shrink-0">{crop.icon}</span>
              <div className="min-w-0">
                <p className="text-xs font-bold text-zinc-800">{crop.name}</p>
                <p className="text-[11px] text-zinc-500 truncate">{crop.diseases}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
