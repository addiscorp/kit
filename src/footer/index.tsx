// The footer every Addis site shares (Sami, 27 Nov): on the left who makes the
// site, the one copyright line; on the right terms · privacy · the light/dark
// switch. Terms and privacy are the same two pages on addis.gg for the whole
// family of sites. The site's own name and its license stay out of the footer:
// the license is the hero's "License: MIT" pill and the /license/ page.
// On a phone, terms and privacy fold into one "legal" link, addis.gg/legal/,
// a page that links to both (Sami, 28 Nov). `extra`: a site's own switch
// beside the theme switch (heyava.ca's tail switch, on phones).
import type { ReactNode } from 'react';
import { ThemeToggle } from '../theme/index.js';

export type Owner = { name: string; href: string; logo: ReactNode };

/** Addis Corp, the default owner. */
export const ADDIS: Owner = {
  name: 'Addis Corp',
  href: 'https://addis.gg',
  logo: <AddisMark />,
};

/** The terms and privacy pages: one place on addis.gg for every Addis site. */
export const TERMS_HREF = 'https://addis.gg/terms/';
export const PRIVACY_HREF = 'https://addis.gg/privacy/';
/** One link to both, on a phone: addis.gg/legal/ links to terms and privacy. */
export const LEGAL_HREF = 'https://addis.gg/legal/';

export type FooterProps = {
  owner?: Owner;
  /** The year in the copyright line; this year by default. */
  year?: number;
  /** A small line under the footer row, e.g. trademark notices. */
  note?: ReactNode;
  /** A site's own control, just before the theme switch (a button the size of it, `ak-theme-toggle`). */
  extra?: ReactNode;
};

export function Footer({ owner = ADDIS, year = new Date().getFullYear(), note, extra }: FooterProps) {
  return (
    <footer className="ak-foot">
      <a className="ak-credit" href={owner.href}>
        {owner.logo}
        © {year} {owner.name}
      </a>
      <nav className="ak-foot-end" aria-label="Legal">
        <a className="ak-foot-wide" href={TERMS_HREF}>terms</a>
        <a className="ak-foot-wide" href={PRIVACY_HREF}>privacy</a>
        <a className="ak-foot-narrow" href={LEGAL_HREF}>legal</a>
        {extra}
        <ThemeToggle />
      </nav>
      {note && <p className="ak-foot-note">{note}</p>}
    </footer>
  );
}

function AddisMark() {
  return (
    <svg className="ak-owner-mark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width={32} height={32} aria-hidden="true" dangerouslySetInnerHTML={{ __html: '<circle cx="32" cy="32" r="31" fill="#1b1914"/><path fill="#f3efe3" d="M28.48 41L23.89 41L29.63 28.07Q26.87 27.73 25.60 26.27Q24.33 24.82 24.33 22.28L24.33 22.28L24.33 18.87L28.73 18.87L28.73 21.44Q28.73 23.27 29.52 23.95Q30.31 24.63 32.11 24.63L32.11 24.63L35.70 24.63L28.48 41ZM40.17 41L35.55 41Q35.52 38.21 35.08 36.51Q34.65 34.80 33.81 33.85Q32.98 32.91 31.74 32.38L31.74 32.38L33.19 28.91Q35.39 29.69 36.93 31.11Q38.46 32.54 39.28 34.92Q40.11 37.31 40.17 41L40.17 41Z"/><rect x="20" y="47.5" width="8" height="3" fill="#078930"/><rect x="28" y="47.5" width="8" height="3" fill="#fcdd09"/><rect x="36" y="47.5" width="8" height="3" fill="#da121a"/>' }} />
  );
}
