'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { AuthShell, INPUT, PRIMARY_BTN } from '../authShell';
import { passwordProblem, register } from '../Api/authApi';
import { errorMessage } from '../Api/aiTenderApi';

const LABEL = 'block text-sm font-semibold';
const HINT = 'mt-1 text-[13px] text-[#475467]';

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;

    // Read the form before any await (the event is gone afterwards).
    const form = new FormData(e.currentTarget);
    const full_name = String(form.get('full_name') || '').trim();
    const company_name = String(form.get('company_name') || '').trim();
    const email = String(form.get('email') || '').trim();
    const phone = String(form.get('phone') || '').trim();
    const password = String(form.get('password') || '');

    if (!full_name || !email) {
      setError('Please enter your full name and email.');
      return;
    }
    const problem = passwordProblem(password);
    if (problem) {
      setError(problem);
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      await register({ full_name, company_name, email, phone, password });
      router.replace('/dashboard'); // stay in the "creating" state while the page changes
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
        <h2 className="m-0 text-2xl font-bold">Create your account</h2>

        <div>
          <label htmlFor="full_name" className={LABEL}>
            Full name
          </label>
          <input id="full_name" name="full_name" type="text" required autoComplete="name" className={INPUT} />
        </div>

        <div>
          <label htmlFor="company_name" className={LABEL}>
            Company name (optional)
          </label>
          <input id="company_name" name="company_name" type="text" autoComplete="organization" className={INPUT} />
        </div>

        <div>
          <label htmlFor="email" className={LABEL}>
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
          <label htmlFor="phone" className={LABEL}>
            Phone (optional)
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="0712345678"
            aria-describedby="phone-hint"
            className={INPUT}
          />
          <p id="phone-hint" className={HINT}>
            Used for M-Pesa payments.
          </p>
        </div>

        <div>
          <label htmlFor="password" className={LABEL}>
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="new-password"
            aria-describedby="password-hint"
            className={INPUT}
          />
          <p id="password-hint" className={HINT}>
            At least 8 characters.
          </p>
        </div>

        {error && (
          <p role="alert" className="m-0 rounded-lg bg-[#FDECEA] px-3 py-2 text-sm font-medium text-[#912018]">
            {error}
          </p>
        )}

        <button type="submit" disabled={submitting} className={`${PRIMARY_BTN} disabled:cursor-not-allowed disabled:opacity-60`}>
          {submitting ? 'Creating account…' : 'Create account'}
        </button>

        <p className="m-0 text-sm text-[#475467]">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-[#0B6B4B] underline">
            Log in
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}