"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  Building2,
  ImagePlus,
  Leaf,
  Loader2,
  Package,
  PackagePlus,
  Pencil,
  ShieldCheck,
  Trash2,
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
        {children}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {hint && <span className="text-[11px] text-zinc-400">{hint}</span>}
    </div>
  );
}

function FieldError({ msg }) {
  if (!msg) return null;
  return (
    <p className="mt-1 text-[11px] text-red-600 flex items-center gap-1">
      <AlertCircle className="h-3 w-3 shrink-0" /> {msg}
    </p>
  );
}

const TABS = [
  { id: "basics", label: "Basics", icon: Package },
  { id: "pricing", label: "Pricing & Stock", icon: PackagePlus },
  { id: "agri", label: "Agri & Media", icon: Leaf },
  { id: "visibility", label: "Visibility", icon: ShieldCheck },
];

export default function EditProductDialog({ product, isOpen, onClose, onUpdated }) {
  const user = useAuthStore((state) => state.user);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const isSuperAdmin = mounted
    ? Boolean(user?.is_superuser || user?.role === "admin" || user?.is_staff)
    : false;

  const { categories, fetchCategories } = useCategoryStore();
  const { vendors, fetchVendors } = useVendorStore();
  const { updateProduct } = useProductStore();

  const [activeTab, setActiveTab] = useState("basics");
  const [form, setForm] = useState({});
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Cover image state
  const [newCover, setNewCover] = useState(null);
  const [newCoverPreview, setNewCoverPreview] = useState(null);
  const coverRef = useRef(null);

  // Gallery state
  const [removedImageIds, setRemovedImageIds] = useState([]);
  const [newGalleryFiles, setNewGalleryFiles] = useState([]);
  const [newGalleryPreviews, setNewGalleryPreviews] = useState([]);
  const galleryRef = useRef(null);

  // Populate form from product prop whenever dialog opens or product changes
  useEffect(() => {
    if (!product || !isOpen) return;
    setForm({
      vendor_id: product.vendor ?? product.vendor_id ?? "",
      name: product.name ?? "",
      category_id: product.category?.id ?? product.category ?? "",
      brand: product.brand ?? "",
      short_description: product.short_description ?? "",
      description: product.description ?? "",
      price: product.price ?? "",
      compare_at_price: product.compare_at_price ?? "",
      cost_price: product.cost_price ?? "",
      unit: product.unit ?? "piece",
      pack_size: product.pack_size ?? "",
      stock: product.stock ?? 0,
      low_stock_threshold: product.low_stock_threshold ?? 5,
      active_ingredient: product.active_ingredient ?? "",
      usage_instructions: product.usage_instructions ?? "",
      safety_precautions: product.safety_precautions ?? "",
      is_organic: product.is_organic ?? false,
      status: product.status ?? "published",
      is_active: product.is_active ?? true,
      is_featured: product.is_featured ?? false,
      blocked_reason: product.blocked_reason ?? "",
    });
    setErrors({});
    setGlobalError("");
    setActiveTab("basics");
    setNewCover(null);
    setNewCoverPreview(null);
    setRemovedImageIds([]);
    setNewGalleryFiles([]);
    setNewGalleryPreviews([]);
  }, [product, isOpen]);

  // Load categories & vendors on open
  useEffect(() => {
    if (!isOpen) return;
    fetchCategories("all", "", false);
    if (isSuperAdmin) fetchVendors("approved", false);
  }, [isOpen, isSuperAdmin, fetchCategories, fetchVendors]);

  if (!isOpen || !product) return null;

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));
  const fieldErr = (field) => errors[field]?.[0] ?? errors[field] ?? null;

  // Cover image selection
  const onCoverChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const err = fileError(file);
    if (err) { setErrors((p) => ({ ...p, image: [err] })); return; }
    setErrors((p) => { const n = { ...p }; delete n.image; return n; });
    setNewCover(file);
    setNewCoverPreview(URL.createObjectURL(file));
  };

  // Gallery additions
  const onGalleryAdd = (e) => {
    const files = Array.from(e.target.files || []);
    const existing = (product.images || []).length - removedImageIds.length;
    const totalAfter = existing + newGalleryFiles.length + files.length;
    if (totalAfter > 6) {
      setErrors((p) => ({ ...p, gallery_images: [`Max 6 gallery images. Remove some first.`] }));
      return;
    }
    const valid = [];
    const previews = [];
    for (const f of files) {
      const err = fileError(f);
      if (err) { setErrors((p) => ({ ...p, gallery_images: [err] })); return; }
      valid.push(f);
      previews.push(URL.createObjectURL(f));
    }
    setErrors((p) => { const n = { ...p }; delete n.gallery_images; return n; });
    setNewGalleryFiles((old) => [...old, ...valid]);
    setNewGalleryPreviews((old) => [...old, ...previews]);
  };

  const removeNewGallery = (idx) => {
    setNewGalleryFiles((f) => f.filter((_, i) => i !== idx));
    setNewGalleryPreviews((p) => p.filter((_, i) => i !== idx));
  };

  const toggleRemoveExistingImage = (imgId) => {
    setRemovedImageIds((ids) =>
      ids.includes(imgId) ? ids.filter((i) => i !== imgId) : [...ids, imgId]
    );
  };

  // Basic client validation
  const validate = () => {
    const errs = {};
    if (!form.name?.trim()) errs.name = ["Product name is required."];
    if (!form.category_id) errs.category_id = ["Please select a category."];
    if (!form.price || Number(form.price) <= 0) errs.price = ["Enter a valid selling price."];
    if (form.compare_at_price && Number(form.compare_at_price) <= Number(form.price)) {
      errs.compare_at_price = ["Must be higher than the selling price."];
    }
    if (isSuperAdmin && !form.vendor_id) errs.vendor_id = ["Please select a vendor."];
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGlobalError("");
    const clientErrs = validate();
    if (Object.keys(clientErrs).length > 0) {
      setErrors(clientErrs);
      // Switch to first tab with error
      const basics = ["name", "category_id", "vendor_id"];
      const pricing = ["price", "compare_at_price", "cost_price", "stock"];
      if (basics.some((k) => clientErrs[k])) setActiveTab("basics");
      else if (pricing.some((k) => clientErrs[k])) setActiveTab("pricing");
      return;
    }

    setSubmitting(true);
    try {
      const payload = new FormData();

      // Core text fields (only send changed / non-empty)
      const textFields = [
        "name", "brand", "short_description", "description",
        "price", "compare_at_price", "cost_price",
        "unit", "pack_size", "stock", "low_stock_threshold",
        "active_ingredient", "usage_instructions", "safety_precautions",
        "status", "blocked_reason",
      ];
      for (const f of textFields) {
        if (form[f] !== "" && form[f] != null) payload.append(f, form[f]);
      }
      payload.append("category_id", form.category_id);
      payload.append("is_organic", form.is_organic ? "true" : "false");
      payload.append("is_featured", form.is_featured ? "true" : "false");
      payload.append("is_active", form.is_active ? "true" : "false");

      if (isSuperAdmin && form.vendor_id) payload.append("vendor_id", form.vendor_id);

      if (newCover) payload.append("image", newCover);

      for (const id of removedImageIds) payload.append("remove_image_ids", id);
      for (const f of newGalleryFiles) payload.append("gallery_images", f);

      const result = await updateProduct(product.id, payload);

      if (!result.success) {
        if (result.fieldErrors) {
          setErrors(result.fieldErrors);
          const basics = ["name", "category_id", "vendor_id"];
          const pricing = ["price", "compare_at_price", "cost_price", "stock"];
          if (basics.some((k) => result.fieldErrors[k])) setActiveTab("basics");
          else if (pricing.some((k) => result.fieldErrors[k])) setActiveTab("pricing");
        } else {
          setGlobalError(result.error || "Something went wrong.");
        }
        return;
      }

      onUpdated?.(result.data);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const currentCoverSrc = newCoverPreview ?? (product.image || null);
  const existingImages = (product.images || []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog Panel */}
      <div className="relative z-10 w-full max-w-2xl max-h-[92vh] flex flex-col bg-white rounded-3xl shadow-2xl border border-zinc-200/80 overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-zinc-100">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 border border-blue-100">
              <Pencil className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900">Edit Product</h2>
              <p className="text-xs text-zinc-400 font-medium mt-0.5 line-clamp-1">
                {product.name} &bull; SKU: {product.sku}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tab Nav */}
        <div className="flex border-b border-zinc-100 px-6 gap-1 overflow-x-auto shrink-0">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-3 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap -mb-px ${
                  active
                    ? "border-blue-600 text-blue-700"
                    : "border-transparent text-zinc-500 hover:text-zinc-800"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Global Error */}
        {globalError && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium flex items-center gap-2 shrink-0">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
            {globalError}
          </div>
        )}

        {/* Scrollable Content */}
        <form
          id="edit-product-form"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-6 py-5"
        >
          {/* ── TAB: BASICS ── */}
          {activeTab === "basics" && (
            <div className="space-y-4">
              {/* Superadmin vendor re-assign */}
              {isSuperAdmin && (
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/70">
                  <InputLabel required hint="Superadmin">
                    <span className="inline-flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5 text-amber-600" /> Vendor Merchant
                    </span>
                  </InputLabel>
                  <select
                    value={form.vendor_id ?? ""}
                    onChange={(e) => set("vendor_id", e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-amber-300 bg-white text-xs font-semibold text-amber-900 outline-none focus:ring-2 focus:ring-amber-500/30"
                  >
                    <option value="">— Select approved vendor —</option>
                    {(vendors || []).map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.company_name}
                      </option>
                    ))}
                  </select>
                  <FieldError msg={fieldErr("vendor_id")} />
                </div>
              )}

              {/* Name */}
              <div>
                <InputLabel required>Product Name</InputLabel>
                <Input
                  value={form.name ?? ""}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="e.g. Syngenta Engeo Pleno Insecticide"
                  className={`h-10 text-xs rounded-xl ${fieldErr("name") ? "border-red-400 focus:ring-red-300" : "border-zinc-200"}`}
                />
                <FieldError msg={fieldErr("name")} />
              </div>

              {/* Category */}
              <div>
                <InputLabel required>Category</InputLabel>
                <select
                  value={form.category_id ?? ""}
                  onChange={(e) => set("category_id", e.target.value)}
                  className={`w-full h-10 px-3 rounded-xl border text-xs font-medium text-zinc-800 outline-none focus:ring-2 focus:ring-emerald-500/20 bg-zinc-50/60 focus:bg-white ${
                    fieldErr("category_id") ? "border-red-400" : "border-zinc-200"
                  }`}
                >
                  <option value="">— Select category —</option>
                  {(categories || [])
                    .filter((c) => c.is_active)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>
                <FieldError msg={fieldErr("category_id")} />
              </div>

              {/* Brand */}
              <div>
                <InputLabel hint="optional">Brand / Manufacturer</InputLabel>
                <Input
                  value={form.brand ?? ""}
                  onChange={(e) => set("brand", e.target.value)}
                  placeholder="e.g. Syngenta, Bayer, FMC"
                  className="h-10 text-xs rounded-xl border-zinc-200"
                />
              </div>

              {/* Short Description */}
              <div>
                <InputLabel hint="max 500 chars">Short Description</InputLabel>
                <textarea
                  value={form.short_description ?? ""}
                  onChange={(e) => set("short_description", e.target.value)}
                  maxLength={500}
                  rows={2}
                  placeholder="One-line customer-facing summary…"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-zinc-200 bg-zinc-50/60 focus:bg-white outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none font-medium text-zinc-800"
                />
              </div>

              {/* Full Description */}
              <div>
                <InputLabel hint="optional">Full Description</InputLabel>
                <textarea
                  value={form.description ?? ""}
                  onChange={(e) => set("description", e.target.value)}
                  rows={3}
                  placeholder="Detailed product description…"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-zinc-200 bg-zinc-50/60 focus:bg-white outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none font-medium text-zinc-800"
                />
              </div>
            </div>
          )}

          {/* ── TAB: PRICING & STOCK ── */}
          {activeTab === "pricing" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Selling Price */}
                <div>
                  <InputLabel required hint="PKR">Selling Price</InputLabel>
                  <Input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={form.price ?? ""}
                    onChange={(e) => set("price", e.target.value)}
                    placeholder="0.00"
                    className={`h-10 text-xs rounded-xl ${fieldErr("price") ? "border-red-400" : "border-zinc-200"}`}
                  />
                  <FieldError msg={fieldErr("price")} />
                </div>

                {/* Compare-at Price */}
                <div>
                  <InputLabel hint="Optional — original price">Compare-at Price</InputLabel>
                  <Input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={form.compare_at_price ?? ""}
                    onChange={(e) => set("compare_at_price", e.target.value)}
                    placeholder="0.00 (shows strikethrough)"
                    className={`h-10 text-xs rounded-xl ${fieldErr("compare_at_price") ? "border-red-400" : "border-zinc-200"}`}
                  />
                  <FieldError msg={fieldErr("compare_at_price")} />
                </div>

                {/* Cost Price */}
                <div>
                  <InputLabel hint="Private — not shown publicly">Cost Price</InputLabel>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.cost_price ?? ""}
                    onChange={(e) => set("cost_price", e.target.value)}
                    placeholder="0.00"
                    className="h-10 text-xs rounded-xl border-zinc-200"
                  />
                </div>

                {/* Stock */}
                <div>
                  <InputLabel required>Stock Quantity</InputLabel>
                  <Input
                    type="number"
                    min="0"
                    value={form.stock ?? ""}
                    onChange={(e) => set("stock", e.target.value)}
                    placeholder="0"
                    className="h-10 text-xs rounded-xl border-zinc-200"
                  />
                </div>

                {/* Low Stock Threshold */}
                <div>
                  <InputLabel hint="default 5">Low-stock Alert Threshold</InputLabel>
                  <Input
                    type="number"
                    min="0"
                    value={form.low_stock_threshold ?? ""}
                    onChange={(e) => set("low_stock_threshold", e.target.value)}
                    placeholder="5"
                    className="h-10 text-xs rounded-xl border-zinc-200"
                  />
                </div>

                {/* Unit */}
                <div>
                  <InputLabel>Unit</InputLabel>
                  <select
                    value={form.unit ?? "piece"}
                    onChange={(e) => set("unit", e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-zinc-200 bg-zinc-50/60 focus:bg-white text-xs font-medium text-zinc-800 outline-none focus:ring-2 focus:ring-emerald-500/20"
                  >
                    {UNITS.map((u) => (
                      <option key={u.value} value={u.value}>
                        {u.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Pack Size */}
                <div>
                  <InputLabel hint={`qty in ${form.unit || "unit"}`}>Pack Size</InputLabel>
                  <Input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={form.pack_size ?? ""}
                    onChange={(e) => set("pack_size", e.target.value)}
                    placeholder="e.g. 500"
                    className="h-10 text-xs rounded-xl border-zinc-200"
                  />
                </div>

                {/* Status */}
                <div>
                  <InputLabel>Listing Status</InputLabel>
                  <select
                    value={form.status ?? "published"}
                    onChange={(e) => set("status", e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-zinc-200 bg-zinc-50/60 focus:bg-white text-xs font-medium text-zinc-800 outline-none focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="published">Published — visible in store</option>
                    <option value="draft">Draft — hidden from store</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* ── TAB: AGRI & MEDIA ── */}
          {activeTab === "agri" && (
            <div className="space-y-5">
              {/* Active Ingredient */}
              <div>
                <InputLabel hint="optional">Active Ingredient(s)</InputLabel>
                <Input
                  value={form.active_ingredient ?? ""}
                  onChange={(e) => set("active_ingredient", e.target.value)}
                  placeholder="e.g. Thiamethoxam 141g/L + Lambda-cyhalothrin 106g/L"
                  className="h-10 text-xs rounded-xl border-zinc-200"
                />
              </div>

              {/* Usage Instructions */}
              <div>
                <InputLabel hint="optional">Usage Instructions</InputLabel>
                <textarea
                  value={form.usage_instructions ?? ""}
                  onChange={(e) => set("usage_instructions", e.target.value)}
                  rows={3}
                  placeholder="Application rate, timing, method…"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-zinc-200 bg-zinc-50/60 focus:bg-white outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none font-medium text-zinc-800"
                />
              </div>

              {/* Safety Precautions */}
              <div>
                <InputLabel hint="optional">Safety Precautions</InputLabel>
                <textarea
                  value={form.safety_precautions ?? ""}
                  onChange={(e) => set("safety_precautions", e.target.value)}
                  rows={2}
                  placeholder="PPE required, re-entry interval, first aid…"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-zinc-200 bg-zinc-50/60 focus:bg-white outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none font-medium text-zinc-800"
                />
              </div>

              {/* Organic toggle */}
              <div
                className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  form.is_organic
                    ? "bg-emerald-50 border-emerald-300"
                    : "bg-zinc-50 border-zinc-200"
                }`}
                onClick={() => set("is_organic", !form.is_organic)}
              >
                <div className="flex items-center gap-2.5">
                  <Leaf className={`h-4 w-4 ${form.is_organic ? "text-emerald-600" : "text-zinc-400"}`} />
                  <div>
                    <p className="text-xs font-semibold text-zinc-800">Certified Organic</p>
                    <p className="text-[11px] text-zinc-500">Show organic badge on product card</p>
                  </div>
                </div>
                <div
                  className={`h-5 w-9 rounded-full transition-all flex items-center px-0.5 ${
                    form.is_organic ? "bg-emerald-500 justify-end" : "bg-zinc-300 justify-start"
                  }`}
                >
                  <div className="h-4 w-4 rounded-full bg-white shadow-sm" />
                </div>
              </div>

              {/* Cover Image */}
              <div>
                <InputLabel hint="optional">Cover Image</InputLabel>
                <div className="flex items-center gap-4">
                  {currentCoverSrc ? (
                    <div className="relative h-20 w-20 rounded-2xl overflow-hidden border border-zinc-200 shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={currentCoverSrc} alt="Cover" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => { setNewCover(null); setNewCoverPreview(null); }}
                        className="absolute top-1 right-1 h-5 w-5 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-red-600 cursor-pointer"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="h-20 w-20 rounded-2xl bg-zinc-100 border-2 border-dashed border-zinc-300 flex items-center justify-center shrink-0">
                      <ImagePlus className="h-7 w-7 text-zinc-400" />
                    </div>
                  )}
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      ref={coverRef}
                      className="hidden"
                      onChange={onCoverChange}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => coverRef.current?.click()}
                      className="h-9 px-4 rounded-xl border-zinc-200 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 cursor-pointer"
                    >
                      {currentCoverSrc ? "Change Cover" : "Upload Cover"}
                    </Button>
                    <p className="text-[11px] text-zinc-400 mt-1">JPEG, PNG, WebP · max 5 MB</p>
                  </div>
                </div>
                <FieldError msg={fieldErr("image")} />
              </div>

              {/* Gallery Images */}
              <div>
                <InputLabel hint="up to 6 total">Gallery Images</InputLabel>
                <div className="flex flex-wrap gap-2.5">
                  {/* Existing gallery images */}
                  {existingImages.map((img) => {
                    const isRemoved = removedImageIds.includes(img.id);
                    return (
                      <div
                        key={img.id}
                        className={`relative h-20 w-20 rounded-2xl overflow-hidden border transition-all ${
                          isRemoved ? "opacity-40 border-red-300" : "border-zinc-200"
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img.image} alt="Gallery" className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => toggleRemoveExistingImage(img.id)}
                          className={`absolute top-1 right-1 h-5 w-5 rounded-full flex items-center justify-center cursor-pointer text-white ${
                            isRemoved ? "bg-zinc-500 hover:bg-zinc-700" : "bg-black/60 hover:bg-red-600"
                          }`}
                        >
                          {isRemoved ? (
                            <span className="text-[9px] font-bold">↩</span>
                          ) : (
                            <Trash2 className="h-3 w-3" />
                          )}
                        </button>
                        {isRemoved && (
                          <div className="absolute inset-0 bg-red-100/60 flex items-center justify-center">
                            <span className="text-[10px] font-bold text-red-700">Remove</span>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* New gallery previews */}
                  {newGalleryPreviews.map((src, idx) => (
                    <div key={`new-${idx}`} className="relative h-20 w-20 rounded-2xl overflow-hidden border border-blue-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt="New gallery" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeNewGallery(idx)}
                        className="absolute top-1 right-1 h-5 w-5 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-red-600 cursor-pointer"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}

                  {/* Add gallery button */}
                  {existingImages.length - removedImageIds.length + newGalleryFiles.length < 6 && (
                    <button
                      type="button"
                      onClick={() => galleryRef.current?.click()}
                      className="h-20 w-20 rounded-2xl border-2 border-dashed border-zinc-300 hover:border-emerald-400 bg-zinc-50 hover:bg-emerald-50/40 flex flex-col items-center justify-center gap-1 text-zinc-400 hover:text-emerald-600 transition-all cursor-pointer"
                    >
                      <ImagePlus className="h-5 w-5" />
                      <span className="text-[10px] font-semibold">Add</span>
                    </button>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  ref={galleryRef}
                  className="hidden"
                  onChange={onGalleryAdd}
                />
                <FieldError msg={fieldErr("gallery_images")} />
              </div>
            </div>
          )}

          {/* ── TAB: VISIBILITY (superadmin only controls) ── */}
          {activeTab === "visibility" && (
            <div className="space-y-4">
              {/* is_featured toggle */}
              <div
                className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  form.is_featured ? "bg-blue-50 border-blue-300" : "bg-zinc-50 border-zinc-200"
                }`}
                onClick={() => set("is_featured", !form.is_featured)}
              >
                <div>
                  <p className="text-xs font-semibold text-zinc-800">Featured on Homepage</p>
                  <p className="text-[11px] text-zinc-500">Highlighted in the marketplace homepage banner</p>
                </div>
                <div
                  className={`h-5 w-9 rounded-full transition-all flex items-center px-0.5 ${
                    form.is_featured ? "bg-blue-500 justify-end" : "bg-zinc-300 justify-start"
                  }`}
                >
                  <div className="h-4 w-4 rounded-full bg-white shadow-sm" />
                </div>
              </div>

              {/* is_active toggle (superadmin controls) */}
              {isSuperAdmin && (
                <>
                  <div
                    className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      form.is_active ? "bg-emerald-50 border-emerald-300" : "bg-red-50 border-red-300"
                    }`}
                    onClick={() => set("is_active", !form.is_active)}
                  >
                    <div>
                      <p className="text-xs font-semibold text-zinc-800">
                        {form.is_active ? "Active — visible in marketplace" : "Blocked — hidden from store"}
                      </p>
                      <p className="text-[11px] text-zinc-500">Only superadmin can block / unblock a product</p>
                    </div>
                    <div
                      className={`h-5 w-9 rounded-full transition-all flex items-center px-0.5 ${
                        form.is_active ? "bg-emerald-500 justify-end" : "bg-red-400 justify-start"
                      }`}
                    >
                      <div className="h-4 w-4 rounded-full bg-white shadow-sm" />
                    </div>
                  </div>

                  {/* Blocked reason */}
                  {!form.is_active && (
                    <div>
                      <InputLabel hint="shown to vendor">Block Reason</InputLabel>
                      <textarea
                        value={form.blocked_reason ?? ""}
                        onChange={(e) => set("blocked_reason", e.target.value)}
                        rows={2}
                        placeholder="Explain why this product is blocked…"
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-red-200 bg-red-50/40 focus:bg-white outline-none focus:ring-2 focus:ring-red-300/40 resize-none font-medium text-zinc-800"
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-zinc-100 bg-zinc-50/60 shrink-0">
          <div className="flex gap-1">
            {TABS.map((tab) => (
              <div
                key={tab.id}
                className={`h-1.5 rounded-full transition-all ${
                  activeTab === tab.id ? "w-6 bg-blue-600" : "w-1.5 bg-zinc-200"
                }`}
              />
            ))}
          </div>
          <div className="flex items-center gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={submitting}
              className="h-10 px-5 rounded-2xl border-zinc-200 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="edit-product-form"
              disabled={submitting}
              className="h-10 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold gap-2 shadow-md shadow-blue-600/20 cursor-pointer transition-all"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving…
                </>
              ) : (
                <>
                  <Pencil className="h-3.5 w-3.5" /> Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

