'use client';

import { useRouter } from 'next/navigation';
import { logout } from '../app/Api/authApi';

const BASE =
  'inline-flex min-h-[44px] items-center justify-center rounded-lg border border-[#667085] bg-white px-[18px] py-2.5 text-sm font-semibold text-[#101828] hover:bg-[#F2F4F7] cursor-pointer';

// Forgets the saved login in this browser and goes back to the login page.
export function LogoutButton({ className = '' }: { className?: string }) {
  const router = useRouter();

  function onClick() {
    logout();
    router.replace('/login');
  }

  return (
    <button type="button" onClick={onClick} className={`${BASE} ${className}`}>
      Log out
    </button>
  );
}