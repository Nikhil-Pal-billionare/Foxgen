"use client";

import { useState } from "react";
import { AuthCard } from "@/components/auth/auth-card";
import { InputField } from "@/components/auth/input-field";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSignUp(e: any) {
    e.preventDefault();

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) return alert(error.message);

    router.push("/sign-in");
  }

  return (
    <AuthCard title="Sign Up">
      <form className="space-y-4" onSubmit={handleSignUp}>
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
          Create Account
        </Button>

        <p className="text-sm text-center">
          Already have an account?{" "}
          <a href="/sign-in" className="text-blue-600 underline">
            Sign In
          </a>
        </p>
      </form>
    </AuthCard>
  );
}
