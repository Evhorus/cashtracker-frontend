import { Button } from "@/components/ui/button";
import { FacebookIcon, GoogleIcon } from "./icons";
import type { OAuthProvider } from "../types";

interface OAuthButtonsProps {
  disabled?: boolean;
  onSelect: (provider: OAuthProvider) => void;
  /** Providers to hide entirely - e.g. the account page's "connect a new
   * provider" list shouldn't offer a provider that's already linked. */
  exclude?: OAuthProvider[];
}

// Shared between sign-in, sign-up, and the account page's connected-
// accounts section - same two buttons everywhere, the provider-agnostic
// OAuthProvider value is all the caller passes back.
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
