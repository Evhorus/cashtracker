"use client";

import { useState } from "react";
import { SearchX, Wallet } from "lucide-react";
import { useTranslations } from "next-intl";

import { type EnvelopeStatusTab } from "@/features/envelopes/lib/envelope-helpers";
import { EditableEnvelope, Envelope } from "@/features/envelopes/types";
import { EmptyState } from "@/shared/components/common/empty-state";
import { CreateEnvelopeDialog } from "./create-envelope-dialog";
import { DeleteEnvelopeAlertDialog } from "./delete-envelope-alert-dialog";
import { EnvelopeCard } from "./envelope-card";
import { statusFilterLabel } from "./envelopes-filter";
import { EnvelopesTable } from "./envelopes-table";
import { UpdateEnvelopeDialog } from "./update-envelope-dialog";

interface EnvelopesGridProps {
  envelopes: Envelope[];
  /** Active search term; switches empty state to "no matches" instead of first-run CTA. */
  searchQuery?: string;
  /** Active status filter; switches empty state to "no matches" when not "all". */
  statusFilter?: EnvelopeStatusTab;
}

export const EnvelopesGrid = ({
  envelopes,
  searchQuery,
  statusFilter = "all",
}: EnvelopesGridProps) => {
  const t = useTranslations("envelopes");
  const hasActiveFilter = Boolean(searchQuery) || statusFilter !== "all";
  const [editingEnvelope, setEditingEnvelope] =
    useState<EditableEnvelope | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deletingEnvelope, setDeletingEnvelope] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleEdit = (envelope: Envelope) => {
    setEditingEnvelope(envelope);
    setEditOpen(true);
  };

  const handleDelete = (envelope: Envelope) => {
    setDeletingEnvelope({ id: envelope.id, name: envelope.name });
    setDeleteOpen(true);
  };

  return (
    <>
      {envelopes.length === 0 ? (
        hasActiveFilter ? (
          <EmptyState
            icon={SearchX}
            title={
              searchQuery
                ? t("empty.noResultsTitle", { query: searchQuery })
                : t("empty.noneInFilterTitle", {
                    filter: statusFilterLabel(t, statusFilter),
                  })
            }
            description={
              searchQuery
                ? t("empty.noResultsBody")
                : t("empty.noneInFilterBody")
            }
          />
        ) : (
          <EmptyState
            variant="first-run"
            icon={Wallet}
            eyebrow={t("empty.firstRunEyebrow")}
            title={t("empty.firstRunTitle")}
            description={t("empty.firstRunBody")}
            action={<CreateEnvelopeDialog />}
          />
        )
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {envelopes.map((envelope, index) => (
              <div
                key={envelope.id}
                style={{ animationDelay: `${0.5 + index * 0.1}s` }}
              >
                <EnvelopeCard
                  envelope={envelope}
                  onEdit={() => handleEdit(envelope)}
                  onDelete={() => handleDelete(envelope)}
                />
              </div>
            ))}
          </div>
          <EnvelopesTable
            envelopes={envelopes}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </>
      )}

      {editingEnvelope && (
        <UpdateEnvelopeDialog
          envelope={editingEnvelope}
          open={editOpen}
          onOpenChange={setEditOpen}
        />
      )}
      {deletingEnvelope && (
        <DeleteEnvelopeAlertDialog
          id={deletingEnvelope.id}
          name={deletingEnvelope.name}
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
        />
      )}
    </>
  );
};
