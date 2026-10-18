# RoyalBet database rollout

1. Back up the production PostgreSQL database before applying schema changes.

2. Set ADMIN_EMAIL in Vercel to the exact email address that should
   administer RoyalBet. Protect this email account.

3. Set TELEGRAM_USERNAME to RoyalBetPayments.

4. Apply the updated Prisma schema using your normal database
   migration workflow after reviewing the schema and backing up the database.

5. Test with a normal account and the configured admin account.

## Existing balances

Changing the Prisma default to zero only affects new users.
It does not reset existing user balances.

If existing balances are demo credits, review them before deciding
whether they should be cleared. Never clear balances without first
backing up the database and confirming that the balances are not
legitimate rewards.

## Payments

This project does not automatically send or receive cryptocurrency.
Deposits and withdrawals are manually reviewed requests.

Every admin-issued giveaway reward should have a corresponding
transaction record.

An approved database request does not itself prove that a
blockchain transfer occurred.