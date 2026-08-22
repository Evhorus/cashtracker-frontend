"use client";

import { useState } from "react";
import { Edit, Trash2 } from "lucide-react";
import { Envelope } from "@/features/envelopes/types";
import { UpdateEnvelopeDialog } from "./update-envelope-dialog";
import { DeleteEnvelopeAlertDialog } from "./delete-envelope-alert-dialog";
import { ActionsDrawer, ActionItem } from "@/components/common/actions-drawer";

interface EnvelopeActionsMenuProps {
  envelope: Envelope;
}

export const EnvelopeActionsMenu = ({ envelope }: EnvelopeActionsMenuProps) => {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const actions: ActionItem[] = [
    {
      label: "Editar Presupuesto",
      icon: Edit,
      onClick: () => setShowEditDialog(true),
    },
    {
      label: "Eliminar Presupuesto",
      icon: Trash2,
      onClick: () => setShowDeleteDialog(true),
      variant: "destructive",
    },
  ];

  return (
    <>
      <ActionsDrawer actions={actions} />

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
