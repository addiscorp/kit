// Text fields never draw a focus ring (Sami, 14 Nov 2026): not the kit's
// search box, and not any input, textarea or select on a site that loads kit.css.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../dist/kit.css', import.meta.url), 'utf8');

/** A selector list split at its own commas, not the ones inside :where(…) or :is(…). */
function splitTopLevel(list) {
  const parts = [];
  let depth = 0, start = 0;
  for (let i = 0; i < list.length; i++) {
    if (list[i] === '(') depth++;
    else if (list[i] === ')') depth--;
    else if (list[i] === ',' && depth === 0) { parts.push(list.slice(start, i)); start = i + 1; }
  }
  parts.push(list.slice(start));
  return parts;
}

/** Every rule's declarations for a selector, as one string (whitespace-normalised). */
function rulesFor(selector) {
  const out = [];
  for (const m of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const selectors = splitTopLevel(m[1].replace(/\/\*[\s\S]*?\*\//g, '')).map((s) => s.trim().replace(/\s+/g, ' '));
    if (selectors.includes(selector)) out.push(m[2]);
  }
  return out.join(';');
}

test('fields lose the outline and the ring shadow when focused, at zero specificity', () => {
  for (const sel of [':where(input, textarea, select):focus', ':where(input, textarea, select):focus-visible']) {
    const decl = rulesFor(sel);
    assert.match(decl, /outline:\s*none/, sel);
    assert.match(decl, /box-shadow:\s*none/, sel);
  }
});

test('the top bar and help panel ring buttons and links, never their fields', () => {
  assert.match(rulesFor('.ak-topbar :is(input, textarea, select):focus-visible'), /outline:\s*none/);
  assert.match(rulesFor('.ak-help :is(input, textarea, select):focus-visible'), /outline:\s*none/);
  // Buttons and links keep theirs: keyboard users still see where they are.
  assert.match(rulesFor('.ak-topbar :focus-visible'), /outline:\s*2px solid/);
});

test('the menu search box has a quiet border, not the accent ring', () => {
  const decl = rulesFor('.ak-search');
  assert.match(decl, /border:\s*1px solid var\(--ak-edge\)/);
  assert.doesNotMatch(decl, /--ak-accent/);
});
