// The tool site: the page every Addis tool (rixse, mirab, woreda, …) puts on
// its own domain, after zega.dev's layout, and the docs after rixse.dev's.
// Structure = kit, content = per site: a site passes its words, commands and
// demo, never markup of its own.
import type { ReactNode } from 'react';
import type { LinkComponent } from '../header/index.js';
import { Footer } from '../footer/index.js';
import { CopyButton } from './copy.js';
import { MARKS } from './marks.js';
import { TOOLS, toolInfo, type ToolId } from './tools.js';

export { TOOLS, toolInfo, type ToolId, type ToolInfo } from './tools.js';
export { MARKS } from './marks.js';
export { CopyButton } from './copy.js';

const PlainLink: LinkComponent = (props) => <a {...props} />;

/** A tool's mark, drawn for light and dark; the theme picks one. */
export function Mark({ tool, size = 26 }: { tool: ToolId; size?: number }) {
  const mark = MARKS[tool];
  return (
    <span className="akt-mark" style={{ width: size, height: size }} aria-hidden="true">
      <svg className="akt-light" viewBox="0 0 24 24" width={size} height={size} dangerouslySetInnerHTML={{ __html: mark.light }} />
      <svg className="akt-dark" viewBox="0 0 24 24" width={size} height={size} dangerouslySetInnerHTML={{ __html: mark.dark }} />
    </span>
  );
}

/** Everything a tool site shows sits inside this: it sets the tool's colours, the header and the footer. */
export function ToolSite({ tool, home = '/', docs = '/docs/', Link = PlainLink, children }: {
  tool: ToolId;
  home?: string;
  docs?: string;
  Link?: LinkComponent;
  children: ReactNode;
}) {
  return (
    <div className="akt" data-tool={tool}>
      <main className="akt-main">
        <header className="akt-header">
          <Link className="akt-brand" href={home}><Mark tool={tool} />{tool}</Link>
          <nav aria-label="Main">
            <Link href={docs}>docs</Link>
          </nav>
        </header>
        {children}
      </main>
      <Footer site={toolInfo(tool).domain} />
    </div>
  );
}

/** The headline, with one phrase in the brand colour: `{ before: 'Agents in VMs on ', accent: 'your own machine', after: '.' }`. */
export type Headline = { before: string; accent: string; after?: string };
export type Install = { label: string; command: string };
/** A line in the demo: a command (`$ `), output, a highlighted line, a line in the accent, or a quiet one. */
export type ReelLine = { text: string; kind?: 'command' | 'output' | 'highlight' | 'accent' | 'quiet' };
export type ReelScene = { title: string; caption: string; lines: ReelLine[] };

const SCENE_SECONDS = 5;

/** The hero: headline, buttons, install commands under them, and the demo reel on the right. */
export function Hero({ headline, sub, status, docs = '/docs/', github, installs, reel, Link = PlainLink }: {
  headline: Headline;
  sub: string;
  /** Where the tool stands, when a visitor should know before installing: "Early: not yet audited." */
  status?: string;
  docs?: string;
  github: string;
  /** Empty until the tool can be installed; say why in `status`. */
  installs: Install[];
  reel: ReelScene[];
  Link?: LinkComponent;
}) {
  return (
    <section className="akt-hero">
      <div>
        <h1>{headline.before}<em>{headline.accent}</em>{headline.after}</h1>
        <p className="akt-sub">{sub}</p>
        {status && <p className="akt-status">{status}</p>}
        <div className="akt-btns">
          <Link className="akt-btn akt-main-btn" href={docs}>docs</Link>
          <a className="akt-btn" href={github}>GitHub</a>
        </div>
        {installs.length > 0 && <div className="akt-installs">
          {installs.map((install) => (
            <div key={install.command}>
              <div className="akt-ilabel">{install.label}</div>
              <div className="akt-cmd"><code><b>$ </b>{install.command}</code><CopyButton text={install.command} /></div>
            </div>
          ))}
        </div>}
      </div>
      <Reel scenes={reel} />
    </section>
  );
}

/**
 * The demo: a terminal that plays its scenes in turn, a few seconds each,
 * each scene's lines appearing one after another. CSS only, so it runs with
 * no script; with reduced motion it shows the first scene, still.
 */
export function Reel({ scenes }: { scenes: ReelScene[] }) {
  const cycle = scenes.length * SCENE_SECONDS;
  const share = 100 / scenes.length;
  // Each reel gets keyframes for its own number of scenes.
  const css = `@keyframes akt-scene-${scenes.length}{0%{opacity:0;transform:translateY(4px)}${(share * 0.06).toFixed(2)}%{opacity:1;transform:none}${(share * 0.94).toFixed(2)}%{opacity:1}${share.toFixed(2)}%,100%{opacity:0}}`
    + `@keyframes akt-dot-${scenes.length}{0%,${(share - 0.01).toFixed(2)}%{background:var(--akt-accent);width:28px}${share.toFixed(2)}%,100%{background:var(--akt-dotoff);width:14px}}`;
  return (
    <div>
      <style>{css}</style>
      <div className="akt-reel">
        <div className="akt-stage">
          {scenes.map((scene, i) => (
            <div className="akt-scene" key={i} style={{ animation: `akt-scene-${scenes.length} ${cycle}s ${i * SCENE_SECONDS}s infinite both` }}>
              <div className="akt-tab"><i />{scene.title}</div>
              <div className="akt-term">
                {scene.lines.map((line, j) => (
                  <div className={`akt-ln akt-${line.kind ?? 'output'}`} key={j} style={{ animation: `akt-line ${cycle}s ${(i * SCENE_SECONDS + 0.3 + j * 0.45).toFixed(2)}s infinite both` }}>
                    <span className="akt-no">{j + 1}</span><span className="akt-tx">{line.text}</span>
                  </div>
                ))}
              </div>
              <div className="akt-cap">{scene.caption}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="akt-dots" aria-hidden="true">
        {scenes.map((_, i) => <i key={i} style={{ animation: `akt-dot-${scenes.length} ${cycle}s ${i * SCENE_SECONDS}s infinite` }} />)}
      </div>
    </div>
  );
}

export type Benefit = { title: string; text: string };

/** "Why <tool> · the short version": three benefits, and the family of Addis tools. */
export function Why({ tool, benefits }: { tool: ToolId; benefits: [Benefit, Benefit, Benefit] }) {
  return (
    <section className="akt-why">
      <h2>Why {tool}<small>the short version</small></h2>
      <div className="akt-cards">
        {benefits.map((benefit) => (
          <div className="akt-card" key={benefit.title}>
            <div className="akt-dash" />
            <h3>{benefit.title}</h3>
            <p>{benefit.text}</p>
          </div>
        ))}
        <div className="akt-card">
          <h3>Addis tools<small>they work together</small></h3>
          <div className="akt-family">
            {TOOLS.map((t) => (
              <a key={t.id} className="akt-row" href={`https://${t.domain}`} aria-current={t.id === tool ? 'page' : undefined}>
                <strong><Mark tool={t.id} size={18} />{t.id}</strong>
                <span>{t.short}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export type DocsPage = { href: string; title: string };

/** The docs, after rixse.dev: the pages down the side, the page on the right. */
export function DocsLayout({ tool, pages, pathname, eyebrow = 'Documentation', title, lede, note, home = '/', Link = PlainLink, children }: {
  tool: ToolId;
  pages: DocsPage[];
  pathname: string;
  eyebrow?: string;
  title: string;
  lede?: string;
  /** A small note under the page list, e.g. what the docs describe. */
  note?: string;
  home?: string;
  Link?: LinkComponent;
  children: ReactNode;
}) {
  const here = (href: string) => href.replace(/\/$/, '') === pathname.replace(/\/$/, '');
  return (
    <div className="akt akt-docs" data-tool={tool}>
      <div className="akt-docs-grid">
        <aside className="akt-side">
          <Link className="akt-brand" href={home}><Mark tool={tool} />{tool}<span className="akt-brand-docs">docs</span></Link>
          <nav aria-label="Docs">
            {pages.map((page) => (
              <Link key={page.href} href={page.href} aria-current={here(page.href) ? 'page' : undefined}>{page.title}</Link>
            ))}
          </nav>
          {note && <p className="akt-side-note">{note}</p>}
        </aside>
        <article className="akt-doc">
          <div className="akt-eyebrow">{eyebrow}</div>
          <h1>{title}</h1>
          {lede && <p className="akt-lede">{lede}</p>}
          <div className="akt-prose">{children}</div>
        </article>
      </div>
      <Footer site={toolInfo(tool).domain} />
    </div>
  );
}

/** A boxed aside. */
export function Callout({ children }: { children: ReactNode }) {
  return <div className="akt-callout">{children}</div>;
}

/** One numbered step: `<Step n={1} label="Install">…</Step>`. */
export function Step({ n, label, children }: { n: number; label: string; children: ReactNode }) {
  return (
    <div className="akt-step">
      <div className="akt-step-label">{String(n).padStart(2, '0')} · {label}</div>
      {children}
    </div>
  );
}

/** A command or code block, with a copy button. */
export function Code({ children, copy = true }: { children: string; copy?: boolean }) {
  return (
    <div className="akt-code">
      <pre><code>{children}</code></pre>
      {copy && <CopyButton text={children} />}
    </div>
  );
}
