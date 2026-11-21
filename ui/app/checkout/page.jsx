"use client";

import React, { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ShoppingBag,
  User,
  Mail,
  Phone,
  MapPin,
  Truck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
  Plus,
  Minus,
  ShieldCheck,
  Store,
  Leaf,
  Clock,
  Sparkles,
  HelpCircle,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cartStore";
import { useOrderStore } from "@/store/orderStore";
import { formatPrice, getProductImageUrl } from "@/components/products/ProductCard";

const emptySubscribe = () => () => {};

function useMounted() {
  return useSyncExternalStore(emptySubscribe, () => true, () => false);
}

export default function CheckoutPage() {
  const mounted = useMounted();
  const {
    items,
    clearCart,
    getTotalCount,
    getSubtotal,
    updateQuantity,
    removeFromCart,
  } = useCartStore();

  const { placeOrder, isPlacing, error, placedOrder, reset } = useOrderStore();

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    address: "",
    notes: "",
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [isSuccess, setIsSuccess] = useState(false);

  const totalCount = getTotalCount();
  const subtotal = getSubtotal();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!form.full_name.trim()) errs.full_name = "Full name is required.";
    if (!form.email.trim()) {
      errs.email = "Email address is required.";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      errs.email = "Please enter a valid email address.";
    }
    if (!form.phone.trim()) {
      errs.phone = "Phone number is required.";
    } else if (form.phone.trim().length < 8) {
      errs.phone = "Please enter a valid phone number.";
    }
    if (!form.address.trim()) {
      errs.address = "Complete delivery address is required.";
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      window.scrollTo({ top: 100, behavior: "smooth" });
      return;
    }

    const payload = {
      ...form,
      items: items.map((i) => ({
        product_id: i.product?.id ?? i.id,
        quantity: i.quantity,
      })),
    };

    const res = await placeOrder(payload);
    if (res.success) {
      clearCart();
      setIsSuccess(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (res.error && typeof res.error === "object" && !Array.isArray(res.error)) {
      setFieldErrors(res.error);
    }
  };

  // SSR skeleton
  if (!mounted) {
    return (
      <div className="min-h-screen bg-husk/40 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-8 animate-pulse">
          <div className="h-8 w-48 bg-zinc-200 rounded-xl" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 h-96 bg-white/70 rounded-3xl" />
            <div className="lg:col-span-5 h-96 bg-white/70 rounded-3xl" />
          </div>
        </div>
      </div>
    );
  }

  // ── Success View ─────────────────────────────────────────────────────────────
  if (isSuccess && placedOrder) {
    return (
      <div className="min-h-screen bg-husk/40 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Main Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-zinc-200/80 text-center space-y-6">
            {/* Animated Celebration Icon */}
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 ring-8 ring-emerald-50 mb-2">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-fern/15 text-fern uppercase tracking-wider">
                Order Confirmed
              </span>
              <h1 className="text-3xl font-display font-bold text-canopy sm:text-4xl">
                Thank You, {placedOrder.full_name}!
              </h1>
              <p className="text-sm text-soil/80 max-w-md mx-auto">
                Your order has been placed successfully. A representative will contact you on{" "}
                <strong className="text-zinc-800">{placedOrder.phone}</strong> to confirm delivery.
              </p>
            </div>

            {/* Order Reference Badge */}
            <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
              <div>
                <p className="text-xs text-zinc-400 font-medium">Order Reference</p>
                <p className="text-lg font-bold font-display text-canopy">
                  #{placedOrder.id}
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 px-3.5 py-2 rounded-xl border border-emerald-200">
                <Truck className="w-4 h-4 text-emerald-600" />
                <span>Payment: Cash on Delivery</span>
              </div>
            </div>

            {/* Order Details & Summary */}
            <div className="text-left bg-zinc-50/70 border border-zinc-200/80 rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Ordered Items
              </h3>

              <div className="divide-y divide-zinc-200/70">
                {placedOrder.items?.map((item) => (
                  <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      {item.product_image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.product_image}
                          alt={item.product_name}
                          className="w-12 h-12 rounded-xl object-cover border border-zinc-200 bg-white"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-mist/50 flex items-center justify-center text-fern">
                          <Leaf className="w-6 h-6" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-canopy truncate">
                          {item.product_name}
                        </p>
                        <p className="text-xs text-zinc-500">
                          Qty: {item.quantity} × {formatPrice(item.price)}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-canopy shrink-0">
                      {formatPrice(item.subtotal)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Total Row */}
              <div className="border-t border-zinc-200 pt-3 flex items-center justify-between">
                <span className="font-bold text-canopy">Total Amount (COD)</span>
                <span className="text-xl font-bold font-display text-canopy">
                  {formatPrice(placedOrder.total_amount)}
                </span>
              </div>
            </div>

            {/* Delivery Destination Card */}
            <div className="text-left bg-white border border-zinc-200 rounded-2xl p-5 space-y-2">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Shipping Destination
              </h4>
              <p className="text-sm font-semibold text-canopy">{placedOrder.full_name}</p>
              <p className="text-xs text-zinc-600 leading-relaxed">{placedOrder.address}</p>
              <p className="text-xs text-zinc-500">Phone: {placedOrder.phone} • Email: {placedOrder.email}</p>
              {placedOrder.notes && (
                <p className="text-xs text-soil/70 bg-husk/50 p-2.5 rounded-xl border border-zinc-200/60 mt-2">
                  <strong>Notes:</strong> {placedOrder.notes}
                </p>
              )}
            </div>

            {/* What Happens Next Steps */}
            <div className="text-left space-y-3 pt-2">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                What happens next?
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-zinc-50 p-3.5 rounded-2xl border border-zinc-200/80 space-y-1">
                  <div className="w-6 h-6 rounded-lg bg-fern/15 text-fern flex items-center justify-center font-bold text-xs">
                    1
                  </div>
                  <p className="text-xs font-bold text-canopy">Call Verification</p>
                  <p className="text-[11px] text-zinc-500 leading-tight">
                    Our team calls to confirm your address and order specifics.
                  </p>
                </div>
                <div className="bg-zinc-50 p-3.5 rounded-2xl border border-zinc-200/80 space-y-1">
                  <div className="w-6 h-6 rounded-lg bg-fern/15 text-fern flex items-center justify-center font-bold text-xs">
                    2
                  </div>
                  <p className="text-xs font-bold text-canopy">Dispatch & Packing</p>
                  <p className="text-[11px] text-zinc-500 leading-tight">
                    Certified packaging prepared by direct verified suppliers.
                  </p>
                </div>
                <div className="bg-zinc-50 p-3.5 rounded-2xl border border-zinc-200/80 space-y-1">
                  <div className="w-6 h-6 rounded-lg bg-fern/15 text-fern flex items-center justify-center font-bold text-xs">
                    3
                  </div>
                  <p className="text-xs font-bold text-canopy">Pay on Delivery</p>
                  <p className="text-[11px] text-zinc-500 leading-tight">
                    Receive your products at your doorstep and pay in cash.
                  </p>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/products" className="w-full sm:w-auto">
                <Button
                  onClick={reset}
                  className="w-full sm:w-auto px-8 py-3 bg-canopy text-husk hover:bg-canopy/90 rounded-2xl font-bold text-sm shadow-sm"
                >
                  Continue Shopping
                </Button>
              </Link>
              <Link href="/" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto px-8 py-3 rounded-2xl font-bold text-sm border-zinc-300 text-zinc-700 hover:bg-zinc-100"
                >
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Empty Cart View ──────────────────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-husk/40 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl mx-auto text-center bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-zinc-200/80 space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-mist/50 text-fern mx-auto flex items-center justify-center">
            <ShoppingBag className="w-10 h-10 stroke-[1.5]" />
          </div>

          <div className="space-y-2">
            <h1 className="font-display text-2xl font-bold text-canopy sm:text-3xl">
              Your Cart is Empty
            </h1>
            <p className="text-sm text-soil/80 max-w-sm mx-auto leading-relaxed">
              You haven&apos;t added any products to your cart yet. Explore our marketplace for verified fertilizers, fungicides, and crop care medicines.
            </p>
          </div>

          <Link href="/products" className="inline-block">
            <Button className="bg-canopy text-husk hover:bg-canopy/90 rounded-2xl px-8 py-3 font-bold text-sm shadow-sm">
              Explore Marketplace
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // ── Checkout Form & Summary (Two Column Layout) ──────────────────────────────
  return (
    <div className="min-h-screen bg-husk/40 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Navigation Bar / Return Link */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-xs font-semibold text-fern hover:text-canopy transition-colors mb-1"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Marketplace</span>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-canopy">
              Checkout
            </h1>
            <p className="text-xs sm:text-sm text-soil/70">
              Provide your delivery details to place your Cash on Delivery order.
            </p>
          </div>

          {/* Guarantee Pill */}
          <div className="flex items-center gap-2 self-start sm:self-auto bg-emerald-50 border border-emerald-200 text-emerald-800 px-3.5 py-1.5 rounded-full text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>100% Cash on Delivery Guarantee</span>
          </div>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3 text-red-800 text-sm">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Unable to process order</p>
              {typeof error === "string" ? (
                <p className="text-xs text-red-700 mt-0.5">{error}</p>
              ) : Array.isArray(error) ? (
                <ul className="text-xs text-red-700 mt-1 list-disc list-inside">
                  {error.map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-red-700 mt-0.5">
                  Please review the errors below and try again.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Main 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ──────────────── LEFT COLUMN: FORM (col-span-7) ──────────────── */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-zinc-200/80 space-y-6">
            <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6">
              {/* Section 1: Customer Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-2.5 pb-2 border-b border-zinc-100">
                  <div className="w-7 h-7 rounded-xl bg-fern/15 text-fern flex items-center justify-center text-xs font-bold">
                    1
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-canopy">Customer Details</h2>
                    <p className="text-[11px] text-zinc-400">
                      We will use these details to contact you and verify delivery.
                    </p>
                  </div>
                </div>

                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-zinc-700">
                    <User className="w-3.5 h-3.5 text-fern" />
                    <span>Full Name *</span>
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    value={form.full_name}
                    onChange={handleChange}
                    placeholder="e.g. Tariq Mehmood"
                    className={`w-full px-4 py-3 rounded-2xl border text-sm text-zinc-800 bg-zinc-50/60 placeholder:text-zinc-400 outline-none transition focus:bg-white focus:ring-2 focus:ring-emerald-400/40 ${
                      fieldErrors.full_name
                        ? "border-red-300 bg-red-50/50 focus:ring-red-300"
                        : "border-zinc-200 focus:border-emerald-500"
                    }`}
                  />
                  {fieldErrors.full_name && (
                    <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{fieldErrors.full_name}</span>
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Phone Number */}
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-1.5 text-xs font-bold text-zinc-700">
                      <Phone className="w-3.5 h-3.5 text-fern" />
                      <span>Phone / WhatsApp *</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="e.g. 0300-1234567"
                      className={`w-full px-4 py-3 rounded-2xl border text-sm text-zinc-800 bg-zinc-50/60 placeholder:text-zinc-400 outline-none transition focus:bg-white focus:ring-2 focus:ring-emerald-400/40 ${
                        fieldErrors.phone
                          ? "border-red-300 bg-red-50/50 focus:ring-red-300"
                          : "border-zinc-200 focus:border-emerald-500"
                      }`}
                    />
                    {fieldErrors.phone && (
                      <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>{fieldErrors.phone}</span>
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-1.5 text-xs font-bold text-zinc-700">
                      <Mail className="w-3.5 h-3.5 text-fern" />
                      <span>Email Address *</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="e.g. farmer@example.com"
                      className={`w-full px-4 py-3 rounded-2xl border text-sm text-zinc-800 bg-zinc-50/60 placeholder:text-zinc-400 outline-none transition focus:bg-white focus:ring-2 focus:ring-emerald-400/40 ${
                        fieldErrors.email
                          ? "border-red-300 bg-red-50/50 focus:ring-red-300"
                          : "border-zinc-200 focus:border-emerald-500"
                      }`}
                    />
                    {fieldErrors.email && (
                      <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>{fieldErrors.email}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Section 2: Shipping Destination */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2.5 pb-2 border-b border-zinc-100">
                  <div className="w-7 h-7 rounded-xl bg-fern/15 text-fern flex items-center justify-center text-xs font-bold">
                    2
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-canopy">Delivery Address</h2>
                    <p className="text-[11px] text-zinc-400">
                      Provide full address including house/farm number, street, city & province.
                    </p>
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-zinc-700">
                    <MapPin className="w-3.5 h-3.5 text-fern" />
                    <span>Complete Address *</span>
                  </label>
                  <textarea
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    rows={3}
                    placeholder="House/Farm/Shop #, Street, Mouza/Chak, Tehsil, City, District"
                    className={`w-full px-4 py-3 rounded-2xl border text-sm text-zinc-800 bg-zinc-50/60 placeholder:text-zinc-400 outline-none transition focus:bg-white focus:ring-2 focus:ring-emerald-400/40 resize-none ${
                      fieldErrors.address
                        ? "border-red-300 bg-red-50/50 focus:ring-red-300"
                        : "border-zinc-200 focus:border-emerald-500"
                    }`}
                  />
                  {fieldErrors.address && (
                    <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{fieldErrors.address}</span>
                    </p>
                  )}
                </div>

                {/* Order Notes */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-zinc-700">
                    <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Special Instructions / Landmark (Optional)</span>
                  </label>
                  <textarea
                    name="notes"
                    value={form.notes}
                    onChange={handleChange}
                    rows={2}
                    placeholder="e.g. Near Canal Bridge, call on arrival, deliver in morning..."
                    className="w-full px-4 py-3 rounded-2xl border border-zinc-200 text-sm text-zinc-800 bg-zinc-50/60 placeholder:text-zinc-400 outline-none transition focus:bg-white focus:ring-2 focus:ring-emerald-400/40 focus:border-emerald-500 resize-none"
                  />
                </div>
              </div>

              {/* Section 3: Payment Method */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2.5 pb-2 border-b border-zinc-100">
                  <div className="w-7 h-7 rounded-xl bg-fern/15 text-fern flex items-center justify-center text-xs font-bold">
                    3
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-canopy">Payment Method</h2>
                    <p className="text-[11px] text-zinc-400">
                      Payment is collected upon safe delivery of your products.
                    </p>
                  </div>
                </div>

                {/* Cash on Delivery Box */}
                <div className="rounded-2xl border-2 border-emerald-500/80 bg-emerald-50/40 p-4.5 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm shadow-emerald-500/20">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-sm font-bold text-canopy">Cash on Delivery (COD)</h4>
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/70 px-2.5 py-0.5 rounded-full">
                        <Check className="w-3 h-3" /> Active
                      </span>
                    </div>
                    <p className="text-xs text-soil/80 mt-1 leading-relaxed">
                      Pay cash to the delivery courier once you receive and inspect your package. No credit card or online payment required.
                    </p>
                  </div>
                </div>
              </div>

              {/* Place Order CTA Button */}
              <div className="pt-4 space-y-3">
                <Button
                  type="submit"
                  disabled={isPlacing || items.length === 0}
                  className="w-full h-14 bg-canopy text-husk hover:bg-canopy/90 rounded-2xl font-bold text-base shadow-md shadow-canopy/15 flex items-center justify-center gap-2.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isPlacing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Placing Order...</span>
                    </>
                  ) : (
                    <>
                      <span>Place Order (Cash on Delivery)</span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-lg bg-white/20">
                        {formatPrice(subtotal)}
                      </span>
                    </>
                  )}
                </Button>

                <p className="text-center text-xs text-zinc-400">
                  By clicking Place Order, you confirm your order with LeafLens Direct.
                </p>
              </div>
            </form>
          </div>

          {/* ──────────────── RIGHT COLUMN: ORDER SUMMARY (col-span-5) ─────────────── */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-zinc-200/80 space-y-5">
              {/* Summary Header */}
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-bold text-canopy text-lg">
                    Order Summary
                  </h3>
                  <span className="inline-flex items-center justify-center rounded-full bg-fern/15 px-2.5 py-0.5 text-xs font-bold text-fern">
                    {totalCount} {totalCount === 1 ? "item" : "items"}
                  </span>
                </div>
                <Link
                  href="/products"
                  className="text-xs font-semibold text-fern hover:underline"
                >
                  + Add more
                </Link>
              </div>

              {/* Items List */}
              <div className="max-h-80 overflow-y-auto pr-1 space-y-3 divide-y divide-zinc-100">
                {items.map((item) => {
                  const product = item.product || {};
                  const imgSrc = getProductImageUrl(product.image);
                  const maxStock = product.stock != null ? Number(product.stock) : 999;
                  const itemTotal = (Number(product.price) || 0) * item.quantity;

                  return (
                    <div key={item.id} className="pt-3 first:pt-0 flex gap-3">
                      {/* Image */}
                      <div className="relative w-16 h-16 rounded-2xl bg-zinc-100 border border-zinc-200/60 overflow-hidden shrink-0">
                        {imgSrc ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={imgSrc}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-fern/60">
                            <Leaf className="w-6 h-6" />
                          </div>
                        )}
                      </div>

                      {/* Info & Quantity controls */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-1.5">
                            <h4
                              className="text-xs font-bold text-canopy line-clamp-1"
                              title={product.name}
                            >
                              {product.name}
                            </h4>
                            <button
                              type="button"
                              onClick={() => removeFromCart(item.id)}
                              className="text-zinc-400 hover:text-rose-600 transition-colors p-0.5"
                              title="Remove item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="flex items-center gap-1 text-[11px] text-soil/70 mt-0.5">
                            <Store className="w-3 h-3 text-fern shrink-0" />
                            <span className="truncate">{product.vendor_name || "Leaf Direct"}</span>
                            {product.pack_size && (
                              <span className="text-zinc-400">• {product.pack_size} {product.unit || ""}</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-2">
                          {/* Price */}
                          <div className="flex items-baseline gap-1">
                            <span className="text-xs font-bold text-canopy">
                              {formatPrice(itemTotal)}
                            </span>
                            {item.quantity > 1 && (
                              <span className="text-[10px] text-zinc-400">
                                ({formatPrice(product.price)})
                              </span>
                            )}
                          </div>

                          {/* Stepper */}
                          <div className="flex items-center gap-1 rounded-xl border border-zinc-200 bg-zinc-50 p-0.5">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-5 h-5 flex items-center justify-center rounded-lg bg-white text-zinc-700 shadow-2xs hover:bg-zinc-100 transition-colors"
                              title="Decrease"
                            >
                              <Minus className="w-2.5 h-2.5" />
                            </button>

                            <span className="w-5 text-center text-xs font-bold text-zinc-800">
                              {item.quantity}
                            </span>

                            <button
                              type="button"
                              disabled={item.quantity >= maxStock}
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-5 h-5 flex items-center justify-center rounded-lg bg-white text-zinc-700 shadow-2xs hover:bg-zinc-100 disabled:opacity-40 transition-colors"
                              title="Increase"
                            >
                              <Plus className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Price Calculations */}
              <div className="border-t border-zinc-100 pt-4 space-y-2.5">
                <div className="flex items-center justify-between text-xs text-zinc-500">
                  <span>Subtotal ({totalCount} items)</span>
                  <span className="font-semibold text-zinc-800">
                    {formatPrice(subtotal)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-zinc-500">
                  <span>Shipping & Handling</span>
                  <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                    FREE
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-zinc-500">
                  <span>Payment Surcharge</span>
                  <span className="font-medium text-zinc-700">None (COD)</span>
                </div>
                <div className="border-t border-zinc-200/80 pt-3 flex items-center justify-between">
                  <span className="font-display font-bold text-sm text-canopy">
                    Total (Pay on Delivery)
                  </span>
                  <span className="font-display font-bold text-xl text-canopy">
                    {formatPrice(subtotal)}
                  </span>
                </div>
              </div>

            </div>

            {/* Need Help Card */}
            {/* <div className="bg-white/80 rounded-2xl p-4 border border-zinc-200/70 text-xs text-zinc-600 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-fern shrink-0" />
                <span>Need assistance ordering?</span>
              </div>
              <a
                href="tel:03001234567"
                className="font-bold text-fern hover:text-canopy transition-colors"
              >
                0300-1234567
              </a>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
}
