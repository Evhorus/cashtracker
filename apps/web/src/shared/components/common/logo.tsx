import Link from "next/link";
import { Wallet } from "lucide-react";

// Intentionally free of Clerk imports so public pages don't pull in Clerk's client bundle; callers pass auth-aware `href`.
export const Logo = ({ href = "/" }: { href?: string }) => {
  return (
    <Link href={href} className="flex items-center gap-2">
      <Wallet className="h-6 w-6 text-primary" />
      <span className="text-xl font-bold text-foreground">CashTracker</span>
    </Link>
  );
};
