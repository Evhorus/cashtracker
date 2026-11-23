import { Search } from "lucide-react";

import { Input } from "@/shared/components/ui/input";
import { cn } from "@/shared/lib/utils";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  /** Required so callers provide an accessible name for the icon-only input. */
  "aria-label": string;
  className?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder,
  className,
  ...props
}: SearchInputProps) {
  return (
    <div className={cn("relative", className)}>
      <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder={placeholder}
        aria-label={props["aria-label"]}
        className="pl-8"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
