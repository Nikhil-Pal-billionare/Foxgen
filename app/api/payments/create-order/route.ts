import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import crypto from "crypto";

const PLANS: Record<string, { amount: number; name: string }> = {
  "plan-1": { amount: 668, name: "Starter Plan" },
  "plan-2": { amount: 999, name: "Pro Plan" },     
  "plan-3": { amount: 2649, name: "Elite Plan" }, 
};

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { email, planId } = body;

  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    return NextResponse.json({ error: "Razorpay keys not configured" }, { status: 500 });
  }

  const rp = new Razorpay({ key_id, key_secret });

  // Default to plan-1 if not specified, or validate planId
  const selectedPlan = PLANS[planId as string] || PLANS["plan-1"];
  const amount = selectedPlan.amount;

  try {
    const order = await rp.orders.create({
      amount,
      currency: process.env.LAUNCH_CURRENCY ?? "INR",
      receipt: `early-${Date.now()}`,
      notes: { email, planId: planId || "plan-1", planName: selectedPlan.name },
    });

    return NextResponse.json({ order, key_id, planName: selectedPlan.name });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Failed to create order" }, { status: 500 });
  }
}
