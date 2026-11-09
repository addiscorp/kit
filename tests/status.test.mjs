// The pills: ( Status: Beta ) ( License: MIT ), side by side, carrying only that.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';

const React = await import('react');
const { renderToString } = await import('react-dom/server');
const kit = await import('../dist/index.js');
const h = React.createElement;
const page = (el) => new JSDOM(renderToString(el)).window.document;

test('the status pill names the stage, and nothing else', () => {
  for (const [status, text] of [['alpha', 'Status: Alpha'], ['beta', 'Status: Beta']]) {
    const pill = page(h(kit.StatusPill, { status })).querySelector('.ak-pill.ak-status');
    assert.equal(pill.textContent, text);
    assert.equal(kit.statusText(status), text);
    assert.equal(pill.getAttribute('data-status'), status);
  }
});

test('the license pill says License: MIT and links to the license page', () => {
  const pill = page(h(kit.LicensePill, {})).querySelector('a.ak-pill.ak-license-pill');
  assert.equal(pill.textContent, kit.LICENSE_PILL_TEXT);
  assert.equal(pill.textContent, 'License: MIT');
  assert.equal(pill.getAttribute('href'), '/license/');
  assert.equal(page(h(kit.LicensePill, { license: { href: '/legal/' } })).querySelector('a').getAttribute('href'), '/legal/');
});

test('the pair: status first, the license right beside it, in one row; either alone; nothing without either', () => {
  const pills = (props) => page(h(kit.ProductPills, props)).querySelector('.ak-pills');
  assert.deepEqual([...pills({ status: 'beta', license: {} }).children].map((p) => p.textContent), ['Status: Beta', 'License: MIT']);
  assert.deepEqual([...pills({ status: 'alpha' }).children].map((p) => p.textContent), ['Status: Alpha']);
  assert.deepEqual([...pills({ license: {} }).children].map((p) => p.textContent), ['License: MIT']);
  assert.equal(pills({}), null);
});

test('both pills share one shape: the same class, a dot, the value in bold', () => {
  const row = page(h(kit.ProductPills, { status: 'beta', license: {} })).querySelector('.ak-pills');
  for (const pill of row.children) {
    assert.ok(pill.classList.contains('ak-pill'));
    assert.ok(pill.querySelector('i[aria-hidden="true"]'), 'a dot');
    assert.match(pill.querySelector('b').textContent, /^(Beta|MIT)$/);
  }
});

test('the hero shows the pair above the buttons; the old badge is gone', () => {
  const hero = (props) => page(h(kit.Hero, { headline: { before: 'A ', accent: 'vault' }, sub: 's', installs: [], reel: [], ...props }));
  const doc = hero({ status: 'alpha', license: {} });
  assert.deepEqual([...doc.querySelectorAll('.akt-hero .ak-pills > *')].map((p) => p.textContent), ['Status: Alpha', 'License: MIT']);
  assert.ok(doc.querySelector('.ak-pills').compareDocumentPosition(doc.querySelector('.akt-btns')) & 4, 'the buttons follow the pills');
  assert.equal(doc.querySelector('.akt-btns .ak-pill'), null);
  assert.equal(kit.LicenseBadge, undefined);
  assert.equal(hero({}).querySelector('.ak-pills'), null);
});
