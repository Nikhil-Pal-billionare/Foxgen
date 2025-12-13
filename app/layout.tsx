import "./globals.css";
import { ReactNode } from "react";
import { Toaster } from "@/components/ui/toaster";

export const metadata = {
  title: "AI SaaS Platform",
  description: "Multi AI modules with credits & billing"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white">
        <Toaster />
        {children}
      </body>
    </html>
  );
}
