"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";

export default function DemoRequestModal({
  onClose,
}: {
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    useCase: "",
    reason: "",
  });

  async function submitForm() {
    if (!form.name || !form.phone || !form.useCase || !form.reason || !form.email) {
      alert("Please fill all required fields");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/demo-request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setLoading(false);

    if (res.ok) {
      setSuccess(true);
    } else {
      alert("Failed to submit. Try again.");
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#0b0f19] border border-white/10 p-6 space-y-4">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X />
        </button>

        <h2 className="text-2xl font-semibold">
          Get a Free Use-Case Demo
        </h2>
        <p className="text-sm text-gray-400">
          See if this fits your work before paying.
        </p>

        {success ? (
          <div className="text-green-400 text-center py-8">
            ✅ Request submitted!  
            <p className="text-sm text-gray-400 mt-2">
              We usually respond within 24 hours.
            </p>
          </div>
        ) : (
          <>
            <input
              placeholder="Full Name *"
              className="w-full p-3 rounded-lg bg-black/40 border border-white/10"
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            <input
              placeholder="WhatsApp / Phone *"
              className="w-full p-3 rounded-lg bg-black/40 border border-white/10"
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />

            <input
              placeholder="Email *"
              className="w-full p-3 rounded-lg bg-black/40 border border-white/10"
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />

            <select
              className="w-full p-3 rounded-lg bg-black/40 border border-white/10"
              onChange={(e) =>
                setForm({ ...form, useCase: e.target.value })
              }
            >
              <option value="">What do you want to use this for? *</option>
              <option>Instagram Reels / Shorts</option>
              <option>YouTube Videos</option>
              <option>Ads / Marketing</option>
              <option>Client Work (Agency / Freelance)</option>
              <option>Just Exploring</option>
              <option>Other</option>
            </select>

            <textarea
              placeholder="Why are you interested right now? *"
              className="w-full h-28 p-3 rounded-lg bg-black/40 border border-white/10"
              onChange={(e) =>
                setForm({ ...form, reason: e.target.value })
              }
            />

            <button
              onClick={submitForm}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 font-semibold flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" /> : "👉 Request Free Demo"}
            </button>

            <p className="text-xs text-gray-400 text-center">
              We usually respond within 24 hours.  
              Demos are prioritised for serious creators & businesses.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
