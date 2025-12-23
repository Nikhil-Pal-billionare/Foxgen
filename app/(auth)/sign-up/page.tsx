"use client";

import { useState } from "react";
import { AuthCard } from "@/components/auth/auth-card";
import { InputField } from "@/components/auth/input-field";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import FoxgenLogo from "@/components/branding/FoxgenLogo";

export default function SignUpPage() {
  const router = useRouter();
  const supabase = createClient();

  return (
    <AuthCard>

      <FoxgenLogo size={90} />

      <h2 className="text-center text-3xl font-bold mb-4">Waitlist Only</h2>
      <p className="text-center text-gray-300 mb-6">
        Public signup is closed for launch phase.
        Join the waitlist to be invited in batches.
      </p>
      <div className="space-y-3">
        <Button className="w-full bg-[#C1272D] hover:bg-[#a02025]" onClick={() => router.push("/")}>Join Waitlist</Button>
        <p className="text-sm text-center mt-2 text-gray-400">
          Already invited?{" "}
          <a href="/sign-in" className="text-[#C1272D] underline">Sign In</a>
        </p>
      </div>
    </AuthCard>
  );
}
