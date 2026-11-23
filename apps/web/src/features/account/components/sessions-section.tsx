"use client";

import { Laptop, Loader2, LogOut, Smartphone } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { ErrorMessage } from "@/shared/components/common/error-message";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { formatRelativeTime } from "@/shared/utils/date-helpers";
import { useSessions } from "../hooks/use-sessions";

export function SessionsSection() {
  const t = useTranslations("account.sessions");
  const locale = useLocale();
  const { sessions, isLoading, error, revokingId, revokeSession } =
    useSessions();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("subtitle")}</CardDescription>
      </CardHeader>
      <CardContent className="gap-y-3">
        {error && <ErrorMessage>{error}</ErrorMessage>}

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : sessions?.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("empty")}</p>
        ) : (
          sessions?.map((session) => {
            const DeviceIcon = session.isMobile ? Smartphone : Laptop;
            return (
              <div
                key={session.id}
                className="flex flex-col gap-3 rounded-lg border border-border/60 p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted">
                    <DeviceIcon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    {/* Wraps instead of truncating so users can inspect full session details. */}
                    <p className="flex flex-wrap items-center gap-2 text-sm font-medium">
                      {session.browser} ·{" "}
                      {t(session.isMobile ? "mobile" : "desktop")}
                      {session.isCurrent && (
                        <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">
                          {t("thisDevice")}
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {session.location} ·{" "}
                      {t("lastActive", {
                        when: formatRelativeTime(session.lastActiveAt, locale),
                      })}
                    </p>
                  </div>
                </div>

                {!session.isCurrent && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="w-full sm:w-fit"
                    disabled={revokingId === session.id}
                    onClick={() => revokeSession(session.id)}
                  >
                    {revokingId === session.id ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <LogOut />
                    )}
                    {t("revoke")}
                  </Button>
                )}
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
