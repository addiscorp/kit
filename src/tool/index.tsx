// The tool site: the page every Addis tool (rixse, mirab, woreda, …) puts on
// its own domain, after zega.dev's layout, and the docs after rixse.dev's.
// Structure = kit, content = per site: a site passes its words, commands and
// demo, never markup of its own.
import type { ReactNode } from 'react';
import type { LinkComponent } from '../header/index.js';
import { Footer } from '../footer/index.js';
import { LicenseBadge, type License } from '../license/index.js';
import { StatusPill, type Stage } from '../status/index.js';
import { CopyButton } from './copy.js';
import { MARKS } from './marks.js';
import { TOOLS, toolInfo, toolName, type ToolId } from './tools.js';

export { TOOLS, toolInfo, toolName, type ToolId, type ToolInfo } from './tools.js';
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

/** A link in a tool site's header, after docs: `{ label: 'test suite', href: 'https://p8-test-suite.addis.gg' }`. */
export type HeaderLink = { label: string; href: string };

/** Everything a tool site shows sits inside this: it sets the tool's colours, the header and the footer. */
export function ToolSite({ tool, home = '/', docs = '/docs/', links = [], footnote, license, Link = PlainLink, children }: {
  tool: ToolId;
  home?: string;
  docs?: string;
  /** More header links, after docs, for what only this tool has. */
  links?: HeaderLink[];
  /** A small line under the footer, e.g. trademark notices. */
  footnote?: ReactNode;
  /** The tool's license, in the footer: `MIT · © 2026 Sami Fouad`. */
  license?: License;
  Link?: LinkComponent;
  children: ReactNode;
}) {
  return (
    <div className="akt" data-tool={tool}>
      <main className="akt-main">
        <header className="akt-header">
          <Link className="akt-brand" href={home}><Mark tool={tool} />{toolName(tool)}</Link>
          <nav aria-label="Main">
            <Link href={docs}>docs</Link>
            {links.map((link) => <Link key={link.href} href={link.href}>{link.label}</Link>)}
          </nav>
        </header>
        {children}
      </main>
      <Footer site={toolInfo(tool).domain} note={footnote} license={license} Link={Link} />
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

/**
 * A screenshot of the app, in each theme: images the site serves itself
 * (`dark` when the app looks different on a dark ground). Width and height
 * are the image's own, so the page keeps its place while it loads.
 */
export type Shot = { light: string; dark?: string; alt: string; width: number; height: number };
/** A screen of the app and what it shows, for the tour. */
export type Feature = { title: string; text: string; shot: Shot };

/**
 * The hero: headline, buttons, install commands under them, and the demo
 * beside them: the reel for a tool you run in a terminal, or, for an app, a
 * screenshot of it, under the words and as wide as the page.
 */
export function Hero({ headline, sub, status, statusNote, docs = '/docs/', github, license, installs, reel, shot, Link = PlainLink }: {
  headline: Headline;
  sub: string;
  /** Where the tool stands, so nobody takes it for a 1.0: a "Status: Alpha" pill above the buttons. */
  status?: Stage;
  /** What a visitor should know at that stage, after the stage: "Status: Beta · not yet audited: …". */
  statusNote?: string;
  docs?: string;
  /** The source, when it's public. */
  github?: string;
  /** The tool's license: a "MIT licensed" badge beside the buttons, linking to the license page. */
  license?: License;
  /** Empty until the tool can be installed; say why in `statusNote`. */
  installs: Install[];
  Link?: LinkComponent;
} & ({ reel: ReelScene[]; shot?: never } | { shot: Shot; reel?: never })) {
  return (
    <section className={shot ? 'akt-hero akt-hero-app' : 'akt-hero'}>
      <div>
        <h1>{headline.before}<em>{headline.accent}</em>{headline.after}</h1>
        <p className="akt-sub">{sub}</p>
        {status && <p className="akt-status"><StatusPill status={status} note={statusNote} /></p>}
        <div className="akt-btns">
          <Link className="akt-btn akt-main-btn" href={docs}>docs</Link>
          {github && <a className="akt-btn" href={github}>GitHub</a>}
          {license && <LicenseBadge license={license} Link={Link} />}
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
      {shot ? <Screen shot={shot} eager /> : <Reel scenes={reel ?? []} />}
    </section>
  );
}

/** A screenshot in a window frame, in the page's theme. */
export function Screen({ shot, eager = false }: { shot: Shot; eager?: boolean }) {
  const img = (src: string, className?: string) => (
    <img className={className} src={src} alt={shot.alt} width={shot.width} height={shot.height} loading={eager ? 'eager' : 'lazy'} decoding="async" />
  );
  return (
    <figure className="akt-screen">
      <div className="akt-chrome" aria-hidden="true"><i /><i /><i /></div>
      {shot.dark ? <>{img(shot.light, 'akt-light')}{img(shot.dark, 'akt-dark')}</> : img(shot.light)}
    </figure>
  );
}

/** The app, screen by screen: what each one is for, beside it, sides alternating. */
export function Tour({ features, title = 'A look around' }: { features: Feature[]; title?: string }) {
  return (
    <section className="akt-tour">
      <h2>{title}</h2>
      {features.map((feature) => (
        <div className="akt-feature" key={feature.title}>
          <div className="akt-feature-text">
            <div className="akt-dash" />
            <h3>{feature.title}</h3>
            <p>{feature.text}</p>
          </div>
          <Screen shot={feature.shot} />
        </div>
      ))}
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

/**
 * Something the tool works with: a name, and its logo when the owner allows reference use
 * (an image the site serves itself; `dark` when it needs another one on a dark ground).
 */
export type WorksItem = { name: string; logo?: { light: string; dark?: string }; note?: string };
export type WorksWith = { title: string; note?: string; items: WorksItem[] };

/**
 * "Why <tool> · the short version": three benefits, and the other Addis tools. A tool can put a
 * "Works with" card in the third benefit's place instead.
 */
export function Why({ tool, benefits, works }: { tool: ToolId } & (
  | { benefits: [Benefit, Benefit, Benefit]; works?: never }
  | { benefits: [Benefit, Benefit]; works: WorksWith }
)) {
  return (
    <section className="akt-why">
      <h2>Why {toolName(tool)}<small>the short version</small></h2>
      <div className="akt-cards">
        {benefits.map((benefit) => (
          <div className="akt-card" key={benefit.title}>
            <div className="akt-dash" />
            <h3>{benefit.title}</h3>
            <p>{benefit.text}</p>
          </div>
        ))}
        {works && <Works works={works} />}
        <div className="akt-card">
          <h3>Addis tools<small>they work together</small></h3>
          <div className="akt-family">
            {TOOLS.filter((t) => t.id !== tool).map((t) => (
              <a key={t.id} className="akt-row" href={`https://${t.domain}`}>
                <strong><Mark tool={t.id} size={18} />{t.name ?? t.id}</strong>
                <span>{t.short}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Works({ works }: { works: WorksWith }) {
  return (
    <div className="akt-card akt-works">
      <h3>{works.title}{works.note && <small>{works.note}</small>}</h3>
      <div className="akt-family">
        {works.items.map((item) => (
          <div key={item.name} className="akt-work">
            {item.logo && (item.logo.dark
              ? <span className="akt-mark akt-work-logo"><img className="akt-light" src={item.logo.light} alt="" /><img className="akt-dark" src={item.logo.dark} alt="" /></span>
              : <span className="akt-work-logo"><img src={item.logo.light} alt="" /></span>)}
            <div>
              <strong>{item.name}</strong>
              {item.note && <span>{item.note}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export type DocsPage = { href: string; title: string };

/** The docs, after rixse.dev: the pages down the side, the page on the right. */
export function DocsLayout({ tool, pages, pathname, eyebrow = 'Documentation', title, lede, note, footnote, license, home = '/', Link = PlainLink, children }: {
  tool: ToolId;
  pages: DocsPage[];
  pathname: string;
  eyebrow?: string;
  title: string;
  lede?: string;
  /** A small note under the page list, e.g. what the docs describe. */
  note?: string;
  /** A small line under the footer, e.g. trademark notices. */
  footnote?: ReactNode;
  /** The tool's license, in the footer. */
  license?: License;
  home?: string;
  Link?: LinkComponent;
  children: ReactNode;
}) {
  const here = (href: string) => href.replace(/\/$/, '') === pathname.replace(/\/$/, '');
  return (
    <div className="akt akt-docs" data-tool={tool}>
      <div className="akt-docs-grid">
        <aside className="akt-side">
          <Link className="akt-brand" href={home}><Mark tool={tool} />{toolName(tool)}<span className="akt-brand-docs">docs</span></Link>
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
      <Footer site={toolInfo(tool).domain} note={footnote} license={license} Link={Link} />
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
