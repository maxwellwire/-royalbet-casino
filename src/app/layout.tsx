import type { Metadata } from "next";
import "./globals.css";

import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "RoyalBet Casino",
  description:
    "RoyalBet Casino — a premium casino-style gaming experience.",
  applicationName: "RoyalBet Casino"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main>{children}</main>

        <footer className="site-footer">
          <div className="footer-brand">
            ROYAL<span className="gold-text">BET</span>
          </div>

          <p>
            A premium gaming interface built for entertainment.
          </p>

          <p className="footer-note">
            Virtual-credit prototype. No real-money wagering
            or withdrawals are available.
          </p>

          <p>© {new Date().getFullYear()} RoyalBet Casino</p>
        </footer>
      </body>
    </html>
  );
}