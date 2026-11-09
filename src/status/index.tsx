// Two pills, side by side, the same on every site: where a product stands, so
// nobody mistakes it for a 1.0, and its license: ( Status: Beta ) ( License: MIT ).
// They carry only that; anything longer belongs in the page's words.
import type { LinkComponent } from '../header/index.js';
import { LICENSE_HREF, type License } from '../license/index.js';

/** How far along a product is. Nothing here is 1.0 yet. */
export type Stage = 'alpha' | 'beta';

const STAGE_NAMES: Record<Stage, string> = { alpha: 'Alpha', beta: 'Beta' };

/** The status pill's words: `Status: Beta`. */
export const statusText = (status: Stage) => `Status: ${STAGE_NAMES[status]}`;

/** The license pill's words. */
export const LICENSE_PILL_TEXT = 'License: MIT';

const PlainLink: LinkComponent = (props) => <a {...props} />;

/** The status pill. Beta has a filled dot, alpha a hollow one. */
export function StatusPill({ status }: { status: Stage }) {
  return (
    <span className="ak-pill ak-status" data-status={status}>
      <i aria-hidden="true" />
      <span>Status: <b>{STAGE_NAMES[status]}</b></span>
    </span>
  );
}

/** The license pill, linking to the license page. */
export function LicensePill({ license = {}, Link = PlainLink }: { license?: License; Link?: LinkComponent }) {
  return (
    <Link className="ak-pill ak-license-pill" href={license.href ?? LICENSE_HREF}>
      <i aria-hidden="true" />
      <span>License: <b>MIT</b></span>
    </Link>
  );
}

/** ( Status: Beta ) ( License: MIT ): the pair, side by side, either one alone when only it is given. */
export function ProductPills({ status, license, Link }: { status?: Stage; license?: License; Link?: LinkComponent }) {
  if (!status && !license) return null;
  return (
    <div className="ak-pills">
      {status && <StatusPill status={status} />}
      {license && <LicensePill license={license} Link={Link} />}
    </div>
  );
}
