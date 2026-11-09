// The license (APS 17) as a visitor and a lawyer meet it: the text byte for byte
// against real LICENSE files, and the footer, badge and page rendered to HTML.
//
// fixtures/harar-LICENSE: addiscorp/harar, branch claude/mit-license-aps17 (PR #107).
// fixtures/p8-runtime-LICENSE: p8runtime/runtime main, two notices (Di Wu, Sami Fouad).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';

const React = await import('react');
const { renderToString } = await import('react-dom/server');
const kit = await import('../dist/index.js');
const h = React.createElement;
const page = (el) => new JSDOM(renderToString(el)).window.document;
const fixture = (name) => readFileSync(new URL(`./fixtures/${name}`, import.meta.url), 'utf8');

const P8 = {
  holder: 'Sami Fouad',
  github: 'samifouad',
  upstream: [{ year: 2025, holder: 'Di Wu', github: 'wudi' }],
  preface: 'p8 began as a fork of php-rs by Di Wu.',
};

test('MIT_LICENSE is harar’s LICENSE file, byte for byte', () => {
  assert.equal(kit.MIT_LICENSE, fixture('harar-LICENSE'));
  assert.equal(kit.mitLicense({ year: 2026, holder: 'Sami Fouad' }), kit.MIT_LICENSE);
});

test('a fork keeps its upstream notices above ours: p8’s LICENSE, byte for byte', () => {
  assert.equal(kit.mitLicense(P8), fixture('p8-runtime-LICENSE'));
});

test('the footer line links to the license page; no repository without a source', () => {
  const doc = page(h(kit.Footer, { site: 'mirab.addis.gg', license: {} }));
  const links = [...doc.querySelectorAll('.ak-license a')];
  assert.deepEqual(links.map((a) => [a.textContent, a.getAttribute('href')]), [['MIT · © 2026 Sami Fouad', '/license/']]);
  assert.equal(doc.querySelector('a[href*="github.com"]'), null);
  assert.equal(page(h(kit.Footer, { site: 'mirab.addis.gg' })).querySelector('.ak-license'), null, 'nothing when the site passes no license');
});

test('a public source shows in the footer only when it’s passed', () => {
  const doc = page(h(kit.Footer, { site: 'harar.addis.gg', license: { source: 'https://github.com/addiscorp/harar' } }));
  assert.deepEqual([...doc.querySelectorAll('.ak-license a')].map((a) => [a.textContent, a.getAttribute('href')]),
    [['MIT · © 2026 Sami Fouad', '/license/'], ['source', 'https://github.com/addiscorp/harar']]);
});

test('the badge says MIT licensed and links to the license page', () => {
  const doc = page(h(kit.LicenseBadge, {}));
  const a = doc.querySelector('a.ak-license-badge');
  assert.equal(a.textContent, 'MIT licensed');
  assert.equal(a.getAttribute('href'), '/license/');
  assert.equal(page(h(kit.LicenseBadge, { license: { href: '/legal/' } })).querySelector('a').getAttribute('href'), '/legal/');
});

test('the page: what MIT lets you do, the note, and the full text', () => {
  const doc = page(h(kit.LicenseView, { product: 'gelada', license: {}, note: 'The seatbelt profiles stay Apache-2.0.' }));
  assert.equal(doc.querySelector('h1').textContent, 'MIT License');
  assert.equal(doc.querySelector('.ak-license-summary').textContent,
    'gelada is MIT licensed: use it, change it, ship it, commercially or not; keep the notice.');
  assert.equal(doc.querySelector('.ak-license-note').textContent, 'The seatbelt profiles stay Apache-2.0.');
  assert.equal(doc.querySelector('pre.ak-license-text').textContent, kit.MIT_LICENSE);
  assert.equal(doc.querySelector('a'), null, 'a private product links nowhere');
  assert.doesNotMatch(doc.body.textContent, /open.source/i);
});

test('the page shows every notice of a fork, and the source only when it’s public', () => {
  const doc = page(h(kit.LicenseView, { product: 'p8', license: P8 }));
  assert.equal(doc.querySelector('pre').textContent, fixture('p8-runtime-LICENSE'));
  assert.equal(doc.querySelector('.ak-license-source'), null);
  const pub = page(h(kit.LicenseView, { product: 'harar', license: { source: 'https://github.com/addiscorp/harar' } }));
  assert.equal(pub.querySelector('.ak-license-source a').getAttribute('href'), 'https://github.com/addiscorp/harar');
  assert.equal(pub.querySelector('.ak-license-source a').textContent, 'github.com/addiscorp/harar');
});

test('a tool site carries the license into its footer and docs, and the hero shows the badge beside the buttons', () => {
  const license = { source: 'https://github.com/addiscorp/harar' };
  const site = page(h(kit.ToolSite, { tool: 'harar', license }, h(kit.Hero, {
    headline: { before: 'A ', accent: 'vault' }, sub: 's', installs: [], reel: [], license,
  })));
  assert.equal(site.querySelector('.akt-btns .ak-license-badge').getAttribute('href'), '/license/');
  assert.equal(site.querySelector('.ak-foot .ak-license a').getAttribute('href'), '/license/');
  const docs = page(h(kit.DocsLayout, { tool: 'harar', pages: [], pathname: '/docs/', title: 'Docs', license }, h('p', null, 'x')));
  assert.equal(docs.querySelector('.ak-foot .ak-license a').textContent, 'MIT · © 2026 Sami Fouad');
  const bare = page(h(kit.Hero, { headline: { before: 'A ', accent: 'vault' }, sub: 's', installs: [], reel: [] }));
  assert.equal(bare.querySelector('.ak-license-badge'), null, 'no badge unless the site passes a license');
});
