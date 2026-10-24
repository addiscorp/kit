# @addiscorp/kit

The header, footer and theme every Addis site shares. The kit owns their
structure and behaviour; each app owns what's in them and its brand colours.

## Use it

```sh
npm install github:addiscorp/kit#v0.1.0
```

```tsx
import '@addiscorp/kit/kit.css';
import { Header, Footer, HeaderButton, PersonIcon, themeBoot } from '@addiscorp/kit';

// In <head>, before paint: <script dangerouslySetInnerHTML={{ __html: themeBoot }} />

<Header
  brand={{ name: 'simien', mark: <img src="/mark.png" alt="" /> }}
  groups={[
    { id: 'docs', label: 'docs', items: [{ id: 'start', title: 'Start an app', href: '/docs/start/' }] },
    { id: 'menu', label: 'menu', items: [{ id: 'github', title: 'GitHub', href: 'https://github.com/simienapp' }] },
    { id: 'more', label: 'Matches', searchOnly: true, items: [/* found only by searching */] },
  ]}
  pathname={pathname}
  navigate={(href) => router.push(href)}
  Link={Link}          // your framework's link; a plain <a> by default
  start={<HeaderButton name="account" label="Account" variant="profile" icon={<PersonIcon />}>…</HeaderButton>}
  end={<>{/* notifications, settings, anything */}</>}
  placeholder="Search the docs"
/>

<Footer site="simien.dev" />
```

## What the kit does, so no app has to

- **The menu**: the brand button opens it; ⌘M / Ctrl+M opens and closes it; ⌘S, Ctrl+S or `/` opens it on search; typing anywhere searches; ↑ ↓ move, Enter opens, 1–9 open a numbered tile, Esc closes, `?` lists the shortcuts. A click outside or a navigation closes it.
- **Groups** are tiles (numbered 1–9 in order across groups) or rows (`layout: 'list'`); a `searchOnly` group appears only as search matches. An item has a `href` or an `onSelect`, an optional `icon`, `detail` and `keywords`.
- **`HeaderButton`**: a round button with a popover, one popover open at a time with the menu: account, notifications (`badge`), settings, or anything else.
- **`Footer`**: who makes the site (Addis Corp by default; `owner` changes it), the site's name, the light/dark switch.
- **Theme**: `themeBoot` sets light or dark before paint (a `theme` cookie wins, else the system); `ThemeToggle` switches and remembers.

## Make it yours

- **Colours and fonts** are variables. Set your brand's after importing `kit.css`:
  ```css
  :root { --ak-accent: #9a6b0c; --ak-ground: #fafaf8; --ak-display: var(--font-display); }
  :root[data-theme="dark"] { --ak-accent: #e2b54a; --ak-ground: #0b0c0e; }
  ```
  `--ak-ground`, `--ak-panel`, `--ak-menu`, `--ak-tile`, `--ak-ink`, `--ak-soft`, `--ak-accent`, `--ak-edge`, `--ak-header-bg`, `--ak-font`, `--ak-display`, `--ak-width`, `--ak-topbar-h`.
- **One item drawn your way**: `renderItem={(item, { active, current, shortcut, layout }) => …}`; return `undefined` to keep the kit's.
- **A different layout entirely**: `useMenu({ groups, pathname, navigate })` is all the behaviour as a hook; wrap your own markup in `<HeaderProvider menu={menu}>` and use `Launcher`, `MenuPanel`, `MenuItems`, `HeaderButton` and `ShortcutsHelp` as you need them.

## Develop

```sh
npm install
npm run typecheck
npm test          # builds dist/, then drives the header and footer in a DOM (jsdom)
```
