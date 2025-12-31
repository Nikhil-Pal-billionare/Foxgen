import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Razorpay from "razorpay";
import { PRICING } from "@/lib/pricing";
import { applyDiscount } from "@/lib/pricing";

/* =========================
   PLAN NAME MAP
========================= */
const PLAN_NAMES = {
  starter: "Starter Plan",
  pro: "Pro Plan",
  elite: "Elite Plan",
} as const;

type PlanId = keyof typeof PLAN_NAMES;

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email, planId: rawPlanId, discountCode } = body as {
      email?: unknown;
      planId?: unknown;
      discountCode?: unknown;
    };

    /* =========================
       VALIDATION
    ========================= */
    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const planId =
      typeof rawPlanId === "string" && rawPlanId in PLAN_NAMES
        ? (rawPlanId as PlanId)
        : null;

    if (!planId) {
      return NextResponse.json(
        { error: "Invalid plan selected" },
        { status: 400 }
      );
    }

    /* =========================
       REGION DETECTION
    ========================= */
    const h = headers();

    const country =
      h.get("cf-ipcountry") ||
      h.get("x-vercel-ip-country") ||
      "US"; // unknown → USD

    const isIndia = country === "IN";

    /* =========================
       PRICING SELECTION
    ========================= */
    const regionPricing = isIndia ? PRICING.INR : PRICING.USD;
    const currency = isIndia ? "INR" : "USD";

    const planEntry = regionPricing.plans[planId];

    if (!planEntry) {
      return NextResponse.json(
        { error: "Plan pricing not found" },
        { status: 400 }
      );
    }

    /* =========================
       BASE AMOUNT
    ========================= */
    let finalAmount: number = planEntry.discounted;

    /* =========================
       DISCOUNT (OPTIONAL)
    ========================= */
    if (discountCode === "AVT100") {
      finalAmount = isIndia
        ? applyDiscount(finalAmount, "flat", 100)
        : applyDiscount(finalAmount, "flat", 5);
    }

    /* =========================
       RAZORPAY INIT
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
       (smallest currency unit)
    ========================= */
    const order = await rp.orders.create({
      amount: Math.round(finalAmount * 100), // paise / cents
      currency, // INR or USD
      receipt: `foxgen-${planId}-${Date.now()}`,
      notes: {
        email,
        planId,
        planName: PLAN_NAMES[planId],
        country,
        currency,
      },
    });

    return NextResponse.json({
      order,
      key_id,
      currency,
      planName: PLAN_NAMES[planId],
    });
  } catch (err: any) {
    console.error("CREATE ORDER ERROR:", err);
    return NextResponse.json(
      { error: err?.message ?? "Failed to create order" },
      { status: 500 }
    );
  }
}
