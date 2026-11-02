// components/route-loader-provider.tsx
"use client";

import {
  createContext,
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { usePathname, useSearchParams } from "next/navigation";

const RouteLoaderContext = createContext<{
  loading: boolean;
  start: () => void;
  done: () => void;
}>({ loading: false, start: () => {}, done: () => {} });

export function useRouteLoader() {
  return useContext(RouteLoaderContext);
}

function SearchWatch({ onChange }: { onChange: (q: string) => void }) {
  const q = useSearchParams().toString();
  useEffect(() => onChange(q), [q, onChange]);
  return null;
}

export function RouteLoaderProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [shownPath, setShownPath] = useState(pathname);
  if (shownPath !== pathname) {
    setShownPath(pathname);
    setLoading(false);
  }

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, [pathname]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement)?.closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("http")) return;
      if (anchor.target === "_blank" || e.metaKey || e.ctrlKey) return;
      if (href === pathname) return;

      setLoading(true);
      timeoutRef.current = setTimeout(() => setLoading(false), 4000);
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [pathname]);

  const start = useCallback(() => setLoading(true), []);
  const done = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setLoading(false);
  }, []);
  const shownSearch = useRef<string | null>(null);
  const searchChanged = useCallback(
    (q: string) => {
      if (shownSearch.current !== null && shownSearch.current !== q) done();
      shownSearch.current = q;
    },
    [done],
  );

  return (
    <RouteLoaderContext.Provider value={{ loading, start, done }}>
      <Suspense fallback={null}>
        <SearchWatch onChange={searchChanged} />
      </Suspense>
      {children}
    </RouteLoaderContext.Provider>
  );
}
