"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";

import {
  Breadcrumb,
  type BreadcrumbLink,
} from "@/features/dashboard/components/breadcrumb";
import { Heading } from "@/shared/components/common/typography";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: ReactNode;
  backUrl?: string;
  actions?: ReactNode;
  mobileActions?: ReactNode;
  icon?: ReactNode;
  breadcrumbParents?: BreadcrumbLink[];
}

export const PageHeader = ({
  title,
  description,
  backUrl,
  actions,
  mobileActions,
  icon,
  breadcrumbParents,
}: PageHeaderProps) => {
  const t = useTranslations("common");
  return (
    <div className="space-y-4">
      {/* items-start aligns the back button with the first title line when wrapping;
          with an icon, `contents` drops the title to its own full-width row on mobile. */}
      <div
        className={cn(
          "flex items-start justify-between gap-4",
          icon && "max-md:flex-wrap max-md:justify-start max-md:gap-3",
        )}
      >
        <div
          className={cn(
            "flex min-w-0 flex-1 items-start gap-3",
            icon && "max-md:contents",
          )}
        >
          {backUrl && (
            // Mobile-only: desktop navigates back via sidebar or breadcrumb.
            <Link href={backUrl} aria-label={t("back")} className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 shrink-0 rounded-full border border-border/60 bg-card/50 text-muted-foreground transition-colors hover:border-primary/30 hover:bg-primary/10 hover:text-primary"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
          )}

          {icon && <div className="shrink-0">{icon}</div>}

          {/* min-w-0 enables wrapping inside flex without truncating user-entered names. */}
          <div
            className={cn(
              "min-w-0 flex-1",
              icon && "max-md:order-last max-md:basis-full",
            )}
          >
            <Heading as="h1" size="lg">
              {title}
            </Heading>
            {description && (
              <div className="flex flex-wrap items-center gap-x-2 text-muted-foreground">
                {description}
              </div>
            )}
          </div>
        </div>

        <div
          className={cn(
            "flex shrink-0 items-center gap-4 md:flex-col md:items-end md:gap-3",
            icon && "max-md:ml-auto",
          )}
        >
          <Breadcrumb
            current={title}
            parents={breadcrumbParents}
            className="hidden md:block"
          />

          {actions && (
            <div className="hidden items-center gap-2 md:flex">{actions}</div>
          )}

          {mobileActions && <div className="md:hidden">{mobileActions}</div>}
        </div>
      </div>
    </div>
  );
};
