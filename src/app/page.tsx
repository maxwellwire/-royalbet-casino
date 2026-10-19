"use client";

import Link from "next/link";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Wallet,
  Headphones,
  Home,
} from "lucide-react";

const TELEGRAM_USERNAME = "RoyalBetPayments";

const TELEGRAM_SUPPORT_URL = `https://t.me/${TELEGRAM_USERNAME}`;

const DEPOSIT_MESSAGE =
  "Hi\nI want to deposit and claim the 200% bonus";

const WITHDRAW_MESSAGE =
  "Hi\nI want to withdraw my funds";

const DEPOSIT_URL =
  `${TELEGRAM_SUPPORT_URL}?text=${encodeURIComponent(DEPOSIT_MESSAGE)}`;

const WITHDRAW_URL =
  `${TELEGRAM_SUPPORT_URL}?text=${encodeURIComponent(WITHDRAW_MESSAGE)}`;

export default function AccountPage() {
  return (
    <main className="page-container min-h-screen">
      <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="eyebrow mb-2">ROYALBET CASINO</p>

            <h1 className="text-3xl font-black text-white sm:text-4xl">
              My Account
            </h1>

            <p className="mt-2 text-sm text-gray-400">
              Manage your wallet and get support.
            </p>
          </div>

          <Link
            href="/"
            aria-label="Return to homepage"
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white transition hover:bg-white/10"
          >
            <Home size={20} />
          </Link>
        </div>

        {/* Wallet section */}
        <section className="section mb-6 rounded-2xl border border-white/10 p-5 sm:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-400/10 text-yellow-400">
              <Wallet size={24} />
            </div>

            <div>
              <h2 className="text-xl font-bold text-white">
                My Wallet
              </h2>

              <p className="mt-1 text-sm text-gray-400">
                Deposit or request a withdrawal through Telegram.
              </p>
            </div>
          </div>

          {/* Deposit and Withdraw */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <a
              href={DEPOSIT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="button button-gold flex min-h-14 items-center justify-center gap-3 rounded-xl px-5 py-4 font-bold transition hover:opacity-90"
            >
              <ArrowDownToLine size={20} />
              <span>Deposit</span>
            </a>

            <a
              href={WITHDRAW_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="button button-outline flex min-h-14 items-center justify-center gap-3 rounded-xl px-5 py-4 font-bold transition hover:opacity-90"
            >
              <ArrowUpFromLine size={20} />
              <span>Withdraw</span>
            </a>
          </div>

          <div className="mt-5 rounded-xl border border-white/10 bg-black/20 p-4">
            <p className="text-sm leading-6 text-gray-400">
              Tap Deposit to contact support and claim the 200% bonus.
              Tap Withdraw to request a withdrawal of your funds.
            </p>
          </div>
        </section>

        {/* Support section */}
        <section className="section rounded-2xl border border-white/10 p-5 sm:p-8">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
              <Headphones size={24} />
            </div>

            <div className="flex-1">
              <h2 className="font-bold text-white">
                Need Help?
              </h2>

              <p className="mt-1 text-sm text-gray-400">
                Contact RoyalBet support on Telegram.
              </p>
            </div>

            <a
              href={TELEGRAM_SUPPORT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="button button-outline rounded-lg px-4 py-2 text-sm font-semibold"
            >
              Contact Support
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}