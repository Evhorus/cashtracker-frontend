import Link from "next/link";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/common/typography";

// A real 404, not a redirect. This used to `redirect("/")`, which turned
// every wrong URL into a silent bounce to the marketing page: the user
// got no explanation, a signed-in user got bounced again from "/" to
// /dashboard, and crawlers saw a 302 where a 404 belongs. Rendering the
// page keeps the correct status code and actually tells the visitor what
// happened.
export default function NotFound() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-5 px-4 py-24 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
        <Compass className="h-8 w-8 text-primary" />
      </div>
      <div className="space-y-2">
        <p className="font-mono text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          Error 404
        </p>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Esta página no existe
        </h1>
        <Text className="mx-auto max-w-sm">
          Puede que el enlace esté mal escrito, o que lo que buscabas se haya
          eliminado.
        </Text>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        {/* render + nativeButton={false} is this app's convention for a
            link that looks like a button - see back-link-button.tsx. */}
        <Button render={<Link href="/dashboard" />} nativeButton={false}>
          Ir a mi resumen
        </Button>
        <Button
          variant="outline"
          render={<Link href="/" />}
          nativeButton={false}
        >
          Volver al inicio
        </Button>
      </div>
    </div>
  );
}
