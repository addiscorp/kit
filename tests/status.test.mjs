// The status pill: what stage a product is at, so nobody takes it for a 1.0.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';

const React = await import('react');
const { renderToString } = await import('react-dom/server');
const kit = await import('../dist/index.js');
const h = React.createElement;
const page = (el) => new JSDOM(renderToString(el)).window.document;

test('the pill names the stage, and the note after it when there is one', () => {
  const alpha = page(h(kit.StatusPill, { status: 'alpha' })).querySelector('.ak-status');
  assert.equal(alpha.textContent, 'Status: Alpha');
  assert.equal(alpha.getAttribute('data-status'), 'alpha');
  const beta = page(h(kit.StatusPill, { status: 'beta', note: 'not yet audited: keep only what you can rotate.' })).querySelector('.ak-status');
  assert.equal(beta.textContent, 'Status: Beta · not yet audited: keep only what you can rotate.');
  assert.equal(beta.querySelector('b').textContent, 'Status: Beta', 'the stage stands out from the note');
});

test('a page about something else names whose status it is', () => {
  assert.equal(page(h(kit.StatusPill, { status: 'alpha', subject: 'p8' })).querySelector('.ak-status').textContent, 'p8 status: Alpha');
});

test('statusText is the pill’s words', () => {
  for (const props of [{ status: 'alpha' }, { status: 'beta', note: 'channels come next.' }, { status: 'alpha', subject: 'p8' }]) {
    assert.equal(page(h(kit.StatusPill, props)).querySelector('.ak-status').textContent, kit.statusText(props));
  }
});

test('the hero shows the pill above the buttons, next to the MIT badge, and nothing without a status', () => {
  const hero = (props) => page(h(kit.Hero, { headline: { before: 'A ', accent: 'vault' }, sub: 's', installs: [], reel: [], license: {}, ...props }));
  const doc = hero({ status: 'beta', statusNote: 'not yet audited.' });
  const pill = doc.querySelector('.akt-hero .ak-status');
  assert.equal(pill.textContent, 'Status: Beta · not yet audited.');
  assert.ok(pill.compareDocumentPosition(doc.querySelector('.akt-btns .ak-license-badge')) & 4, 'the badge follows the pill');
  assert.equal(hero({}).querySelector('.ak-status'), null);
});
