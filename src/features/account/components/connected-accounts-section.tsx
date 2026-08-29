"use client";

import { useTranslations } from "next-intl";
import { Loader2, Unlink } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ErrorMessage } from "@/components/common/error-message";
import { Text } from "@/components/common/typography";
import { OAuthButtons } from "@/features/auth/components/oauth-buttons";
import type { OAuthProvider } from "@/features/auth/types";
import { useConnectedAccounts } from "../hooks/use-connected-accounts";

const OAUTH_PROVIDERS: OAuthProvider[] = ["google", "facebook"];

export function ConnectedAccountsSection() {
  const t = useTranslations("account.connected");
  const {
    connectedAccounts,
    connectingProvider,
    disconnectingId,
    error,
    connectProvider,
    disconnectAccount,
  } = useConnectedAccounts();

  // Only offer providers not already linked - "Google" still showing up
  // under "connect a new provider" right next to an already-connected
  // Google account reads as broken, not as a real second option.
  const linkedProviders = connectedAccounts
    .map((account) => account.providerId)
    .filter((id): id is OAuthProvider =>
      OAUTH_PROVIDERS.includes(id as OAuthProvider),
    );
  const hasMoreToConnect = linkedProviders.length < OAUTH_PROVIDERS.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("subtitle")}</CardDescription>
      </CardHeader>
      <CardContent className="gap-y-4">
        {error && <ErrorMessage>{error}</ErrorMessage>}

        {connectedAccounts.length > 0 && (
          <div className="grid gap-y-2">
            {connectedAccounts.map((account) => (
              <div
                key={account.id}
                className="flex items-center justify-between gap-4 rounded-lg border border-border/60 p-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar>
                    <AvatarImage src={account.imageUrl} alt={account.label} />
                    <AvatarFallback>{account.label[0]}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{account.label}</p>
                    <Text className="truncate text-xs">
                      {account.identifier}
                    </Text>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={disconnectingId === account.id}
                  onClick={() => disconnectAccount(account.id)}
                >
                  {disconnectingId === account.id ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <Unlink />
                  )}
                  Desconectar
                </Button>
              </div>
            ))}
          </div>
        )}

        {hasMoreToConnect && (
          <div>
            <Text className="mb-2 font-medium">
              Conectar un nuevo proveedor
            </Text>
            <OAuthButtons
              disabled={connectingProvider !== null}
              onSelect={connectProvider}
              exclude={linkedProviders}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
