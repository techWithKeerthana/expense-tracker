export type UpiApp = 'googlepay' | 'phonepe' | 'paytm';

export interface ParsedUpiNotification {
  amount: number;
  direction: 'debit' | 'credit';
  counterparty: string;
  app: UpiApp;
}

// Android package names for the supported UPI apps.
export const UPI_APP_PACKAGES: Record<string, UpiApp> = {
  'com.google.android.apps.nbu.paisa.user': 'googlepay',
  'com.phonepe.app': 'phonepe',
  'net.one97.paytm': 'paytm',
};

const AMOUNT = '(?:₹|Rs\\.?|INR)\\s*([\\d,]+(?:\\.\\d{1,2})?)';
// Capture at most 4 words so trailing sentence text doesn't get swallowed into
// the merchant/payee name; combined with a stop-word list for common trailing terms.
// Periods are deliberately excluded from the word charset so they always act as terminators.
const NAME = "([A-Za-z0-9&'-]+(?:\\s[A-Za-z0-9&'-]+){0,3}?)";
const STOP =
  '(?:\\s+(?:using|via|from|on|through|successfully|successful|success|done|completed|complete|now|today)\\b|[!.\\n]|$)';

/**
 * Ordered, best-effort regex patterns per app. Each entry: [regex, direction].
 * Patterns are based on commonly documented UPI notification phrasing and were
 * NOT independently verified against a live current notification in this session
 * — see README's Smart Transaction Import section for what to check on a real device.
 */
const PATTERNS: Record<UpiApp, { regex: RegExp; direction: 'debit' | 'credit' }[]> = {
  googlepay: [
    { regex: new RegExp(`you\\s+paid\\s+${AMOUNT}\\s+to\\s+${NAME}${STOP}`, 'i'), direction: 'debit' },
    { regex: new RegExp(`paid\\s+${AMOUNT}\\s+to\\s+${NAME}${STOP}`, 'i'), direction: 'debit' },
    { regex: new RegExp(`${NAME}\\s+paid\\s+you\\s+${AMOUNT}`, 'i'), direction: 'credit' },
    { regex: new RegExp(`you\\s+received\\s+${AMOUNT}\\s+from\\s+${NAME}${STOP}`, 'i'), direction: 'credit' },
  ],
  phonepe: [
    { regex: new RegExp(`paid\\s+${AMOUNT}\\s+to\\s+${NAME}${STOP}`, 'i'), direction: 'debit' },
    { regex: new RegExp(`you\\s+paid\\s+${AMOUNT}\\s+to\\s+${NAME}${STOP}`, 'i'), direction: 'debit' },
    { regex: new RegExp(`you\\s+received\\s+${AMOUNT}\\s+from\\s+${NAME}${STOP}`, 'i'), direction: 'credit' },
    { regex: new RegExp(`received\\s+${AMOUNT}\\s+from\\s+${NAME}${STOP}`, 'i'), direction: 'credit' },
  ],
  paytm: [
    { regex: new RegExp(`money\\s+sent!?.*?${AMOUNT}\\s+to\\s+${NAME}${STOP}`, 'i'), direction: 'debit' },
    { regex: new RegExp(`paid\\s+${AMOUNT}\\s+to\\s+${NAME}${STOP}`, 'i'), direction: 'debit' },
    { regex: new RegExp(`money\\s+received!?.*?${AMOUNT}\\s+from\\s+${NAME}${STOP}`, 'i'), direction: 'credit' },
    { regex: new RegExp(`received\\s+${AMOUNT}\\s+from\\s+${NAME}${STOP}`, 'i'), direction: 'credit' },
  ],
};

// Last-resort fallback if an app-specific pattern doesn't match: just find an
// amount + "to"/"from" so at least the amount and rough direction are captured.
const GENERIC_DEBIT = new RegExp(`${AMOUNT}\\s+to\\s+${NAME}${STOP}`, 'i');
const GENERIC_CREDIT = new RegExp(`${AMOUNT}\\s+from\\s+${NAME}${STOP}`, 'i');

export function parseUpiNotification(app: UpiApp, text: string): ParsedUpiNotification | null {
  const candidates = PATTERNS[app];

  for (const { regex, direction } of candidates) {
    const match = text.match(regex);
    if (match) {
      return {
        amount: Number(match[1].replace(/,/g, '')),
        direction,
        counterparty: match[2].trim(),
        app,
      };
    }
  }

  const debitMatch = text.match(GENERIC_DEBIT);
  if (debitMatch) {
    return { amount: Number(debitMatch[1].replace(/,/g, '')), direction: 'debit', counterparty: debitMatch[2].trim(), app };
  }
  const creditMatch = text.match(GENERIC_CREDIT);
  if (creditMatch) {
    return { amount: Number(creditMatch[1].replace(/,/g, '')), direction: 'credit', counterparty: creditMatch[2].trim(), app };
  }

  return null;
}
