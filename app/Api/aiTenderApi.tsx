

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000';
const AUDITS_URL = `${BASE_URL.replace(/\/$/, '')}/api/tender-audits`;
const TOKEN_KEY = 'tp_token';
const MAX_PDF_BYTES = 20 * 1024 * 1024; // same limit as the server

//  types 

export type AuditStatus = 'pending' | 'processing' | 'done' | 'failed';

// green / amber / red come from the checks; unverified and not_found are the honest "we are not sure" states.
export type FindingStatus = 'red' | 'amber' | 'green' | 'unverified' | 'not_found';

export interface AuditSummary {
  red: number;
  amber: number;
  green: number;
  unverified: number;
  not_found: number;
}

export interface Finding {
  check_id: string;
  group: string;
  stage: 'preliminary' | 'technical' | 'financial' | 'general';
  title: string;
  value: string;
  detail: string;
  severity: 'dealbreaker' | 'mandatory' | 'info';
  applies: 'required' | 'not_required' | 'conditional' | 'unclear' | null;
  found: boolean;
  quote: string;
  page: number | null;
  verified: boolean;
  verification: string;
  status: FindingStatus;
  ai_omitted?: boolean;
}

export interface BidSecurity {
  found: boolean;
  required: boolean;
  amount: string;
  currency: string;
  tender_validity_days: number | null;
  security_extra_days: number | null;
  total_validity_days: number | null; // for the bank letter, e.g. 120 + 30 = 150
  beneficiary: string;
  form: string;
  issuer_rules: string;
  accepts_tender_securing_declaration: boolean | null;
  quote: string;
  page: number | null;
  verified: boolean;
  status: FindingStatus;
}

export interface TenderInfo {
  title?: string;
  procuring_entity?: string;
  tender_number?: string;
  procurement_method?: string;
  category?: string;
  scope?: string;
}

export interface AuditResult {
  schema_version: number;
  is_kenyan_tender: boolean;
  tender: TenderInfo;
  bid_security: BidSecurity | null;
  findings: Finding[];
  summary: AuditSummary;
  page_count: number;
  warnings: string[];
  disclaimer: string;
}

// One audit with its full result (from upload, get and retry).
export interface AuditRecord {
  id: string;
  user_id: string;
  file_name: string;
  status: AuditStatus;
  result: AuditResult | null; // only filled when status is "done"
  error_message: string | null; // only filled when status is "failed"
  attempts: number;
  model: string | null;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
}

// A row in the dashboard list (no heavy result, just the tender info and counts).
export interface AuditListItem {
  id: string;
  file_name: string;
  status: AuditStatus;
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
  tender: TenderInfo | null;
  summary: AuditSummary | null;
}

//  token 

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function saveToken(token: string): void {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  try {
    window.localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* storage unavailable */
  }
}

//  errors 

export class ApiError extends Error {
  status: number;
  code?: string;
  constructor(status: number, message: string, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

// A message that is always safe to show to the user.
export function errorMessage(err: unknown): string {
  return err instanceof ApiError ? err.message : 'Something went wrong. Please try again.';
}

// request helper

const SESSION_CODES = ['NO_TOKEN', 'TOKEN_EXPIRED', 'TOKEN_INVALID', 'SESSION_REVOKED'];

type ErrorBody = { error?: string; code?: string };

async function request<T>(path: string, options: { method?: string; form?: FormData } = {}): Promise<T> {
  const headers: Record<string, string> = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${AUDITS_URL}${path}`, {
      method: options.method ?? 'GET',
      headers, // for uploads the browser adds the multipart Content-Type itself
      body: options.form,
    });
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
    // The session is over: forget the token and send the user to log in again.
    if (res.status === 401 && code && SESSION_CODES.includes(code)) {
      clearToken();
      if (typeof window !== 'undefined') window.location.assign('/login');
    }
    throw new ApiError(res.status, data?.error ?? `Request failed (${res.status}).`, code);
  }

  return data as T;
}

//  the API 

// POST /api/tender-audits   Uploads the tender PDF and starts the audit (status "pending").
export async function createAudit(file: File): Promise<AuditRecord> {
  const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  if (!isPdf) throw new ApiError(400, 'This file is not a PDF. Please choose the tender as a PDF.');
  if (file.size > MAX_PDF_BYTES) throw new ApiError(413, 'This PDF is larger than 20 MB. Please choose a smaller file.');

  const form = new FormData();
  form.append('file', file);
  const { audit } = await request<{ audit: AuditRecord }>('', { method: 'POST', form });
  return audit;
}

// GET /api/tender-audits   All my audits, newest first (for the dashboard).
export async function listAudits(): Promise<AuditListItem[]> {
  const { audits } = await request<{ audits: AuditListItem[] }>('');
  return audits;
}

// GET /api/tender-audits/:id   One audit with its full result (for the audit page).
// Call it every few seconds while status is "pending" or "processing".
export async function getAudit(id: string): Promise<AuditRecord> {
  const { audit } = await request<{ audit: AuditRecord }>(`/${encodeURIComponent(id)}`);
  return audit;
}

// POST /api/tender-audits/:id/retry   Runs a failed audit again (only works while the file is still stored).
export async function retryAudit(id: string): Promise<AuditRecord> {
  const { audit } = await request<{ audit: AuditRecord }>(`/${encodeURIComponent(id)}/retry`, { method: 'POST' });
  return audit;
}

// True while the server is still working, so the page should keep checking.
export function isAuditActive(status: AuditStatus): boolean {
  return status === 'pending' || status === 'processing';
}