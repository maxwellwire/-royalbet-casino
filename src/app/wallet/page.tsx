"use client";

import Link from "next/link";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeft,
  ShieldCheck,
  Headset,
  Crown,
  Sparkles,
  Send,
  Wallet,
  CheckCircle2,
} from "lucide-react";

const TELEGRAM_USERNAME = "RoyalBetPayments";

const TELEGRAM_URL = `https://t.me/${TELEGRAM_USERNAME}`;

const DEPOSIT_MESSAGE =
  "Hi\nI want to deposit and claim the 200% bonus";

const WITHDRAW_MESSAGE =
  "Hi\nI want to withdraw my funds";

const DEPOSIT_URL =
  `${TELEGRAM_URL}?text=${encodeURIComponent(DEPOSIT_MESSAGE)}`;

const WITHDRAW_URL =
  `${TELEGRAM_URL}?text=${encodeURIComponent(WITHDRAW_MESSAGE)}`;

export default function WalletPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#070907] text-white">
      {/* Background Effects */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 top-20 h-80 w-80 rounded-full bg-yellow-500/[0.07] blur-[120px]" />

        <div className="absolute -right-40 top-96 h-96 w-96 rounded-full bg-emerald-500/[0.06] blur-[140px]" />

        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(234,179,8,0.05),transparent_55%)]" />
      </div>

      <div className="relative mx-auto min-h-screen w-full max-w-6xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">

        {/* Navigation */}
        <header className="mb-10 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-3"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-yellow-400/30 bg-yellow-400/10">
              <Crown
                size={23}
                className="text-yellow-400"
              />
            </div>

            <div>
              <p className="text-lg font-black tracking-[0.15em]">
                ROYAL<span className="text-yellow-400">BET</span>
              </p>

              <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-gray-500">
                Premium Casino
              </p>
            </div>
          </Link>

          <Link
            href="/account"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-gray-300 transition hover:border-yellow-400/30 hover:text-white"
          >
            <ArrowLeft size={16} />
            <span>My Account</span>
          </Link>
        </header>

        {/* Page Heading */}
        <section className="mb-10 text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-yellow-400/20 bg-yellow-400/[0.06] px-4 py-2">
            <Wallet
              size={15}
              className="text-yellow-400"
            />

            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-yellow-300">
              Wallet Center
            </span>
          </div>

          <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
            Manage Your{" "}
            <span className="bg-gradient-to-r from-yellow-200 via-yellow-400 to-amber-600 bg-clip-text text-transparent">
              Funds
            </span>
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-gray-400 sm:text-base">
            Your wallet, your control. Choose a transaction below
            to connect with the RoyalBet payments team securely
            through Telegram.
          </p>
        </section>

        {/* Wallet Status Card */}
        <section className="mx-auto mb-8 max-w-4xl">
          <div className="relative overflow-hidden rounded-2xl border border-yellow-400/20 bg-gradient-to-br from-[#211b0b] via-[#15160f] to-[#0d120e] p-6 sm:p-8">
            <div className="pointer-events-none absolute -right-10 -top-20 h-64 w-64 rounded-full border border-yellow-400/[0.08]" />

            <div className="pointer-events-none absolute -right-2 -top-12 h-48 w-48 rounded-full border border-yellow-400/[0.08]" />

            <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <ShieldCheck
                    size={18}
                    className="text-yellow-400"
                  />

                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
                    RoyalBet Payments
                  </span>
                </div>

                <h2 className="text-2xl font-bold sm:text-3xl">
                  Your Wallet Center
                </h2>

                <p className="mt-2 max-w-lg text-sm leading-6 text-gray-400">
                  Deposits and withdrawals are handled through
                  our Telegram support channel.
                </p>
              </div>

              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-yellow-400/20 bg-yellow-400/10">
                <Wallet
                  size={32}
                  className="text-yellow-400"
                />
              </div>
            </div>

            <div className="relative mt-6 flex flex-wrap gap-x-5 gap-y-3 border-t border-white/[0.08] pt-5">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <CheckCircle2
                  size={15}
                  className="text-emerald-400"
                />
                Direct support
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-400">
                <CheckCircle2
                  size={15}
                  className="text-emerald-400"
                />
                Deposit assistance
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-400">
                <CheckCircle2
                  size={15}
                  className="text-emerald-400"
                />
                Withdrawal requests
              </div>
            </div>
          </div>
        </section>

        {/* Transaction Cards */}
        <section className="mx-auto max-w-4xl">
          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-gray-500">
              Wallet Services
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              Choose a Transaction
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Select an option to continue to Telegram.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">

            {/* DEPOSIT CARD */}
            <article className="group relative overflow-hidden rounded-2xl border border-emerald-400/20 bg-gradient-to-br from-[#101c15] to-[#0c110e] p-6 transition duration-300 hover:-translate-y-1 hover:border-emerald-400/50 hover:shadow-[0_15px_50px_rgba(16,185,129,0.08)] sm:p-8">
              <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-emerald-400/[0.06] blur-2xl transition group-hover:bg-emerald-400/10" />

              <div className="relative">
                <div className="mb-6 flex items-start justify-between">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10">
                    <ArrowDownToLine
                      size={27}
                      className="text-emerald-400"
                    />
                  </div>

                  <span className="rounded-full border border-yellow-400/20 bg-yellow-400/[0.07] px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-yellow-300">
                    200% Bonus
                  </span>
                </div>

                <h3 className="text-2xl font-black">
                  Deposit Funds
                </h3>

                <p className="mt-3 text-sm leading-7 text-gray-400">
                  Ready to play? Contact our payments team to
                  arrange your deposit and ask about the
                  200% deposit bonus.
                </p>

                <div className="my-6 rounded-xl border border-emerald-400/10 bg-black/20 p-4">
                  <div className="flex items-center gap-3">
                    <Sparkles
                      size={19}
                      className="shrink-0 text-yellow-400"
                    />

                    <div>
                      <p className="text-sm font-bold text-white">
                        Claim the 200% bonus
                      </p>

                      <p className="mt-1 text-xs leading-5 text-gray-500">
                        Ask support about the applicable
                        bonus terms.
                      </p>
                    </div>
                  </div>
                </div>

                <a
                  href={DEPOSIT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-h-14 w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-emerald-400 to-emerald-500 px-5 py-4 text-sm font-black text-[#06100a] shadow-lg shadow-emerald-500/10 transition hover:brightness-110 active:scale-[0.98]"
                >
                  <Send size={18} />
                  Deposit on Telegram
                  <ArrowDownToLine size={17} />
                </a>

                <p className="mt-4 text-center text-[11px] text-gray-500">
                  Your deposit message will be prepared automatically.
                </p>
              </div>
            </article>

            {/* WITHDRAW CARD */}
            <article className="group relative overflow-hidden rounded-2xl border border-yellow-400/20 bg-gradient-to-br from-[#1d190e] to-[#11100b] p-6 transition duration-300 hover:-translate-y-1 hover:border-yellow-400/50 hover:shadow-[0_15px_50px_rgba(234,179,8,0.07)] sm:p-8">
              <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-yellow-400/[0.06] blur-2xl transition group-hover:bg-yellow-400/10" />

              <div className="relative">
                <div className="mb-6 flex items-start justify-between">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-yellow-400/20 bg-yellow-400/10">
                    <ArrowUpFromLine
                      size={27}
                      className="text-yellow-400"
                    />
                  </div>

                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Withdrawals
                  </span>
                </div>

                <h3 className="text-2xl font-black">
                  Withdraw Funds
                </h3>

                <p className="mt-3 text-sm leading-7 text-gray-400">
                  Want to withdraw your funds? Contact the
                  payments team on Telegram to submit your
                  withdrawal request.
                </p>

                <div className="my-6 rounded-xl border border-yellow-400/10 bg-black/20 p-4">
                  <div className="flex items-center gap-3">
                    <ShieldCheck
                      size={19}
                      className="shrink-0 text-yellow-400"
                    />

                    <div>
                      <p className="text-sm font-bold text-white">
                        Withdrawal assistance
                      </p>

                      <p className="mt-1 text-xs leading-5 text-gray-500">
                        Support can explain the verification
                        and withdrawal process.
                      </p>
                    </div>
                  </div>
                </div>

                <a
                  href={WITHDRAW_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-h-14 w-full items-center justify-center gap-3 rounded-xl border border-yellow-400/30 bg-yellow-400/10 px-5 py-4 text-sm font-black text-yellow-300 transition hover:border-yellow-400/60 hover:bg-yellow-400/15 active:scale-[0.98]"
                >
                  <Send size={18} />
                  Withdraw on Telegram
                  <ArrowUpFromLine size={17} />
                </a>

                <p className="mt-4 text-center text-[11px] text-gray-500">
                  Your withdrawal message will be prepared automatically.
                </p>
              </div>
            </article>
          </div>
        </section>

        {/* Support Footer */}
        <section className="mx-auto mt-8 max-w-4xl">
          <a
            href={TELEGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 transition hover:border-white/15 hover:bg-white/[0.04] sm:flex-row sm:items-center sm:justify-between sm:p-6"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-400/10">
                <Headset
                  size={23}
                  className="text-blue-400"
                />
              </div>

              <div>
                <h3 className="font-bold text-white">
                  Need help with your wallet?
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Contact RoyalBet Payments on Telegram.
                </p>
              </div>
            </div>

            <span className="inline-flex items-center gap-2 text-sm font-bold text-gray-300 transition group-hover:text-yellow-400">
              Contact Support
              <Send size={15} />
            </span>
          </a>
        </section>

        {/* Disclaimer */}
        <footer className="mx-auto mt-8 max-w-4xl border-t border-white/[0.06] pt-6 text-center">
          <div className="mb-3 flex items-center justify-center gap-2 text-gray-500">
            <ShieldCheck size={15} />

            <span className="text-xs font-semibold">
              RoyalBet Wallet Support
            </span>
          </div>

          <p className="mx-auto max-w-2xl text-[11px] leading-6 text-gray-600">
            Deposits and withdrawals are subject to verification,
            applicable terms, and approval. Opening Telegram does
            not automatically process a transaction or change
            your account balance.
          </p>

          <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.25em] text-gray-700">
            ROYALBET · PREMIUM CASINO
          </p>
        </footer>
      </div>
    </main>
  );
}