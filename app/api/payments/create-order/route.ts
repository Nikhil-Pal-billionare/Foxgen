import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Razorpay from "razorpay";
import { createClient } from "@/lib/supabaseServer";
import { PLAN_CREDITS, PlanId } from "@/lib/planCredits";
import { PRICING } from "@/lib/pricing";

export async function POST(req: Request) {
  try {
    const supabase = createClient();

    /* ---------------- AUTH ---------------- */
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    /* ---------------- BODY ---------------- */
    const { email, planId, discountCode } = await req.json();

    if (!email || !planId) {
      return NextResponse.json(
        { error: "Email and plan required" },
        { status: 400 }
      );
    }

    if (!["starter", "pro", "elite"].includes(planId)) {
      return NextResponse.json(
        { error: "Invalid plan" },
        { status: 400 }
      );
    }

    const safePlanId = planId as PlanId;

    /* ---------------- REGION ---------------- */
    const h = headers();
    const country =
      h.get("cf-ipcountry") ||
      h.get("x-vercel-ip-country") ||
      "US";

    const pricing = country === "IN" ? PRICING.INR : PRICING.USD;
    const currency = pricing.currency;
    let finalAmount = pricing.plans[safePlanId].discounted;

    /* ---------------- PROMO ---------------- */
    if (discountCode === "YDTA100" || discountCode === "PRCH100A") {
      finalAmount = 0;
    }

    /* =========================
       🆓 FREE FLOW (100% OFF)
    ========================= */
    if (finalAmount === 0) {
      await supabase.from("subscriptions").insert({
        user_id: user.id,
        plan_id: safePlanId,
        status: "active",
        source: "promo",
        promo_code: discountCode,
      });

      await supabase.from("payments").insert({
        user_id: user.id,
        amount: 0,
        currency,
        provider: "promo",
        status: "success",
      });

      // 🔥 CREDIT + HISTORY (THIS WAS MISSING BEFORE)
      await supabase.rpc("add_credits", {
        p_user_id: user.id,
        p_amount: PLAN_CREDITS[safePlanId],
        p_reason: "plan_purchase",
        p_meta: {
          plan: safePlanId,
          promo: discountCode,
          source: "100_percent_off",
        },
      });

      return NextResponse.json({ free: true });
    }

    /* =========================
       💳 PAID FLOW
    ========================= */
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    const order = await razorpay.orders.create({
      amount: Math.round(finalAmount * 100),
      currency,
      receipt: `foxgen-${safePlanId}-${Date.now()}`,
      notes: {
        user_id: user.id,
        plan: safePlanId,
      },
    });

    return NextResponse.json({
      free: false,
      order,
      key: process.env.RAZORPAY_KEY_ID,
      credits: PLAN_CREDITS[safePlanId],
    });
  } catch (err) {
    console.error("CREATE ORDER ERROR:", err);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
