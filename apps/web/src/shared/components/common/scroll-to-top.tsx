"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export const APP_SCROLL_CONTAINER_ID = "app-scroll-container";

export function scrollAppToTop() {
  const container = document.getElementById(APP_SCROLL_CONTAINER_ID);
  if (container) {
    container.scrollTo({ top: 0, behavior: "instant" });
  } else {
    window.scrollTo({ top: 0, behavior: "instant" });
  }
}

export function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    scrollAppToTop();
  }, [pathname]);

  return null;
}
