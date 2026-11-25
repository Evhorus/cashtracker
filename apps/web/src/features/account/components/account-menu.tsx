"use client";

import Link from "next/link";
import { Loader2, LogOut, Settings } from "lucide-react";
import { useTranslations } from "next-intl";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { useAccountUser } from "../hooks/use-account-user";

interface AccountMenuProps {
  /** Optional single-element trigger for Base UI's `render` prop (defaults to the avatar button). */
  trigger?: React.ReactElement;
}

// Custom replacement for Clerk's <UserButton>; `isLoaded` guards the brief client hydration gap.
export function AccountMenu({ trigger }: AccountMenuProps = {}) {
  const t = useTranslations("account");
  const { isLoaded, user, isSigningOut, signOut } = useAccountUser();

  if (!isLoaded || !user) return null;

  const defaultTrigger = (
    <button className="rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
      <Avatar>
        <AvatarImage src={user.imageUrl} alt={user.fullName} />
        <AvatarFallback>{user.initials}</AvatarFallback>
      </Avatar>
    </button>
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={t("menu")}
        render={trigger ?? defaultTrigger}
      />
      {/* Explicit width overrides DropdownMenuContent's default w-(--anchor-width) on the small avatar trigger. */}
      <DropdownMenuContent align="end" className="w-64">
        {/* Base UI throws if GroupLabel is rendered outside a Menu.Group. */}
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex flex-col gap-0.5 font-normal">
            <span className="truncate text-sm font-medium text-foreground">
              {user.fullName}
            </span>
            <span className="truncate text-xs text-muted-foreground">
              {user.email}
            </span>
          </DropdownMenuLabel>
          <DropdownMenuItem render={<Link href="/dashboard/account" />}>
            <Settings />
            {t("title")}
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          disabled={isSigningOut}
          onClick={() => signOut()}
        >
          {isSigningOut ? <Loader2 className="animate-spin" /> : <LogOut />}
          {t("signOut")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
