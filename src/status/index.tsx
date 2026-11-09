// Where a product stands, so nobody mistakes it for a 1.0: "Status: Alpha", or
// "Status: Beta · not yet audited: keep only what you can rotate.". One pill,
// the same on every site; `statusText` is its words, for tests and metadata.

/** How far along a product is. Nothing here is 1.0 yet. */
export type Stage = 'alpha' | 'beta';

const STAGE_NAMES: Record<Stage, string> = { alpha: 'Alpha', beta: 'Beta' };

export type StatusProps = {
  status: Stage;
  /** What a visitor should know at this stage: `not yet audited: keep only what you can rotate.` */
  note?: string;
  /** Whose status, when the page is about something else: `p8` → "p8 status: Alpha". */
  subject?: string;
};

/** The pill's words: `Status: Beta · <note>`, or `p8 status: Alpha`. */
export function statusText({ status, note, subject }: StatusProps): string {
  return `${statusLabel({ status, subject })}${note ? ` · ${note}` : ''}`;
}

const statusLabel = ({ status, subject }: Pick<StatusProps, 'status' | 'subject'>) =>
  `${subject ? `${subject} status` : 'Status'}: ${STAGE_NAMES[status]}`;

/** The pill: the stage in the ink colour, the note after it, quieter. */
export function StatusPill({ status, note, subject }: StatusProps) {
  return (
    <span className="ak-status" data-status={status}>
      <i aria-hidden="true" />
      <span><b>{statusLabel({ status, subject })}</b>{note && ` · ${note}`}</span>
    </span>
  );
}
