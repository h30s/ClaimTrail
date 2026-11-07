import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ClaimTrail",
  description: "Cashless claims and TPA tracking workspace",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
