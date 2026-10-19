export const TELEGRAM_USERNAME = "RoyalBetPayments";

export const TELEGRAM_SUPPORT_URL =
  `https://t.me/${TELEGRAM_USERNAME}`;

export const TELEGRAM_DEPOSIT_MESSAGE =
  "Hi\nI want to deposit and claim the 200% bonus";

export const TELEGRAM_WITHDRAW_MESSAGE =
  "Hi\nI want to withdraw my funds";

export const TELEGRAM_DEPOSIT_URL =
  `${TELEGRAM_SUPPORT_URL}?text=${encodeURIComponent(
    TELEGRAM_DEPOSIT_MESSAGE
  )}`;

export const TELEGRAM_WITHDRAW_URL =
  `${TELEGRAM_SUPPORT_URL}?text=${encodeURIComponent(
    TELEGRAM_WITHDRAW_MESSAGE
  )}`;