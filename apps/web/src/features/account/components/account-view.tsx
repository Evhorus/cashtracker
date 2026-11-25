"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  KeyRound,
  Laptop,
  Link2,
  Loader2,
  Trash2,
  UserRound,
  CreditCard,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { PaymentMethodsSection } from "@/features/payment-methods/components/payment-methods-section";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";
import { cn } from "@/shared/lib/utils";
import { useAccountUser } from "../hooks/use-account-user";
import { ConnectedAccountsSection } from "./connected-accounts-section";
import { DeleteAccountSection } from "./delete-account-section";
import { PasswordSection } from "./password-section";
import { ProfileSection } from "./profile-section";
import { ReverificationProvider } from "./reverification-provider";
import { SessionsSection } from "./sessions-section";

// `value` doubles as the ?section= URL param and the `account.sections.*` message key.
const SECTIONS = [
  { value: "profile", icon: UserRound },
  { value: "password", icon: KeyRound },
  { value: "sessions", icon: Laptop },
  { value: "connected", icon: Link2 },
  { value: "paymentMethods", icon: CreditCard },
  { value: "danger", icon: Trash2 },
] as const;

type SectionValue = (typeof SECTIONS)[number]["value"];

function isSectionValue(value: string | null): value is SectionValue {
  return SECTIONS.some((s) => s.value === value);
}

// Single useAccountUser() call so every section re-renders off the same Clerk user object.
export function AccountView() {
  const t = useTranslations("account");
  const { isLoaded, user } = useAccountUser();
  // Read ?section= once as the initial tab (used by OAuth-linking callback) without locking later switches.
  const searchParams = useSearchParams();
  const initialSection = searchParams.get("section");
  const [section, setSection] = useState<SectionValue>(
    isSectionValue(initialSection) ? initialSection : "profile",
  );

  if (!isLoaded || !user) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    // Shared reverification provider for Password, ConnectedAccounts, and DeleteAccount sections.
    <ReverificationProvider>
      <Tabs
        value={section}
        onValueChange={(value) => setSection(value as SectionValue)}
        orientation="horizontal"
        className="gap-6"
      >
        {/* Mobile uses Select because Base UI's scroll-active-tab-into-view mispositions tabs on narrow screens. */}
        <div className="md:hidden">
          <Select
            value={section}
            onValueChange={(value) => setSection(value as SectionValue)}
          >
            <SelectTrigger aria-label={t("menu")} className="w-full">
              <SelectValue>
                {(value: string) => {
                  const current = SECTIONS.find((s) => s.value === value);
                  if (!current) return null;
                  return (
                    <>
                      <current.icon className="size-4 text-muted-foreground" />
                      {t(`sections.${current.value}`)}
                    </>
                  );
                }}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {SECTIONS.map((s) => (
                <SelectItem
                  key={s.value}
                  value={s.value}
                  className={cn(
                    "gap-2",
                    s.value === "danger" && "text-destructive",
                  )}
                >
                  <s.icon className="size-4" />
                  {t(`sections.${s.value}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* h-auto! overrides TabsList's variant-scoped h-9; flex-wrap avoids Base UI's horizontal scroll clipping. */}
        <TabsList className="hidden h-auto! w-fit max-w-full flex-wrap items-center gap-1.5 rounded-2xl border border-border/60 bg-card/50 p-2.5 md:flex">
          {SECTIONS.map((s) => (
            <TabsTrigger
              key={s.value}
              value={s.value}
              className={cn(
                "shrink-0 gap-2 rounded-full border-none px-4 py-2.5 text-sm font-medium text-muted-foreground shadow-none transition-colors",
                "hover:bg-muted hover:text-foreground",
                "data-active:bg-primary/15 data-active:font-semibold data-active:text-primary data-active:shadow-sm dark:data-active:border-transparent dark:data-active:bg-primary/15 dark:data-active:text-primary",
                // Important modifiers override TabsTrigger's idle/hover/active/dark text variants in one rule.
                s.value === "danger" &&
                  "text-destructive! hover:bg-destructive/10! data-active:bg-destructive/10! dark:data-active:border-transparent! dark:data-active:bg-destructive/20!",
              )}
            >
              <s.icon className="size-4" />
              {t(`sections.${s.value}`)}
            </TabsTrigger>
          ))}
        </TabsList>

        <div>
          <TabsContent value="profile">
            <ProfileSection user={user} />
          </TabsContent>
          <TabsContent value="password">
            <PasswordSection />
          </TabsContent>
          <TabsContent value="sessions">
            <SessionsSection />
          </TabsContent>
          <TabsContent value="connected">
            <ConnectedAccountsSection />
          </TabsContent>
          <TabsContent value="paymentMethods">
            <PaymentMethodsSection />
          </TabsContent>
          <TabsContent value="danger">
            <DeleteAccountSection user={user} />
          </TabsContent>
        </div>
      </Tabs>
    </ReverificationProvider>
  );
}
