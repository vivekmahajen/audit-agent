import type { RawTransaction } from '@/types';

// Regex patterns for common bank statement line formats
const LINE_PATTERNS = [
  // Chase: "01/15/2024 NETFLIX.COM 13.99"
  /^(\d{2}\/\d{2}\/\d{4})\s+(.+?)\s+([-$]?\d+\.\d{2})\s*$/,
  // Bank of America: "01/15 NETFLIX.COM 13.99"
  /^(\d{2}\/\d{2})\s+(.+?)\s+([-$]?\d+\.\d{2})\s*$/,
  // Generic: "2024-01-15 Netflix 13.99"
  /^(\d{4}-\d{2}-\d{2})\s+(.+?)\s+([-$]?\d+\.\d{2})\s*$/,
];

function parseAmountFromText(raw: string): number {
  const cleaned = raw.replace(/[$,\s]/g, '');
  const num = parseFloat(cleaned);
  return Math.abs(isNaN(num) ? 0 : num);
}

function parseDateFromText(raw: string, currentYear?: number): string {
  const year = currentYear ?? new Date().getFullYear();
  const full = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (full) return `${full[3]}-${full[1]}-${full[2]}`;
  const short = raw.match(/^(\d{2})\/(\d{2})$/);
  if (short) return `${year}-${short[1]}-${short[2]}`;
  const iso = raw.match(/^(\d{4}-\d{2}-\d{2})$/);
  if (iso) return iso[1];
  return new Date().toISOString().split('T')[0];
}

export async function parsePDF(buffer: Buffer): Promise<RawTransaction[]> {
  // Use require for pdf-parse to avoid ESM/CJS issues
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdfParse = require('pdf-parse') as (buf: Buffer) => Promise<{ text: string }>;
  const data = await pdfParse(buffer);
  const text = data.text;

  const lines = text.split('\n').map((l: string) => l.trim()).filter(Boolean);
  const transactions: RawTransaction[] = [];
  const currentYear = new Date().getFullYear();

  for (const line of lines) {
    for (const pattern of LINE_PATTERNS) {
      const match = line.match(pattern);
      if (match) {
        const [, rawDate, merchant, rawAmount] = match;
        const amount = parseAmountFromText(rawAmount);
        if (amount === 0) break;

        transactions.push({
          id: `txn_${Math.random().toString(36).slice(2)}`,
          date: parseDateFromText(rawDate, currentYear),
          merchant: merchant.trim(),
          amount,
          raw_description: merchant.trim(),
        });
        break;
      }
    }
  }

  return transactions;
}
