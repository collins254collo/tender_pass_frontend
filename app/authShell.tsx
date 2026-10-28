// Shared layout for the login and create-account pages:

export const INPUT = 'w-full rounded-lg border border-[#667085] bg-white p-3 text-[15px]';

export const PRIMARY_BTN =
  'inline-flex min-h-[44px] w-full items-center justify-center rounded-lg bg-[#0B6B4B] px-[18px] py-2.5 text-sm font-semibold text-white hover:bg-[#095C40] cursor-pointer';

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F6F6F2] text-[#101828] lg:flex">
      <div className="hidden flex-1 flex-col justify-center gap-5 bg-[#0B6B4B] p-[72px] text-white lg:flex">
        <div className="text-[28px] font-bold">Tenderpass</div>
        <h1 className="m-0 max-w-[460px] text-[40px] font-bold leading-[1.15]">
          Catch the mistakes that get bids disqualified.
        </h1>
        <p className="m-0 max-w-[440px] text-lg leading-normal">
          Upload a Kenyan tender PDF and get a clear preliminary compliance audit in minutes.
        </p>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-6 p-6 lg:p-12">
        <div className="text-2xl font-bold text-[#0B6B4B] lg:hidden">Tenderpass</div>
        {children}
      </div>
    </div>
  );
}