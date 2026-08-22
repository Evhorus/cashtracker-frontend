import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import type { ToasterProps } from "sonner";

import { Toaster as UiToaster } from "@/components/ui/sonner";

/**
 * App-wide Toaster. Wraps the stock shadcn Toaster (components/ui/sonner.tsx)
 * instead of modifying it directly, so `ui/` stays regenerable via
 * `shadcn add sonner --overwrite`.
 *
 * Adds a custom icon per toast type instead of sonner's defaults.
 */
function Toaster(props: ToasterProps) {
  return (
    <UiToaster
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      {...props}
    />
  );
}

export { Toaster };
