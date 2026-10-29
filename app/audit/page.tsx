import Link from 'next/link';

// Dummy data, same as the canvas drawing.
type Tone = 'red' | 'amber' | 'green' | 'verify' | 'grey';
type Proof = 'verified' | 'not_matched' | 'none';

const STATS = [
  { value: 5, label: 'Dealbreakers', color: 'text-[#912018]' },
  { value: 8, label: 'Check', color: 'text-[#93370D]' },
  { value: 14, label: 'OK', color: 'text-[#085D3A]' },
  { value: 3, label: 'To verify', color: 'text-[#93370D]' },
  { value: 6, label: 'Not found', color: 'text-[#344054]' },
];

const FACTS = [
  { label: 'CLOSING', value: '5 Nov 2026, 11:00 AM EAT' },
  { label: 'TENDER SECURITY', value: 'KES 200,000, valid 150 days (120 + 30)' },
  { label: 'SUBMISSION', value: 'Physical tender box' },
];

const ROWS: { tone: Tone; status: string; requirement: string; says: string; page: string; proof: Proof }[] = [
  { tone: 'red', status: 'Dealbreaker', requirement: 'Mandatory site visit', says: 'Mandatory. 28 Oct 2026, 10:00 AM EAT.', page: '4', proof: 'verified' },
  { tone: 'red', status: 'Dealbreaker', requirement: 'CR12', says: 'Must be issued within the last 6 months.', page: '18', proof: 'verified' },
  { tone: 'amber', status: 'Check', requirement: 'Tax Compliance Certificate', says: 'Valid KRA certificate, copy to be stamped.', page: '18', proof: 'verified' },
  { tone: 'green', status: 'OK', requirement: 'Tender validity', says: '120 days from the closing date.', page: '5', proof: 'verified' },
  { tone: 'verify', status: 'Verify', requirement: 'County business permit', says: 'Valid permit required. Quote not matched, please check the page.', page: '19', proof: 'not_matched' },
  { tone: 'grey', status: 'Not found', requirement: 'Beneficial Ownership Disclosure Form', says: 'Not found in this document. This does not mean it is not required.', page: '-', proof: 'none' },
];

const CHIP: Record<Tone, string> = {
  red: 'bg-[#FDECEA] text-[#912018]',
  amber: 'bg-[#FEF0C7] text-[#93370D]',
  green: 'bg-[#DCFAE6] text-[#085D3A]',
  grey: 'bg-[#EAECF0] text-[#344054]',
  verify: 'border border-dashed border-[#B54708] bg-white text-[#93370D]',
};

const PROOF: Record<Proof, { text: string; color: string }> = {
  verified: { text: 'Quote verified', color: 'text-[#085D3A]' },
  not_matched: { text: 'Quote not matched', color: 'text-[#93370D]' },
  none: { text: '-', color: 'text-[#344054]' },
};

const BTN =
  'inline-flex min-h-[44px] items-center justify-center rounded-lg bg-[#0B6B4B] px-[18px] py-2.5 text-sm font-semibold text-white hover:bg-[#095C40] cursor-pointer';
const BTN2 =
  'inline-flex min-h-[44px] items-center justify-center rounded-lg border border-[#667085] bg-white px-[18px] py-2.5 text-sm font-semibold text-[#101828] hover:bg-[#F2F4F7] cursor-pointer';
const CARD = 'rounded-xl border border-[#E4E7EC] bg-white';
const ROW = 'grid grid-cols-[120px_1.3fr_2.2fr_50px_140px] items-center gap-4 border-t border-[#E4E7EC] px-5 py-3.5 text-sm';

function Chip({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  return (
    <span className={`inline-block whitespace-nowrap rounded-full px-2.5 py-[3px] text-xs font-semibold ${CHIP[tone]}`}>
      {children}
    </span>
  );
}

export default function AuditPage() {
  return (
    <div className="min-h-screen bg-[#F6F6F2] text-[#101828]">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-6 p-6 md:p-10">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <div className="text-sm text-[#475467]">
              <Link href="/dashboard" className="underline">
                My audits
              </Link>{' '}
              / Supply of Office Printers
            </div>
            <h1 className="my-1.5 text-[28px] font-bold leading-tight">Supply of Office Printers</h1>
            <div className="text-sm text-[#475467]">
              Sample County Government · Tender No. SCG/OT/012/2026-27 · 84 pages
            </div>
          </div>
          <div className="flex gap-3">
            <button type="button" className={BTN}>
              Bank letter
            </button>
            <button type="button" className={BTN2}>
              Packing checklist
            </button>
          </div>
        </div>

        {/* Warning */}
        <div className="rounded-lg bg-[#FEF0C7] px-4 py-3 text-sm font-medium text-[#93370D]">
          3 findings could not be matched to the tender text. Please check them yourself. This is a helper, not legal
          advice.
        </div>

        {/* Summary counts */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {STATS.map((s) => (
            <div key={s.label} className={`${CARD} p-4`}>
              <div className={`text-[28px] font-bold ${s.color}`}>{s.value}</div>
              <div className="text-[13px]">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Key facts */}
        <div className={`${CARD} grid gap-4 p-5 text-sm md:grid-cols-3`}>
          {FACTS.map((f) => (
            <div key={f.label}>
              <div className="text-xs text-[#475467]">{f.label}</div>
              <b>{f.value}</b>
            </div>
          ))}
        </div>

        {/* Requirements matrix */}
        <section aria-labelledby="matrix-heading" className={CARD}>
          <h2 id="matrix-heading" className="m-0 px-5 py-[18px] text-lg font-semibold">
            Preliminary requirements
          </h2>
          <div className="overflow-x-auto">
            <div role="table" aria-label="Preliminary requirements" className="min-w-[860px]">
              <div role="row" className={`${ROW} text-xs font-semibold text-[#475467]`}>
                <div role="columnheader">Status</div>
                <div role="columnheader">Requirement</div>
                <div role="columnheader">What the tender says</div>
                <div role="columnheader">Page</div>
                <div role="columnheader">Proof</div>
              </div>

              {ROWS.map((r) => (
                <div key={r.requirement} role="row" className={ROW}>
                  <div role="cell">
                    <Chip tone={r.tone}>{r.status}</Chip>
                  </div>
                  <div role="cell" className="font-bold">
                    {r.requirement}
                  </div>
                  <div role="cell">{r.says}</div>
                  <div role="cell">{r.page}</div>
                  <div role="cell" className={PROOF[r.proof].color}>
                    {PROOF[r.proof].text}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}