"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import FoxgenLogo from "@/components/branding/FoxgenLogo";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PricingSection } from "@/components/landing/PricingSection";

type RecentEntry = { email: string; status: string; joined_at: string; role?: string };

export default function Home() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [role, setRole] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [isSubmitting, setSubmitting] = useState(false);
  const [recent, setRecent] = useState<RecentEntry[]>([]);
  const [count, setCount] = useState<number>(0);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>("");

  useEffect(() => {
    fetch("/api/waitlist")
      .then((r) => r.json())
      .then((data) => {
        setRecent(data.recent ?? []);
        setCount(data.count ?? 0);
      })
      .catch(() => {});
  }, []);

  async function joinWaitlist(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, whatsapp: whatsapp || undefined, role: role || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setMessage(data.message);
      setEmail("");
      setWhatsapp("");
      setRole("");
      // refresh count
      fetch("/api/waitlist").then((r) => r.json()).then((d) => { setCount(d.count ?? 0); setRecent(d.recent ?? []); });
    } catch (err: any) {
      setMessage(err.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }


  async function startEarlyPayment(planId: string) {
    if (!email) {
      setMessage("Please enter your email first");
      return;
    }
    setCheckoutLoading(true);
    setSelectedPlan(planId);
    try {
      // Create Razorpay order
      const res = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, planId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create order");

      const { order, key_id, planName } = data;

      // Load Razorpay script
      await new Promise((resolve, reject) => {
        if ((window as any).Razorpay) return resolve(true);
        const src = "https://checkout.razorpay.com/v1/checkout.js";
        
        // Remove any existing script to ensure fresh load on retry
        const existing = document.querySelector(`script[src="${src}"]`);
        if (existing) existing.remove();

        const script = document.createElement("script");
        script.src = src;
        script.onload = () => resolve(true);
        script.onerror = () => reject(new Error("Failed to load payment script. Check internet or ad-blockers."));
        document.body.appendChild(script);
      });

      // @ts-ignore - Razorpay injected globally
      const rzp = new window.Razorpay({
        key: key_id,
        order_id: order.id,
        name: `Foxgen Early Access - ${planName}`,
        description: `Launch phase discounted access (${planName})`,
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
        <div className="mb-2">
          <FoxgenLogo size={120} />
        </div>

        <h1 className="text-4xl font-extrabold leading-tight mb-2">
          Foxgen Launch: Join the Waitlist
        </h1>

        <p className="text-gray-300 text-base leading-relaxed mb-6">
          We’re unlocking access in batches. Early users get huge discounts (valid until Dec 31st).
        </p>

        {/* Pricing Plans */}
        <PricingSection
          onSelectPlanAction={(planId) => startEarlyPayment(planId)}
          loadingPlanId={checkoutLoading ? selectedPlan : undefined}
        />

        {/* Waitlist Form */}
        <div className="rounded-xl border border-gray-800 p-6 text-left bg-[#121212] max-w-lg mx-auto mt-12">
          <form onSubmit={joinWaitlist} className="space-y-4">
            <div>
              <Label htmlFor="email">Email (required)</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
            </div>
            <div>
              <Label htmlFor="whatsapp">WhatsApp (optional)</Label>
              <Input id="whatsapp" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="+91xxxxxxxxxx" />
            </div>
            <div>
              <Label htmlFor="role">Role (optional)</Label>
              <select id="role" className="w-full bg-transparent border border-gray-700 rounded-md p-2" value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="">Select</option>
                <option value="creator">Creator</option>
                <option value="editor">Editor</option>
                <option value="agency">Agency</option>
              </select>
            </div>
            <div className="flex gap-3">
              <Button type="submit" disabled={isSubmitting} className="bg-[#C1272D] hover:bg-[#A02025]">
                {isSubmitting ? "Joining..." : "Join Waitlist"}
              </Button>
            </div>
          </form>

          {message && (
            <p className="mt-4 text-sm text-gray-300">{message}</p>
          )}
        </div>

        <div className="space-y-2 text-sm text-gray-300 mt-8">
          <p>Early access is limited for first 200 users before 31st Dec.</p>
          <p>Public pricing will be higher.</p>
        </div>

        <div className="mt-6 text-sm text-gray-400">
          <p>
            You’re on the waitlist. Access will be unlocked soon.
          </p>
        </div>

        <div className="mt-10 text-left">
          <p className="text-gray-400 mb-2">Live waitlist: {count} users</p>
          <ul className="grid grid-cols-1 gap-2">
            {recent.map((r, i) => (
              <li key={i} className="text-gray-500 text-xs">
                {r.email} • {r.status} • {new Date(r.joined_at).toLocaleString()} {r.role ? `• ${r.role}` : ""}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
