"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Crown } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username,
          email,
          password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Registration failed.");
        return;
      }

      router.push("/account");
      router.refresh();
    } catch {
      setError("Connection problem. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <div className="auth-icon"><Crown size={32} /></div>

        <div className="eyebrow">BECOME A MEMBER</div>
        <h1>JOIN ROYALBET</h1>

        <p className="auth-description">
          Create your account and receive 1,000 virtual credits
          to explore the game interface.
        </p>

        <label htmlFor="username">Username</label>
        <input
          id="username"
          autoComplete="username"
          minLength={3}
          maxLength={20}
          pattern="[A-Za-z0-9_]+"
          required
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          placeholder="Choose a username"
        />

        <label htmlFor="email">Email address</label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          minLength={12}
          maxLength={128}
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="At least 12 characters"
        />

        {error && <div className="form-error">{error}</div>}

        <button
          className="button button-gold button-full"
          type="submit"
          disabled={loading}
        >
          {loading ? "Creating account..." : "Create account"}
        </button>

        <p className="auth-switch">
          Already a member? <Link href="/login">Log in</Link>
        </p>
      </form>
    </div>
  );
}