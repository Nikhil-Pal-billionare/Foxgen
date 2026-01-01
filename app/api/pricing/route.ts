import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { PRICING } from "@/lib/pricing";

export async function GET() {
  const h = headers();
  const country =
    h.get("cf-ipcountry") ||
    h.get("x-vercel-ip-country") ||
    "US";

  const isIndia = country === "IN";
  const pricing = isIndia ? PRICING.INR : PRICING.USD;

  return NextResponse.json(pricing);
}
