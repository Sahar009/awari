"use client";

import Container from "@/components/Container";
import { Loader } from "@/components/ui/Loader";
import clsx from "clsx";

const CardSkeleton = () => (
  <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm">
    <div className="relative w-full overflow-hidden rounded-xl">
      <div className="h-44 w-full bg-slate-200/80 animate-pulse" />
      <div className="absolute right-3 top-3 rounded-full bg-white/90 px-2 py-1 text-[10px] font-semibold text-slate-400 shadow-sm">
        Loading
      </div>
    </div>
    <div className="space-y-3">
      <div className="h-5 w-3/4 rounded bg-slate-200/80 animate-pulse" />
      <div className="h-4 w-1/3 rounded bg-slate-200/70 animate-pulse" />
      <div className="flex flex-col gap-2">
        <div className="h-3 w-full rounded bg-slate-200/70 animate-pulse" />
        <div className="h-3 w-2/3 rounded bg-slate-200/60 animate-pulse" />
      </div>
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-slate-200/70 animate-pulse" />
        <div className="h-3 w-1/2 rounded bg-slate-200/60 animate-pulse" />
      </div>
    </div>
  </div>
);

const PillSkeleton = ({ width }: { width: string }) => (
  <span
    className={clsx(
      "h-8 rounded-full bg-white/70 px-6 py-2 text-sm font-medium text-slate-400 shadow-inner",
      "flex items-center gap-2 border border-slate-200/70"
    )}
    style={{ width }}
  >
    <span className="h-3 w-3 rounded-full bg-slate-300 animate-pulse" />
    <span className="h-3 w-16 rounded bg-slate-200 animate-pulse" />
  </span>
);

const PropertyListingSkeleton = () => (
  <Container>
    <div className="my-12 flex flex-col gap-10">
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-3 text-center">
        <div className="h-5 w-28 rounded-full bg-primary/10 text-primary animate-pulse" />
        <div className="h-8 w-3/4 rounded-lg bg-slate-200/80 animate-pulse" />
        <div className="h-4 w-2/3 rounded bg-slate-200/70 animate-pulse" />
      </div>

      <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-md backdrop-blur">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="h-5 w-32 rounded bg-slate-200/70 animate-pulse" />
          <div className="flex items-center gap-2">
            <PillSkeleton width="140px" />
            <PillSkeleton width="120px" />
            <PillSkeleton width="160px" />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-[2fr_1fr]">
          <div className="h-12 rounded-2xl border border-slate-200/80 bg-slate-100/60 px-4 py-3 animate-pulse" />
          <div className="flex gap-3">
            <div className="h-12 flex-1 rounded-2xl border border-slate-200/80 bg-slate-100/60 animate-pulse" />
            <div className="h-12 flex-1 rounded-2xl border border-slate-200/80 bg-slate-100/60 animate-pulse" />
          </div>
        </div>
      </div>

      <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <CardSkeleton key={index} />
        ))}
      </div>

      <div className="flex items-center justify-center">
        <Loader variant="spinner" text="Fetching properties..." />
      </div>
    </div>
  </Container>
);

export default PropertyListingSkeleton;

















