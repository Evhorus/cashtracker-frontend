"use client";

import { Laptop, Loader2, LogOut, Smartphone } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ErrorMessage } from "@/components/common/error-message";
import { formatRelativeTime } from "@/lib/date-helpers";
import { useSessions } from "../hooks/use-sessions";

export function SessionsSection() {
  const { sessions, isLoading, error, revokingId, revokeSession } =
    useSessions();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sesiones activas</CardTitle>
        <CardDescription>
          Dispositivos donde tu cuenta tiene una sesión iniciada actualmente
        </CardDescription>
      </CardHeader>
      <CardContent className="gap-y-3">
        {error && <ErrorMessage>{error}</ErrorMessage>}

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : sessions?.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No hay sesiones activas.
          </p>
        ) : (
          sessions?.map((session) => {
            const DeviceIcon = session.device === "Móvil" ? Smartphone : Laptop;
            return (
              <div
                key={session.id}
                className="flex flex-col gap-3 rounded-lg border border-border/60 p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted">
                    <DeviceIcon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    {/* No truncate here - identifying whether a session is
                        suspicious depends on reading this in full, so it
                        wraps to another line instead of hiding behind an
                        ellipsis (same criterion as envelope-card.tsx). */}
                    <p className="flex flex-wrap items-center gap-2 text-sm font-medium">
                      {session.browser} · {session.device}
                      {session.isCurrent && (
                        <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">
                          Este dispositivo
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {session.location} · activo{" "}
                      {formatRelativeTime(session.lastActiveAt)}
                    </p>
                  </div>
                </div>

                {!session.isCurrent && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="w-fit"
                    disabled={revokingId === session.id}
                    onClick={() => revokeSession(session.id)}
                  >
                    {revokingId === session.id ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <LogOut />
                    )}
                    Cerrar sesión
                  </Button>
                )}
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
