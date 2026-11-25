// Structurally typed against Clerk's finalize() navigate callback to avoid Clerk imports outside auth hooks.
export function navigateAfterAuth(
  router: { push: (url: string) => void },
  {
    session,
    decorateUrl,
  }: {
    session?: { currentTask?: unknown } | null;
    decorateUrl: (url: string) => string;
  },
) {
  // Don't navigate away while a Clerk session task (e.g. org selection) is pending.
  if (session?.currentTask) return;

  const url = decorateUrl("/dashboard");
  // Safari ITP cross-domain cookie refresh returns an absolute URL requiring full-page navigation.
  if (url.startsWith("http")) {
    window.location.href = url;
  } else {
    router.push(url);
  }
}
