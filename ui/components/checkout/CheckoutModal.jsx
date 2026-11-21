"use client";
import { useState } from "react";
import {
  X, ShoppingBag, User, Mail, Phone, MapPin,
  Truck, CheckCircle2, AlertCircle, Loader2, ChevronRight
} from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useOrderStore } from "@/store/orderStore";

export default function CheckoutModal({ onClose }) {
  const { items, clearCart, getTotalCount } = useCartStore();
  const { placeOrder, isPlacing, error, placedOrder, reset } = useOrderStore();

  const [form, setForm] = useState({
    full_name: "", email: "", phone: "", address: "", notes: "",
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [step, setStep] = useState("form"); // "form" | "success"

  const totalCount = getTotalCount();

  const handleClose = () => {
    reset();
    onClose?.();
  };

  const change = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setFieldErrors((fe) => ({ ...fe, [name]: null }));
  };

  const validate = () => {
    const errs = {};
    if (!form.full_name.trim()) errs.full_name = "Name is required.";
    if (!form.email.trim()) errs.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = "Enter a valid email.";
    if (!form.phone.trim()) errs.phone = "Phone number is required.";
    if (!form.address.trim()) errs.address = "Delivery address is required.";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }

    const payload = {
      ...form,
      items: items.map((i) => ({ product_id: i.product?.id ?? i.id, quantity: i.quantity })),
    };

    const result = await placeOrder(payload);
    if (result.success) {
      clearCart();
      setStep("success");
    } else if (result.error && typeof result.error === "object" && !Array.isArray(result.error)) {
      setFieldErrors(result.error);
    }
  };

  const subtotal = items.reduce((s, i) => {
    const price = Number(i.product?.price || i.price) || 0;
    return s + price * i.quantity;
  }, 0);

  if (step === "success") {
    return (
      <ModalShell onClose={handleClose}>
        <div className="flex flex-col items-center text-center py-8 px-4 gap-4">
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Order Placed!</h2>
          <p className="text-gray-500 max-w-xs text-sm">
            Thank you <span className="font-semibold text-gray-800">{placedOrder?.full_name}</span>!
            Your order <span className="font-semibold text-emerald-600">#{placedOrder?.id}</span> has been
            received. Our team will contact you on{" "}
            <span className="font-semibold">{placedOrder?.phone}</span> for delivery confirmation.
          </p>

          {/* Order summary */}
          <div className="w-full max-w-sm bg-gray-50 rounded-2xl p-4 text-left space-y-2 mt-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Order Summary</p>
            {placedOrder?.items?.map((item) => (
              <div key={item.id} className="flex justify-between text-sm text-gray-700">
                <span>{item.quantity}× {item.product_name}</span>
                <span>PKR {Number(item.subtotal).toLocaleString()}</span>
              </div>
            ))}
            <div className="border-t pt-2 flex justify-between font-bold text-gray-900">
              <span>Total</span>
              <span>PKR {Number(placedOrder?.total_amount).toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 rounded-xl px-3 py-2 mt-1">
              <Truck className="w-4 h-4" />
              <span>Cash on Delivery</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="mt-4 w-full max-w-xs py-3 rounded-2xl bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition"
          >
            Continue Shopping
          </button>
        </div>
      </ModalShell>
    );
  }

  return (
    <ModalShell onClose={handleClose}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-lg leading-tight">Checkout</h2>
              <p className="text-xs text-gray-400">{totalCount} item{totalCount !== 1 ? "s" : ""}</p>
            </div>
          </div>
          <button type="button" onClick={handleClose} className="p-2 rounded-xl hover:bg-gray-100 transition">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} id="checkout-form">
            <div className="px-6 pt-5 pb-2 space-y-5">

              {/* Cart Items Preview */}
              <section>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Your Items</p>
                <div className="space-y-2">
                  {items.map((item) => {
                    const p = item.product || item;
                    const price = Number(p.price) || 0;
                    const imgSrc = p.image
                      ? (p.image.startsWith("http") ? p.image : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}${p.image}`)
                      : null;
                    return (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 bg-gray-50 rounded-2xl px-3 py-2.5"
                      >
                        {imgSrc ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={imgSrc}
                            alt={p.name}
                            className="w-10 h-10 rounded-xl object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                            <ShoppingBag className="w-5 h-5 text-emerald-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{p.name}</p>
                          <p className="text-xs text-gray-400">{item.quantity} × PKR {price.toLocaleString()}</p>
                        </div>
                        <span className="text-sm font-semibold text-gray-800 flex-shrink-0">
                          PKR {(price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Divider */}
              <div className="border-t border-dashed border-gray-200" />

              {/* Customer Details */}
              <section className="space-y-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Delivery Details</p>

                {/* Full Name */}
                <FormField
                  icon={<User className="w-4 h-4" />}
                  label="Full Name"
                  error={fieldErrors.full_name}
                >
                  <input
                    name="full_name" value={form.full_name} onChange={change}
                    placeholder="e.g. Ahmed Khan"
                    className={inputCls(fieldErrors.full_name)}
                  />
                </FormField>

                {/* Email */}
                <FormField
                  icon={<Mail className="w-4 h-4" />}
                  label="Email Address"
                  error={fieldErrors.email}
                >
                  <input
                    name="email" value={form.email} onChange={change}
                    type="email" placeholder="ahmed@example.com"
                    className={inputCls(fieldErrors.email)}
                  />
                </FormField>

                {/* Phone */}
                <FormField
                  icon={<Phone className="w-4 h-4" />}
                  label="Phone Number"
                  error={fieldErrors.phone}
                >
                  <input
                    name="phone" value={form.phone} onChange={change}
                    type="tel" placeholder="03XX-XXXXXXX"
                    className={inputCls(fieldErrors.phone)}
                  />
                </FormField>

                {/* Address */}
                <FormField
                  icon={<MapPin className="w-4 h-4" />}
                  label="Delivery Address"
                  error={fieldErrors.address}
                >
                  <textarea
                    name="address" value={form.address} onChange={change}
                    rows={3} placeholder="House #, Street, City, Province"
                    className={inputCls(fieldErrors.address) + " resize-none"}
                  />
                </FormField>

                {/* Notes (optional) */}
                <FormField
                  icon={null}
                  label="Order Notes (optional)"
                  error={null}
                >
                  <textarea
                    name="notes" value={form.notes} onChange={change}
                    rows={2}
                    placeholder="Any special instructions for delivery..."
                    className={inputCls(null) + " resize-none"}
                  />
                </FormField>
              </section>

              {/* Payment Method */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3 flex items-center gap-3">
                <Truck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-emerald-800">Cash on Delivery</p>
                  <p className="text-xs text-emerald-600">Pay when your order arrives — no prepayment needed.</p>
                </div>
              </div>

              {/* Backend error */}
              {error && typeof error === "string" && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-sm text-red-700">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Array errors */}
              {Array.isArray(error) && (
                <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-sm text-red-700 space-y-1">
                  {error.map((e, i) => <p key={i}>• {e}</p>)}
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Footer — Order Total + Submit */}
        <div className="border-t border-gray-100 px-6 py-4 space-y-3">
          {/* Total */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-xs text-gray-400">Order Total</p>
              <p className="text-2xl font-bold text-gray-900">
                PKR {subtotal.toLocaleString()}
              </p>
            </div>
            <div className="text-right text-xs text-gray-400">
              <p>Shipping</p>
              <p className="text-emerald-600 font-semibold">Free</p>
            </div>
          </div>

          <button
            type="submit"
            form="checkout-form"
            disabled={isPlacing || items.length === 0}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-base transition"
          >
            {isPlacing ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Placing Order...</>
            ) : (
              <><span>Place Order</span><ChevronRight className="w-5 h-5" /></>
            )}
          </button>
          <p className="text-xs text-center text-gray-400">
            By placing your order you agree to our terms. Payment is collected on delivery.
          </p>
        </div>
      </div>
    </ModalShell>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function ModalShell({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Panel */}
      <div className="relative z-10 w-full sm:max-w-md bg-white sm:rounded-3xl rounded-t-3xl max-h-[92dvh] flex flex-col overflow-hidden shadow-2xl">
        {children}
      </div>
    </div>
  );
}

function FormField({ icon, label, error, children }) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600">
        {icon && <span className="text-emerald-500">{icon}</span>}
        {label}
      </label>
      {children}
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {Array.isArray(error) ? error[0] : error}
        </p>
      )}
    </div>
  );
}

const inputCls = (error) =>
  `w-full px-4 py-3 rounded-2xl border text-sm text-gray-800 bg-gray-50 
   placeholder:text-gray-300 outline-none transition
   focus:bg-white focus:ring-2 focus:ring-emerald-400/50
   ${error ? "border-red-300 bg-red-50 focus:ring-red-300/50" : "border-gray-200 focus:border-emerald-400"}`;
