"use client";
import { AccountMenu } from "@/features/account/components/account-menu";
import { LocaleToggle } from "@/features/locale/components/locale-toggle";
import { Logo } from "@/shared/components/common/logo";
import { ModeToggle } from "@/shared/components/common/mode-toggle";

/** Dashboard top bar for app-wide controls; logo and account menu render only below `md` since the sidebar owns them on desktop. */
export const CustomHeader = () => {
  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="md:hidden">
          <Logo href="/dashboard" />
        </div>

        {/* gap-2 on narrow phones keeps the logo from colliding with the action buttons at 320px. */}
        <div className="ml-auto flex items-center gap-2 sm:gap-4">
          <LocaleToggle />
          <ModeToggle />
          <div className="md:hidden">
            <AccountMenu />
          </div>
        </div>
      </div>
    </header>
  );
};
