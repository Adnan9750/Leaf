"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  Microscope,
  Bug,
  Sparkles,
  RefreshCw,
  Eye,
  CloudRain,
  HelpCircle,
  Activity,
  Check,
  Info,
  Download,
  Leaf,
  Search,
  Stethoscope,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Utility to clean raw model class labels (e.g., "Wheat_Yellow Rust" -> "Wheat: Yellow Rust")
function cleanLabel(rawLabel) {
  if (!rawLabel) return "";
  if (!rawLabel.includes("_")) return rawLabel;
  const [crop, ...rest] = rawLabel.split("_");
  const disease = rest.join(" ").trim();
  return `${crop}: ${disease}`;
}

export default function DiagnosisResult({
  result,
  previewUrl,
  onReset,
}) {
  const [activeTab, setActiveTab] = useState("all"); // 'all' | 'symptoms' | 'treatment' | 'differential'

  if (!result || !result.data) return null;

  const { data, message } = result;
  const isLowConfidence = data.low_confidence === true;
  const isHealthy = data.is_healthy === true;

  const confidenceValue = typeof data.confidence === "number" ? data.confidence : 0;
  const isModerateConfidence = confidenceValue < 80 && !isLowConfidence;

  // Disease Type Styling Tokens
  const diseaseType = data.type || (isHealthy ? "Healthy" : "Fungal");
  const typeConfig = {
    Healthy: {
      label: "Healthy",
      badgeBg: "bg-emerald-100 text-emerald-800",
      barColor: "bg-emerald-500",
      icon: Sparkles,
    },
    Fungal: {
      label: "Fungal Pathogen",
      badgeBg: "bg-amber-100 text-amber-800",
      barColor: "bg-amber-500",
      icon: Microscope,
    },
    Bacterial: {
      label: "Bacterial Pathogen",
      badgeBg: "bg-purple-100 text-purple-800",
      barColor: "bg-purple-500",
      icon: Bug,
    },
  }[diseaseType] || {
    label: diseaseType,
    badgeBg: "bg-zinc-100 text-zinc-800",
    barColor: "bg-zinc-500",
    icon: ShieldAlert,
  };

  const TypeIcon = typeConfig.icon;

  // const handlePrint = () => {
  //   window.print();
  // };

  const cleanTitle = isHealthy
    ? `${data.crop} — Healthy`
    : `${data.crop} — ${data.disease}`;

  // Confidence bar color
  const barColor =
    confidenceValue >= 85
      ? "bg-emerald-500"
      : confidenceValue >= 60
        ? "bg-amber-500"
        : "bg-red-500";

  // ─────────────────────────────────────────────────
  // Case A: Image with Low Confidence (< 60%)
  // ─────────────────────────────────────────────────
  if (isLowConfidence) {
    return (
      <div className="space-y-5 animate-in fade-in slide-in-from-bottom-3 duration-300">
        <div className="flex flex-col sm:flex-row gap-5 items-start">
          {previewUrl && (
            <div className="w-full sm:w-44 h-40 rounded-xl overflow-hidden bg-zinc-900 border border-zinc-200 shrink-0">
              <img
                src={previewUrl}
                alt="Uploaded leaf"
                className="w-full h-full object-contain"
              />
            </div>
          )}

          <div className="flex-1 space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
              <AlertTriangle className="h-3.5 w-3.5" />
              Uncertain Match · {confidenceValue.toFixed(1)}%
            </span>

            <h3 className="text-xl font-bold text-zinc-900">
              {message || "Not sure about this image"}
            </h3>

            <p className="text-sm text-zinc-600 leading-relaxed">
              The visual patterns did not reach our certainty threshold (60%). For safety, we don't provide treatment recommendations for uncertain results.
            </p>

            {data.possible_matches && data.possible_matches.length > 0 && (
              <div className="space-y-2 pt-1">
                <p className="text-xs font-semibold text-zinc-700">Closest candidates:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {data.possible_matches.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-200 flex items-center justify-between text-xs"
                    >
                      <span className="font-medium text-zinc-800">
                        {cleanLabel(item.label)}
                      </span>
                      <span className="font-mono text-zinc-500 font-semibold">
                        {item.confidence.toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
              <p className="font-semibold flex items-center gap-1.5">
                <HelpCircle className="h-3.5 w-3.5" />
                Tips for better results:
              </p>
              <p className="text-amber-800 text-[11px] leading-relaxed">
                • Ensure a single leaf fills the frame &nbsp;• Avoid blur or heavy shadows &nbsp;• Use natural daylight
              </p>
            </div>

            <Button
              onClick={onReset}
              className="h-10 px-5 rounded-xl bg-canopy hover:bg-canopy/90 text-white text-sm font-semibold gap-2 cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Try Another Image</span>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────
  // Case B: Confirmed Diagnosis
  // ─────────────────────────────────────────────────
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
      {/* ───── Top: Image + Diagnosis Summary ───── */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Leaf image */}
        {previewUrl && (
          <div className="w-full md:w-56 shrink-0">
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-zinc-900 border border-zinc-200 group">
              <img
                src={previewUrl}
                alt="Analyzed Leaf"
                className="w-full h-full object-contain"
              />
              {/* Crop badge overlay */}
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-3 pt-6">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/20 backdrop-blur-sm text-white text-[11px] font-medium">
                  <Leaf className="h-3 w-3" />
                  {data.crop}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Diagnosis info */}
        <div className="flex-1 space-y-4">
          {/* Status badge */}
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${typeConfig.badgeBg}`}>
            <TypeIcon className="h-3.5 w-3.5" />
            {typeConfig.label}
          </span>

          {/* Title */}
          <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight leading-snug">
            {cleanTitle}
          </h2>

          {/* Confidence */}
          <div className="space-y-1.5">
            <p className="text-sm font-semibold text-canopy">
              {confidenceValue.toFixed(2)}% confidence
            </p>
            <div className="w-full h-2.5 rounded-full bg-zinc-200 overflow-hidden">
              <div
                className={`h-full rounded-full ${barColor} transition-all duration-700 ease-out`}
                style={{ width: `${Math.min(100, Math.max(8, confidenceValue))}%` }}
              />
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-zinc-600 leading-relaxed">
            {isHealthy
              ? "The leaf appears to be healthy with no visible signs of disease."
              : `Active pathological signs identified. Review symptoms and treatment below.`}
          </p>
        </div>
      </div>

      {/* ───── Stats Row ───── */}
      <div className="grid grid-cols-2 gap-3">
        {[
          // {
          //   icon: Activity,
          //   label: "Severity",
          //   value: isHealthy ? "None" : (data.severity || "Moderate"),
          //   color: "text-canopy",
          // },
          {
            icon: Leaf,
            label: "Crop",
            value: data.crop,
            color: "text-canopy",
          },
          {
            icon: Search,
            label: "Confidence",
            value: `${confidenceValue.toFixed(2)}%`,
            color: "text-canopy",
          },
        ].map((stat) => (
          <div key={stat.label} className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/80 text-center">
            <stat.icon className={`h-4.5 w-4.5 mx-auto mb-1.5 ${stat.color}`} />
            <p className="text-[11px] text-zinc-500 font-medium">{stat.label}</p>
            <p className="text-sm font-bold text-zinc-900 mt-0.5">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* ───── Healthy Plant: Care Tips ───── */}
      {isHealthy && (
        <div className="rounded-xl bg-emerald-50/70 border border-emerald-200 p-5">
          <h3 className="text-sm font-bold text-emerald-900 flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-emerald-700" />
            General Care Tips
          </h3>
          <div className="space-y-2">
            {(data.prevention || [
              "Continue regular monitoring of your crops.",
              "Ensure proper irrigation and nutrition.",
              "Maintain good field hygiene.",
            ]).map((tip, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-sm text-emerald-800">
                <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{tip}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ───── Diseased Plant: Tab Navigation ───── */}
      {!isHealthy && (
        <>
          {/* Tabs */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-zinc-100 border border-zinc-200/80">
            {[
              { id: "all", label: "Full Report" },
              { id: "symptoms", label: "Symptoms & Causes" },
              { id: "treatment", label: "Treatment" },
              { id: "differential", label: "Other Possibilities" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-white text-zinc-900 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-800"
                }`}
              >
                {tab.label}
                {tab.id === "differential" && isModerateConfidence && (
                  <span className="ml-1 text-amber-600">!</span>
                )}
              </button>
            ))}
          </div>

          {/* ─── Symptoms & Causes ─── */}
          {(activeTab === "all" || activeTab === "symptoms") && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-200">
              {/* Symptoms */}
              <div className="rounded-xl border border-zinc-200/80 bg-white p-5">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-700 border border-amber-200">
                    <Eye className="h-4 w-4" />
                  </div>
                  <h3 className="text-sm font-bold text-zinc-900">Field Symptoms</h3>
                </div>

                {data.symptoms && data.symptoms.length > 0 ? (
                  <div className="space-y-2">
                    {data.symptoms.map((symptom, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2.5 text-sm text-zinc-700"
                      >
                        <Check className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                        <span>{symptom}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-zinc-500">
                    Check foliage for spots, streaks, or chlorotic lesions.
                  </p>
                )}
              </div>

              {/* Causes */}
              <div className="rounded-xl border border-zinc-200/80 bg-white p-5">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                    <CloudRain className="h-4 w-4" />
                  </div>
                  <h3 className="text-sm font-bold text-zinc-900">Causes & Triggers</h3>
                </div>

                <div className="text-sm text-zinc-700 leading-relaxed">
                  <p>{data.causes || "Fungal spores or bacterial agents thriving in prolonged humidity and favorable ambient temperatures."}</p>
                </div>

                <div className="mt-3 p-2.5 rounded-lg bg-blue-50/50 border border-blue-100 text-xs text-zinc-600 flex items-start gap-2">
                  <Info className="h-3.5 w-3.5 text-blue-500 shrink-0 mt-0.5" />
                  <span>Weather, uncertified seed, and crop residue are primary infection sources.</span>
                </div>
              </div>
            </div>
          )}

          {/* ─── Treatment & Prevention ─── */}
          {(activeTab === "all" || activeTab === "treatment") && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-200">
              {/* Immediate treatment */}
              <div className="rounded-xl border border-zinc-200/80 bg-white p-5">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <Stethoscope className="h-4 w-4" />
                  </div>
                  <h3 className="text-sm font-bold text-zinc-900">Treatment Steps</h3>
                </div>

                {data.treatment && data.treatment.length > 0 ? (
                  <div className="space-y-2.5">
                    {data.treatment.map((step, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 text-sm text-zinc-700"
                      >
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-canopy text-white text-[11px] font-bold shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="leading-relaxed">{step}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-zinc-500">
                    Maintain standard crop management and inspect neighboring rows.
                  </p>
                )}
              </div>

              {/* Prevention */}
              <div className="rounded-xl border border-zinc-200/80 bg-white p-5">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 text-teal-700 border border-teal-200">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <h3 className="text-sm font-bold text-zinc-900">Prevention</h3>
                </div>

                {data.prevention && data.prevention.length > 0 ? (
                  <div className="space-y-2.5">
                    {data.prevention.map((step, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2.5 text-sm text-zinc-700"
                      >
                        <Check className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{step}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-zinc-500">
                    Use certified disease-free seeds and avoid mono-cropping.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ─── Differential Diagnosis ─── */}
          {(activeTab === "all" || activeTab === "differential") &&
            data.other_possibilities &&
            data.other_possibilities.length > 0 && (
              <div className="rounded-xl border border-zinc-200/80 bg-white p-5 animate-in fade-in duration-200">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700 border border-zinc-200">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900">Other Possibilities</h3>
                    <p className="text-[11px] text-zinc-500">
                      {isModerateConfidence
                        ? `Moderate confidence (${confidenceValue.toFixed(1)}%) — review alternatives`
                        : "Secondary predictions ranked by probability"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {data.other_possibilities.map((item, idx) => {
                    const itemPercent =
                      typeof item.confidence === "number" ? item.confidence : 0;
                    return (
                      <div
                        key={idx}
                        className="p-3 rounded-lg bg-zinc-50 border border-zinc-200/80 space-y-1.5"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-zinc-800">
                            {cleanLabel(item.label)}
                          </span>
                          <span className="font-mono text-zinc-500 font-semibold">
                            {itemPercent.toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-zinc-200 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-zinc-400"
                            style={{
                              width: `${Math.min(100, Math.max(5, itemPercent))}%`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
        </>
      )}

      {/* ───── Disclaimer ───── */}
      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3">
        <AlertTriangle className="h-4.5 w-4.5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="text-xs font-bold uppercase tracking-wide text-amber-800">
            Agricultural Notice
          </p>
          <p className="text-xs sm:text-sm text-amber-900 leading-relaxed">
            {data.disclaimer ||
              "This is an AI suggestion, not a confirmed diagnosis. For treatment and dosage, consult your local agriculture office."}
          </p>
        </div>
      </div>

      {/* ───── Bottom Actions ───── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <Button
          type="button"
          onClick={onReset}
          variant="outline"
          className="h-11 px-5 rounded-xl border-zinc-200 text-zinc-700 hover:bg-zinc-50 text-sm font-semibold gap-2 cursor-pointer flex-1 sm:flex-initial"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Analyze Another Image</span>
        </Button>

        {/* <Button
          type="button"
          onClick={handlePrint}
          className="h-11 px-5 rounded-xl bg-canopy hover:bg-canopy/90 text-white text-sm font-semibold gap-2 shadow-sm cursor-pointer flex-1 sm:flex-initial"
        >
          <Download className="h-4 w-4" />
          <span>Download Report</span>
        </Button> */}
      </div>
    </div>
  );
}
