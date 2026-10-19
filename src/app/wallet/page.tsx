"use client";

import { useEffect, useState, type FormEvent } from "react";

type Transaction = {
  id: string;
  type: "DEPOSIT" | "WITHDRAWAL";
  amount: number;
  status: string;
  note: string | null;
  createdAt: string;
};

const TELEGRAM_URL = "https://t.me/RoyalBetPayments";

export default function WalletPage() {
  const [type, setType] = useState<"DEPOSIT" | "WITHDRAWAL">("DEPOSIT");

  const [amount, setAmount] = useState("100");
  const [note, setNote] = useState("");
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadTransactions() {
    try {
      const response = await fetch("/api/transactions", {
        method: "GET",
        cache: "no-store",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Unable to load your wallet.");
        return;
      }

      setBalance(Number(data.balance ?? 0));
      setTransactions(data.transactions ?? []);
      setError("");
    } catch {
      setError("Unable to connect. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (params.get("type") === "WITHDRAWAL") {
      setType("WITHDRAWAL");
    } else {
      setType("DEPOSIT");
    }

    void loadTransactions();
  }, []);

  function switchType(nextType: "DEPOSIT" | "WITHDRAWAL") {
    setType(nextType);
    setMessage("");
    setError("");

    const url = new URL(window.location.href);
    url.searchParams.set("type", nextType);
    window.history.replaceState({}, "", url.toString());
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setMessage("");

    const numericAmount = Number(amount);

    if (
      !Number.isFinite(numericAmount) ||
      numericAmount <= 0 ||
      numericAmount > 1_000_000
    ) {
      setError("Enter an amount greater than zero, up to 1,000,000 USDT.");
      return;
    }

    if (numericAmount > balance) {
      setError("Your recorded balance is insufficient for this withdrawal.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "WITHDRAWAL",
          amount: numericAmount,
          note: note.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Unable to submit your withdrawal request.");
        return;
      }

      setMessage(
        data.message ||
          "Your withdrawal request has been submitted for administrator review."
      );

      setNote("");
      setAmount("");
      await loadTransactions();
    } catch {
      setError("A connection error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#080b09] px-4 py-8 text-[#f5f2e9] sm:px-8 sm:py-10">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <header className="mb-9">
          <a
            href="/casino"
            className="inline-flex items-center gap-2 text-xl font-black tracking-tight"
          >
            ROYAL<span className="text-[#42dc91]">BET</span>
          </a>

          <div className="mt-9">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-[#d6b56d]">
              Your account · Wallet
            </p>

            <h1 className="text-4xl font-black tracking-tight sm:text-6xl">
              Your USDT Wallet
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/55 sm:text-base">
              Manage your wallet, contact payment support, and keep track
              of your account transactions.
            </p>
          </div>
        </header>

        {/* Balance card */}
        <section className="relative mb-7 overflow-hidden rounded-3xl border border-[#d6b56d]/40 bg-gradient-to-br from-[#193b29] via-[#11271a] to-[#0d110e] p-6 sm:p-9">
          <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full border border-[#42dc91]/15" />

          <div className="pointer-events-none absolute -right-8 -top-12 h-48 w-48 rounded-full border border-[#42dc91]/10" />

          <div className="relative">
            <div className="flex items-center justify-between gap-4">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/55">
                Recorded balance
              </p>

              <span className="rounded-full border border-[#42dc91]/25 bg-[#42dc91]/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#67e9a7]">
                USDT Wallet
              </span>
            </div>

            <p className="mt-6 break-words text-4xl font-black tracking-tight text-[#f1d68e] sm:text-6xl">
              {loading
                ? "Loading..."
                : `${balance.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })} USDT`}
            </p>

            <p className="mt-4 max-w-xl text-sm leading-7 text-white/55">
              Your recorded account balance. Pending requests do not
              automatically transfer funds.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-2 text-xs text-white/65">
              <span className="text-[#f1d68e]">◆</span>
              Account records and manual payment verification
            </div>
          </div>
        </section>

        {/* Deposit / Withdrawal selection */}
        <div className="mb-7 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => switchType("DEPOSIT")}
            className={`min-h-14 rounded-xl px-3 py-4 text-sm font-extrabold transition ${
              type === "DEPOSIT"
                ? "bg-gradient-to-r from-[#f1d68e] to-[#d6b56d] text-black shadow-lg shadow-yellow-900/10"
                : "border border-white/10 bg-[#111511] text-white/70 hover:border-[#d6b56d]/50"
            }`}
          >
            ↓ Deposit USDT
          </button>

          <button
            type="button"
            onClick={() => switchType("WITHDRAWAL")}
            className={`min-h-14 rounded-xl px-3 py-4 text-sm font-extrabold transition ${
              type === "WITHDRAWAL"
                ? "bg-gradient-to-r from-[#f1d68e] to-[#d6b56d] text-black shadow-lg shadow-yellow-900/10"
                : "border border-white/10 bg-[#111511] text-white/70 hover:border-[#d6b56d]/50"
            }`}
          >
            ↑ Withdraw USDT
          </button>
        </div>

        {/* Deposit: Telegram support only */}
        {type === "DEPOSIT" && (
          <section className="mb-8 overflow-hidden rounded-3xl border border-[#31563c] bg-gradient-to-br from-[#121c15] to-[#0c100d]">
            <div className="border-b border-white/[0.07] p-6 sm:p-8">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#42dc91]">
                RoyalBet Payments
              </p>

              <h2 className="mt-4 text-2xl font-black sm:text-3xl">
                Deposit USDT
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-7 text-white/55">
                To deposit funds into your RoyalBet account, contact our
                payment support team on Telegram. They will guide you
                through the deposit process.
              </p>
            </div>

            <div className="p-6 sm:p-8">
              <div className="rounded-2xl border border-[#42dc91]/20 bg-[#42dc91]/[0.045] p-5 sm:p-7">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#42dc91]/20 bg-[#42dc91]/10 text-2xl text-[#42dc91]">
                    ↗
                  </div>

                  <div>
                    <h3 className="text-lg font-bold">
                      Need to make a deposit?
                    </h3>

                    <p className="mt-2 text-sm leading-7 text-white/55">
                      Chat with RoyalBet Payments to receive deposit
                      instructions and assistance with your payment.
                    </p>
                  </div>
                </div>

                <a
                  href={TELEGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 flex min-h-14 w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-[#f1d68e] to-[#d6b56d] px-5 py-4 text-center font-extrabold text-[#151108] transition hover:brightness-110"
                >
                  Contact Support on Telegram
                  <span aria-hidden="true">↗</span>
                </a>

                <p className="mt-4 text-center text-xs leading-6 text-white/40">
                  Always verify payment instructions before sending funds.
                  Your account should only be credited after payment
                  verification.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Withdrawal: form remains available */}
        {type === "WITHDRAWAL" && (
          <section className="mb-8 rounded-3xl border border-white/10 bg-[#111511] p-5 sm:p-8">
            <div className="mb-7">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#d6b56d]">
                Account services
              </p>

              <h2 className="mt-3 text-2xl font-black sm:text-3xl">
                Withdrawal request
              </h2>

              <p className="mt-3 text-sm leading-7 text-white/55">
                Submit a withdrawal request for administrator review.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="amount"
                  className="mb-2 block text-sm font-semibold text-white/80"
                >
                  Amount (USDT)
                </label>

                <div className="flex min-h-14 items-center rounded-xl border border-white/15 bg-[#080b09] focus-within:border-[#d6b56d]">
                  <input
                    id="amount"
                    name="amount"
                    type="number"
                    inputMode="decimal"
                    min="0.01"
                    max="1000000"
                    step="any"
                    required
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                    placeholder="Enter amount"
                    className="min-w-0 flex-1 bg-transparent px-4 py-4 text-base text-white outline-none"
                  />

                  <span className="px-4 text-xs font-bold text-[#d6b56d]">
                    USDT
                  </span>
                </div>

                <p className="mt-2 text-xs text-white/40">
                  Recorded balance:{" "}
                  {balance.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{" "}
                  USDT
                </p>
              </div>

              <div>
                <label
                  htmlFor="note"
                  className="mb-2 block text-sm font-semibold text-white/80"
                >
                  Reference or note (optional)
                </label>

                <input
                  id="note"
                  name="note"
                  type="text"
                  maxLength={300}
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="Enter a short note"
                  className="min-h-14 w-full rounded-xl border border-white/15 bg-[#080b09] px-4 py-4 text-base text-white outline-none focus:border-[#d6b56d]"
                />
              </div>

              <div className="rounded-xl border border-[#d6b56d]/20 bg-[#d6b56d]/[0.05] p-4 text-xs leading-6 text-white/60">
                Submitting a withdrawal request does not automatically
                transfer funds. An administrator must review and process
                your request.
              </div>

              {error && (
                <div
                  role="alert"
                  className="break-words rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300"
                >
                  {error}
                </div>
              )}

              {message && (
                <div
                  role="status"
                  className="break-words rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-sm text-green-300"
                >
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || loading}
                className="min-h-14 w-full rounded-xl bg-gradient-to-r from-[#f1d68e] to-[#d6b56d] px-5 py-4 font-extrabold text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting
                  ? "Submitting request..."
                  : "Submit withdrawal request →"}
              </button>
            </form>
          </section>
        )}

        {/* Transaction history */}
        <section className="overflow-hidden rounded-3xl border border-white/10 bg-[#111511]">
          <div className="border-b border-white/[0.07] p-5 sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#d6b56d]">
              Account records
            </p>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-2xl font-black sm:text-3xl">
                Transaction history
              </h2>

              <span className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-xs text-white/50">
                {transactions.length} records
              </span>
            </div>

            <p className="mt-3 text-sm leading-6 text-white/50">
              Review the status of your recorded wallet transactions.
            </p>
          </div>

          {loading ? (
            <p className="p-6 text-sm text-white/50">
              Loading transactions...
            </p>
          ) : transactions.length === 0 ? (
            <div className="p-8 text-center sm:p-12">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-2xl text-[#d6b56d]">
                ◈
              </div>

              <h3 className="mt-4 font-bold">No transactions found</h3>

              <p className="mt-2 text-sm text-white/45">
                Your recorded wallet transactions will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.07]">
              {transactions.map((transaction) => (
                <article
                  key={transaction.id}
                  className="p-5 transition hover:bg-white/[0.02] sm:p-6"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border text-lg ${
                          transaction.type === "DEPOSIT"
                            ? "border-green-500/20 bg-green-500/10 text-green-300"
                            : "border-[#d6b56d]/20 bg-[#d6b56d]/10 text-[#e6c477]"
                        }`}
                      >
                        {transaction.type === "DEPOSIT" ? "↓" : "↑"}
                      </div>

                      <div className="min-w-0">
                        <p className="font-bold">
                          {transaction.type === "DEPOSIT"
                            ? "Deposit"
                            : "Withdrawal"}
                        </p>

                        <p className="mt-1 text-xs text-white/40">
                          {new Date(
                            transaction.createdAt
                          ).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-bold text-[#f1d68e]">
                        {Number(transaction.amount).toLocaleString(
                          undefined,
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }
                        )}{" "}
                        USDT
                      </p>

                      <span
                        className={`mt-2 inline-block rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${
                          transaction.status.toUpperCase() === "APPROVED" ||
                          transaction.status.toUpperCase() === "COMPLETED"
                            ? "bg-green-500/10 text-green-300"
                            : transaction.status.toUpperCase() === "REJECTED" ||
                                transaction.status.toUpperCase() === "FAILED"
                              ? "bg-red-500/10 text-red-300"
                              : "bg-[#d6b56d]/10 text-[#e6c477]"
                        }`}
                      >
                        {transaction.status}
                      </span>
                    </div>
                  </div>

                  {transaction.note && (
                    <p className="mt-4 break-words rounded-lg bg-black/20 p-3 text-sm leading-6 text-white/50">
                      {transaction.note}
                    </p>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Footer */}
        <footer className="py-8 text-center text-xs leading-6 text-white/30">
          <p className="font-bold tracking-[0.2em] text-white/50">
            ROYALBET
          </p>

          <p className="mt-2">
            Wallet services · Verify payment instructions before sending funds.
          </p>

          <a
            href={TELEGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block text-[#d6b56d] hover:text-[#f1d68e]"
          >
            RoyalBet Payments on Telegram ↗
          </a>
        </footer>
      </div>
    </main>
  );
}