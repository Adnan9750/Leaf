"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Building2,
  Check,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  ImagePlus,
  Info,
  Leaf,
  Loader2,
  Package,
  PackagePlus,
  Percent,
  ShieldCheck,
  Sparkles,
  Tag,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/authStore";
import { useCategoryStore } from "@/store/categoryStore";
import { useProductStore } from "@/store/productStore";
import { useVendorStore } from "@/store/vendorStore";

const UNITS = [
  { value: "piece", label: "Piece (pc)" },
  { value: "pack", label: "Pack (pk)" },
  { value: "g", label: "Gram (g)" },
  { value: "kg", label: "Kilogram (kg)" },
  { value: "ml", label: "Milliliter (ml)" },
  { value: "l", label: "Liter (L)" },
];

const STEPS = [
  { id: "basics", title: "Basics & Vendor", subtitle: "Core information", icon: Package },
  { id: "pricing", title: "Pricing & Stock", subtitle: "Financials & inventory", icon: PackagePlus },
  { id: "agri", title: "Agri & Media", subtitle: "Specs, labels & photos", icon: Leaf },
];

const INITIAL = {
  vendor_id: "",
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
  if (!file.type.startsWith("image/")) return "Only image files (JPEG, PNG, WebP) are allowed.";
  if (file.size > MAX_IMAGE_MB * 1024 * 1024) return `Image must be under ${MAX_IMAGE_MB} MB.`;
  return null;
}

function InputLabel({ children, required, hint }) {
  return (
    <div className="flex items-center justify-between mb-1.5">
      <label className="block text-xs font-semibold text-zinc-800">
        {children} {required ? <span className="text-red-500">*</span> : null}
      </label>
      {hint ? <span className="text-[11px] text-zinc-400 font-normal">{hint}</span> : null}
    </div>
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
  const user = useAuthStore((state) => state.user);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isSuperAdmin = mounted ? Boolean(user?.is_superuser || user?.role === "admin" || user?.is_staff) : false;

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
  const { vendors, fetchVendors, isLoading: vendorsLoading } = useVendorStore();
  const createProduct = useProductStore((s) => s.createProduct);

  const activeCategories = useMemo(
    () => (categories || []).filter((c) => c.is_active),
    [categories]
  );

  const approvedVendors = useMemo(
    () => (vendors || []).filter((v) => v.status === "approved" || !v.status),
    [vendors]
  );

  useEffect(() => {
    if (!isOpen) return;
    fetchCategories("active", "", false);
    if (isSuperAdmin) {
      fetchVendors("approved", false);
    }
  }, [isOpen, fetchCategories, fetchVendors, isSuperAdmin]);

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

  const set = (key, value) => {
    setForm((p) => ({ ...p, [key]: value }));
    if (error) setError("");
    if (fieldErrors[key]) setFieldErrors((p) => ({ ...p, [key]: null }));
  };

  const fieldErr = (name) => {
    if (name === "category_id") {
      const catErr = fieldErrors?.category_id || fieldErrors?.category;
      if (!catErr) return null;
      return Array.isArray(catErr) ? catErr[0] : catErr;
    }
    if (name === "vendor_id") {
      const venErr = fieldErrors?.vendor_id || fieldErrors?.vendor;
      if (!venErr) return null;
      return Array.isArray(venErr) ? venErr[0] : venErr;
    }
    const e = fieldErrors?.[name];
    if (!e) return null;
    return Array.isArray(e) ? e[0] : e;
  };

  // Discount preview calculation
  const discountInfo = useMemo(() => {
    const price = Number(form.price);
    const compare = Number(form.compare_at_price);
    if (Number.isFinite(price) && Number.isFinite(compare) && compare > price && price > 0) {
      const diff = compare - price;
      const pct = Math.round((diff / compare) * 100);
      return { pct, savings: diff };
    }
    return null;
  }, [form.price, form.compare_at_price]);

  if (!isOpen) return null;

  const validateStep = () => {
    if (step === 0) {
      if (isSuperAdmin && !form.vendor_id) {
        return "Please select a vendor for this product.";
      }
      if (!form.name.trim()) return "Product name is required.";
      if (!form.category_id) return "Please select an active category.";
    }
    if (step === 1) {
      const price = Number(form.price);
      if (!form.price || !Number.isFinite(price) || price <= 0) {
        return "Selling price must be greater than 0 PKR.";
      }
      if (form.compare_at_price !== "") {
        const cmp = Number(form.compare_at_price);
        if (!Number.isFinite(cmp) || cmp <= price) {
          return "Compare-at (original) price must be strictly higher than selling price.";
        }
      }
      if (form.stock !== "" && Number(form.stock) < 0) {
        return "Available stock quantity cannot be negative.";
      }
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
    if (isSuperAdmin && form.vendor_id) {
      fd.append("vendor_id", String(form.vendor_id));
    }
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in">
      <div
        className="w-full max-w-3xl max-h-[92vh] overflow-hidden rounded-3xl bg-white shadow-2xl border border-zinc-200/80 animate-in zoom-in-95 duration-200 flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-label="Add product"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 sm:px-7 py-5 border-b border-zinc-100 shrink-0 bg-zinc-50/50">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20">
              <PackagePlus className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-zinc-900 tracking-tight">Add New Product</h3>
                {isSuperAdmin ? (
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200/80 rounded-full px-2 py-0.5">
                    Superadmin
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 rounded-full px-2 py-0.5">
                    Vendor Portal
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">
                {isSuperAdmin
                  ? "Select a merchant vendor and enter product details for the marketplace catalog."
                  : "Create and publish a new product listing to your store inventory."}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={close}
            disabled={submitting}
            className="rounded-xl p-2 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer disabled:opacity-50"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Stepper Navigation */}
        <div className="px-6 sm:px-7 pt-4 pb-3 border-b border-zinc-100 shrink-0 bg-white">
          <div className="flex items-center justify-between gap-2">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const active = i === step;
              const done = i < step;
              return (
                <React.Fragment key={s.id}>
                  <button
                    type="button"
                    onClick={() => !submitting && i <= step && setStep(i)}
                    className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      active
                        ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/25 ring-2 ring-emerald-600/20"
                        : done
                          ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100/80 border border-emerald-200/60"
                          : "bg-zinc-50 text-zinc-400 border border-zinc-150 hover:bg-zinc-100/70"
                    }`}
                  >
                    <div
                      className={`flex h-5 w-5 items-center justify-center rounded-lg text-[10px] font-bold ${
                        active ? "bg-white/20 text-white" : done ? "bg-emerald-600 text-white" : "bg-zinc-200 text-zinc-600"
                      }`}
                    >
                      {done ? <Check className="h-3 w-3 stroke-[3]" /> : i + 1}
                    </div>
                    <div className="text-left hidden sm:block">
                      <p className="leading-none">{s.title}</p>
                    </div>
                  </button>
                  {i < STEPS.length - 1 ? (
                    <div
                      className={`h-0.5 flex-1 rounded-full transition-colors ${
                        done ? "bg-emerald-500" : "bg-zinc-200"
                      }`}
                    />
                  ) : null}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Global Error Banner */}
        {error ? (
          <div className="mx-6 sm:mx-7 mt-4 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5 animate-in fade-in shrink-0 shadow-xs">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
            <span className="font-medium">{error}</span>
          </div>
        ) : null}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 sm:px-7 py-5 space-y-5">
          {/* STEP 0: BASICS & VENDOR */}
          {step === 0 ? (
            <div className="space-y-4 animate-in fade-in-50 duration-150">
              {/* Superadmin Vendor Picker */}
              {isSuperAdmin ? (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50/80 to-amber-100/30 border border-amber-200/90 shadow-xs">
                  <InputLabel required hint="Select which vendor owns this product listing">
                    <span className="inline-flex items-center gap-1.5 text-amber-900 font-bold">
                      <Building2 className="h-4 w-4 text-amber-700" />
                      Assign Vendor Merchant
                    </span>
                  </InputLabel>
                  <Select
                    value={form.vendor_id}
                    onChange={(e) => set("vendor_id", e.target.value)}
                    disabled={vendorsLoading}
                    className="border-amber-200 focus:border-amber-500 focus:ring-amber-500/20 bg-white font-medium"
                  >
                    <option value="">
                      {vendorsLoading ? "Loading approved vendors..." : "— Choose an approved merchant vendor —"}
                    </option>
                    {approvedVendors.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.company_name} {v.city ? `(${v.city})` : ""} {v.email ? `· ${v.email}` : ""}
                      </option>
                    ))}
                  </Select>
                  {fieldErr("vendor_id") ? (
                    <p className="mt-1.5 text-[11px] text-red-600 font-semibold">{fieldErr("vendor_id")}</p>
                  ) : null}
                  {!vendorsLoading && approvedVendors.length === 0 ? (
                    <p className="mt-1.5 text-[11px] text-amber-800 font-medium">
                      No approved vendors found. Please approve a vendor in the Vendors section first.
                    </p>
                  ) : null}
                </div>
              ) : null}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <InputLabel required>Product Title</InputLabel>
                  <Input
                    autoFocus
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    placeholder="e.g. Organic Cold-Pressed Neem Oil Insecticide (1L)"
                    className="h-11 rounded-xl border-zinc-200 text-xs font-medium focus:border-emerald-500"
                  />
                  {fieldErr("name") ? <p className="mt-1 text-[11px] text-red-600 font-medium">{fieldErr("name")}</p> : null}
                </div>

                <div>
                  <InputLabel required hint="Department category">Category</InputLabel>
                  <Select
                    value={form.category_id}
                    onChange={(e) => set("category_id", e.target.value)}
                    disabled={categoriesLoading}
                  >
                    <option value="">
                      {categoriesLoading ? "Loading categories..." : "Select category..."}
                    </option>
                    {activeCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </Select>
                  {fieldErr("category_id") ? (
                    <p className="mt-1 text-[11px] text-red-600 font-medium">{fieldErr("category_id")}</p>
                  ) : null}
                </div>

                <div>
                  <InputLabel hint="Manufacturer or label name">Brand</InputLabel>
                  <Input
                    value={form.brand}
                    onChange={(e) => set("brand", e.target.value)}
                    placeholder="e.g. AgroLeaf Bio"
                    className="h-11 rounded-xl border-zinc-200 text-xs font-medium focus:border-emerald-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <InputLabel hint={`${form.short_description.length}/500 characters`}>
                    Short Summary (Highlighted in catalog search)
                  </InputLabel>
                  <Input
                    value={form.short_description}
                    onChange={(e) => set("short_description", e.target.value)}
                    placeholder="Brief 1-line overview of what this product solves for farmers..."
                    maxLength={500}
                    className="h-11 rounded-xl border-zinc-200 text-xs font-medium focus:border-emerald-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <InputLabel hint="Comprehensive product description">Full Description</InputLabel>
                  <TextArea
                    rows={4}
                    value={form.description}
                    onChange={(e) => set("description", e.target.value)}
                    placeholder="Provide full description, benefits, suitable crops, composition details..."
                  />
                </div>
              </div>

              {/* Status Toggle Card */}
              <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80 flex items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-zinc-900 block">Publication State</span>
                  <span className="text-[11px] text-zinc-500 block mt-0.5">
                    {form.status === "published"
                      ? "Published: Visible and purchasable in the Leaf marketplace."
                      : "Draft: Kept private for revision, not visible to customers."}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-zinc-200">
                  <button
                    type="button"
                    onClick={() => set("status", "draft")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      form.status === "draft"
                        ? "bg-zinc-900 text-white shadow-xs"
                        : "text-zinc-500 hover:text-zinc-900"
                    }`}
                  >
                    Draft
                  </button>
                  <button
                    type="button"
                    onClick={() => set("status", "published")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      form.status === "published"
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "text-zinc-500 hover:text-zinc-900"
                    }`}
                  >
                    Published
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          {/* STEP 1: PRICING & INVENTORY */}
          {step === 1 ? (
            <div className="space-y-5 animate-in fade-in-50 duration-150">
              {/* Pricing Grid */}
              <div className="p-4 rounded-2xl bg-zinc-50/70 border border-zinc-200/80 space-y-4">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-emerald-600" />
                  <span className="text-xs font-bold text-zinc-900">Pricing Configuration (PKR)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <InputLabel required hint="Actual checkout price">
                      Selling Price (PKR)
                    </InputLabel>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">
                        PKR
                      </span>
                      <Input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={form.price}
                        onChange={(e) => set("price", e.target.value)}
                        placeholder="0.00"
                        className="h-11 pl-13 rounded-xl border-zinc-200 text-xs font-semibold text-zinc-900"
                      />
                    </div>
                    {fieldErr("price") ? <p className="mt-1 text-[11px] text-red-600 font-medium">{fieldErr("price")}</p> : null}
                  </div>

                  <div>
                    <InputLabel hint="Original strikethrough">
                      Compare-at Price
                    </InputLabel>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">
                        PKR
                      </span>
                      <Input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={form.compare_at_price}
                        onChange={(e) => set("compare_at_price", e.target.value)}
                        placeholder="Original price"
                        className="h-11 pl-13 rounded-xl border-zinc-200 text-xs font-semibold text-zinc-900"
                      />
                    </div>
                    {fieldErr("compare_at_price") ? (
                      <p className="mt-1 text-[11px] text-red-600 font-medium">{fieldErr("compare_at_price")}</p>
                    ) : null}
                  </div>

                  <div>
                    <InputLabel hint="Vendor cost (Private)">
                      Cost Price
                    </InputLabel>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">
                        PKR
                      </span>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.cost_price}
                        onChange={(e) => set("cost_price", e.target.value)}
                        placeholder="Vendor unit cost"
                        className="h-11 pl-13 rounded-xl border-zinc-200 text-xs font-semibold text-zinc-900"
                      />
                    </div>
                  </div>
                </div>

                {/* Live Discount Calculation Badge */}
                {discountInfo ? (
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200/60 text-emerald-800 text-xs font-medium">
                    <Percent className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>
                      Customer discount: <strong className="font-bold text-emerald-900">{discountInfo.pct}% OFF</strong> (Save PKR {discountInfo.savings.toLocaleString("en-US")})
                    </span>
                  </div>
                ) : null}
              </div>

              {/* Units & Inventory Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <InputLabel required hint="Measurement">Unit</InputLabel>
                  <Select value={form.unit} onChange={(e) => set("unit", e.target.value)}>
                    {UNITS.map((u) => (
                      <option key={u.value} value={u.value}>{u.label}</option>
                    ))}
                  </Select>
                </div>

                <div>
                  <InputLabel hint="e.g. 500 or 1.5">Pack Size</InputLabel>
                  <Input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={form.pack_size}
                    onChange={(e) => set("pack_size", e.target.value)}
                    placeholder="e.g. 500"
                    className="h-11 rounded-xl border-zinc-200 text-xs font-medium"
                  />
                </div>

                <div>
                  <InputLabel required hint="Units available">Stock Quantity</InputLabel>
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    value={form.stock}
                    onChange={(e) => set("stock", e.target.value)}
                    className="h-11 rounded-xl border-zinc-200 text-xs font-medium"
                  />
                  {fieldErr("stock") ? <p className="mt-1 text-[11px] text-red-600 font-medium">{fieldErr("stock")}</p> : null}
                </div>

                <div>
                  <InputLabel hint="Trigger alert level">Low-Stock Alert</InputLabel>
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    value={form.low_stock_threshold}
                    onChange={(e) => set("low_stock_threshold", e.target.value)}
                    className="h-11 rounded-xl border-zinc-200 text-xs font-medium"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80 text-[11px] text-zinc-600 flex items-center gap-2.5">
                <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600" />
                <span>
                  Cost price is kept strictly private for profitability margin calculation. Only selling price and compare-at price appear on product pages.
                </span>
              </div>
            </div>
          ) : null}

          {/* STEP 2: AGRICULTURAL SPECS & MEDIA */}
          {step === 2 ? (
            <div className="space-y-5 animate-in fade-in-50 duration-150">
              {/* Organic Certification Switch */}
              <label className="flex items-center justify-between p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 cursor-pointer hover:bg-emerald-100/50 transition-colors shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
                    <Leaf className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-zinc-900 block">Certified Organic Product</span>
                    <span className="text-[11px] text-zinc-500 block mt-0.5">
                      Highlights product with an organic verified badge across customer searches and filters.
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={form.is_organic}
                  onChange={(e) => set("is_organic", e.target.checked)}
                  className="h-5 w-5 rounded text-emerald-600 focus:ring-emerald-500 border-zinc-300 accent-emerald-600 cursor-pointer"
                />
              </label>

              {/* Chemical / Agricultural Specs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <InputLabel hint="Main chemical / biological ingredient as stated on label">
                    Active Ingredient
                  </InputLabel>
                  <Input
                    value={form.active_ingredient}
                    onChange={(e) => set("active_ingredient", e.target.value)}
                    placeholder="e.g. Azadirachtin 0.03% EC, Glyphosate 41% SL, Trichoderma viride..."
                    className="h-11 rounded-xl border-zinc-200 text-xs font-medium"
                  />
                </div>

                <div>
                  <InputLabel hint="Dilution ratio, application timing">Usage Instructions</InputLabel>
                  <TextArea
                    rows={3}
                    value={form.usage_instructions}
                    onChange={(e) => set("usage_instructions", e.target.value)}
                    placeholder="e.g. Mix 3-5 ml per liter of water. Spray during early morning or evening hours."
                  />
                </div>

                <div>
                  <InputLabel hint="PPE, re-entry period, storage rules">Safety Precautions</InputLabel>
                  <TextArea
                    rows={3}
                    value={form.safety_precautions}
                    onChange={(e) => set("safety_precautions", e.target.value)}
                    placeholder="e.g. Wear gloves and eye protection. Keep away from water bodies and direct sunlight."
                  />
                </div>
              </div>

              {/* Media Upload Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                {/* Cover Image Upload */}
                <div>
                  <InputLabel hint="Primary card thumbnail (Max 5 MB)">Cover Showcase Image</InputLabel>
                  <label className="flex flex-col items-center justify-center gap-2 h-40 rounded-2xl border-2 border-dashed border-zinc-200 bg-zinc-50/70 hover:bg-zinc-100/60 cursor-pointer transition-colors overflow-hidden relative group">
                    {coverPreview ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={coverPreview} alt="Cover preview" className="absolute inset-0 w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1.5">
                          <UploadCloud className="h-4 w-4" /> Change Image
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-xs text-zinc-500 border border-zinc-200">
                          <ImagePlus className="h-5 w-5" />
                        </div>
                        <span className="text-xs font-bold text-zinc-700">Click to upload cover</span>
                        <span className="text-[10px] text-zinc-400">PNG, JPG, WebP up to 5 MB</span>
                      </>
                    )}
                    <input type="file" accept="image/*" className="hidden" onChange={onCover} />
                  </label>
                  {cover ? (
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-[11px] text-zinc-500 truncate max-w-[200px]">{cover.name}</span>
                      <button
                        type="button"
                        onClick={clearCover}
                        className="text-[11px] text-red-600 hover:text-red-700 font-semibold cursor-pointer inline-flex items-center gap-1"
                      >
                        <Trash2 className="h-3 w-3" /> Remove
                      </button>
                    </div>
                  ) : null}
                  {fieldErr("image") ? <p className="mt-1 text-[11px] text-red-600 font-medium">{fieldErr("image")}</p> : null}
                </div>

                {/* Gallery Images Upload */}
                <div>
                  <InputLabel hint={`${gallery.length} of 6 uploaded`}>Gallery Photos (Up to 6)</InputLabel>
                  <label className="flex flex-col items-center justify-center gap-2 h-40 rounded-2xl border-2 border-dashed border-zinc-200 bg-zinc-50/70 hover:bg-zinc-100/60 cursor-pointer transition-colors">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-xs text-zinc-500 border border-zinc-200">
                      <UploadCloud className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-bold text-zinc-700">Add gallery photos</span>
                    <span className="text-[10px] text-zinc-400">Packaging, label, application angles</span>
                    <input type="file" accept="image/*" multiple className="hidden" onChange={onGallery} />
                  </label>
                  {fieldErr("gallery_images") ? (
                    <p className="mt-1 text-[11px] text-red-600 font-medium">{fieldErr("gallery_images")}</p>
                  ) : null}

                  {galleryPreviews.length ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {galleryPreviews.map((src, i) => (
                        <div key={i} className="relative h-14 w-14 rounded-xl overflow-hidden border border-zinc-200 shadow-xs group">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={src} alt={`Gallery preview ${i}`} className="h-full w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeGallery(i)}
                            className="absolute top-1 right-1 bg-black/70 hover:bg-red-600 text-white rounded-md p-1 transition-colors"
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

        {/* Modal Footer */}
        <div className="px-6 sm:px-7 py-4 border-t border-zinc-100 flex items-center justify-between gap-3 shrink-0 bg-white">
          <div className="text-xs text-zinc-500 font-medium">
            Step <span className="font-bold text-zinc-900">{step + 1}</span> of {STEPS.length} ·{" "}
            <span className="text-zinc-400">{STEPS[step].title}</span>
          </div>

          <div className="flex items-center gap-2.5">
            {step > 0 ? (
              <Button
                type="button"
                variant="outline"
                disabled={submitting}
                onClick={back}
                className="h-10 px-4 rounded-xl border-zinc-200 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 gap-1.5 cursor-pointer"
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
                className="h-10 px-4 rounded-xl border-zinc-200 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 cursor-pointer"
              >
                Cancel
              </Button>
            )}

            <Button
              type="button"
              disabled={submitting || (step === 0 && !categoriesLoading && activeCategories.length === 0)}
              onClick={handleSubmit}
              className="h-10 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-semibold gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer transition-all"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Submitting Product...</span>
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
