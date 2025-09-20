'use client';

import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import LoadingOverlay from './LoadingOverlay';

type Ctx = {
  /** লোডার অন (নেস্টেড কল সাপোর্টেড) */
  start: () => void;
  /** লোডার অফ (start যতবার, stop ততবার) */
  stop: () => void;
  /** যেকোনো প্রমিজ চালান, লোডার অটো অন/অফ হবে */
  withLoader: <T>(run: () => Promise<T>, opts?: { minMs?: number }) => Promise<T>;
};

// 🔧 লোডার কমপক্ষে কত ms দেখা যাবে
const DEFAULT_MIN_MS = 1200;

const LoadingCtx = createContext<Ctx | null>(null);

export function useGlobalLoading() {
  const ctx = useContext(LoadingCtx);
  if (!ctx) throw new Error('useGlobalLoading must be used inside <LoadingProvider/>');
  return ctx;
}

export default function LoadingProvider({
  children,
  minMs = DEFAULT_MIN_MS,
}: { children: React.ReactNode; minMs?: number }) {
  const pathname = usePathname();

  // 🚫 যেসব রুটে অটো-লোডার দেখাতে চাই না (messages পেজ)
  const EXCLUDE_PREFIXES = useMemo(() => ['/messages'], []);
  // 🚫 যেসব API পাথ পোলিং-এর জন্য স্কিপ করবো (messages থ্রেড পোলিং)
  const EXCLUDE_URL_PATTERNS = useMemo(
    () => [/\/authorconnect\/v1\/messages(\/|\?|$)/i],
    []
  );

  const isExcludedRoute = useMemo(
    () => EXCLUDE_PREFIXES.some(p => pathname?.startsWith(p)),
    [pathname, EXCLUDE_PREFIXES]
  );

  const [visible, setVisible] = useState(false);
  const counterRef = useRef(0);
  const lastStartAtRef = useRef<number | null>(null);
  const hideTimerRef = useRef<number | null>(null);

  const reallyHide = () => setVisible(false);

  const start = () => {
    counterRef.current += 1;
    if (counterRef.current === 1) {
      lastStartAtRef.current = Date.now();
      setVisible(true);
    }
  };

  const stop = () => {
    counterRef.current = Math.max(0, counterRef.current - 1);
    if (counterRef.current === 0) {
      const since = lastStartAtRef.current ? Date.now() - lastStartAtRef.current : minMs;
      const wait = Math.max(minMs - since, 0);
      if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = window.setTimeout(reallyHide, wait);
      lastStartAtRef.current = null;
    }
  };

  const withLoader = async <T,>(run: () => Promise<T>, opts?: { minMs?: number }) => {
    // ❌ messages রুটে "ম্যানুয়াল" কলেও ওভারলে দেখাবো না (অটো বারবার যেন না আসে)
    if (isExcludedRoute) {
      return run();
    }
    const localMin = opts?.minMs ?? minMs;
    start();
    const started = Date.now();
    try {
      const out = await run();
      const elapsed = Date.now() - started;
      const wait = Math.max(localMin - elapsed, 0);
      await new Promise((r) => setTimeout(r, wait));
      return out;
    } finally {
      stop();
    }
  };

  // ✅ সব client-side fetch অটো-ট্র্যাক হবে, তবে:
  //  - header: X-Loader=off -> স্কিপ
  //  - messages রুট -> স্কিপ
  //  - messages API পোলিং -> স্কিপ
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const orig = window.fetch.bind(window);
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const hdrs = new Headers((init && init.headers) || {});
      const noLoader = hdrs.get('X-Loader') === 'off';

      // URL বের করি
      let urlStr = '';
      try {
        if (typeof input === 'string') urlStr = input;
        else if (input instanceof URL) urlStr = input.toString();
        else if (typeof (input as any)?.url === 'string') urlStr = (input as any).url;
      } catch {}

      const skipByUrl = EXCLUDE_URL_PATTERNS.some(re => re.test(urlStr));

      if (noLoader || isExcludedRoute || skipByUrl) {
        return orig(input, init);
      }

      start();
      try {
        const res = await orig(input, init);
        return res;
      } finally {
        stop();
      }
    };

    return () => {
      window.fetch = orig;
    };
  }, [isExcludedRoute, EXCLUDE_URL_PATTERNS]);

  const value = useMemo<Ctx>(() => ({ start, stop, withLoader }), [isExcludedRoute, minMs]);

  return (
    <LoadingCtx.Provider value={value}>
      {children}
      {visible && <LoadingOverlay fullscreen />} {/* গ্লোবাল ওভারলে */}
    </LoadingCtx.Provider>
  );
}
