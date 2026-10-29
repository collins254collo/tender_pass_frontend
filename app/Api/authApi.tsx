import { ApiError, clearToken, getToken, saveToken } from './aiTenderApi';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000';
const AUTH_URL = `${BASE_URL.replace(/\/$/, '')}/api/auth`;

//  types 

export interface User {
  id: string;
  email: string;
  full_name: string;
  company_name: string | null;
  phone: string | null;
  role: 'user' | 'admin';
  created_at: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  full_name: string;
  company_name?: string; // optional
  phone?: string; // optional, e.g. 0712345678 (the server saves it as 254712345678)
}

export interface ChangePasswordInput {
  current_password: string;
  new_password: string;
}

interface AuthResponse {
  token: string;
  user: User;
}

//  request helper 

const SESSION_CODES = ['NO_TOKEN', 'TOKEN_EXPIRED', 'TOKEN_INVALID', 'SESSION_REVOKED'];
const PUBLIC_PAGES = ['/login', '/register'];

type ErrorBody = { error?: string; code?: string };

async function request<T>(path: string, options: { method?: string; json?: unknown } = {}): Promise<T> {
  const headers: Record<string, string> = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let body: string | undefined;
  if (options.json !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(options.json);
  }

  let res: Response;
  try {
    res = await fetch(`${AUTH_URL}${path}`, { method: options.method ?? 'GET', headers, body });
  } catch {
    throw new ApiError(0, 'Cannot reach the server. Check your internet connection and try again.');
  }

  let data: (ErrorBody & Record<string, unknown>) | null = null;
  try {
    data = await res.json();
  } catch {
    /* the response had no JSON body */
  }

  if (!res.ok) {
    const code = data?.code;
    // The session is over: forget the token and go to the login page (unless we are already on a public page).
    if (res.status === 401 && code && SESSION_CODES.includes(code)) {
      clearToken();
      if (typeof window !== 'undefined' && !PUBLIC_PAGES.includes(window.location.pathname)) {
        window.location.assign('/login');
      }
    }
    throw new ApiError(res.status, data?.error ?? `Request failed (${res.status}).`, code);
  }

  return data as T;
}

//  checks you can run before sending a form 

// Same rules as the server: at least 8 characters, at most 72 bytes. Returns a message, or null if the password is fine.
export function passwordProblem(password: string): string | null {
  if (password.length < 8) return 'Password must be at least 8 characters.';
  if (new TextEncoder().encode(password).length > 72) return 'Password is too long. Use at most 72 characters.';
  return null;
}

//  the API 

// POST /api/auth/register   Creates the account, saves the token, returns the user.
// Errors to expect: 400 (a field is invalid), 409 (email already used), 429 (too many sign-ups).
export async function register(input: RegisterInput): Promise<User> {
  const payload: Record<string, string> = {
    email: input.email.trim().toLowerCase(),
    password: input.password,
    full_name: input.full_name.trim(),
  };
  if (input.company_name?.trim()) payload.company_name = input.company_name.trim();
  if (input.phone?.trim()) payload.phone = input.phone.trim();

  const { token, user } = await request<AuthResponse>('/register', { method: 'POST', json: payload });
  saveToken(token);
  return user;
}

// POST /api/auth/login   Saves the token and returns the user.
// Errors to expect: 401 (wrong email or password), 403 (account disabled), 429 (too many attempts).
export async function login(email: string, password: string): Promise<User> {
  const { token, user } = await request<AuthResponse>('/login', {
    method: 'POST',
    json: { email: email.trim().toLowerCase(), password },
  });
  saveToken(token);
  return user;
}

// GET /api/auth/me   Returns the logged-in user. Use it when the app loads to restore the session.
export async function getMe(): Promise<User> {
  const { user } = await request<{ user: User }>('/me');
  return user;
}

// POST /api/auth/change-password   Saves the fresh token (all older tokens stop working) and returns the user.
// Errors to expect: 400 (new password invalid or same as old), 401 (current password wrong).
export async function changePassword(input: ChangePasswordInput): Promise<User> {
  const { token, user } = await request<AuthResponse>('/change-password', { method: 'POST', json: input });
  saveToken(token);
  return user;
}

// The server has no logout route, so this only forgets the token in this browser.
// The old token itself stays valid until it expires, or until the password is changed.
export function logout(): void {
  clearToken();
}

// True if a token is saved in this browser. It does not check that the token is still valid, use getMe() for that.
export function hasToken(): boolean {
  return getToken() !== null;
}