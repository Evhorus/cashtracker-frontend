import { Button } from "@/components/ui/button";
import { FacebookIcon, GoogleIcon } from "./icons";
import type { OAuthProvider } from "../types";

interface OAuthButtonsProps {
  disabled?: boolean;
  onSelect: (provider: OAuthProvider) => void;
}

// Shared between sign-in and sign-up - same two buttons either way, the
// provider-agnostic OAuthProvider value is all the caller passes back.
export function OAuthButtons({ disabled, onSelect }: OAuthButtonsProps) {
  return (
    <div className="grid grid-cols-2 gap-x-3">
      <Button
        type="button"
        variant="outline"
        disabled={disabled}
        onClick={() => onSelect("google")}
      >
        <GoogleIcon className="size-4" />
        Google
      </Button>
      <Button
        type="button"
        variant="outline"
        disabled={disabled}
        onClick={() => onSelect("facebook")}
      >
        <FacebookIcon className="size-4" />
        Facebook
      </Button>
    </div>
  );
}
