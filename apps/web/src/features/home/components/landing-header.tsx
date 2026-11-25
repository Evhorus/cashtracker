import Link from "next/link";
import { useTranslations } from "next-intl";

import { LocaleToggle } from "@/features/locale/components/locale-toggle";
import { Logo } from "@/shared/components/common/logo";
import { ModeToggle } from "@/shared/components/common/mode-toggle";
import { buttonVariants } from "@/shared/components/ui/button";

// Public landing header only; signed-in users redirect server-side, so no Clerk client SDK is needed.
export const LandingHeader = () => {
  const t = useTranslations("nav");
  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Logo />

        <div className="flex items-center gap-4">
          <LocaleToggle />
          <ModeToggle />
          <Link
            href="/sign-in"
            className={buttonVariants({
              variant: "outline",
              size: "default",
              className: "bg-transparent",
            })}
          >
            {t("signIn")}
          </Link>
        </div>
      </div>
    </header>
  );
};
