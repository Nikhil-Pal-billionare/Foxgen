"use client";

export function AuthCard({ title, children }: any) {
  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <div className="w-full max-w-md bg-[#111111] border border-[#222] rounded-2xl p-8 shadow-xl">
        
        {children}
      </div>
    </div>
  );
}
