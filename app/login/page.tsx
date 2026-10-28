'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent } from 'react';
import { AuthShell, INPUT, PRIMARY_BTN } from '../authShell';

export default function LoginPage() {
  const router = useRouter();

  // Design only: no login yet, so the button just opens the dashboard.
  function onSubmit(e: FormEvent) {
    e.preventDefault();
    router.push('/dashboard');
  }

  return (
    <AuthShell>
      <form
        onSubmit={onSubmit}
        className="flex w-full max-w-[400px] flex-col gap-4 rounded-xl border border-[#E4E7EC] bg-white p-8"
      >
        <h2 className="m-0 text-2xl font-bold">Log in</h2>

        <div>
          <label htmlFor="email" className="block text-sm font-semibold">
            Email
          </label>
          <input id="email" type="email" autoComplete="email" placeholder="you@company.co.ke" className={INPUT} />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-semibold">
            Password
          </label>
          <input id="password" type="password" autoComplete="current-password" className={INPUT} />
        </div>

        <button type="submit" className={PRIMARY_BTN}>
          Log in
        </button>

        <p className="m-0 text-sm text-[#475467]">
          New here?{' '}
          <Link href="/register" className="font-semibold text-[#0B6B4B] underline">
            Create an account
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}