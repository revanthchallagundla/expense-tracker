'use server';

import { db } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';

// If your app type expects date as ISO string, you can keep this local type;
// otherwise use your existing '@/types/Record' and remove this.
type UIRecord = {
  id: string;
  text: string;
  amount: number;
  category: string;
  date: string; // ISO string for the client
};

interface Result {
  records?: UIRecord[];
  error?: string;
}

/**
 * Fetch latest expense records for the current user.
 * Looks up the app User (UUID) by Clerk's clerkUserId, then queries by that UUID.
 */
export default async function getRecords(limit = 10): Promise<Result> {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return { error: 'Not authenticated' };

  // Find the app user row by Clerk id (created earlier via upsert/webhook)
  const appUser = await db.user.findUnique({
    where: { clerkUserId },
    select: { id: true },
  });
  if (!appUser) return { error: 'User not found in database' };

  try {
    const rows = await db.record.findMany({
      where: { userId: appUser.id },   // <-- UUID FK, not Clerk id
      orderBy: { date: 'desc' },
      take: Math.max(1, Math.min(limit, 100)), // safety clamp
      select: {
        id: true,
        text: true,
        amount: true,
        category: true,
        date: true,
      },
    });

    // Serialize Date to ISO string for the client/UI
    const records: UIRecord[] = rows.map(r => ({
      id: r.id,
      text: r.text,
      amount: r.amount,
      category: r.category,
      date: r.date.toISOString(),
    }));

    return { records };
  } catch (err) {
    console.error('Error fetching records:', err);
    return { error: 'Database error while fetching records' };
  }
}
