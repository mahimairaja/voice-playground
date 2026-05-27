/**
 * Shared type fragments for the credentials runtime. Defined here so the
 * components that surface rejection information (banner, sheet, voice surface)
 * can agree on shape without depending on each other.
 */

export interface RejectionDetail {
  provider: string;
  reason?: string;
}
