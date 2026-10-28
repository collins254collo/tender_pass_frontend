import Link from 'next/link';

// Dummy data, same as the canvas drawing.
const AUDITS = [
  { id: '1', title: 'Supply of Office Printers', sub: 'printers-tender.pdf', status: 'done' },
  { id: '2', title: 'security-services.pdf', sub: 'Uploaded 2 minutes ago', status: 'processing' },
  { id: '3', title: 'road-works-tender.pdf', sub: 'Uploaded yesterday', status: 'failed' },
] as const;

const CHIP = {
  red: 'bg-[#FDECEA] text-[#912018]',
  amber: 'bg-[#FEF0C7] text-[#93370D]',
  green: 'bg-[#DCFAE6] text-[#085D3A]',
  grey: 'bg-[#EAECF0] text-[#344054]',
};

const BTN =
  'inline-flex min-h-[44px] items-center justify-center rounded-lg bg-[#0B6B4B] px-[18px] py-2.5 text-sm font-semibold text-white hover:bg-[#095C40] cursor-pointer';
const BTN2 =
  'inline-flex min-h-[44px] items-center justify-center rounded-lg border border-[#667085] bg-white px-[18px] py-2.5 text-sm font-semibold text-[#101828] hover:bg-[#F2F4F7] cursor-pointer';
const NAV = 'block rounded-lg px-3.5 py-3 text-sm font-medium text-[#344054] hover:bg-[#F2F4F7]';
const ROW = 'grid grid-cols-[2.4fr_1.2fr_1.8fr_1fr] items-center gap-4 px-5 py-3.5 text-sm';

function Chip({ tone, children }: { tone: keyof typeof CHIP; children: React.ReactNode }) {
  return (
    <span className={`inline-block whitespace-nowrap rounded-full px-2.5 py-[3px] text-xs font-semibold ${CHIP[tone]}`}>
      {children}
    </span>
  );
}

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#F6F6F2] text-[#101828] md:flex">
      {/* Phone: top bar */}
      <header className="border-b border-[#E4E7EC] bg-white px-4 py-3 md:hidden">
        <span className="text-xl font-bold text-[#0B6B4B]">Tenderpass</span>
      </header>

      {/* Sidebar */}
      <aside className="hidden w-[232px] shrink-0 border-r border-[#E4E7EC] bg-white px-4 py-6 md:block">
        <div className="px-3.5 pb-6 text-xl font-bold text-[#0B6B4B]">Tenderpass</div>
        <nav aria-label="Main">
          <Link
            href="/dashboard"
            aria-current="page"
            className="block rounded-lg bg-[#E6F4EE] px-3.5 py-3 text-sm font-medium text-[#0B6B4B]"
          >
            New audit
          </Link>
          <Link href="#audits" className={NAV}>
            My audits
          </Link>
          <Link href="#" className={NAV}>
            Account
          </Link>
        </nav>
      </aside>

      <main className="min-w-0 flex-1 p-6 md:p-10">
        <div className="flex max-w-[1000px] flex-col gap-7">
          <h1 className="m-0 text-[28px] font-bold leading-tight">New tender audit</h1>

          <div className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-[#667085] bg-white p-11 text-center">
            <div className="text-lg font-semibold">Drop the tender PDF here</div>
            <div className="text-sm text-[#475467]">PDF only, up to 20 MB. Your audit is ready in a few minutes.</div>
            <button type="button" className={BTN}>
              Choose PDF
            </button>
          </div>

          <section id="audits" aria-labelledby="audits-heading" className="rounded-xl border border-[#E4E7EC] bg-white">
            <h2 id="audits-heading" className="m-0 px-5 py-[18px] text-lg font-semibold">
              Your audits
            </h2>
            <div className="overflow-x-auto">
              <div role="table" aria-label="Your audits" className="min-w-[680px]">
                <div role="row" className={`${ROW} border-t border-[#E4E7EC] text-xs font-semibold text-[#475467]`}>
                  <div role="columnheader">Tender</div>
                  <div role="columnheader">Status</div>
                  <div role="columnheader">Result</div>
                  <div role="columnheader" className="sr-only">
                    Action
                  </div>
                </div>

                {AUDITS.map((a) => (
                  <div key={a.id} role="row" className={`${ROW} border-t border-[#E4E7EC]`}>
                    <div role="cell" className="min-w-0">
                      <div className="truncate font-semibold">{a.title}</div>
                      <div className="truncate text-[13px] text-[#475467]">{a.sub}</div>
                    </div>

                    <div role="cell">
                      {a.status === 'done' && <Chip tone="green">Done</Chip>}
                      {a.status === 'processing' && <Chip tone="grey">Processing</Chip>}
                      {a.status === 'failed' && <Chip tone="red">Failed</Chip>}
                    </div>

                    <div role="cell">
                      {a.status === 'done' && (
                        <div className="flex flex-wrap gap-1.5">
                          <Chip tone="red">5 red</Chip>
                          <Chip tone="amber">8 amber</Chip>
                          <Chip tone="green">14 green</Chip>
                        </div>
                      )}
                      {a.status === 'processing' && (
                        <div role="status" aria-label="The audit is running" className="h-2 rounded bg-[#EAECF0]">
                          <div className="h-2 w-3/5 rounded bg-[#0B6B4B]" />
                        </div>
                      )}
                      {a.status === 'failed' && (
                        <span className="text-[#912018]">The AI service is busy. Please retry in a minute.</span>
                      )}
                    </div>

                    <div role="cell">
                      {a.status === 'done' && (
                        <button type="button" className={BTN2}>
                          Open
                        </button>
                      )}
                      {a.status === 'failed' && (
                        <button type="button" className={BTN2}>
                          Retry
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}