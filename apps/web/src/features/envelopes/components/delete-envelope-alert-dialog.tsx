"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { deleteEnvelopeAction } from "@/features/envelopes/actions/delete-envelope.action";
import { CardActionButton } from "@/shared/components/common/card-action-button";
import { ConfirmDeleteDialog } from "@/shared/components/common/confirm-delete-dialog";
import { Text } from "@/shared/components/common/typography";
import { Input } from "@/shared/components/ui/input";
import { useActionDialog } from "@/shared/hooks/useActionDialog";

interface DeleteEnvelopeAlertDialogProps {
  id: string;
  name: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  label?: string;
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
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) setInputValue("");
    if (isControlled) {
      setControlledOpen?.(nextOpen);
    } else {
      setInternalOpen(nextOpen);
    }
  };

  const { dispatch, isPending } = useActionDialog(
    deleteEnvelopeAction,
    { errors: [], success: "" },
    {
      setOpen: handleOpenChange,
      onSuccess: () => {
        if (pathname.startsWith("/dashboard/envelope/")) {
          router.replace("/dashboard/envelopes");
        }
      },
    },
  );

  return (
    <ConfirmDeleteDialog
      open={open}
      onOpenChange={handleOpenChange}
      title={t("deleteDialog.title")}
      description={t("deleteDialog.description")}
      confirmLabel={tCommon("delete")}
      cancelLabel={tCommon("cancel")}
      isPending={isPending}
      confirmDisabled={inputValue !== name}
      onConfirm={() => dispatch(id)}
      trigger={
        isControlled ? undefined : (
          <CardActionButton
            icon={Trash2}
            label={label ?? t("deleteAria")}
            tone="destructive"
            showLabelOnDesktop={showLabelOnDesktop}
          />
        )
      }
    >
      <div className="my-2 space-y-2">
        <Text>
          {t.rich("deleteDialog.confirmPrompt", {
            name: () => (
              <span className="font-bold text-foreground">{name}</span>
            ),
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
    </ConfirmDeleteDialog>
  );
};
