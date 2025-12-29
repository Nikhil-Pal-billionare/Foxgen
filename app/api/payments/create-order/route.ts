import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Razorpay from "razorpay";
import { PRICING } from "@/lib/pricing";
import { applyDiscount } from "@/lib/pricing";

/* =========================
   PLAN NAME MAP
========================= */
const PLAN_NAMES: Record<string, string> = {
  starter: "Starter Plan",
  pro: "Pro Plan",
  elite: "Elite Plan",
};

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email, planId: rawPlanId, discountCode } = body as {
      email?: unknown;
      planId?: unknown;
      discountCode?: unknown;
    };

    // normalize and type-guard planId so TypeScript knows it's one of the known keys
    const planId = typeof rawPlanId === "string" ? (rawPlanId as keyof typeof PLAN_NAMES) : undefined;

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    if (!planId || !PLAN_NAMES[planId]) {
      return NextResponse.json(
        { error: "Invalid plan selected" },
        { status: 400 }
      );
    }

    /* =========================
       REGION DETECTION (CF)
    ========================= */
    const country = headers().get("cf-ipcountry");

    const regionPricing =
      country === "IN" ? PRICING.INR : PRICING.USD;

    const currency = regionPricing.currency;

    /* =========================
       BASE PRICE
    ========================= */
    const baseAmount = regionPricing.plans[planId as keyof typeof regionPricing.plans];

    if (!baseAmount) {
      return NextResponse.json(
        { error: "Plan pricing not found" },
        { status: 400 }
      );
    }

    /* =========================
       DISCOUNT (BACKEND ONLY)
    ========================= */
    let finalAmount = baseAmount;

    if (discountCode === "AVT100") {
      // Flat discount per region
      finalAmount =
        country === "IN"
          ? applyDiscount(baseAmount, "flat", 100)
          : applyDiscount(baseAmount, "flat", 5);
    }

    /* =========================
       RAZORPAY SETUP
    ========================= */
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_id || !key_secret) {
      return NextResponse.json(
        { error: "Razorpay keys not configured" },
        { status: 500 }
      );
    }

    const rp = new Razorpay({ key_id, key_secret });

    /* =========================
       CREATE ORDER
       Razorpay expects amount in
       smallest currency unit
    ========================= */
    const order = await rp.orders.create({
      amount: Math.round(finalAmount * 100), // ₹ → paise, $ → cents
      currency,
      receipt: `foxgen-${Date.now()}`,
      notes: {
        email,
        planId,
        planName: PLAN_NAMES[planId],
        country: country ?? "UNKNOWN",
        currency,
      },
    });

    return NextResponse.json({
      order,
      key_id,
      planName: PLAN_NAMES[planId],
      currency,
    });
  } catch (err: any) {
    console.error("CREATE ORDER ERROR:", err);
    return NextResponse.json(
      { error: err?.message ?? "Failed to create order" },
      { status: 500 }
    );
  }
}
