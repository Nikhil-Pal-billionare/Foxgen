"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import FoxgenLogo from "@/components/branding/FoxgenLogo";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PricingSection } from "@/components/landing/PricingSection";

type RecentEntry = {
  email: string;
  status: string;
  joined_at: string;
  role?: string;
};

export default function Home() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [role, setRole] = useState<string>("");

  const [message, setMessage] = useState<string>("");
  const [isSubmitting, setSubmitting] = useState(false);
  const [count, setCount] = useState<number>(0);

  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>("");

  /* =========================
     DISCOUNT STATE
  ========================= */
  const [discountCode, setDiscountCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [discountError, setDiscountError] = useState<string>("");

  useEffect(() => {
    fetch("/api/waitlist")
      .then((r) => r.json())
      .then((data) => setCount(data.count ?? 0))
      .catch(() => {});
  }, []);

  /* =========================
     APPLY DISCOUNT
  ========================= */
  function applyDiscount() {
    const code = discountCode.trim().toUpperCase();
    setDiscountError("");

    if (code === "AVT100") {
      setAppliedDiscount(100);
    } else {
      setAppliedDiscount(0);
      setDiscountError("Invalid discount code");
    }
  }

  /* =========================
     JOIN WAITLIST
  ========================= */
  async function joinWaitlist(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          whatsapp: whatsapp || undefined,
          role: role || undefined,
          referralCode: appliedDiscount > 0 ? "AVT100" : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");

      setMessage(data.message);
      setEmail("");
      setWhatsapp("");
      setRole("");
    } catch (err: any) {
      setMessage(err.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  /* =========================
     PAYMENT
  ========================= */
  async function startEarlyPayment(planId: string) {
    if (!email) {
      setMessage("Please enter your email first");
      return;
    }

    setCheckoutLoading(true);
    setSelectedPlan(planId);

    try {
      const res = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          planId,
          discountCode: appliedDiscount > 0 ? "AVT100" : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Payment failed");

      const { order, key_id, planName } = data;

      await new Promise((resolve, reject) => {
        if ((window as any).Razorpay) return resolve(true);
        const src = "https://checkout.razorpay.com/v1/checkout.js";
        
        // Remove any existing script to ensure fresh load on retry
        const existingScript = document.querySelector(`script[src="${src}"]`);
        if (existingScript) existingScript.remove();

        const present = document.querySelector(`script[src="${src}"]`);
        if (present) return resolve(true);
        const script = document.createElement("script");
        script.src = src;
        script.onload = () => resolve(true);
        script.onerror = () => reject(new Error("Failed to load payment script. Check internet or ad-blockers."));
        document.body.appendChild(script);
      });

      // @ts-ignore
      const rzp = new window.Razorpay({
        key: key_id,
        order_id: order.id,
        name: `Foxgen Early Access - ${planName}`,
        description: "Launch phase discounted access",
        prefill: { email },
        notes: { email, planId },
        handler: async function (response: any) {
          // Verify signature
          const verifyRes = await fetch("/api/payments/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              email,
            }),
          });
          const v = await verifyRes.json();
          if (!verifyRes.ok) {
            setMessage(v.error || "Payment verification failed");
          } else {
            setMessage("Payment successful. Redirecting...");
            router.push("/dashboard");
          }
        },
        theme: { color: "#C1272D" },
      });

      rzp.open();
    } catch (err: any) {
      setMessage(err.message || "Payment error");
    } finally {
      setCheckoutLoading(false);
      setSelectedPlan("");
    }
  }

  return (
    <main className="min-h-screen bg-[#0D0D0D] text-white">
      <div className="bg-[#C1272D] text-white text-center py-2 px-4 font-medium">
        Join waitlist to get 20% discount lifetime
      </div>
      <section className="text-center py-10 px-6 space-y-6 max-w-5xl mx-auto">
        <FoxgenLogo size={120} />

        <h1 className="text-4xl font-extrabold">
          Foxgen Launch: Join the Waitlist
        </h1>

        <p className="text-gray-300">
          Early users get special launch discounts (valid till Dec 31st).
        </p>

        {/* =========================
           DISCOUNT BOX
        ========================= */}
        <div className="max-w-md mx-auto border border-gray-700 rounded-lg p-4 bg-[#121212]">
          <p className="text-sm text-gray-300 mb-2">
            Have a discount code?
          </p>

          <div className="flex gap-2">
            <Input
              placeholder="Enter Discount Code"
              value={discountCode}
              onChange={(e) => setDiscountCode(e.target.value)}
            />
            <Button onClick={applyDiscount}>Apply</Button>
          </div>

          {appliedDiscount > 0 && (
            <p className="text-green-400 text-sm mt-2">
              🎉 ₹100 discount applied to Pro & Elite plans
            </p>
          )}

          {discountError && (
            <p className="text-red-400 text-sm mt-2">
              {discountError}
            </p>
          )}
        </div>

        {/* =========================
           PRICING
        ========================= */}
        <PricingSection
          onSelectPlanAction={(planId) => startEarlyPayment(planId)}
          loadingPlanId={checkoutLoading ? selectedPlan : undefined}
        />

        {/* =========================
           WAITLIST FORM
        ========================= */}
        <div className="rounded-xl border border-gray-800 p-6 text-left bg-[#121212] max-w-lg mx-auto mt-12">
          <form onSubmit={joinWaitlist} className="space-y-4">
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <Label>WhatsApp (optional)</Label>
              <Input
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
              />
            </div>

            <div>
              <Label>Role (optional)</Label>
              <select
                className="w-full bg-transparent border border-gray-700 rounded-md p-2"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="">Select</option>
                <option value="creator">Creator</option>
                <option value="editor">Editor</option>
                <option value="agency">Agency</option>
              </select>
            </div>

            <Button
  type="submit"
  disabled={isSubmitting}
  className="
    mt-6 w-full
    bg-red-600 text-white
    hover:bg-red-700
    active:bg-red-800
    disabled:bg-red-600/40
    disabled:cursor-not-allowed
    font-semibold
    py-3
    rounded-md
    transition
    focus:outline-none
    focus:ring-2
    focus:ring-red-500
    focus:ring-offset-2
    focus:ring-offset-[#121212]
  "
>
  {isSubmitting ? "Joining..." : "Join Waitlist"}
</Button>

          </form>

          {message && (
            <p className="mt-4 text-sm text-gray-300">{message}</p>
          )}
        </div>

        <p className="text-gray-400 mt-10">
          Live waitlist: {count} users
        </p>
      </section>
    </main>
  );
}
