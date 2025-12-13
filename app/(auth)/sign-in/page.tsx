"use client";

import { useState } from "react";
import { AuthCard } from "@/components/auth/auth-card";
import { InputField } from "@/components/auth/input-field";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSignIn(e: any) {
    e.preventDefault();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) return alert(error.message);

    router.push("/dashboard");
  }

  return (
    <AuthCard title="Sign In">
      <form className="space-y-4" onSubmit={handleSignIn}>
        <InputField
          label="Email"
          id="email"
          type="email"
          value={email}
          onChange={setEmail}
        />

        <InputField
          label="Password"
          id="password"
          type="password"
          value={password}
          onChange={setPassword}
        />

        <Button className="w-full" type="submit">
          Sign In
        </Button>

        <p className="text-sm text-center">
          Don't have an account?{" "}
          <a href="/sign-up" className="text-blue-600 underline">
            Sign Up
          </a>
        </p>
      </form>
    </AuthCard>
  );
}
