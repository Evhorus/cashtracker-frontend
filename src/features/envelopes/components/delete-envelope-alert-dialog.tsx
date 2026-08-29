"use client";
import { deleteEnvelopeAction } from "@/features/envelopes/actions/delete-envelope.action";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { CardActionButton } from "@/components/common/card-action-button";
import { Text } from "@/components/common/typography";
import { useActionDialog } from "@/hooks/useActionDialog";
import { Loader2, Trash2 } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";

interface DeleteEnvelopeAlertDialogProps {
  id: string;
  name: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Override the default trigger's a11y label (envelopes.deleteAria) -
   * the envelope detail page passes the shorter common.delete since
   * there's only one delete button on that page, no ambiguity to
   * resolve. */
  label?: string;
  /** See CardActionButton - only the envelope detail page's header
   * turns this on. */
  showLabelOnDesktop?: boolean;
}

export const DeleteEnvelopeAlertDialog = ({
  id,
  name,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  label,
  showLabelOnDesktop,
}: DeleteEnvelopeAlertDialogProps) => {
  const t = useTranslations("envelopes");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const pathname = usePathname();
  const [internalOpen, setInternalOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const { dispatch, isPending } = useActionDialog(
    deleteEnvelopeAction,
    {
      errors: [],
      success: "",
    },
    {
      setOpen: (open) => {
        if (controlledOpen === undefined) {
          setInternalOpen(open);
        } else {
          setControlledOpen?.(open);
        }
      },
      onSuccess: () => {
        setInputValue("");

        if (pathname.startsWith("/dashboard/envelope/")) {
          router.replace("/dashboard/envelopes");
        } else {
          router.refresh();
        }
      },
    },
  );

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? setControlledOpen : setInternalOpen;

  const handleDeleteEnvelope = async () => {
    dispatch(id);
  };

  const Content = (
    <div className="my-2 space-y-2">
      <Text>
        {t.rich("deleteDialog.confirmPrompt", {
          name: () => <span className="font-bold text-foreground">{name}</span>,
        })}
      </Text>
      <Input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder={t("deleteDialog.namePlaceholder")}
        className="col-span-3"
        autoComplete="off"
      />
    </div>
  );

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      {!isControlled && (
        <AlertDialogTrigger
          render={
            <CardActionButton
              icon={Trash2}
              label={label ?? t("deleteAria")}
              tone="destructive"
              showLabelOnDesktop={showLabelOnDesktop}
            />
          }
        />
      )}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("deleteDialog.title")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("deleteDialog.description")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        {Content}
        <AlertDialogFooter>
          <AlertDialogCancel>{tCommon("cancel")}</AlertDialogCancel>
          <AlertDialogAction
            className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90 sm:w-auto"
            onClick={(e) => {
              e.preventDefault();
              handleDeleteEnvelope();
            }}
            disabled={isPending || inputValue !== name}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {tCommon("delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
