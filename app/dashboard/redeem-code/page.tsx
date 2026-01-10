"use client";

import { useState } from "react";

export default function RedeemCode() {
  const [code, setCode] = useState("");
  const [result, setResult] = useState<any>(null);

  async function apply() {
    const res = await fetch("/api/influencer/validate-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, amount: 100 }),
    });
    setResult(await res.json());
  }

  return (
    <div className="max-w-md space-y-4">
      <h1 className="text-xl font-semibold">Apply Discount Code</h1>

      <input
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Enter code"
        className="w-full p-3 bg-black border rounded-lg"
      />

      <button
        onClick={apply}
        className="px-6 py-2 bg-blue-600 rounded-lg"
      >
        Apply
      </button>

      {result && (
        <p className="text-green-400">
          Discount: {result.discount} | Final: {result.finalAmount}
        </p>
      )}
    </div>
  );
}
