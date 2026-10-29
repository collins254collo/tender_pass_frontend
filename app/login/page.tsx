'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { AuthShell, INPUT, PRIMARY_BTN } from '../authShell';
import { login } from '../Api/authApi';
import { errorMessage } from '../Api/aiTenderApi';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;

    // Read the form before any await (the event is gone afterwards).
    const form = new FormData(e.currentTarget);
    const email = String(form.get('email') || '').trim();
    const password = String(form.get('password') || '');

    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      router.replace('/dashboard'); // stay in the "logging in" state while the page changes
    } catch (err) {
      setError(errorMessage(err));
      setSubmitting(false);
    }
  }

  return (
    <AuthShell>
      <form
        onSubmit={onSubmit}
        aria-busy={submitting}
        className="flex w-full max-w-[400px] flex-col gap-4 rounded-xl border border-[#E4E7EC] bg-white p-8"
      >
        <h2 className="m-0 text-2xl font-bold">Log in</h2>

        <div>
          <label htmlFor="email" className="block text-sm font-semibold">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@company.co.ke"
            className={INPUT}
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-semibold">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className={INPUT}
          />
        </div>

        {error && (
          <p role="alert" className="m-0 rounded-lg bg-[#FDECEA] px-3 py-2 text-sm font-medium text-[#912018]">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className={`${PRIMARY_BTN} disabled:cursor-not-allowed disabled:opacity-60`}
        >
          {submitting ? 'Logging in…' : 'Log in'}
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