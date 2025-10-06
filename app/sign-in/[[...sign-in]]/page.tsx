// app/(auth)/sign-in/page.tsx (or wherever your sign-in route is)
'use server';

import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { SignIn } from '@clerk/nextjs';
import checkUser from '@/lib/checkUser'; // optional, see note below

export default async function Page() {
  const { userId } = await auth();

  if (userId) {
    // Optional: ensure a local DB user exists and is up to date
    await checkUser();
    redirect('/'); // already signed in → go home (or wherever you want)
  }

  // Not signed in → show Clerk widget
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <SignIn/>
    </div>
  );
}
