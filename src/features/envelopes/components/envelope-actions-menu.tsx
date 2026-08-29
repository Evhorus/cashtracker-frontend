"use client";

import { useState } from "react";
import { Edit, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Envelope } from "@/features/envelopes/types";
import { UpdateEnvelopeDialog } from "./update-envelope-dialog";
import { DeleteEnvelopeAlertDialog } from "./delete-envelope-alert-dialog";
import { ActionsDrawer, ActionItem } from "@/components/common/actions-drawer";

interface EnvelopeActionsMenuProps {
  envelope: Envelope;
}

export const EnvelopeActionsMenu = ({ envelope }: EnvelopeActionsMenuProps) => {
  const t = useTranslations("envelopes");
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const actions: ActionItem[] = [
    {
      label: t("editAria"),
      icon: Edit,
      onClick: () => setShowEditDialog(true),
    },
    {
      label: t("deleteAria"),
      icon: Trash2,
      onClick: () => setShowDeleteDialog(true),
      variant: "destructive",
    },
  ];

  return (
    <>
      <ActionsDrawer actions={actions} title={t("optionsMenu")} />

      <UpdateEnvelopeDialog
        envelope={envelope}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
      />
      <DeleteEnvelopeAlertDialog
        id={envelope.id}
        name={envelope.name}
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
      />
    </>
  );
};
