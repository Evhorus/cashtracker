"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { ConfirmDeleteDialog } from "@/shared/components/common/confirm-delete-dialog";
import { Button } from "@/shared/components/ui/button";
import { useActionDialog } from "@/shared/hooks/use-action-dialog";
import { deletePaymentMethodAction } from "@/features/payment-methods/actions/delete-payment-method.action";
import { usePaymentMethods } from "@/features/payment-methods/providers/payment-methods-provider";
import type { PaymentMethod } from "@/features/payment-methods/types";
import { PaymentMethodDialog } from "./payment-method-dialog";

export function PaymentMethodsSection() {
  const t = useTranslations("paymentMethods");
  const tCommon = useTranslations("common");
  const paymentMethods = usePaymentMethods();
  const [editing, setEditing] = useState<PaymentMethod | undefined>();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleting, setDeleting] = useState<PaymentMethod | null>(null);
  const remove = useActionDialog(
    deletePaymentMethodAction,
    { errors: [], success: "" },
    { setOpen: (open) => !open && setDeleting(null) },
  );

  const openForm = (method?: PaymentMethod) => {
    setEditing(method);
    setIsFormOpen(true);
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <h2 className="text-lg font-semibold">{t("section.title")}</h2>
          <p className="text-sm text-muted-foreground">
            {t("section.description")}
          </p>
        </div>
        <Button onClick={() => openForm()}>
          <Plus className="h-4 w-4" />
          {t("section.add")}
        </Button>
      </div>

      {paymentMethods.length === 0 ? (
        <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
          {t("section.empty")}
        </p>
      ) : (
        <ul className="divide-y rounded-lg border">
          {paymentMethods.map((method) => (
            <li key={method.id} className="flex items-center gap-3 p-3">
              <span
                aria-hidden
                className="h-3 w-3 shrink-0 rounded-full"
                style={{ background: method.color }}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{method.name}</p>
                <p className="text-xs text-muted-foreground">
                  {t(`types.${method.type}`)}
                  {method.cutDay !== null &&
                    ` · ${t("section.cutDayLabel", { day: method.cutDay })}`}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                aria-label={t("section.edit", { name: method.name })}
                onClick={() => openForm(method)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label={t("section.delete", { name: method.name })}
                onClick={() => setDeleting(method)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <PaymentMethodDialog
        key={editing?.id ?? "new"}
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        paymentMethod={editing}
      />

      <ConfirmDeleteDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={t("section.deleteTitle", { name: deleting?.name ?? "" })}
        description={t("section.deleteDescription")}
        confirmLabel={t("section.deleteConfirm")}
        cancelLabel={tCommon("cancel")}
        isPending={remove.isPending}
        onConfirm={() => {
          if (deleting) remove.dispatch({ id: deleting.id });
        }}
      />
    </section>
  );
}
