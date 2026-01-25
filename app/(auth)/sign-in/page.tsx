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
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) return alert(error.message);
    router.push("/dashboard");
  }

  async function signInWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
  }

  return (
    <AuthCard>
      <FoxgenLogo size={90} />

      <h2 className="text-center text-3xl font-bold mb-6">Welcome Back</h2>

      {/* Google Auth */}
      <Button
        type="button"
        onClick={signInWithGoogle}
        className="w-full mb-4 flex items-center justify-center gap-2 border border-gray-300 bg-white text-black hover:bg-gray-100"
      >
        <GoogleIcon />
        Continue with Google
      </Button>

      <Divider />

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

        <Button className="w-full bg-[#3B82F6] hover:bg-[#2563EB]" type="submit">
          Sign In
        </Button>

        <p className="text-sm text-center mt-2 text-gray-400">
          Don&apos;t have an account?{" "}
          <a href="/sign-up" className="text-[#3B82F6] underline">
            Sign Up
          </a>
        </p>
      </form>
    </AuthCard>
  );
}

/* ---------- Helpers ---------- */

function Divider() {
  return (
    <div className="flex items-center gap-2 my-4">
      <div className="flex-1 h-px bg-gray-300" />
      <span className="text-xs text-gray-400">OR</span>
      <div className="flex-1 h-px bg-gray-300" />
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.33 1.54 7.79 2.83l5.68-5.68C33.84 3.4 29.28 1.5 24 1.5 14.73 1.5 6.96 7.6 4.19 15.85l6.63 5.15C12.33 14.1 17.67 9.5 24 9.5z" />
      <path fill="#34A853" d="M46.1 24.5c0-1.34-.12-2.63-.35-3.88H24v7.34h12.47c-.54 2.9-2.18 5.36-4.64 7.02l7.18 5.57c4.2-3.87 6.09-9.57 6.09-16.05z" />
      <path fill="#4A90E2" d="M10.82 28.01A14.5 14.5 0 0 1 10 24c0-1.4.24-2.76.68-4.01l-6.63-5.15A23.93 23.93 0 0 0 0 24c0 3.87.93 7.53 2.59 10.76l8.23-6.75z" />
      <path fill="#FBBC05" d="M24 46.5c5.28 0 9.72-1.74 12.96-4.74l-7.18-5.57c-1.99 1.34-4.54 2.13-5.78 2.13-6.33 0-11.67-4.6-13.18-10.5l-8.23 6.75C6.96 40.4 14.73 46.5 24 46.5z" />
    </svg>
  );
}
