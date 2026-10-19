"use client";

import Link from "next/link";

const TELEGRAM_DEPOSIT_URL =
  "https://t.me/RoyalBetPayments?text=Hi%0AI%20want%20to%20deposit%20and%20claim%20the%20200%25%20bonus";

const TELEGRAM_SUPPORT_URL = "https://t.me/RoyalBetPayments";

export default function WalletPage() {
  return (
    <main className="min-h-screen bg-[#080b09] px-4 py-8 text-white sm:px-6">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="mb-8 inline-flex text-sm text-gray-400 transition hover:text-white"
        >
          ← Back to Home
        </Link>

        <div className="mb-8">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.3em] text-emerald-400">
            RoyalBet Casino
          </p>

          <h1 className="text-3xl font-black sm:text-4xl">
            Your Wallet
          </h1>

          <p className="mt-3 text-sm leading-6 text-gray-400">
            Manage your deposits and withdrawals through RoyalBet support.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#111713] p-5 sm:p-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold">
              Wallet Assistance
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-400">
              Click Deposit to contact our team on Telegram and request your
              deposit with the 200% bonus.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* DEPOSIT */}
            <a
              href={TELEGRAM_DEPOSIT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-32 flex-col justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5 transition hover:border-emerald-400 hover:bg-emerald-500/20"
            >
              <span className="text-lg font-bold text-emerald-400">
                Deposit
              </span>

              <span className="mt-2 text-sm text-gray-300">
                Deposit and claim your 200% bonus.
              </span>

              <span className="mt-4 text-sm font-semibold text-white">
                Continue on Telegram →
              </span>
            </a>

            {/* WITHDRAW */}
            <a
              href={TELEGRAM_SUPPORT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-32 flex-col justify-center rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-5 transition hover:border-yellow-400 hover:bg-yellow-500/20"
            >
              <span className="text-lg font-bold text-yellow-400">
                Withdraw
              </span>

              <span className="mt-2 text-sm text-gray-300">
                Contact support to request a withdrawal.
              </span>

              <span className="mt-4 text-sm font-semibold text-white">
                Contact Support →
              </span>
            </a>
          </div>

          <p className="mt-6 text-center text-xs leading-5 text-gray-500">
            Deposits and withdrawals are subject to verification and approval.
            Contact official support for assistance.
          </p>
        </div>
      </div>
    </main>
  );
}