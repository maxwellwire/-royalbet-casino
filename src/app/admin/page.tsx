"use client";

import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Gift, RefreshCw, ShieldCheck } from "lucide-react";

type Transaction = {
  id: string;
  userId: string;
  username: string | null;
  email: string;
  balance: number;
  type: string;
  amount: number;
  status: string;
  note: string | null;
  createdAt: string;
};

type User = {
  id: string;
  username: string | null;
  email: string;
  role: string;
  balance: number;
  createdAt: string;
};

export default function AdminPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [userId, setUserId] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("Community giveaway reward");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [transactionResponse, userResponse] = await Promise.all([
        fetch("/api/admin/transactions", { cache: "no-store" }),
        fetch("/api/admin/users", { cache: "no-store" }),
      ]);

      const transactionData = await transactionResponse.json();
      const userData = await userResponse.json();

      if (!transactionResponse.ok) {
        throw new Error(transactionData.error || "Admin access required.");
      }

      if (!userResponse.ok) {
        throw new Error(userData.error || "Could not load users.");
      }

      setTransactions(transactionData.transactions || []);
      setUsers(userData.users || []);

      if (!userId && userData.users?.length) {
        setUserId(userData.users[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load admin panel.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function review(id: string, action: "APPROVE" | "REJECT") {
    setBusy(id);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/admin/transactions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Review failed.");
      }

      setMessage(data.message);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Review failed.");
    } finally {
      setBusy("");
    }
  }

  async function reward(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy("reward");
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          amount: Number(amount),
          note,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to credit reward.");
      }

      setMessage(data.message);
      setAmount("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to credit reward.");
    } finally {
      setBusy("");
    }
  }

  return (
    <main className="page-container" style={{ maxWidth: 1200, minHeight: "70vh" }}>
      <div className="page-heading">
        <div className="eyebrow">
          <ShieldCheck size={15} /> ADMIN CONTROL
        </div>
        <h1>
          ROYALBET <span className="gold-text">ADMIN</span>
        </h1>
        <p>Review requests and issue community giveaway rewards.</p>
      </div>

      {error && <p role="alert" style={{ color: "#ff8f8f" }}>{error}</p>}
      {message && <p role="status" style={{ color: "#9de0ad" }}>{message}</p>}

      <section className="section" style={{ marginBottom: 28 }}>
        <div className="section-heading">
          <div>
            <div className="eyebrow"><Gift size={15} /> COMMUNITY REWARDS</div>
            <h2>Credit a USDT giveaway</h2>
          </div>
        </div>

        <form
          onSubmit={reward}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
            gap: 12,
            alignItems: "end",
          }}
        >
          <label>
            Choose user
            <select value={userId} onChange={(event) => setUserId(event.target.value)} required style={inputStyle}>
              <option value="">Select user</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.username || user.email} — {user.balance.toFixed(2)} USDT
                </option>
              ))}
            </select>
          </label>

          <label>
            Reward amount (USDT)
            <input
              style={inputStyle}
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              required
            />
          </label>

          <label>
            Reason
            <input
              style={inputStyle}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              minLength={3}
              maxLength={300}
              required
            />
          </label>

          <button className="button button-gold" disabled={busy === "reward" || !users.length}>
            {busy === "reward" ? "Crediting..." : "Credit giveaway"}
          </button>
        </form>

        <p style={{ fontSize: 13, opacity: 0.75 }}>
          Each reward updates the user's recorded balance and creates a GIVEAWAY
          transaction record.
        </p>
      </section>

      <section className="section">
        <div className="section-heading">
          <div>
            <div className="eyebrow">REQUEST QUEUE</div>
            <h2>Deposits & withdrawals</h2>
          </div>

          <button className="button button-outline" onClick={() => void load()} type="button">
            <RefreshCw size={15} /> Refresh
          </button>
        </div>

        {loading ? (
          <p>Loading admin data...</p>
        ) : transactions.length === 0 ? (
          <div className="empty-state">
            <h3>No transaction requests</h3>
            <p>Requests will appear here when users submit them.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="history-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Current balance</th>
                  <th>Status</th>
                  <th>Note</th>
                  <th>Requested</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>
                      {transaction.username || transaction.email}
                      <br />
                      <small>{transaction.email}</small>
                    </td>
                    <td>{transaction.type}</td>
                    <td>{transaction.amount.toFixed(2)} USDT</td>
                    <td>{transaction.balance.toFixed(2)} USDT</td>
                    <td>{transaction.status}</td>
                    <td>{transaction.note || "—"}</td>
                    <td>{new Date(transaction.createdAt).toLocaleString()}</td>
                    <td>
                      {transaction.status === "PENDING" ? (
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            className="button button-gold"
                            disabled={Boolean(busy)}
                            onClick={() => void review(transaction.id, "APPROVE")}
                          >
                            {busy === transaction.id ? "..." : "Approve"}
                          </button>

                          <button
                            className="button button-outline"
                            disabled={Boolean(busy)}
                            onClick={() => void review(transaction.id, "REJECT")}
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        "Reviewed"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  minWidth: 0,
  marginTop: 7,
  padding: 12,
  border: "1px solid rgba(255,255,255,.15)",
  borderRadius: 9,
  background: "#101511",
  color: "#fff",
  font: "inherit",
};