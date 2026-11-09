// The footer every Addis site shares: who makes it, the site's name, and the
// light/dark switch.
import type { ReactNode } from 'react';
import { ThemeToggle } from '../theme/index.js';
import type { LinkComponent } from '../header/index.js';
import { LicenseLink, type License } from '../license/index.js';

export type Owner = { name: string; href: string; logo: ReactNode };

/** Addis Corp, the default owner. */
export const ADDIS: Owner = {
  name: 'Addis Corp',
  href: 'https://addis.gg',
  logo: <AddisMark />,
};

export type FooterProps = {
  /** The site's name, shown at the end: `simien.dev`. */
  site: string;
  owner?: Owner;
  /** The year in the copyright line; this year by default. */
  year?: number;
  /** Anything else for the end of the footer, before the theme switch. */
  children?: ReactNode;
  /** A small line under the footer row, e.g. trademark notices. */
  note?: ReactNode;
  /** The product's license: `MIT License · © 2026 Sami Fouad`, linking to the license page. */
  license?: License;
  Link?: LinkComponent;
};

export function Footer({ site, owner = ADDIS, year = new Date().getFullYear(), children, note, license, Link }: FooterProps) {
  return (
    <footer className="ak-foot">
      <a className="ak-credit" href={owner.href}>
        {owner.logo}
        © {year} {owner.name}
      </a>
      <span className="ak-foot-end">
        {license && <LicenseLink license={license} Link={Link} />}
        {children}
        <span>{site}</span>
        <ThemeToggle />
      </span>
      {note && <p className="ak-foot-note">{note}</p>}
    </footer>
  );
}

function AddisMark() {
  return (
    <svg className="ak-owner-mark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width={32} height={32} aria-hidden="true" dangerouslySetInnerHTML={{ __html: '<circle cx="32" cy="32" r="31" fill="#1b1914"/><path fill="#f3efe3" d="M28.48 41L23.89 41L29.63 28.07Q26.87 27.73 25.60 26.27Q24.33 24.82 24.33 22.28L24.33 22.28L24.33 18.87L28.73 18.87L28.73 21.44Q28.73 23.27 29.52 23.95Q30.31 24.63 32.11 24.63L32.11 24.63L35.70 24.63L28.48 41ZM40.17 41L35.55 41Q35.52 38.21 35.08 36.51Q34.65 34.80 33.81 33.85Q32.98 32.91 31.74 32.38L31.74 32.38L33.19 28.91Q35.39 29.69 36.93 31.11Q38.46 32.54 39.28 34.92Q40.11 37.31 40.17 41L40.17 41Z"/><rect x="20" y="47.5" width="8" height="3" fill="#078930"/><rect x="28" y="47.5" width="8" height="3" fill="#fcdd09"/><rect x="36" y="47.5" width="8" height="3" fill="#da121a"/>' }} />
  );
}
