'use server';

import checkUser from '@/lib/checkUser';
import { db } from '@/lib/db';
import { generateAIAnswer, ExpenseRecord } from '@/lib/ai';

export async function generateInsightAnswer(question: string): Promise<string> {
  try {
    const user = await checkUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // 1️⃣ Find the internal user by Clerk ID
    const me = await db.user.findFirst({
      where: { clerkUserId: user.clerkUserId },
      select: { id: true },
    });

    if (!me) {
      throw new Error('Local user record not found');
    }

    // 2️⃣ Fetch the user's recent expenses (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const expenses = await db.record.findMany({
      where: {
        userId: me.id, // ✅ use internal UUID
        createdAt: { gte: thirtyDaysAgo },
      },
      orderBy: { createdAt: 'desc' },
      take: 50, // Limit to recent 50 expenses
    });

    // 3️⃣ Convert data for AI
    const expenseData: ExpenseRecord[] = expenses.map((expense) => ({
      id: expense.id,
      amount: expense.amount,
      category: expense.category || 'Other',
      description: expense.text,
      date: expense.createdAt.toISOString(),
    }));

    // 4️⃣ Generate AI answer
    const answer = await generateAIAnswer(question, expenseData);
    return answer;
  } catch (error) {
    console.error('Error generating insight answer:', error);
    return "I'm unable to provide a detailed answer at the moment. Please try refreshing the insights or check your connection.";
  }
}
