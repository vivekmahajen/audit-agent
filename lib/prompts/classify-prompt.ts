import type { RawTransaction } from '@/types';

export const buildClassifyPrompt = (transactions: RawTransaction[]) => `
You are a financial data classifier. Analyze these bank transactions and return structured JSON.

TRANSACTIONS:
${JSON.stringify(transactions, null, 2)}

For each transaction, determine:
1. is_recurring: Is this a subscription or recurring bill? (true/false)
2. recurrence_cadence: "monthly" | "annual" | "weekly" | "one-time"
3. category: "streaming" | "software" | "gym" | "food" | "utility" | "insurance" | "phone" | "internet" | "news" | "gaming" | "cloud" | "other"
4. merchant_clean: Cleaned merchant name (e.g. "NETFLIX.COM" → "Netflix")
5. ai_verdict: "keep" | "cancel" | "negotiate" | "review"
6. ai_reason: One short sentence explaining the verdict (max 15 words)

VERDICT RULES:
- "cancel": Same merchant charged 2+ times in 30 days, OR no activity in category for 60+ days, OR clearly duplicate service
- "negotiate": Utility, phone, internet, or cable bill over $50/month
- "review": Annual subscription coming up for renewal within 30 days
- "keep": Everything else

Return ONLY a valid JSON array. No explanation, no markdown fences.
Example output:
[
  {
    "id": "txn_123",
    "is_recurring": true,
    "recurrence_cadence": "monthly",
    "category": "streaming",
    "merchant_clean": "Netflix",
    "ai_verdict": "keep",
    "ai_reason": "Active streaming service, reasonable price"
  }
]
`;
