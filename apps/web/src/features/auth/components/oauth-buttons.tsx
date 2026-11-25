import { Button } from "@/shared/components/ui/button";
import type { OAuthProvider } from "@/features/auth/types";
import { FacebookIcon, GoogleIcon } from "./icons";

interface OAuthButtonsProps {
  disabled?: boolean;
  onSelect: (provider: OAuthProvider) => void;
  exclude?: OAuthProvider[];
}

export function OAuthButtons({
  disabled,
  onSelect,
  exclude = [],
}: OAuthButtonsProps) {
  const showGoogle = !exclude.includes("google");
  const showFacebook = !exclude.includes("facebook");

  if (!showGoogle && !showFacebook) return null;

  return (
    <div
      className={
        showGoogle && showFacebook ? "grid grid-cols-2 gap-x-3" : "grid"
      }
    >
      {showGoogle && (
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          onClick={() => onSelect("google")}
        >
          <GoogleIcon className="size-4" />
          Google
        </Button>
      )}
      {showFacebook && (
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          onClick={() => onSelect("facebook")}
        >
          <FacebookIcon className="size-4" />
          Facebook
        </Button>
      )}
    </div>
  );
}
