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

export default function WalletPage() {
  const [type, setType] = useState<"DEPOSIT" | "WITHDRAWAL">(
    "DEPOSIT"
  );

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
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Unable to load your wallet.");
        return;
      }

      setBalance(Number(data.balance ?? 0));
      setTransactions(data.transactions ?? []);
    } catch {
      setError("Unable to connect. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadTransactions();
  }, []);

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

    if (
      type === "WITHDRAWAL" &&
      numericAmount > balance
    ) {
      setError("Your available balance is insufficient for this withdrawal.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type,
          amount: numericAmount,
          note: note.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Unable to submit your request.");
        return;
      }

      setMessage(
        data.message ||
          "Your request has been submitted for administrator review."
      );

      setNote("");

      await loadTransactions();
    } catch {
      setError("A connection error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#080b09] px-4 py-10 text-[#f5f2e9] sm:px-8">
      <div className="mx-auto max-w-4xl">
        <header className="mb-10">
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.3em] text-[#d6b56d]">
            RoyalBet · Wallet
          </p>

          <h1 className="text-4xl font-bold sm:text-6xl">
            Your USDT Wallet
          </h1>

          <p className="mt-5 max-w-2xl leading-8 text-white/60">
            Submit deposit and withdrawal requests and check their
            status. All requests are reviewed by an administrator.
          </p>
        </header>

        <section className="mb-8 rounded-3xl border border-[#d6b56d]/40 bg-gradient-to-br from-[#193124] to-[#111511] p-6 sm:p-10">
          <p className="text-sm uppercase tracking-[0.25em] text-white/55">
            Recorded balance
          </p>

          <p className="mt-5 text-4xl font-bold text-[#f1d68e] sm:text-6xl">
            {loading ? "Loading..." : `${balance.toFixed(2)} USDT`}
          </p>

          <p className="mt-4 text-sm text-white/55">
            Your recorded account balance. Pending requests do not
            automatically transfer funds.
          </p>
        </section>

        <section className="mb-8 rounded-3xl border border-white/10 bg-[#111511] p-5 sm:p-8">
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                setType("DEPOSIT");
                setMessage("");
                setError("");
              }}
              className={`min-h-14 rounded-xl px-3 py-4 font-bold transition ${
                type === "DEPOSIT"
                  ? "bg-[#e6c477] text-black"
                  : "border border-white/15 text-white"
              }`}
            >
              ↙ Deposit USDT
            </button>

            <button
              type="button"
              onClick={() => {
                setType("WITHDRAWAL");
                setMessage("");
                setError("");
              }}
              className={`min-h-14 rounded-xl px-3 py-4 font-bold transition ${
                type === "WITHDRAWAL"
                  ? "bg-[#e6c477] text-black"
                  : "border border-white/15 text-white"
              }`}
            >
              ↗ Withdraw USDT
            </button>
          </div>

          <h2 className="mt-8 text-2xl font-bold">
            {type === "DEPOSIT"
              ? "Deposit request"
              : "Withdrawal request"}
          </h2>

          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            <div>
              <label
                htmlFor="amount"
                className="mb-2 block text-sm font-medium text-white/80"
              >
                Amount (USDT)
              </label>

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
                className="min-h-14 w-full rounded-xl border border-white/15 bg-[#080b09] px-4 py-4 text-lg text-white outline-none focus:border-[#e6c477]"
              />
            </div>

            <div>
              <label
                htmlFor="note"
                className="mb-2 block text-sm font-medium text-white/80"
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
                placeholder="Transaction reference or a short note"
                className="min-h-14 w-full rounded-xl border border-white/15 bg-[#080b09] px-4 py-4 text-lg text-white outline-none focus:border-[#e6c477]"
              />
            </div>

            <p className="text-sm leading-6 text-white/55">
              Submitting this form records a request. It does not
              transfer funds automatically. The administrator must
              verify and process payments manually.
            </p>

            {error && (
              <div
                role="alert"
                className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300"
              >
                {error}
              </div>
            )}

            {message && (
              <div
                role="status"
                className="rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-sm text-green-300"
              >
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="min-h-14 w-full rounded-xl bg-gradient-to-r from-[#f1d68e] to-[#d6b56d] px-5 py-4 font-bold text-black transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting
                ? "Submitting request..."
                : `Submit ${
                    type === "DEPOSIT" ? "deposit" : "withdrawal"
                  } request`}
            </button>
          </form>

          {type === "DEPOSIT" && (
            <div className="mt-6 rounded-2xl border border-white/10 p-5">
              <h3 className="font-bold">Need help with your deposit?</h3>

              <p className="mt-2 text-sm leading-6 text-white/60">
                Contact RoyalBet Payments for instructions on how
                to arrange your deposit.
              </p>

              <a
                href="https://t.me/RoyalBetPayments"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex min-h-12 items-center justify-center rounded-xl bg-[#e6c477] px-5 py-3 font-bold text-black"
              >
                Contact RoyalBet Payments
              </a>
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-white/10 bg-[#111511] p-5 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#d6b56d]">
            Account records
          </p>

          <h2 className="mt-3 text-3xl font-bold">
            Transaction history
          </h2>

          {loading ? (
            <p className="mt-6 text-white/60">
              Loading transactions...
            </p>
          ) : transactions.length === 0 ? (
            <p className="mt-6 text-white/60">
              No transactions found.
            </p>
          ) : (
            <div className="mt-6 space-y-3">
              {transactions.map((transaction) => (
                <article
                  key={transaction.id}
                  className="rounded-xl border border-white/10 bg-[#080b09] p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-bold">
                        {transaction.type === "DEPOSIT"
                          ? "Deposit"
                          : "Withdrawal"}
                      </p>

                      <p className="mt-1 text-sm text-white/50">
                        {new Date(
                          transaction.createdAt
                        ).toLocaleString()}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-bold text-[#f1d68e]">
                        {transaction.amount.toFixed(2)} USDT
                      </p>

                      <p className="mt-1 text-xs uppercase tracking-wider text-white/50">
                        {transaction.status}
                      </p>
                    </div>
                  </div>

                  {transaction.note && (
                    <p className="mt-3 break-words text-sm text-white/60">
                      {transaction.note}
                    </p>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}