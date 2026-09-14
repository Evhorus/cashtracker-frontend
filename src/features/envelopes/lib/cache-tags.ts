/** The envelopes feature's cache tags. See dashboard/lib/cache-tags.ts. */
export const ENVELOPE_TAGS = {
  /** The paginated list, whatever the filters - every envelope write moves it. */
  all: "all-envelopes",
  /**
   * One envelope's detail response.
   *
   * Per-id, not the single global "envelope" this used to be: that tag
   * meant editing one envelope dropped the cached detail of every other
   * one too. Correct, but it threw away work on every write.
   */
  detail: (id: string) => `envelope-${id}`,
} as const;
