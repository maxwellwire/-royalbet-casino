"use client";

import Link from "next/link";

const SUPPORT_URL = "https://t.me/RoyalBetPayments";

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
            Need to deposit or withdraw? Contact our support team directly.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#111713] p-5 sm:p-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold">
              Wallet Assistance
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-400">
              All deposits and withdrawals are handled through RoyalBet
              Payments support. Select an option below to contact our team.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <a
              href={SUPPORT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-32 flex-col justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5 transition hover:border-emerald-400 hover:bg-emerald-500/20"
            >
              <span className="text-lg font-bold text-emerald-400">
                Deposit
              </span>

              <span className="mt-2 text-sm text-gray-300">
                Contact support to request a deposit.
              </span>

              <span className="mt-4 text-sm font-semibold text-white">
                Contact Support →
              </span>
            </a>

            <a
              href={SUPPORT_URL}
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

          <a
            href={SUPPORT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 flex min-h-12 w-full items-center justify-center rounded-xl bg-emerald-500 px-5 py-3 font-bold text-black transition hover:bg-emerald-400"
          >
            Open RoyalBet Payments on Telegram
          </a>

          <p className="mt-4 text-center text-xs leading-5 text-gray-500">
            Contact support for assistance with your wallet. Deposits and
            withdrawals are subject to verification and approval.
          </p>
        </div>
      </div>
    </main>
  );
}