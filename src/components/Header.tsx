import Link from "next/link";
import { Crown, UserRound, LogOut, Gamepad2 } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function Header() {
  const user = await getCurrentUser();

  return (
    <header className="site-header">
      <Link
        href="/"
        className="brand"
        aria-label="RoyalBet home"
      >
        <span className="brand-icon">
          <Crown size={23} />
        </span>

        <span>
          ROYAL<span className="gold-text">BET</span>
          <small>CASINO</small>
        </span>
      </Link>

      <div className="header-actions">
        {user ? (
          <>
            <Link
              href="/casino"
              className="button button-gold royal-header-play"
            >
              <Gamepad2 size={16} />
              Play
            </Link>

            <details className="profile-menu">
              <summary
                className="profile-trigger"
                aria-label="Open profile menu"
                title="Your profile"
              >
                <UserRound size={21} />
              </summary>

              <div className="profile-dropdown">
                <div className="profile-heading">
                  <span className="profile-avatar">
                    <UserRound size={22} />
                  </span>

                  <div>
                    <strong>
                      {user.username || user.name || "Player"}
                    </strong>
                    <span>My Profile</span>
                  </div>
                </div>

                <div className="profile-details">
                  <span>USERNAME</span>
                  <p>
                    {user.username || user.name || "Not set"}
                  </p>

                  <span>EMAIL ADDRESS</span>
                  <p className="profile-email">
                    {user.email || "Not available"}
                  </p>
                </div>

                <Link
                  href="/account"
                  className="profile-account-link"
                >
                  View Account
                </Link>

                <form action="/api/auth/logout" method="post">
                  <button
                    type="submit"
                    className="profile-logout"
                  >
                    <LogOut size={16} />
                    Log out
                  </button>
                </form>
              </div>
            </details>
          </>
        ) : (
          <>
            <Link
              className="button button-outline"
              href="/login"
            >
              Log in
            </Link>

            <Link
              className="button button-gold"
              href="/register"
            >
              Join now
            </Link>
          </>
        )}
      </div>

      <style>{`
        .royal-header-play {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          text-decoration: none;
        }

        @media (max-width: 420px) {
          .royal-header-play {
            padding-left: 10px;
            padding-right: 10px;
            font-size: 12px;
          }
        }
      `}</style>
    </header>
  );
}