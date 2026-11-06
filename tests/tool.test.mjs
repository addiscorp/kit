// The tool site as a visitor meets it: rendered to HTML the way a server sends it.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';

const React = await import('react');
const { renderToString } = await import('react-dom/server');
const kit = await import('../dist/index.js');
const h = React.createElement;
const page = (el) => new JSDOM(renderToString(el)).window.document;

const reel = [
  { title: 'one', caption: 'first', lines: [{ text: 'mirab dev', kind: 'command' }, { text: 'ready', kind: 'highlight' }] },
  { title: 'two', caption: 'second', lines: [{ text: 'ls' }] },
];

test('every tool has both marks, a palette and a site', () => {
  const css = readFileSync(new URL('../dist/tool.css', import.meta.url), 'utf8');
  for (const tool of kit.TOOLS) {
    assert.ok(kit.MARKS[tool.id].light.includes('<'), `${tool.id} light mark`);
    assert.ok(kit.MARKS[tool.id].dark.includes('<'), `${tool.id} dark mark`);
    assert.match(css, new RegExp(`\\.akt\\[data-tool="${tool.id}"\\] \\{[^}]*--akt-accent:`), `${tool.id} light palette`);
    assert.match(css, new RegExp(`:root\\[data-theme="dark"\\] \\.akt\\[data-tool="${tool.id}"\\] \\{[^}]*--akt-ground:`), `${tool.id} dark palette`);
  }
});

test('the site wraps the page in the tool’s colours, with only docs in the header', () => {
  const doc = page(h(kit.ToolSite, { tool: 'harar' }, h('p', { id: 'body' }, 'hi')));
  const root = doc.querySelector('.akt');
  assert.equal(root.getAttribute('data-tool'), 'harar');
  assert.deepEqual([...doc.querySelectorAll('.akt-header nav a')].map((a) => [a.textContent, a.getAttribute('href')]), [['docs', '/docs/']]);
  assert.equal(doc.querySelector('.akt-brand').getAttribute('href'), '/');
  assert.ok(doc.querySelector('.akt-brand .akt-mark .akt-light'), 'light mark');
  assert.ok(doc.querySelector('.akt-brand .akt-mark .akt-dark'), 'dark mark');
  assert.ok(doc.getElementById('body'));
  assert.match(doc.querySelector('.ak-foot').textContent, /harar\.addis\.gg/);
});

test('a site can add its own header links, after docs', () => {
  const doc = page(h(kit.ToolSite, { tool: 'p8', links: [{ label: 'test suite', href: 'https://p8-test-suite.addis.gg' }] }, h('p', null, 'hi')));
  assert.deepEqual([...doc.querySelectorAll('.akt-header nav a')].map((a) => [a.textContent, a.getAttribute('href')]),
    [['docs', '/docs/'], ['test suite', 'https://p8-test-suite.addis.gg']]);
});

test('the hero has the headline, the buttons, every install command and the reel', () => {
  const doc = page(h(kit.Hero, {
    headline: { before: 'Agents in VMs on ', accent: 'your own machine', after: '.' }, sub: 'No keys inside.',
    github: 'https://github.com/addiscorp/mirab',
    installs: [{ label: 'install the cli', command: 'curl -fsSL https://mirab.addis.gg/install.sh | sh' }, { label: 'or', command: 'npm i -g mirab' }],
    reel,
  }));
  assert.equal(doc.querySelector('h1').textContent, 'Agents in VMs on your own machine.');
  assert.equal(doc.querySelector('h1 em').textContent, 'your own machine');
  assert.deepEqual([...doc.querySelectorAll('.akt-btn')].map((a) => a.getAttribute('href')), ['/docs/', 'https://github.com/addiscorp/mirab']);
  assert.deepEqual([...doc.querySelectorAll('.akt-cmd code')].map((c) => c.textContent), ['$ curl -fsSL https://mirab.addis.gg/install.sh | sh', '$ npm i -g mirab']);
  assert.equal(doc.querySelectorAll('.akt-copy').length, 2);
  assert.equal(doc.querySelectorAll('.akt-scene').length, 2);
  assert.equal(doc.querySelectorAll('.akt-dots i').length, 2);
  assert.equal(doc.querySelector('.akt-status'), null);
});

test('a tool that can’t be installed yet says why, and shows no install commands or private source', () => {
  const doc = page(h(kit.Hero, { headline: { before: 'PHP, in ', accent: 'pure Rust' }, sub: 's', status: 'Not released yet.', installs: [], reel }));
  assert.equal(doc.querySelector('.akt-status').textContent, 'Not released yet.');
  assert.deepEqual([...doc.querySelectorAll('.akt-btn')].map((a) => a.textContent), ['docs'], 'no GitHub button for private source');
  assert.equal(doc.querySelector('.akt-installs'), null);
});

test('the reel plays its scenes in turn: each starts when the one before ends, and its lines follow one another', () => {
  const doc = page(h(kit.Reel, { scenes: reel }));
  const scenes = [...doc.querySelectorAll('.akt-scene')].map((s) => s.style.animation);
  assert.deepEqual(scenes, ['akt-scene-2 10s 0s infinite both', 'akt-scene-2 10s 5s infinite both']);
  const lines = [...doc.querySelectorAll('.akt-ln')].map((l) => [l.className, l.style.animation]);
  assert.deepEqual(lines, [
    ['akt-ln akt-command', 'akt-line 10s 0.30s infinite both'],
    ['akt-ln akt-highlight', 'akt-line 10s 0.75s infinite both'],
    ['akt-ln akt-output', 'akt-line 10s 5.30s infinite both'],
  ]);
  assert.match(doc.querySelector('style').textContent, /@keyframes akt-scene-2\{.*50\.00%,100%\{opacity:0\}/);
});

test('why lists three benefits and the other tools, linked to their sites, never this one', () => {
  const doc = page(h(kit.Why, { tool: 'woreda', benefits: [{ title: 'a', text: '1' }, { title: 'b', text: '2' }, { title: 'c', text: '3' }] }));
  assert.equal(doc.querySelector('h2').textContent, 'Why woredathe short version');
  assert.equal(doc.querySelectorAll('.akt-dash').length, 3);
  const rows = [...doc.querySelectorAll('.akt-row')];
  assert.deepEqual(rows.map((r) => r.getAttribute('href')), kit.TOOLS.filter((t) => t.id !== 'woreda').map((t) => `https://${t.domain}`));
  assert.ok(!rows.some((r) => r.getAttribute('href') === 'https://woreda.addis.gg'), 'woreda must not list itself');
});

test('docs mark the page you are on, with or without a trailing slash', () => {
  const pages = [{ href: '/docs/', title: 'Overview' }, { href: '/docs/install/', title: 'Install' }];
  for (const pathname of ['/docs/install', '/docs/install/']) {
    const doc = page(h(kit.DocsLayout, { tool: 'p8', pages, pathname, title: 'Install', lede: 'Get p8.' }, h('p', null, 'x')));
    assert.deepEqual([...doc.querySelectorAll('.akt-side nav a[aria-current="page"]')].map((a) => a.textContent), ['Install']);
  }
  const doc = page(h(kit.DocsLayout, { tool: 'p8', pages, pathname: '/docs/', title: 'Overview', note: 'n' }, h(kit.Code, null, 'p8 hello.php')));
  assert.equal(doc.querySelector('.akt-doc h1').textContent, 'Overview');
  assert.equal(doc.querySelector('.akt-side .akt-brand').textContent, 'p8docs');
  assert.equal(doc.querySelector('.akt-code pre').textContent, 'p8 hello.php');
  assert.ok(doc.querySelector('.akt-code .akt-copy'));
});

test('a tool with a display name shows it everywhere it is named; the others show their id', () => {
  const benefits = [{ title: 'a', text: '1' }, { title: 'b', text: '2' }, { title: 'c', text: '3' }];
  const site = page(h(kit.ToolSite, { tool: 'securecore' }, h(kit.Why, { tool: 'securecore', benefits })));
  assert.equal(site.querySelector('.akt-header .akt-brand').textContent, 'SecureCore');
  assert.equal(site.querySelector('.akt-why h2').textContent, 'Why SecureCorethe short version');
  assert.match(site.querySelector('.ak-foot').textContent, /securecore\.addis\.gg/, 'the domain stays lowercase');
  const docs = page(h(kit.DocsLayout, { tool: 'securecore', pages: [{ href: '/docs/', title: 'Overview' }], pathname: '/docs/', title: 'Overview' }, h('p', null, 'x')));
  assert.equal(docs.querySelector('.akt-side .akt-brand').textContent, 'SecureCoredocs');
  // In another tool's family list: the display name for securecore, the id for every other tool.
  const names = [...page(h(kit.Why, { tool: 'harar', benefits })).querySelectorAll('.akt-row strong')].map((s) => s.textContent);
  assert.deepEqual(names, kit.TOOLS.filter((t) => t.id !== 'harar').map((t) => (t.id === 'securecore' ? 'SecureCore' : t.id)));
  assert.equal(page(h(kit.ToolSite, { tool: 'harar' }, null)).querySelector('.akt-brand').textContent, 'harar');
});

test('a site’s footnote is a line in its footer, on the site and in its docs; without one there is none', () => {
  const note = 'WordPress® is a registered trademark of the WordPress Foundation.';
  const site = page(h(kit.ToolSite, { tool: 'securecore', footnote: note }, h('p', null, 'hi')));
  assert.equal(site.querySelector('.ak-foot .ak-foot-note').textContent, note);
  const docs = page(h(kit.DocsLayout, { tool: 'securecore', pages: [], pathname: '/docs/', title: 'Overview', footnote: note }, h('p', null, 'x')));
  assert.equal(docs.querySelector('.ak-foot .ak-foot-note').textContent, note);
  assert.equal(page(h(kit.ToolSite, { tool: 'harar' }, h('p', null, 'hi'))).querySelector('.ak-foot-note'), null);
});
