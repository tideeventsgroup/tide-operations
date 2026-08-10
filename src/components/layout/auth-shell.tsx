import { BrandMark } from "@/components/brand-mark";

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <div className="relative hidden w-[42%] flex-col justify-between overflow-hidden bg-tide-charcoal px-12 py-12 text-white lg:flex">
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.07]"
          viewBox="0 0 400 800"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          {[120, 220, 320, 420, 520, 620, 720].map((y) => (
            <path
              key={y}
              d={`M -40 ${y} C 20 ${y - 30}, 60 ${y + 30}, 120 ${y} S 220 ${y - 30}, 280 ${y} S 380 ${y + 30}, 440 ${y}`}
              stroke="white"
              strokeWidth="2"
              fill="none"
            />
          ))}
        </svg>

        <div className="relative flex items-center gap-3">
          <BrandMark className="size-10 shrink-0" />
          <div className="leading-tight">
            <div className="text-base font-bold tracking-tight">Tide Events Group</div>
            <div className="text-[11px] font-semibold tracking-[0.12em] text-tide-teal uppercase">
              Operations System
            </div>
          </div>
        </div>

        <div className="relative max-w-sm">
          <p className="text-2xl leading-snug font-semibold text-balance">
            One system of record for every event, document and decision.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-white/55">
            Enquiry through to delivery — client records, controlled document production, and
            live event control, in one place.
          </p>
        </div>

        <p className="relative text-xs text-white/35">
          Internal / Commercial-in-confidence
        </p>
      </div>

      <div className="flex flex-1 items-center justify-center bg-[#fafafa] px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-6 flex items-center gap-2.5 lg:hidden">
            <BrandMark className="size-8 shrink-0" />
            <div className="leading-tight">
              <div className="text-sm font-bold text-tide-charcoal">Tide Events Group</div>
              <div className="text-[10px] font-semibold tracking-[0.1em] text-tide-teal uppercase">
                Operations System
              </div>
            </div>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
