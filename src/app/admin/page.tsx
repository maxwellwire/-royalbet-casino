"use client";

import { useCallback, useEffect, useState } from "react";
import type { FormEvent, CSSProperties } from "react";
import { RefreshCw, ShieldCheck, Wallet } from "lucide-react";

type User = {
  id: string;
  name: string | null;
  username: string | null;
  email: string;
  role: string;
  balance: number;
  createdAt: string;
};

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

type ApiResponse = {
  error?: string;
  message?: string;
  users?: User[];
  transactions?: Transaction[];
  user?: {
    id: string;
    email: string;
    balance: number;
  };
};

const inputStyle: CSSProperties = {
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
  boxSizing: "border-box",
};

const buttonStyle: CSSProperties = {
  minHeight: 42,
};

const MAX_AMOUNT = 1_000_000;

async function readJson(response: Response): Promise<ApiResponse> {
  try {
    return (await response.json()) as ApiResponse;
  } catch {
    return {};
  }
}

function formatAmount(value: number): string {
  return (Number.isFinite(value) ? value : 0).toFixed(2);
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const [userId, setUserId] = useState("");
  const [search, setSearch] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [transactionError, setTransactionError] = useState("");

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    setTransactionError("");

    try {
      const userResponse = await fetch("/api/admin/users", {
        method: "GET",
        cache: "no-store",
        credentials: "same-origin",
      });

      const userData = await readJson(userResponse);

      if (!userResponse.ok) {
        throw new Error(
          userData.error || "Unable to load registered users."
        );
      }

      const loadedUsers: User[] = Array.isArray(userData.users)
        ? userData.users.map((user) => ({
            ...user,
            balance: Number(user.balance) || 0,
          }))
        : [];

      setUsers(loadedUsers);

      setUserId((currentId) => {
        if (loadedUsers.some((user) => user.id === currentId)) {
          return currentId;
        }

        return loadedUsers[0]?.id || "";
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load registered users."
      );
    }

    try {
      const transactionResponse = await fetch(
        "/api/admin/transactions",
        {
          method: "GET",
          cache: "no-store",
          credentials: "same-origin",
        }
      );

      const transactionData = await readJson(transactionResponse);

      if (!transactionResponse.ok) {
        throw new Error(
          transactionData.error || "Unable to load transactions."
        );
      }

      const loadedTransactions: Transaction[] = Array.isArray(
        transactionData.transactions
      )
        ? transactionData.transactions.map((transaction) => ({
            ...transaction,
            amount: Number(transaction.amount) || 0,
            balance: Number(transaction.balance) || 0,
          }))
        : [];

      setTransactions(loadedTransactions);
    } catch (err) {
      setTransactionError(
        err instanceof Error
          ? err.message
          : "Unable to load transactions."
      );

      setTransactions([]);
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
      user.id.toLowerCase().includes(query) ||
      (user.name || "").toLowerCase().includes(query)
    );
  });

  const parsedAmount = Number(amount);

  const validAmount =
    amount.trim() !== "" &&
    Number.isFinite(parsedAmount) &&
    parsedAmount > 0 &&
    parsedAmount <= MAX_AMOUNT &&
    Math.abs(parsedAmount * 100 - Math.round(parsedAmount * 100)) <
      1e-8;

  async function fundAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (busy) {
      return;
    }

    setError("");
    setMessage("");

    if (!userId || !selectedUser) {
      setError("Please select a registered user.");
      return;
    }

    if (!validAmount) {
      setError(
        "Enter a valid amount between 0.01 and 1,000,000 USDT with no more than two decimal places."
      );
      return;
    }

    const amountInCents = Math.round(parsedAmount * 100);
    const normalizedAmount = amountInCents / 100;

    const confirmed = window.confirm(
      `Confirm internal account funding?\n\n` +
        `User: ${selectedUser.email}\n` +
        `Amount: ${formatAmount(normalizedAmount)} USDT\n` +
        `Current balance: ${formatAmount(selectedUser.balance)} USDT\n` +
        `New balance: ${formatAmount(
          selectedUser.balance + normalizedAmount
        )} USDT\n\n` +
        `This changes the RoyalBet database balance. It does not send cryptocurrency on the blockchain.`
    );

    if (!confirmed) {
      return;
    }

    setBusy("fund");

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({
          userId,
          amount: normalizedAmount,
          note: note.trim() || "Admin account funding",
        }),
      });

      const data = await readJson(response);

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to fund this account."
        );
      }

      setMessage(
        data.message ||
          `${formatAmount(normalizedAmount)} USDT credited successfully.`
      );

      setAmount("");
      setNote("");

      // Refresh balances and transaction history after successful funding.
      await load();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to fund this account."
      );
    } finally {
      setBusy("");
    }
  }

  async function review(
    id: string,
    action: "APPROVE" | "REJECT"
  ) {
    if (busy) {
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to ${action.toLowerCase()} this transaction?`
    );

    if (!confirmed) {
      return;
    }

    setBusy(id);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/admin/transactions", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({
          id,
          action,
        }),
      });

      const data = await readJson(response);

      if (!response.ok) {
        throw new Error(
          data.error || "Transaction review failed."
        );
      }

      setMessage(
        data.message || "Transaction reviewed successfully."
      );

      await load();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Transaction review failed."
      );
    } finally {
      setBusy("");
    }
  }

  return (
    <main
      className="page-container"
      style={{
        maxWidth: 1200,
        minHeight: "70vh",
        paddingBottom: 48,
      }}
    >
      <div className="page-heading">
        <div className="eyebrow">
          <ShieldCheck size={15} /> ADMIN CONTROL
        </div>

        <h1>
          ROYALBET <span className="gold-text">ADMIN</span>
        </h1>

        <p>
          Manage registered users, account balances, deposits, and
          withdrawals.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          style={{
            color: "#ff9b9b",
            background: "rgba(255,70,70,.08)",
            border: "1px solid rgba(255,100,100,.25)",
            padding: 12,
            borderRadius: 9,
            marginBottom: 16,
            overflowWrap: "anywhere",
          }}
        >
          {error}
        </div>
      )}

      {message && (
        <div
          role="status"
          style={{
            color: "#9de0ad",
            background: "rgba(70,200,100,.08)",
            border: "1px solid rgba(100,220,130,.25)",
            padding: 12,
            borderRadius: 9,
            marginBottom: 16,
            overflowWrap: "anywhere",
          }}
        >
          {message}
        </div>
      )}

      {/* ACCOUNT FUNDING */}
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
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 16,
            alignItems: "end",
          }}
        >
          <label>
            Search registered users
            <input
              style={inputStyle}
              type="search"
              placeholder="Search email, username, name or ID"
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
              disabled={loading && users.length === 0}
            >
              <option value="">Select a registered user</option>

              {filteredUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.email} — {formatAmount(user.balance)} USDT
                </option>
              ))}
            </select>
          </label>

          <label>
            Amount to add (USDT)
            <input
              style={inputStyle}
              type="number"
              inputMode="decimal"
              min="0.01"
              max={MAX_AMOUNT}
              step="0.01"
              placeholder="e.g. 100.00"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              required
            />
          </label>

          <label>
            Funding note (optional)
            <input
              style={inputStyle}
              type="text"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              maxLength={300}
              placeholder="Admin account funding"
            />
          </label>

          <button
            className="button button-gold"
            type="submit"
            style={buttonStyle}
            disabled={
              Boolean(busy) ||
              loading ||
              !users.length ||
              !userId ||
              !validAmount
            }
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
              border: "1px solid rgba(255,255,255,.08)",
              overflowWrap: "anywhere",
              lineHeight: 1.8,
            }}
          >
            <p>
              <strong>Selected email:</strong> {selectedUser.email}
            </p>

            <p>
              <strong>Username:</strong>{" "}
              {selectedUser.username || "—"}
            </p>

            <p>
              <strong>User ID:</strong> {selectedUser.id}
            </p>

            <p>
              <strong>Current balance:</strong>{" "}
              {formatAmount(selectedUser.balance)} USDT
            </p>

            <p>
              <strong>Amount to add:</strong>{" "}
              {formatAmount(validAmount ? parsedAmount : 0)} USDT
            </p>

            <p>
              <strong>Balance after funding:</strong>{" "}
              {formatAmount(
                selectedUser.balance +
                  (validAmount ? parsedAmount : 0)
              )}{" "}
              USDT
            </p>
          </div>
        )}

        <p
          style={{
            fontSize: 13,
            opacity: 0.75,
            marginTop: 14,
            lineHeight: 1.7,
          }}
        >
          Account funding increases the selected user&apos;s existing
          RoyalBet database balance and creates an ADMIN_CREDIT
          transaction record. It does not send an on-chain USDT
          transfer.
        </p>
      </section>

      {/* REGISTERED USERS */}
      <section className="section" style={{ marginBottom: 28 }}>
        <div className="section-heading">
          <div>
            <div className="eyebrow">REGISTERED ACCOUNTS</div>
            <h2>All Users ({users.length})</h2>
          </div>

          <button
            className="button button-outline"
            type="button"
            style={buttonStyle}
            onClick={() => void load()}
            disabled={loading || Boolean(busy)}
          >
            <RefreshCw size={15} />
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {loading && users.length === 0 ? (
          <p>Loading registered users...</p>
        ) : users.length === 0 ? (
          <div className="empty-state">
            <h3>No registered users found</h3>
            {error && <p>Check the error message above.</p>}
          </div>
        ) : (
          <div className="table-wrap">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Username</th>
                  <th>User ID</th>
                  <th>Role</th>
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

                    <td
                      style={{
                        overflowWrap: "anywhere",
                        maxWidth: 200,
                      }}
                    >
                      {user.id}
                    </td>

                    <td>{user.role}</td>

                    <td>{formatAmount(user.balance)} USDT</td>

                    <td>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>

                    <td>
                      <button
                        className="button button-gold"
                        type="button"
                        style={buttonStyle}
                        onClick={() => {
                          setUserId(user.id);
                          window.scrollTo({
                            top: 0,
                            behavior: "smooth",
                          });
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
              <p style={{ padding: 16 }}>
                No users match your search.
              </p>
            )}
          </div>
        )}
      </section>

      {/* TRANSACTION MANAGEMENT */}
      <section className="section">
        <div className="section-heading">
          <div>
            <div className="eyebrow">TRANSACTION MANAGEMENT</div>
            <h2>Deposits &amp; Withdrawals</h2>
          </div>
        </div>

        {transactionError && (
          <div
            role="alert"
            style={{
              color: "#ff9b9b",
              marginBottom: 16,
              overflowWrap: "anywhere",
            }}
          >
            {transactionError}
          </div>
        )}

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

                    <td>{formatAmount(transaction.amount)} USDT</td>

                    <td>{formatAmount(transaction.balance)} USDT</td>

                    <td>{transaction.status}</td>

                    <td>{transaction.note || "—"}</td>

                    <td>
                      {new Date(
                        transaction.createdAt
                      ).toLocaleString()}
                    </td>

                    <td>
                      {transaction.status === "PENDING" ? (
                        <div
                          style={{
                            display: "flex",
                            gap: 6,
                            flexWrap: "wrap",
                          }}
                        >
                          <button
                            className="button button-gold"
                            type="button"
                            style={buttonStyle}
                            disabled={Boolean(busy)}
                            onClick={() =>
                              void review(transaction.id, "APPROVE")
                            }
                          >
                            {busy === transaction.id
                              ? "Processing..."
                              : "Approve"}
                          </button>

                          <button
                            className="button button-outline"
                            type="button"
                            style={buttonStyle}
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