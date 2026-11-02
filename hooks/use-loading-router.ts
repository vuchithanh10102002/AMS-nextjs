// hooks/use-loading-router.ts
"use client";

import { useRouteLoader } from "@/components/provider/router-loader-provider";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useTransition } from "react";

export function useLoadingRouter() {
  const router = useRouter();
  const { start, done } = useRouteLoader();
  const [pending, startTransition] = useTransition();
  const started = useRef(false);

  useEffect(() => {
    if (!pending && started.current) {
      started.current = false;
      done();
    }
  }, [pending, done]);

  return useMemo(() => {
    const go = (nav: () => void) => {
      started.current = true;
      start();
      startTransition(nav);
    };
    return {
      push: (href: string) => go(() => router.push(href)),
      replace: (href: string) => go(() => router.replace(href)),
      back: () => {
        start();
        router.back();
      },
      forward: () => {
        start();
        router.forward();
      },
      refresh: () => {
        router.refresh();
      },
    };
  }, [router, start]);
}
