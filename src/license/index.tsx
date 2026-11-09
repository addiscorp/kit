// The license, once (APS 17: Addis products are MIT, `Copyright (c) <year> Sami Fouad`).
// One description of a product's license drives all four places a site shows
// it, so they can't disagree: the text (`mitLicense`), the footer line
// (`LicenseLink`), the hero pill (`LicensePill`, in ../status) and the page (`LicenseView`).
import { Fragment, type ReactNode } from 'react';
import type { LinkComponent } from '../header/index.js';

/** A copyright line: `Copyright (c) 2025 Di Wu (GitHub: wudi)`. */
export type Notice = { year: number; holder: string; github?: string };

export type License = {
  /** The year in our copyright line. */
  year?: number;
  /** Who holds it; APS 17 makes it `Sami Fouad`. */
  holder?: string;
  /** A GitHub handle after our name, when the file has one: `(GitHub: samifouad)`. */
  github?: string;
  /** The notices a fork arrived with, kept above ours, in their order (APS 17: never dropped). */
  upstream?: Notice[];
  /** A line between the title and the notices, e.g. where a fork began. */
  preface?: string;
  /**
   * The public source. Only a public repository passes it: without it the
   * kit links to no repository and never says "open source".
   */
  source?: string;
  /** Where the site serves the license page. */
  href?: string;
};

export const LICENSE_YEAR = 2026;
export const LICENSE_HOLDER = 'Sami Fouad';
export const LICENSE_HREF = '/license/';

/** The MIT permission notice and disclaimer, as every Addis LICENSE file has it. */
export const MIT_PERMISSION = `Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
`;

const ours = (license: License): Notice => ({
  year: license.year ?? LICENSE_YEAR,
  holder: license.holder ?? LICENSE_HOLDER,
  github: license.github,
});

const noticeLine = (n: Notice) => `Copyright (c) ${n.year} ${n.holder}${n.github ? ` (GitHub: ${n.github})` : ''}`;

/** The LICENSE file's text, byte for byte: title, preface, every notice (upstream first, ours last), the permission. */
export function mitLicense(license: License = {}): string {
  const notices = [...(license.upstream ?? []), ours(license)].map(noticeLine).join('\n');
  return ['MIT License', ...(license.preface ? [license.preface] : []), notices, MIT_PERMISSION].join('\n\n');
}

/** The default: `MIT License`, `Copyright (c) 2026 Sami Fouad`, the permission. */
export const MIT_LICENSE = mitLicense();

/** The short line a footer shows: `MIT · © 2026 Sami Fouad`. */
export function licenseLine(license: License = {}): string {
  const { year, holder } = ours(license);
  return `MIT · © ${year} ${holder}`;
}

const PlainLink: LinkComponent = (props) => <a {...props} />;

/** For the footer: the line, linking to the license page, and the source when it's public. */
export function LicenseLink({ license = {}, Link = PlainLink }: { license?: License; Link?: LinkComponent }) {
  return (
    <span className="ak-license">
      <Link href={license.href ?? LICENSE_HREF}>{licenseLine(license)}</Link>
      {license.source && <> · <a href={license.source}>source</a></>}
    </span>
  );
}


/** What MIT lets you do, in a line: `harar is MIT licensed: use it, change it, ship it, …`. */
export const licenseSummary = (product: string) =>
  `${product} is MIT licensed: use it, change it, ship it, commercially or not; keep the notice.`;

/**
 * The license page: a heading, the plain-language line, anything the product
 * must add (a part under another license), the source when it's public, and
 * the full text. Styled by the kit's `--ak-*` tokens, so it takes any site's colours.
 */
export function LicenseView({ product, license = {}, note, title = 'MIT License' }: {
  /** The product's name as the site shows it: `harar`, `the p8 test suite`. */
  product: string;
  license?: License;
  /** A line under the summary, e.g. a part that keeps an upstream license. */
  note?: ReactNode;
  title?: string;
}) {
  return (
    <section className="ak-license-page" aria-labelledby="ak-license-title">
      <div className="ak-license-eyebrow">License</div>
      <h1 id="ak-license-title">{title}</h1>
      <p className="ak-license-summary">{licenseSummary(product)}</p>
      {note && <p className="ak-license-note">{note}</p>}
      {license.source && <p className="ak-license-source">The source: <a href={license.source}>{license.source.replace(/^https?:\/\//, '')}</a></p>}
      {/* A span per paragraph: the text is the file's, byte for byte, and a phone can reflow its hard-wrapped lines. */}
      <pre className="ak-license-text">
        {mitLicense(license).split('\n\n').map((paragraph, i) => (
          <Fragment key={i}>{i > 0 && '\n\n'}<span>{paragraph}</span></Fragment>
        ))}
      </pre>
    </section>
  );
}
