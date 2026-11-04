"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Log client-side; never expose stack traces to visitors.
    console.error(error);
  }, [error]);

  return (
    <div className="grid min-h-[60vh] place-items-center px-4">
      <div className="bento w-full max-w-lg p-8 text-center sm:p-12">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#FDE6D2]">
          <AlertTriangle className="h-6 w-6 text-[#5c3a1e]" aria-hidden />
        </span>
        <h1 className="mt-6 text-xl font-black tracking-tight text-[#15161A] sm:text-2xl">Something went wrong</h1>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-gray-500">
          An unexpected error occurred while loading this page. It has been noted — please try again.
        </p>
        <button
          onClick={reset}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#15161A] px-5 py-2.5 text-sm font-bold text-white transition-transform hover:-translate-y-0.5 active:scale-95"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
