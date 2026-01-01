import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Razorpay from "razorpay";
import { PRICING, applyDiscount, PlanId } from "@/lib/pricing";
import { createClient } from "@/lib/supabaseServer";

/* =========================
   PLAN NAMES (TYPE SAFE)
========================= */
const PLAN_NAMES: Record<PlanId, string> = {
  starter: "Starter Plan",
  pro: "Pro Plan",
  elite: "Elite Plan",
};

export async function POST(req: Request) {
  try {
    const supabase = createClient();

    /* =========================
       AUTH
    ========================= */
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    /* =========================
       PARSE BODY (UNKNOWN → SAFE)
    ========================= */
    const body: unknown = await req.json();

    if (
      typeof body !== "object" ||
      body === null ||
      !("email" in body) ||
      !("planId" in body)
    ) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const { email, planId, discountCode } = body as {
      email: string;
      planId: string;
      discountCode?: string;
    };

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    /* =========================
       PLAN VALIDATION (KEY FIX)
    ========================= */
    if (!["starter", "pro", "elite"].includes(planId)) {
      return NextResponse.json(
        { error: "Invalid plan selected" },
        { status: 400 }
      );
    }

    // 🔥 NOW planId IS SAFE
    const safePlanId = planId as PlanId;

    /* =========================
       REGION
    ========================= */
    const h = headers();
    const country =
      h.get("cf-ipcountry") ||
      h.get("x-vercel-ip-country") ||
      "US";

    const regionPricing =
      country === "IN" ? PRICING.INR : PRICING.USD;

    const currency = regionPricing.currency;

    /* =========================
       BASE PRICE
    ========================= */
    const basePrice =
      regionPricing.plans[safePlanId].discounted;

    let finalAmount = basePrice;

    /* =========================
       PROMOS
    ========================= */

    // 🆓 100% OFF
    if (discountCode === "YDTA100") {
      finalAmount = 0;
    }
    if (discountCode === "PRCH100A") {
      finalAmount = 0;
    }
    // 💸 PARTIAL DISCOUNT
    if (discountCode === "AVT100") {
      finalAmount =
        currency === "INR"
          ? applyDiscount(basePrice, "flat", 100)
          : applyDiscount(basePrice, "flat", 5);
    }

    /* =========================
       FREE FLOW (NO RAZORPAY)
    ========================= */
    if (finalAmount === 0) {
      await supabase.from("subscriptions").insert({
        user_id: user.id,
        plan_id: safePlanId,
        status: "active",
        source: "promo",
        promo_code: discountCode ?? null,
      });

      await supabase.from("payments").insert({
        user_id: user.id,
        amount: 0,
        currency,
        provider: "promo",
        status: "success",
      });

      return NextResponse.json({ free: true });
    }

    /* =========================
       RAZORPAY
    ========================= */
    const rp = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    const order = await rp.orders.create({
      amount: Math.round(finalAmount * 100),
      currency,
      receipt: `foxgen-${safePlanId}-${Date.now()}`,
      notes: {
        email,
        planId: safePlanId,
        planName: PLAN_NAMES[safePlanId],
        promo: discountCode ?? "none",
      },
    });

    return NextResponse.json({
      free: false,
      order,
      key_id: process.env.RAZORPAY_KEY_ID,
      currency,
      planName: PLAN_NAMES[safePlanId],
      finalAmount,
    });
  } catch (err) {
    console.error("CREATE ORDER ERROR:", err);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
