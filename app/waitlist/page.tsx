"use client";

import { useState } from "react";

export default function WaitlistPage() {
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [role, setRole] = useState("creator");

  const [showReferral, setShowReferral] = useState(false);
  const [referralCode, setReferralCode] = useState("");
  const [discountPreview, setDiscountPreview] = useState(0);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  function handleReferralChange(value: string) {
    const code = value.toUpperCase().trim();
    setReferralCode(code);

    if (code === "AVT100") {
      setDiscountPreview(100);
    } else {
      setDiscountPreview(0);
    }
  }

  async function submit() {
    setLoading(true);
    setMessage("");

    const res = await fetch("/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        whatsapp,
        role,
        referralCode: referralCode || undefined,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setMessage(data.error || "Something went wrong");
      return;
    }

    setMessage(data.message);
    setEmail("");
    setWhatsapp("");
    setReferralCode("");
    setDiscountPreview(0);
    setShowReferral(false);
  }

  return (
    <main className="min-h-screen bg-[#0D0D0D] text-white flex items-center justify-center">
      <div className="w-full max-w-md space-y-4 p-6">
        <h1 className="text-3xl font-bold">Join the Waitlist</h1>

        {/* Email */}
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 bg-black border border-gray-700 rounded"
        />

        {/* WhatsApp */}
        <input
          placeholder="WhatsApp (optional)"
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value)}
          className="w-full p-3 bg-black border border-gray-700 rounded"
        />

        {/* Role */}
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full p-3 bg-black border border-gray-700 rounded"
        >
          <option value="creator">Creator</option>
          <option value="editor">Editor</option>
          <option value="agency">Agency</option>
        </select>

        {/* Referral toggle */}
        <button
          type="button"
          onClick={() => setShowReferral(!showReferral)}
          className="text-sm text-gray-400 hover:text-white underline"
        >
          Have a referral code?
        </button>

        {/* Referral input */}
        {showReferral && (
          <div className="space-y-2">
            <input
              placeholder="Enter referral code"
              value={referralCode}
              onChange={(e) => handleReferralChange(e.target.value)}
              className="w-full p-3 bg-black border border-gray-700 rounded"
            />

            {discountPreview > 0 && (
              <p className="text-green-400 text-sm">
                🎉 ₹{discountPreview} discount unlocked!  
                <span className="text-gray-400">
                  {" "}Applied when you upgrade.
                </span>
              </p>
            )}
          </div>
        )}

        {/* Submit */}
        <button
          onClick={submit}
          disabled={loading}
          className="w-full bg-red-600 py-3 rounded font-semibold disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Join Waitlist"}
        </button>

        {/* Message */}
        {message && (
          <p className="text-sm text-gray-300">{message}</p>
        )}
      </div>
    </main>
  );
}
