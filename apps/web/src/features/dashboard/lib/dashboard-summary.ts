import { EnvelopeHelpers } from "@/features/envelopes/lib/envelope-helpers";
import type { Envelope } from "@/features/envelopes/types";

export interface AlertEnvelope {
  envelope: Envelope;
  status: "warning" | "exceeded";
  percentage: number;
}

/** Returns warning/exceeded envelopes sorted worst-first, matching the envelopes "alert" filter. */
export function getAlertEnvelopes(envelopes: Envelope[]): AlertEnvelope[] {
  return envelopes
    .map((envelope) => ({
      envelope,
      status: envelope.status,
      percentage: EnvelopeHelpers.getPercentage(envelope) ?? 0,
    }))
    .filter(
      (entry): entry is AlertEnvelope =>
        entry.status === "warning" || entry.status === "exceeded",
    )
    .sort((a, b) => b.percentage - a.percentage);
}
