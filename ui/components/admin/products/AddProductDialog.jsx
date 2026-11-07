"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Check,
  ChevronLeft,
  ChevronRight,
  ImagePlus,
  Leaf,
  Loader2,
  Package,
  PackagePlus,
  ShieldCheck,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCategoryStore } from "@/store/categoryStore";
import { useProductStore } from "@/store/productStore";

const UNITS = [
  { value: "piece", label: "Piece" },
  { value: "pack", label: "Pack" },
  { value: "g", label: "Gram (g)" },
  { value: "kg", label: "Kg" },
  { value: "ml", label: "ml" },
  { value: "l", label: "Liter" },
];

const STEPS = [
  { id: "basics", title: "Basics", icon: Package },
  { id: "pricing", title: "Pricing", icon: PackagePlus },
  { id: "agri", title: "Agri & Media", icon: Leaf },
];

const INITIAL = {
  name: "",
  category_id: "",
  brand: "",
  short_description: "",
  description: "",
  price: "",
  compare_at_price: "",
  cost_price: "",
  unit: "piece",
  pack_size: "",
  stock: "0",
  low_stock_threshold: "5",
  active_ingredient: "",
  usage_instructions: "",
  safety_precautions: "",
  is_organic: false,
  status: "published",
};

const MAX_IMAGE_MB = 5;

function fileError(file) {
  if (!file) return null;
  if (!file.type.startsWith("image/")) return "Only image files are allowed.";
  if (file.size > MAX_IMAGE_MB * 1024 * 1024) return `Image must be under ${MAX_IMAGE_MB} MB.`;
  return null;
}

function InputLabel({ children, required }) {
  return (
    <label className="block text-xs font-bold text-zinc-700 mb-1.5">
      {children} {required ? <span className="text-red-500">*</span> : null}
    </label>
  );
}

function TextArea(props) {
  return (
    <textarea
      {...props}
      className={`w-full p-3 rounded-xl border border-zinc-200 bg-white text-xs font-medium text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 shadow-xs transition-all resize-none ${props.className || ""}`}
    />
  );
}

function Select(props) {
  return (
    <select
      {...props}
      className={`w-full h-11 px-3.5 rounded-xl border border-zinc-200 bg-white text-xs font-medium text-zinc-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 shadow-xs transition-all ${props.className || ""}`}
    />
  );
}

export default function AddProductDialog({ isOpen, onClose, onCreated }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(INITIAL);
  const [cover, setCover] = useState(null);
  const [gallery, setGallery] = useState([]);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [coverPreview, setCoverPreview] = useState("");
  const [galleryPreviews, setGalleryPreviews] = useState([]);

  const { categories, fetchCategories, isLoading: categoriesLoading } = useCategoryStore();
  const createProduct = useProductStore((s) => s.createProduct);

  const activeCategories = useMemo(
    () => (categories || []).filter((c) => c.is_active),
    [categories]
  );

  useEffect(() => {
    if (!isOpen) return;
    fetchCategories("active", "", false);
  }, [isOpen, fetchCategories]);

  const reset = () => {
    if (coverPreview) URL.revokeObjectURL(coverPreview);
    galleryPreviews.forEach((u) => URL.revokeObjectURL(u));
    setStep(0);
    setForm(INITIAL);
    setCover(null);
    setGallery([]);
    setCoverPreview("");
    setGalleryPreviews([]);
    setError("");
    setFieldErrors({});
    setSubmitting(false);
  };

  const close = () => {
    if (submitting) return;
    reset();
    onClose();
  };

  if (!isOpen) return null;

  const set = (key, value) => {
    setForm((p) => ({ ...p, [key]: value }));
    if (error) setError("");
    if (fieldErrors[key]) setFieldErrors((p) => ({ ...p, [key]: null }));
  };

  const fieldErr = (name) => {
    const e = fieldErrors?.[name] || fieldErrors?.category_id;
    if (name === "category_id" && fieldErrors?.category) return fieldErrors.category;
    if (!e) return null;
    return Array.isArray(e) ? e[0] : e;
  };

  const validateStep = () => {
    if (step === 0) {
      if (!form.name.trim()) return "Product name is required.";
      if (!form.category_id) return "Please select an active category.";
    }
    if (step === 1) {
      const price = Number(form.price);
      if (!form.price || !Number.isFinite(price) || price <= 0)
        return "Selling price must be greater than 0.";
      if (form.compare_at_price) {
        const cmp = Number(form.compare_at_price);
        if (!Number.isFinite(cmp) || cmp <= price)
          return "Compare-at price must be higher than selling price.";
      }
      if (form.stock !== "" && Number(form.stock) < 0) return "Stock cannot be negative.";
    }
    return "";
  };

  const next = () => {
    const msg = validateStep();
    if (msg) return setError(msg);
    setError("");
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const back = () => {
    setError("");
    setStep((s) => Math.max(s - 1, 0));
  };

  const onCover = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const msg = fileError(file);
    if (msg) return setError(msg);
    if (coverPreview) URL.revokeObjectURL(coverPreview);
    setError("");
    setCover(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const onGallery = (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files.length) return;
    const nextFiles = [...gallery];
    const nextUrls = [...galleryPreviews];
    for (const f of files) {
      const msg = fileError(f);
      if (msg) return setError(msg);
      if (nextFiles.length >= 6) return setError("You can upload up to 6 gallery images.");
      nextFiles.push(f);
      nextUrls.push(URL.createObjectURL(f));
    }
    setError("");
    setGallery(nextFiles);
    setGalleryPreviews(nextUrls);
  };

  const removeGallery = (idx) => {
    setGallery((g) => g.filter((_, i) => i !== idx));
    setGalleryPreviews((prev) => {
      const url = prev[idx];
      if (url) URL.revokeObjectURL(url);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const clearCover = () => {
    if (coverPreview) URL.revokeObjectURL(coverPreview);
    setCover(null);
    setCoverPreview("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step < STEPS.length - 1) return next();
    const msg = validateStep();
    if (msg) return setError(msg);

    setSubmitting(true);
    setError("");
    setFieldErrors({});

    const fd = new FormData();
    fd.append("name", form.name.trim());
    fd.append("category_id", String(form.category_id));
    if (form.brand.trim()) fd.append("brand", form.brand.trim());
    if (form.short_description.trim()) fd.append("short_description", form.short_description.trim());
    if (form.description.trim()) fd.append("description", form.description.trim());
    fd.append("price", String(form.price));
    if (form.compare_at_price !== "") fd.append("compare_at_price", String(form.compare_at_price));
    if (form.cost_price !== "") fd.append("cost_price", String(form.cost_price));
    fd.append("unit", form.unit);
    if (form.pack_size !== "") fd.append("pack_size", String(form.pack_size));
    fd.append("stock", String(form.stock === "" ? 0 : form.stock));
    fd.append("low_stock_threshold", String(form.low_stock_threshold === "" ? 5 : form.low_stock_threshold));
    if (form.active_ingredient.trim()) fd.append("active_ingredient", form.active_ingredient.trim());
    if (form.usage_instructions.trim()) fd.append("usage_instructions", form.usage_instructions.trim());
    if (form.safety_precautions.trim()) fd.append("safety_precautions", form.safety_precautions.trim());
    fd.append("is_organic", form.is_organic ? "true" : "false");
    fd.append("status", form.status);
    if (cover) fd.append("image", cover);
    gallery.forEach((f) => fd.append("gallery_images", f));

    const result = await createProduct(fd);
    setSubmitting(false);
    if (!result.success) {
      setError(result.error || "Failed to create product.");
      if (result.fieldErrors) setFieldErrors(result.fieldErrors);
      return;
    }
    if (onCreated) onCreated(result.data);
    reset();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in">
      <div
        className="w-full max-w-3xl max-h-[92vh] overflow-hidden rounded-[28px] bg-white shadow-2xl border border-black/[0.08] animate-in zoom-in-95 duration-200 flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-label="Add product"
      >
        <div className="flex items-start justify-between px-6 sm:px-7 pt-6 sm:pt-7 pb-4 border-b border-zinc-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 shadow-xs">
              <PackagePlus className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-zinc-900 tracking-tight">Add Product</h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                Create a catalog product for the Leaf marketplace.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={close}
            disabled={submitting}
            className="rounded-xl p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer disabled:opacity-50"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 sm:px-7 pt-4 shrink-0">
          <div className="flex items-center gap-2">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const active = i === step;
              const done = i < step;
              return (
                <React.Fragment key={s.id}>
                  <button
                    type="button"
                    onClick={() => !submitting && i <= step && setStep(i)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                      active
                        ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/20"
                        : done
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                          : "bg-zinc-50 text-zinc-400 border border-zinc-100"
                    }`}
                  >
                    {done ? <Check className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5" />}
                    <span className="hidden sm:inline">{s.title}</span>
                  </button>
                  {i < STEPS.length - 1 ? (
                    <div className={`h-px flex-1 ${done ? "bg-emerald-200" : "bg-zinc-100"}`} />
                  ) : null}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {error ? (
          <div className="mx-6 sm:mx-7 mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 animate-in fade-in shrink-0">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 sm:px-7 py-5">
          {step === 0 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <InputLabel required>Product Name</InputLabel>
                  <Input
                    autoFocus
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    placeholder="e.g., Neem Oil Insecticide"
                    className="h-11 rounded-xl border-zinc-200 text-xs"
                  />
                  {fieldErr("name") ? <p className="mt-1 text-[11px] text-red-600">{fieldErr("name")}</p> : null}
                </div>
                <div>
                  <InputLabel required>Category</InputLabel>
                  <Select
                    value={form.category_id}
                    onChange={(e) => set("category_id", e.target.value)}
                    disabled={categoriesLoading}
                  >
                    <option value="">
                      {categoriesLoading ? "Loading categories..." : "Select category"}
                    </option>
                    {activeCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </Select>
                  {fieldErr("category_id") || fieldErr("category") ? (
                    <p className="mt-1 text-[11px] text-red-600">{fieldErr("category_id") || fieldErr("category")}</p>
                  ) : null}
                  {!categoriesLoading && activeCategories.length === 0 ? (
                    <p className="mt-1 text-[11px] text-amber-700">No active categories found. Add one first.</p>
                  ) : null}
                </div>
                <div>
                  <InputLabel>Brand</InputLabel>
                  <Input
                    value={form.brand}
                    onChange={(e) => set("brand", e.target.value)}
                    placeholder="Brand name"
                    className="h-11 rounded-xl border-zinc-200 text-xs"
                  />
                </div>
                <div className="sm:col-span-2">
                  <InputLabel>Short Description</InputLabel>
                  <Input
                    value={form.short_description}
                    onChange={(e) => set("short_description", e.target.value)}
                    placeholder="One-line summary shown in listings"
                    maxLength={500}
                    className="h-11 rounded-xl border-zinc-200 text-xs"
                  />
                </div>
                <div className="sm:col-span-2">
                  <InputLabel>Description</InputLabel>
                  <TextArea
                    rows={4}
                    value={form.description}
                    onChange={(e) => set("description", e.target.value)}
                    placeholder="Full product details, benefits, and usage context..."
                  />
                </div>
              </div>
              <label className="flex items-start gap-3 p-3 rounded-2xl bg-zinc-50/80 border border-zinc-200/80 cursor-pointer hover:bg-zinc-100/60 transition-colors">
                <input
                  type="checkbox"
                  checked={form.status === "published"}
                  onChange={(e) => set("status", e.target.checked ? "published" : "draft")}
                  className="mt-0.5 h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500 border-zinc-300 accent-emerald-600"
                />
                <div className="text-xs">
                  <span className="font-bold text-zinc-900 block">Publish immediately</span>
                  <span className="text-zinc-500 text-[11px] block mt-0.5">
                    Uncheck to save as a draft (not visible in store until published).
                  </span>
                </div>
              </label>
            </div>
          ) : null}

          {step === 1 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <InputLabel required>Selling Price (PKR)</InputLabel>
                  <Input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={form.price}
                    onChange={(e) => set("price", e.target.value)}
                    placeholder="0.00"
                    className="h-11 rounded-xl border-zinc-200 text-xs"
                  />
                  {fieldErr("price") ? <p className="mt-1 text-[11px] text-red-600">{fieldErr("price")}</p> : null}
                </div>
                <div>
                  <InputLabel>Compare-at Price</InputLabel>
                  <Input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={form.compare_at_price}
                    onChange={(e) => set("compare_at_price", e.target.value)}
                    placeholder="Original price"
                    className="h-11 rounded-xl border-zinc-200 text-xs"
                  />
                  {fieldErr("compare_at_price") ? (
                    <p className="mt-1 text-[11px] text-red-600">{fieldErr("compare_at_price")}</p>
                  ) : null}
                </div>
                <div>
                  <InputLabel>Cost Price (private)</InputLabel>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.cost_price}
                    onChange={(e) => set("cost_price", e.target.value)}
                    placeholder="Your cost"
                    className="h-11 rounded-xl border-zinc-200 text-xs"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <InputLabel>Unit</InputLabel>
                  <Select value={form.unit} onChange={(e) => set("unit", e.target.value)}>
                    {UNITS.map((u) => (
                      <option key={u.value} value={u.value}>{u.label}</option>
                    ))}
                  </Select>
                </div>
                <div>
                  <InputLabel>Pack Size</InputLabel>
                  <Input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={form.pack_size}
                    onChange={(e) => set("pack_size", e.target.value)}
                    placeholder="e.g. 500"
                    className="h-11 rounded-xl border-zinc-200 text-xs"
                  />
                </div>
                <div>
                  <InputLabel>Stock</InputLabel>
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    value={form.stock}
                    onChange={(e) => set("stock", e.target.value)}
                    className="h-11 rounded-xl border-zinc-200 text-xs"
                  />
                </div>
                <div>
                  <InputLabel>Low-stock Threshold</InputLabel>
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    value={form.low_stock_threshold}
                    onChange={(e) => set("low_stock_threshold", e.target.value)}
                    className="h-11 rounded-xl border-zinc-200 text-xs"
                  />
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-100 text-[11px] text-emerald-900 flex gap-2">
                <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5 text-emerald-700" />
                <span>Cost price is private and used for margin tracking; it is not shown on public product pages.</span>
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <InputLabel>Active Ingredient</InputLabel>
                  <Input
                    value={form.active_ingredient}
                    onChange={(e) => set("active_ingredient", e.target.value)}
                    placeholder="Copy from product label"
                    className="h-11 rounded-xl border-zinc-200 text-xs"
                  />
                </div>
                <div>
                  <InputLabel>Usage Instructions</InputLabel>
                  <TextArea
                    rows={3}
                    value={form.usage_instructions}
                    onChange={(e) => set("usage_instructions", e.target.value)}
                    placeholder="Dosage, timing, application method..."
                  />
                </div>
                <div>
                  <InputLabel>Safety Precautions</InputLabel>
                  <TextArea
                    rows={3}
                    value={form.safety_precautions}
                    onChange={(e) => set("safety_precautions", e.target.value)}
                    placeholder="PPE, storage, warnings..."
                  />
                </div>
              </div>
              <label className="flex items-start gap-3 p-3 rounded-2xl bg-zinc-50/80 border border-zinc-200/80 cursor-pointer hover:bg-zinc-100/60 transition-colors">
                <input
                  type="checkbox"
                  checked={form.is_organic}
                  onChange={(e) => set("is_organic", e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500 border-zinc-300 accent-emerald-600"
                />
                <div className="text-xs">
                  <span className="font-bold text-zinc-900 block">Certified / organic product</span>
                  <span className="text-zinc-500 text-[11px] block mt-0.5">Mark only when the product label supports this claim.</span>
                </div>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <InputLabel>Cover Image</InputLabel>
                  <label className="flex flex-col items-center justify-center gap-2 h-36 rounded-2xl border-2 border-dashed border-zinc-200 bg-zinc-50/60 hover:bg-zinc-100/60 cursor-pointer transition-colors overflow-hidden relative">
                    {coverPreview ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={coverPreview} alt="Cover preview" className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <>
                        <ImagePlus className="h-5 w-5 text-zinc-400" />
                        <span className="text-[11px] text-zinc-500 font-medium">Upload cover (max 5 MB)</span>
                      </>
                    )}
                    <input type="file" accept="image/*" className="hidden" onChange={onCover} />
                  </label>
                  {cover ? (
                    <button type="button" onClick={clearCover} className="mt-1.5 text-[11px] text-red-600 hover:underline cursor-pointer">
                      Remove cover
                    </button>
                  ) : null}
                </div>
                <div>
                  <InputLabel>Gallery Images (up to 6)</InputLabel>
                  <label className="flex flex-col items-center justify-center gap-2 h-36 rounded-2xl border-2 border-dashed border-zinc-200 bg-zinc-50/60 hover:bg-zinc-100/60 cursor-pointer transition-colors">
                    <ImagePlus className="h-5 w-5 text-zinc-400" />
                    <span className="text-[11px] text-zinc-500 font-medium">Add gallery images</span>
                    <input type="file" accept="image/*" multiple className="hidden" onChange={onGallery} />
                  </label>
                  {galleryPreviews.length ? (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {galleryPreviews.map((src, i) => (
                        <div key={i} className="relative h-12 w-12 rounded-lg overflow-hidden border border-zinc-200">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={src} alt="" className="h-full w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeGallery(i)}
                            className="absolute -top-0 -right-0 bg-black/60 text-white rounded-bl-lg p-0.5"
                            aria-label="Remove image"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}
        </form>

        <div className="px-6 sm:px-7 py-4 border-t border-zinc-100 flex items-center justify-between gap-2.5 shrink-0 bg-white">
          <div className="text-[11px] text-zinc-400">
            Step {step + 1} of {STEPS.length}
          </div>
          <div className="flex items-center gap-2.5">
            {step > 0 ? (
              <Button
                type="button"
                variant="outline"
                disabled={submitting}
                onClick={back}
                className="h-10 px-4 rounded-xl border-zinc-200 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 gap-1.5"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                disabled={submitting}
                onClick={close}
                className="h-10 px-4 rounded-xl border-zinc-200 text-xs font-semibold text-zinc-700 hover:bg-zinc-100"
              >
                Cancel
              </Button>
            )}
            <Button
              type="button"
              disabled={submitting || (step === 0 && !categoriesLoading && activeCategories.length === 0)}
              onClick={handleSubmit}
              className="h-10 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-semibold gap-1.5 shadow-sm shadow-emerald-600/20"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Creating...</span>
                </>
              ) : step < STEPS.length - 1 ? (
                <>
                  <span>Continue</span>
                  <ChevronRight className="h-4 w-4" />
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  <span>Create Product</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
