"use client";
import { useState } from "react";
import { Edit } from "lucide-react";
import { useTranslations } from "next-intl";

import { updateEnvelopeAction } from "@/features/envelopes/actions/update-envelope.action";
import { EnvelopeFormValues } from "@/features/envelopes/schemas/envelope.schema";
import { EditableEnvelope } from "@/features/envelopes/types";
import { CardActionButton } from "@/shared/components/common/card-action-button";
import { ResponsiveFormSheet } from "@/shared/components/common/responsive-form-sheet";
import { useActionDialog } from "@/shared/hooks/useActionDialog";
import { EnvelopeForm } from "./envelope-form";

interface UpdateEnvelopeDialogProps {
  envelope: EditableEnvelope;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Overrides the default trigger aria-label (e.g. shorter label on the detail page). */
  label?: string;
  showLabelOnDesktop?: boolean;
}

export const UpdateEnvelopeDialog = ({
  envelope,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  label,
  showLabelOnDesktop,
}: UpdateEnvelopeDialogProps) => {
  const t = useTranslations("envelopes");
  const [internalOpen, setInternalOpen] = useState(false);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? setControlledOpen! : setInternalOpen;

  const { dispatch, isPending } = useActionDialog(
    updateEnvelopeAction,
    {
      errors: [],
      success: "",
    },
    {
      setOpen,
    },
  );

  const handleUpdate = async (envelopeFormValues: EnvelopeFormValues) => {
    dispatch({ ...envelopeFormValues, id: envelope.id });
  };

  return (
    <ResponsiveFormSheet
      open={open}
      onOpenChange={setOpen}
      title={t("updateDialog.title")}
      description={t("updateDialog.description")}
      trigger={
        isControlled ? undefined : (
          <CardActionButton
            icon={Edit}
            label={label ?? t("editAria")}
            showLabelOnDesktop={showLabelOnDesktop}
          />
        )
      }
    >
      <EnvelopeForm
        key={envelope.id}
        defaultValues={{
          name: envelope.name,
          hasLimit: envelope.amount !== null,
          amount: envelope.amount ?? "",
          // Must pass envelope.currency explicitly; EnvelopeForm defaults to "COP".
          currency: envelope.currency,
          categoryId: envelope.category?.id ?? "",
        }}
        isLoading={isPending}
        // Lock currency when the envelope already has expenses (spent > 0).
        isCurrencyLocked={Number(envelope.spent) > 0}
        onSubmit={handleUpdate}
        onCloseDialog={() => setOpen(false)}
      />
    </ResponsiveFormSheet>
  );
};
