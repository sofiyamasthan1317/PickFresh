import { Link } from "react-router-dom";
import { cn } from "../lib/utils";

export const BrandMark = ({ className }: { className?: string }) => (
  <div
    className={cn(
      "relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary-600 to-primary-500 text-white shadow-lift transition-transform duration-300 hover:scale-105",
      className,
    )}
  >
    {/* Decorative organic orange accent bubble */}
    <span className="absolute -right-1.5 -top-1.5 h-6 w-6 rounded-full bg-gradient-to-tr from-citrus-500 to-citrus-400 opacity-90 shadow-sm" />
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="relative h-6 w-6 text-white"
    >
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.5 0 9.5A7 7 0 0 1 11 20z" />
      <path d="M9 22v-4" />
    </svg>
  </div>
);

export const BrandLogo = ({ compact = false }: { compact?: boolean }) => (
  <Link to="/" className="flex min-w-0 items-center gap-3 transition-opacity duration-200 hover:opacity-90" aria-label="PickFresh home">
    <BrandMark />
    {!compact && (
      <div className="flex flex-col justify-center leading-none">
        <span className="bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-xl font-black tracking-tight text-transparent dark:from-primary-400 dark:to-primary-300">
          Pick<span className="text-ink-900 dark:text-white">Fresh</span>
        </span>
        <span className="mt-0.5 hidden text-[10px] font-bold uppercase tracking-wider text-primary-700 dark:text-primary-300 sm:block">
          premium organic market
        </span>
      </div>
    )}
  </Link>
);
