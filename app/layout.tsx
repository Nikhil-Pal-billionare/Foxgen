import "./globals.css";
import { ReactNode } from "react";
import { Toaster } from "@/components/ui/toaster";

export const metadata = {
  title: "Foxgen AI",
  description: "Create faster with Foxgen intelligence"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0D0D0D] text-white">
        <Toaster />
        {children}
      </body>
    </html>
  );
}
