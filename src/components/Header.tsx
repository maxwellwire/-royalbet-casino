import Link from "next/link";
import { Crown } from "lucide-react";

export default function Header() {
  return (
    <header className="site-header">
      <Link href="/" className="brand">
        <span className="brand-icon">
          <Crown size={23} />
        </span>

        <span>
          ROYAL<span className="gold-text">BET</span>
          <small>CASINO</small>
        </span>
      </Link>

      <nav className="main-nav">
        <Link href="/">Home</Link>
        <Link href="/casino">Casino</Link>
        <Link href="/account">Account</Link>
      </nav>

      <div className="header-actions">
        <Link className="button button-outline" href="/login">
          Log in
        </Link>

        <Link className="button button-gold" href="/register">
          Join now
        </Link>
      </div>
    </header>
  );
}