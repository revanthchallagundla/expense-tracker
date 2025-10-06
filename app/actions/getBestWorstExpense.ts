'use server';
import { db } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';

async function getBestWorstExpense(): Promise<{
  bestExpense?: number;
  worstExpense?: number;
  error?: string;
}> {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    return { error: 'User not found' };
  }

  const appUser = await db.user.findUnique({
    where: { clerkUserId },
    select: { id: true }, // UUID
  });
  if (!appUser) return { error: 'User not found in database' };


  try {
    // Fetch all records for the authenticated user
    const records = await db.record.findMany({
      where: { userId: appUser.id }, // <-- UUID, not Clerk id
      select: { amount: true }, // Fetch only the `amount` field for efficiency
    });

    if (!records || records.length === 0) {
      return { bestExpense: 0, worstExpense: 0 }; // Return 0 if no records exist
    }

    const amounts = records.map((record) => record.amount);

    // Calculate best and worst expense amounts
    const bestExpense = Math.max(...amounts); // Highest amount
    const worstExpense = Math.min(...amounts); // Lowest amount

    return { bestExpense, worstExpense };
  } catch (error) {
    console.error('Error fetching expense amounts:', error); // Log the error
    return { error: 'Database error' };
  }
}

export default getBestWorstExpense;