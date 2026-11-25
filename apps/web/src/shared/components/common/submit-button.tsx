import type { ComponentProps } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/shared/components/ui/button";

type SubmitButtonProps = ComponentProps<typeof Button> & {
  isLoading?: boolean;
};

/** Form submit button with a pending spinner; use `Button` directly when `isLoading` is not needed. */
function SubmitButton({
  isLoading = false,
  disabled,
  children,
  ...props
}: SubmitButtonProps) {
  if (isLoading) {
    return (
      <Button disabled {...props}>
        <Loader2 aria-hidden className="mr-2 size-4 animate-spin" />
        {children}
      </Button>
    );
  }

  return (
    <Button disabled={disabled} {...props}>
      {children}
    </Button>
  );
}

export { SubmitButton };
