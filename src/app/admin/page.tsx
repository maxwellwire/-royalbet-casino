"use client";

import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { RefreshCw, ShieldCheck, Wallet } from "lucide-react";

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
  name: string | null;
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
  const [search, setSearch] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
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
        throw new Error(
          transactionData.error || "Unable to load transactions."
        );
      }

      if (!userResponse.ok) {
        throw new Error(userData.error || "Unable to load users.");
      }

      setTransactions(transactionData.transactions || []);
      setUsers(userData.users || []);

      setUserId((currentId) => {
        if (userData.users?.some((user: User) => user.id === currentId)) {
          return currentId;
        }

        return userData.users?.[0]?.id || "";
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load admin dashboard."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const selectedUser = users.find((user) => user.id === userId);

  const filteredUsers = users.filter((user) => {
    const query = search.trim().toLowerCase();

    return (
      !query ||
      user.email.toLowerCase().includes(query) ||
      (user.username || "").toLowerCase().includes(query) ||
      user.id.toLowerCase().includes(query)
    );
  });

  async function fundAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!userId) {
      setError("Select a registered user first.");
      return;
    }

    const numericAmount = Number(amount);

    if (
      !Number.isFinite(numericAmount) ||
      numericAmount <= 0 ||
      numericAmount > 1_000_000 ||
      Math.round(numericAmount * 100) !== numericAmount * 100
    ) {
      setError("Enter a valid amount between 0.01 and 1,000,000 USDT.");
      return;
    }

    const confirmed = window.confirm(
      `Credit ${numericAmount.toFixed(2)} USDT to ${selectedUser?.email}?`
    );

    if (!confirmed) return;

    setBusy("fund");
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          amount: numericAmount,
          note: note.trim() || "Admin account funding",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to fund account.");
      }

      setMessage(data.message || "Account funded successfully.");
      setAmount("");
      setNote("");

      await load();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to fund this account."
      );
    } finally {
      setBusy("");
    }
  }

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

      setMessage(data.message || "Transaction reviewed.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Review failed.");
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

        <p>Manage registered users and fund their account balances.</p>
      </div>

      {error && (
        <p role="alert" style={{ color: "#ff8f8f", marginBottom: 16 }}>
          {error}
        </p>
      )}

      {message && (
        <p role="status" style={{ color: "#9de0ad", marginBottom: 16 }}>
          {message}
        </p>
      )}

      <section className="section" style={{ marginBottom: 28 }}>
        <div className="section-heading">
          <div>
            <div className="eyebrow">
              <Wallet size={15} /> ACCOUNT MANAGEMENT
            </div>
            <h2>Fund a User Account</h2>
          </div>
        </div>

        <form
          onSubmit={fundAccount}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
            gap: 16,
            alignItems: "end",
          }}
        >
          <label>
            Search registered users
            <input
              style={inputStyle}
              type="search"
              placeholder="Search email, username or ID"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>

          <label>
            Select user
            <select
              value={userId}
              onChange={(event) => setUserId(event.target.value)}
              required
              style={inputStyle}
            >
              <option value="">Select a registered user</option>

              {filteredUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.email} — {user.balance.toFixed(2)} USDT
                </option>
              ))}
            </select>
          </label>

          <label>
            Amount to add (USDT)
            <input
              style={inputStyle}
              type="number"
              min="0.01"
              max="1000000"
              step="0.01"
              placeholder="Enter amount"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              required
            />
          </label>

          <label>
            Funding note (optional)
            <input
              style={inputStyle}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              maxLength={300}
              placeholder="Account funding"
            />
          </label>

          <button
            className="button button-gold"
            type="submit"
            disabled={Boolean(busy) || !users.length || !userId}
          >
            {busy === "fund" ? "Funding Account..." : "Fund Account"}
          </button>
        </form>

        {selectedUser && (
          <div
            style={{
              marginTop: 20,
              padding: 16,
              borderRadius: 10,
              background: "rgba(255,255,255,.04)",
              overflowWrap: "anywhere",
            }}
          >
            <p>
              <strong>Selected email:</strong> {selectedUser.email}
            </p>
            <p style={{ marginTop: 6 }}>
              <strong>User ID:</strong> {selectedUser.id}
            </p>
            <p style={{ marginTop: 6 }}>
              <strong>Current balance:</strong>{" "}
              {selectedUser.balance.toFixed(2)} USDT
            </p>
            <p style={{ marginTop: 6 }}>
              <strong>Balance after funding:</strong>{" "}
              {(
                selectedUser.balance + (Number(amount) || 0)
              ).toFixed(2)}{" "}
              USDT
            </p>
          </div>
        )}

        <p style={{ fontSize: 13, opacity: 0.75, marginTop: 14 }}>
          Funding increases the selected user&apos;s existing recorded balance
          and creates an ADMIN_CREDIT transaction.
        </p>
      </section>

      <section className="section" style={{ marginBottom: 28 }}>
        <div className="section-heading">
          <div>
            <div className="eyebrow">REGISTERED ACCOUNTS</div>
            <h2>All Users ({users.length})</h2>
          </div>

          <button
            className="button button-outline"
            type="button"
            onClick={() => void load()}
            disabled={loading}
          >
            <RefreshCw size={15} /> Refresh
          </button>
        </div>

        {loading ? (
          <p>Loading registered users...</p>
        ) : users.length === 0 ? (
          <div className="empty-state">
            <h3>No registered users found</h3>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Username</th>
                  <th>User ID</th>
                  <th>Balance</th>
                  <th>Registered</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>{user.email}</td>
                    <td>{user.username || "—"}</td>
                    <td style={{ overflowWrap: "anywhere" }}>{user.id}</td>
                    <td>{user.balance.toFixed(2)} USDT</td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button
                        className="button button-gold"
                        type="button"
                        onClick={() => {
                          setUserId(user.id);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                      >
                        Select User
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredUsers.length === 0 && (
              <p style={{ padding: 16 }}>No users match your search.</p>
            )}
          </div>
        )}
      </section>

      <section className="section">
        <div className="section-heading">
          <div>
            <div className="eyebrow">TRANSACTION MANAGEMENT</div>
            <h2>Deposits & Withdrawals</h2>
          </div>
        </div>

        {loading ? (
          <p>Loading transactions...</p>
        ) : transactions.length === 0 ? (
          <div className="empty-state">
            <h3>No transaction requests</h3>
            <p>Existing requests will appear here.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="history-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Balance</th>
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
                            type="button"
                            disabled={Boolean(busy)}
                            onClick={() =>
                              void review(transaction.id, "APPROVE")
                            }
                          >
                            {busy === transaction.id ? "..." : "Approve"}
                          </button>

                          <button
                            className="button button-outline"
                            type="button"
                            disabled={Boolean(busy)}
                            onClick={() =>
                              void review(transaction.id, "REJECT")
                            }
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