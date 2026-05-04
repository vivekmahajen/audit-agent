import type { RawTransaction } from '@/types';

export async function parsePDF(_buffer: Buffer): Promise<RawTransaction[]> {
  throw new Error('PDF parsing is not supported yet. Please export a CSV from your bank instead.');
}
