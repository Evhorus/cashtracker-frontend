import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  /** Required, not optional - a bare icon+input with no accessible name
   * is the one thing every caller of this needs to get right themselves,
   * so there's no silent fallback here. */
  "aria-label": string;
  className?: string;
}

// The icon-in-input shell every list/table search box in the app uses
// (envelopes, categories, ...) - previously copy-pasted at each call
// site. Purely presentational: how the value round-trips (a debounced
// URL param, plain local state, ...) stays with the caller, since that
// genuinely differs per list - only the markup was identical.
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
