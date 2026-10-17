import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RoyalBet Casino",
  description:
    "RoyalBet Casino — a premium casino-style gaming experience.",
  applicationName: "RoyalBet Casino",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}