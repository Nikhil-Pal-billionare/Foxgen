"use client";

import { useState } from "react";
import { AuthCard } from "@/components/auth/auth-card";
import { InputField } from "@/components/auth/input-field";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import FoxgenLogo from "@/components/branding/FoxgenLogo";


export const dynamic = "force-dynamic";

export default function SignInPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSignIn(e: any) {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return alert(error.message);
    router.push("/dashboard");
  }

  return (
    <AuthCard>

      <FoxgenLogo size={90} />

      <h2 className="text-center text-3xl font-bold mb-6">Welcome Back</h2>

      <form className="space-y-4" onSubmit={handleSignIn}>
        <InputField label="Email" id="email" type="email" value={email} onChange={setEmail} />
        <InputField label="Password" id="password" type="password" value={password} onChange={setPassword} />

        <Button className="w-full bg-[#3B82F6] hover:bg-[#2563EB]" type="submit">
          Sign In
        </Button>

        <p className="text-sm text-center mt-2 text-gray-400">
          Don't have an account?{" "}
          <a href="/sign-up" className="text-[#3B82F6] underline">Sign Up</a>
        </p>
      </form>
    </AuthCard>
  );
}
