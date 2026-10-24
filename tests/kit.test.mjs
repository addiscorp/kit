// The kit as a user meets it: a real React tree in a DOM, driven by keys and clicks.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', { url: 'https://example.test/docs/' });
for (const name of ['window', 'document', 'navigator', 'HTMLElement', 'HTMLInputElement', 'Node', 'KeyboardEvent', 'MouseEvent', 'Event']) {
  Object.defineProperty(globalThis, name, { value: dom.window[name], configurable: true, writable: true });
}
globalThis.requestAnimationFrame = (fn) => setTimeout(fn, 0);
globalThis.cancelAnimationFrame = (id) => clearTimeout(id);
globalThis.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
dom.window.matchMedia = globalThis.matchMedia;
dom.window.HTMLElement.prototype.scrollIntoView = () => {};
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const React = await import('react');
const { act } = React;
const { createRoot } = await import('react-dom/client');
const { renderToString } = await import('react-dom/server');
const kit = await import('../dist/index.js');
const h = React.createElement;

const groups = [
  { id: 'docs', label: 'docs', items: [
    { id: 'start', title: 'Start an app', href: '/docs/start/' },
    { id: 'database', title: 'The database', href: '/docs/database/', keywords: 'schema postgres' },
  ] },
  { id: 'menu', label: 'menu', items: [{ id: 'github', title: 'GitHub', href: 'https://github.com/x' }] },
  { id: 'matches', label: 'Matches', searchOnly: true, items: [{ id: 'filters', title: 'Filters', href: '/docs/database/#filters' }] },
];

function mount(extra = {}) {
  const went = [];
  const container = document.getElementById('root');
  const root = createRoot(container);
  act(() => {
    root.render(h(kit.Header, { brand: { name: 'simien' }, groups, pathname: '/docs/', navigate: (href) => went.push(href), ...extra }));
  });
  return { went, root, container };
}

const key = (k, opts = {}) => act(() => { window.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, ...opts })); });
const flush = () => act(() => new Promise((resolve) => setTimeout(resolve, 5)));

test('⌘M opens the menu with every group but the search-only one, numbered', async () => {
  const { root } = mount();
  assert.equal(document.getElementById('ak-menu'), null);
  key('m', { metaKey: true });
  await flush();
  const menu = document.getElementById('ak-menu');
  assert.ok(menu, 'the menu opened');
  assert.deepEqual([...menu.querySelectorAll('.ak-group-label')].map((n) => n.textContent), ['docs', 'menu']);
  assert.deepEqual([...menu.querySelectorAll('.ak-key-num')].map((n) => n.textContent), ['1', '2', '3']);
  key('Escape');
  await flush();
  assert.equal(document.getElementById('ak-menu'), null, 'Esc closes it');
  act(() => root.unmount());
});

test('typing searches, the search-only group joins, Enter opens the highlighted match', async () => {
  const { went, root } = mount();
  key('/');
  await flush();
  const input = document.querySelector('.ak-search input');
  assert.ok(input);
  // As a browser types into the focused box: the value, then an input event.
  const setValue = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
  act(() => {
    setValue.call(input, 'filt');
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await flush();
  const titles = [...document.querySelectorAll('#ak-menu .ak-tile, #ak-menu .ak-row')].map((n) => n.textContent);
  assert.deepEqual(titles.map((t) => t.replace(/\d$/, '')), ['Filters'], 'only the match is left');
  key('Enter');
  await flush();
  assert.deepEqual(went, ['/docs/database/#filters']);
  assert.equal(document.getElementById('ak-menu'), null, 'and the menu closed');
  act(() => root.unmount());
});

test('arrows move through items in order; a number opens its tile', async () => {
  const { went, root } = mount();
  key('m', { ctrlKey: true });
  await flush();
  key('ArrowDown');
  key('ArrowDown');
  await flush();
  assert.equal(document.querySelector('#ak-menu .is-active')?.id, 'ak-item-database');
  key('3');
  await flush();
  assert.deepEqual(went, ['https://github.com/x']);
  act(() => root.unmount());
});

test('a HeaderButton opens its own popover, one at a time with the menu', async () => {
  const { root } = mount({
    end: h(kit.HeaderButton, { name: 'account', label: 'Account', icon: h(kit.PersonIcon) }, h('p', null, 'Signed in')),
  });
  const button = document.querySelector('[aria-label="Account"]');
  act(() => button.click());
  await flush();
  assert.equal(document.querySelector('.ak-popover')?.textContent, 'Signed in');
  key('m', { metaKey: true });
  await flush();
  assert.equal(document.querySelector('.ak-popover'), null, 'the menu replaced it');
  assert.ok(document.getElementById('ak-menu'));
  act(() => root.unmount());
});

test('? shows the shortcuts; renderItem draws items the app’s way', async () => {
  const { root } = mount({ renderItem: (item) => (item.id === 'github' ? h('em', null, 'GH') : undefined) });
  key('?');
  await flush();
  assert.ok(document.querySelector('.ak-help'));
  key('Escape');
  key('m', { metaKey: true });
  await flush();
  assert.equal(document.querySelector('#ak-item-github em')?.textContent, 'GH');
  assert.ok(document.querySelector('#ak-item-start .ak-favicon'), 'the others keep the kit’s look');
  act(() => root.unmount());
});

test('the footer names the site and, by default, Addis Corp', () => {
  const html = renderToString(h(kit.Footer, { site: 'simien.dev', year: 2026 }));
  assert.match(html, /simien\.dev/);
  assert.match(html, /© <!-- -->2026<!-- --> <!-- -->Addis Corp/);
  assert.match(html, /href="https:\/\/addis\.gg"/);
});

test('typing with the menu open, outside the search box, starts a search on the first match', async () => {
  const { went, root } = mount();
  key('m', { metaKey: true });
  await flush();
  key('u');
  await flush();
  assert.equal(document.querySelector('.ak-search input').value, 'u');
  key('Enter');
  await flush();
  assert.deepEqual(went, ['https://github.com/x'], 'Enter opens the first match');
  act(() => root.unmount());
});
