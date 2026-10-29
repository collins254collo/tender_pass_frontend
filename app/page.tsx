'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { getMe, hasToken } from '../app/Api/authApi';
import { ApiError, errorMessage } from '../app/Api/aiTenderApi';

// The home page decides where to go:
//   no saved token            -> /login
//   token the server accepts  -> /dashboard
//   token the server rejects  -> /login (authApi has already cleared it)
//   server unreachable        -> a visible message, so the user is not sent to the wrong place silently
export default function Page() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const check = useCallback(async () => {
    setError(null);

    if (!hasToken()) {
      router.replace('/login');
      return;
    }

    try {
      await getMe(); // asks the server whether this token is still valid
      router.replace('/dashboard');
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.replace('/login');
        return;
      }
      setError(errorMessage(err));
    }
  }, [router]);

  useEffect(() => {
    check();
  }, [check]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F6F6F2] p-6 text-[#101828]">
      {error ? (
        <div
          role="alert"
          className="flex w-full max-w-[400px] flex-col gap-4 rounded-xl border border-[#E4E7EC] bg-white p-8"
        >
          <h1 className="m-0 text-xl font-bold">We could not check your session</h1>
          <p className="m-0 rounded-lg bg-[#FDECEA] px-3 py-2 text-sm font-medium text-[#912018]">{error}</p>
          <button
            type="button"
            onClick={check}
            className="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-[#0B6B4B] px-[18px] py-2.5 text-sm font-semibold text-white hover:bg-[#095C40]"
          >
            Try again
          </button>
          <Link href="/login" className="text-sm font-semibold text-[#0B6B4B] underline">
            Go to the login page
          </Link>
        </div>
      ) : (
        <p role="status" className="m-0 text-sm text-[#475467]">
          Loading…
        </p>
      )}
    </div>
  );
}