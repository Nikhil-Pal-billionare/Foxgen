import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Razorpay from "razorpay";

import { createClient } from "@/lib/supabaseServer"; // auth client
import { supabaseAdmin } from "@/lib/supabaseAdmin"; // 🔐 admin client

import { PLAN_CREDITS, PlanId } from "@/lib/planCredits";
import { PRICING } from "@/lib/pricing";

export async function POST(req: Request) {
  try {
    /* ---------------- CLIENTS ---------------- */
    const supabase = createClient(); // auth only

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

    /* ---------------- PROMO CODES ---------------- */
    if (discountCode === "YDTA100" || discountCode === "PRCH100A") {
      finalAmount = 0;
    }

    /* ==================================================
       🆓 FREE / 100% DISCOUNT FLOW (NO PAYMENT)
    ================================================== */
    if (finalAmount === 0) {
      await supabaseAdmin.from("subscriptions").insert({
        user_id: user.id,
        plan_name: safePlanId,                 // ✅ MATCH COLUMN
        amount: PLAN_CREDITS[safePlanId],      // or 0 if you want
        credits_granted: PLAN_CREDITS[safePlanId], // ✅ REQUIRED
        status: "active",
        start_date: new Date().toISOString(),
      });
    
      await supabaseAdmin.from("payments").insert({
        user_id: user.id,
        amount: 0,
        currency,
        provider: "promo",
        status: "success",
      });
    
      await supabaseAdmin.rpc("add_credits", {
        p_user_id: user.id,
        p_amount: PLAN_CREDITS[safePlanId],
        p_reason: "plan_purchase",
        p_meta: {
          plan: safePlanId,
          source: "100_percent_off",
        },
      });
    
      return NextResponse.json({
        free: true,
        plan: safePlanId,
        credits: PLAN_CREDITS[safePlanId],
      });
    }    

    /* ==================================================
       💳 PAID FLOW (RAZORPAY)
    ================================================== */
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    const order = await razorpay.orders.create({
      amount: Math.round(finalAmount * 100), // paise
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
