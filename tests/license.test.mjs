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

test('the footer never shows the license or a second copyright; the tool site keeps it in the hero pill', () => {
  for (const doc of [page(h(kit.Footer, {})), page(h(kit.ToolSite, { tool: 'harar' }, h('p', null, 'x')))]) {
    const foot = doc.querySelector('.ak-foot');
    assert.equal(foot.querySelector('.ak-license'), null);
    assert.doesNotMatch(foot.textContent, /MIT|Sami Fouad|addis\.gg$/);
    assert.equal((foot.textContent.match(/©/g) ?? []).length, 1);
  }
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

test('the hero shows the License pill; the tool site\'s footer and docs footer leave the license out', () => {
  const license = { source: 'https://github.com/addiscorp/harar' };
  const site = page(h(kit.ToolSite, { tool: 'harar' }, h(kit.Hero, {
    headline: { before: 'A ', accent: 'vault' }, sub: 's', installs: [], reel: [], license,
  })));
  assert.equal(site.querySelector('.akt-hero .ak-pills a.ak-license-pill').getAttribute('href'), '/license/');
  assert.equal(site.querySelector('.ak-foot .ak-license'), null);
  const docs = page(h(kit.DocsLayout, { tool: 'harar', pages: [], pathname: '/docs/', title: 'Docs' }, h('p', null, 'x')));
  assert.equal(docs.querySelector('.ak-foot .ak-license'), null);
  assert.deepEqual([...docs.querySelectorAll('.ak-foot-end a')].map((a) => a.textContent), ['terms', 'privacy']);
  const bare = page(h(kit.Hero, { headline: { before: 'A ', accent: 'vault' }, sub: 's', installs: [], reel: [] }));
  assert.equal(bare.querySelector('.ak-license-pill'), null, 'no License pill unless the site passes a license');
});
