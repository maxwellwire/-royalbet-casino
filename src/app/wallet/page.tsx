"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  Wallet as WalletIcon,
} from "lucide-react";

type Transaction = {
  id: string;
  type: string;
  amount: number;
  status: string;
  note: string | null;
  reference: string | null;
  createdAt: string;
};

export default function WalletPage() {
  const [balance, setBalance] = useState(0);
  const [items, setItems] = useState<Transaction[]>([]);
  const [type, setType] = useState<"DEPOSIT" | "WITHDRAWAL">("DEPOSIT");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/transactions", {
        cache: "no-store",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to load wallet.");
      }

      setBalance(Number(data.balance) || 0);
      setItems(data.transactions || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load wallet."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          type,
          amount: Number(amount),
          note: note.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to submit request.");
      }

      setMessage(data.message || "Request submitted.");
      setAmount("");
      setNote("");
      await load();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to submit request."
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="page-container" style={{ maxWidth: 1100 }}>
      <section className="page-heading">
        <div className="eyebrow">
          <WalletIcon size={16} /> ROYALBET WALLET
        </div>
        <h1>
          YOUR <span className="gold-text">USDT WALLET</span>
        </h1>
        <p>
          Your balance and giveaway rewards are managed by RoyalBet
          administrators. Requests are reviewed manually.
        </p>
      </section>

      <section className="account-grid">
        <article className="balance-card">
          <span>RECORDED BALANCE</span>
          <strong>{balance.toFixed(2)} USDT</strong>
          <small>Admin-managed account balance</small>
        </article>

        <article className="account-info-card">
          <h3>Contact the admin</h3>
          <p>
            Contact the RoyalBet administrator to arrange a deposit or
            discuss a withdrawal request.
          </p>
          <a
            className="button button-gold"
            href="https://t.me/RoyalBetPayments"
            target="_blank"
            rel="noopener noreferrer"
          >
            Contact @RoyalBetPayments
          </a>
        </article>
      </section>

      <section className="section">
        <div className="section-heading">
          <div>
            <div className="eyebrow">WALLET REQUESTS</div>
            <h2>Deposit or withdraw</h2>
          </div>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          <button
            type="button"
            className={`button ${
              type === "DEPOSIT" ? "button-gold" : "button-outline"
            }`}
            onClick={() => setType("DEPOSIT")}
          >
            <ArrowDownLeft size={16} /> Deposit USDT
          </button>

          <button
            type="button"
            className={`button ${
              type === "WITHDRAWAL" ? "button-gold" : "button-outline"
            }`}
            onClick={() => setType("WITHDRAWAL")}
          >
            <ArrowUpRight size={16} /> Withdraw USDT
          </button>
        </div>

        <form onSubmit={submit} style={{ display: "grid", gap: 14, maxWidth: 560, marginTop: 20 }}>
          <label>
            Amount (USDT)
            <input
              type="number"
              min="0.01"
              step="0.01"
              required
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="Enter amount"
              style={inputStyle}
            />
          </label>

          <label>
            Reference or note (optional)
            <input
              value={note}
              onChange={(event) => setNote(event.target.value)}
              maxLength={300}
              placeholder="Transaction reference or a short note"
              style={inputStyle}
            />
          </label>

          <p>
            Submitting this form records a request. It does not transfer
            funds automatically. The administrator must verify and process
            payments manually.
          </p>

          {error && <p role="alert" style={{ color: "#ff8f8f" }}>{error}</p>}
          {message && <p role="status" style={{ color: "#9de0ad" }}>{message}</p>}

          <button className="button button-gold" type="submit" disabled={sending}>
            {sending ? "Submitting..." : `Submit ${type === "DEPOSIT" ? "deposit" : "withdrawal"} request`}
          </button>
        </form>
      </section>

      <section className="section">
        <div className="section-heading">
          <div>
            <div className="eyebrow">ACCOUNT RECORDS</div>
            <h2>Transaction history</h2>
          </div>

          <button className="button button-outline" onClick={() => void load()} type="button">
            <RefreshCw size={15} /> Refresh
          </button>
        </div>

        {loading ? (
          <p>Loading transactions...</p>
        ) : items.length === 0 ? (
          <div className="empty-state">
            <WalletIcon size={32} />
            <h3>No transactions yet</h3>
            <p>Deposits, withdrawals, and giveaway rewards will appear here.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Note</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.type.replace("_", " ")}</td>
                    <td>{item.amount.toFixed(2)} USDT</td>
                    <td>{item.status}</td>
                    <td>{item.note || "—"}</td>
                    <td>{new Date(item.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <p style={{ marginTop: 24 }}>
        <Link className="text-link" href="/casino">
          ← Back to casino
        </Link>
      </p>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  marginTop: 7,
  padding: "13px 14px",
  border: "1px solid rgba(255,255,255,.15)",
  borderRadius: 10,
  background: "#101511",
  color: "#fff",
  font: "inherit",
};