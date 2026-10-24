'use client';
// The menu's behaviour, shared by every Addis site: what opens and closes it,
// search, keyboard movement, numbered shortcuts. What it lists, and how each
// item looks, is the app's.
import { useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from 'react';

export type MenuItem = {
  id: string;
  title: string;
  /** Where it goes; leave it out and give `onSelect` for an action. */
  href?: string;
  onSelect?: () => void;
  /** A second line, and what search matches besides the title. */
  detail?: string;
  keywords?: string;
  icon?: ReactNode;
};

export type MenuGroup = {
  id: string;
  label: string;
  items: MenuItem[];
  /** Tiles (a grid, numbered 1–9 across groups) or rows. Tiles by default. */
  layout?: 'tiles' | 'list';
  /** Only shown while searching, as matches. */
  searchOnly?: boolean;
};

export type MenuConfig = {
  groups: MenuGroup[];
  pathname: string;
  navigate: (href: string) => void;
};

export type Panel = string | null;

export function matches(item: MenuItem, query: string) {
  if (!query) return true;
  return `${item.title} ${item.detail ?? ''} ${item.keywords ?? ''}`.toLowerCase().includes(query);
}

function isTyping(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable;
}

export type Menu = ReturnType<typeof useMenu>;

/**
 * All of the menu's behaviour. `panel` is which popover is open: `'menu'`, or
 * any name an app gives its own (`'account'`, `'notifications'`, …).
 *
 * Keys: ⌘M / Ctrl+M opens and closes the menu; ⌘S, Ctrl+S or `/` opens it on
 * search; typing anywhere starts a search; ↑ ↓ move, Enter opens, 1–9 open a
 * numbered tile, Esc closes, `?` shows the shortcuts.
 */
export function useMenu({ groups, pathname, navigate }: MenuConfig) {
  const [panel, setPanel] = useState<Panel>(null);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(-1);
  const [help, setHelp] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mod, setMod] = useState('Ctrl+');
  const launcherRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const helpRef = useRef<HTMLDivElement>(null);
  const wantSearch = useRef(false);

  const needle = query.trim().toLowerCase();
  /** Each group with only what matches the search; search-only groups appear only while searching. */
  const shown = useMemo(
    () =>
      groups
        .filter((group) => !group.searchOnly || needle)
        .map((group) => ({ ...group, items: group.items.filter((item) => matches(item, needle)) }))
        .filter((group) => group.items.length > 0),
    [groups, needle],
  );
  /** Every visible item in order: what ↑ ↓ move through. */
  const flat = useMemo(() => shown.flatMap((group) => group.items), [shown]);
  /** The tiles 1–9 open. */
  const numbered = useMemo(
    () => shown.filter((group) => (group.layout ?? 'tiles') === 'tiles' && !group.searchOnly).flatMap((g) => g.items).slice(0, 9),
    [shown],
  );

  function close() {
    setPanel(null);
    setQuery('');
    setActive(-1);
  }

  function openMenu(search: boolean) {
    wantSearch.current = search;
    setQuery('');
    setActive(-1);
    setPanel('menu');
  }

  function toggle(name: string) {
    setPanel((current) => (current === name ? null : name));
  }

  function select(item: MenuItem) {
    close();
    if (item.onSelect) item.onSelect();
    else if (item.href) navigate(item.href);
  }

  function search(value: string) {
    setQuery(value);
    setActive(value.trim() ? 0 : -1);
  }

  const here = (href?: string) => !!href && !href.includes('#') && pathname === href;

  useEffect(() => {
    setMod(/Mac|iPhone|iPad/.test(navigator.platform) ? '⌘' : 'Ctrl+');
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // A navigation closes whatever was open.
  useEffect(() => {
    setPanel(null);
  }, [pathname]);

  // A click outside the header closes the open popover.
  useEffect(() => {
    if (!panel) return;
    const onPointer = (event: MouseEvent) => {
      if (event.target instanceof Node && headerRef.current?.contains(event.target)) return;
      close();
    };
    document.addEventListener('mousedown', onPointer);
    return () => document.removeEventListener('mousedown', onPointer);
  }, [panel]);

  useEffect(() => {
    if (panel !== 'menu') return;
    const frame = requestAnimationFrame(() => {
      if (wantSearch.current) searchRef.current?.focus();
      else dialogRef.current?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [panel]);

  useEffect(() => {
    if (help) helpRef.current?.focus();
  }, [help]);

  useEffect(() => {
    if (active < 0) return;
    document.getElementById(`ak-item-${flat[active]?.id}`)?.scrollIntoView({ block: 'nearest' });
  }, [active, flat]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const chord = event.metaKey || event.ctrlKey;
      if (event.repeat && (key === 'm' || key === 's' || event.key === '/' || event.key === '?')) return;

      if (help) {
        if (event.key === 'Escape' || event.key === '?') {
          event.preventDefault();
          setHelp(false);
        }
        return;
      }
      if (event.key === '?' && !chord && !event.altKey) {
        if (event.target !== searchRef.current && isTyping(event.target)) return;
        event.preventDefault();
        setHelp(true);
        return;
      }
      if (chord && key === 'm' && !event.altKey && !event.shiftKey) {
        event.preventDefault();
        if (panel === 'menu') {
          close();
          launcherRef.current?.focus();
        } else openMenu(false);
        return;
      }
      if ((chord && key === 's' && !event.altKey) || (event.key === '/' && !chord && !event.altKey && !isTyping(event.target))) {
        event.preventDefault();
        if (panel === 'menu') searchRef.current?.focus();
        else openMenu(true);
        return;
      }
      if (panel !== 'menu') {
        if (event.key === 'Escape') setPanel(null);
        return;
      }
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
        launcherRef.current?.focus();
        return;
      }
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        setActive((current) => {
          if (flat.length === 0) return -1;
          if (event.key === 'ArrowDown') return current < flat.length - 1 ? current + 1 : 0;
          return current <= 0 ? flat.length - 1 : current - 1;
        });
        return;
      }
      if (event.key === 'Enter' && active >= 0 && flat[active]) {
        event.preventDefault();
        select(flat[active]);
        return;
      }
      if (/^[1-9]$/.test(event.key) && !chord && !event.altKey) {
        const item = numbered[Number(event.key) - 1];
        if (item) {
          event.preventDefault();
          select(item);
          return;
        }
      }
      if (event.key.length === 1 && !chord && !event.altKey && !isTyping(event.target)) {
        event.preventDefault();
        wantSearch.current = true;
        setQuery((value) => value + event.key);
        setActive(0);
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return {
    panel, setPanel, toggle, close, openMenu,
    query, search, active, setActive,
    shown, flat, numbered, select, here,
    help, setHelp, scrolled, mod,
    refs: { launcher: launcherRef, search: searchRef, dialog: dialogRef, header: headerRef as RefObject<HTMLElement>, help: helpRef },
  };
}
