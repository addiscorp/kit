'use client';
// The header every Addis site shares: a launcher in the middle that opens the
// menu, and two slots for whatever the app puts beside it. The structure and
// behaviour are the kit's; the content and look of every item are the app's.
import {
  createContext,
  useContext,
  type AnchorHTMLAttributes,
  type ComponentType,
  type ReactNode,
} from 'react';
import { useMenu, type Menu, type MenuGroup, type MenuItem } from './menu.js';

export { useMenu, matches, type Menu, type MenuGroup, type MenuItem, type MenuConfig } from './menu.js';

/** A link component (Next's or vinext's `Link`); a plain <a> by default. */
export type LinkComponent = ComponentType<AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }>;

const PlainLink: LinkComponent = (props) => <a {...props} />;

type Context = { menu: Menu; Link: LinkComponent };
const HeaderContext = createContext<Context | null>(null);

/** The menu's state and the link component, for anything inside a Header. */
export function useHeader(): Context {
  const context = useContext(HeaderContext);
  if (!context) throw new Error('useHeader needs a <Header> (or <HeaderProvider>) around it');
  return context;
}

/** Shares a menu built with useMenu with the blocks inside, for a header an app lays out itself. */
export function HeaderProvider({ menu, Link = PlainLink, children }: { menu: Menu; Link?: LinkComponent; children: ReactNode }) {
  return <HeaderContext.Provider value={{ menu, Link }}>{children}</HeaderContext.Provider>;
}

export type ItemContext = { active: boolean; current: boolean; shortcut?: string; layout: 'tiles' | 'list' };

export type HeaderProps = {
  brand: { name: string; mark?: ReactNode };
  groups: MenuGroup[];
  pathname: string;
  navigate: (href: string) => void;
  /** Beside the brand on the left: an account button, say. */
  start?: ReactNode;
  /** On the right: notifications, settings, anything. */
  end?: ReactNode;
  placeholder?: string;
  Link?: LinkComponent;
  /** Draws an item your way; return undefined to keep the kit's. */
  renderItem?: (item: MenuItem, context: ItemContext) => ReactNode;
};

export function Header({ brand, groups, pathname, navigate, start, end, placeholder, Link = PlainLink, renderItem }: HeaderProps) {
  const menu = useMenu({ groups, pathname, navigate });
  return (
    <HeaderProvider menu={menu} Link={Link}>
      <header className={menu.scrolled ? 'ak-topbar is-scrolled' : 'ak-topbar'} ref={menu.refs.header}>
        <div className="ak-topbar-inner">
          <div className="ak-top-side">{start}</div>
          <div className="ak-top-center">
            <Launcher name={brand.name} mark={brand.mark} />
            <MenuPanel placeholder={placeholder} renderItem={renderItem} />
          </div>
          <div className="ak-top-side ak-end">{end}</div>
        </div>
      </header>
      <ShortcutsHelp />
    </HeaderProvider>
  );
}

/** The brand button that opens the menu. */
export function Launcher({ name, mark }: { name: string; mark?: ReactNode }) {
  const { menu } = useHeader();
  const open = menu.panel === 'menu';
  return (
    <button
      ref={menu.refs.launcher}
      className="ak-launcher"
      type="button"
      aria-haspopup="dialog"
      aria-expanded={open}
      aria-controls="ak-menu"
      onClick={() => (open ? menu.close() : menu.openMenu(false))}
    >
      {mark}
      <span>{name}</span>
      <Chevron open={open} />
    </button>
  );
}

/** The menu: search, then each group as tiles or rows. */
export function MenuPanel({ placeholder = 'Search or jump', renderItem }: { placeholder?: string; renderItem?: HeaderProps['renderItem'] }) {
  const { menu } = useHeader();
  if (menu.panel !== 'menu') return null;
  return (
    <div ref={menu.refs.dialog} id="ak-menu" className="ak-menu" role="dialog" aria-modal="true" aria-label="Menu" tabIndex={-1}>
      <div className="ak-search">
        <SearchIcon />
        <input
          ref={menu.refs.search}
          value={menu.query}
          onChange={(event) => menu.search(event.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
          aria-activedescendant={menu.active >= 0 ? `ak-item-${menu.flat[menu.active]?.id}` : undefined}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
        />
      </div>
      {menu.shown.map((group) => (
        <MenuItems key={group.id} group={group} renderItem={renderItem} />
      ))}
      {menu.flat.length === 0 && <p className="ak-empty">Nothing matches.</p>}
    </div>
  );
}

/** One group of the menu. */
export function MenuItems({ group, renderItem }: { group: MenuGroup; renderItem?: HeaderProps['renderItem'] }) {
  const { menu, Link } = useHeader();
  const layout = group.searchOnly ? 'list' : group.layout ?? 'tiles';
  return (
    <div className="ak-group">
      <p className="ak-group-label">{group.label}</p>
      <div className={layout === 'tiles' ? 'ak-tiles' : 'ak-list'} role="list">
        {group.items.map((item) => {
          const index = menu.flat.indexOf(item);
          const number = menu.numbered.indexOf(item);
          const context: ItemContext = {
            active: index === menu.active,
            current: menu.here(item.href),
            shortcut: number >= 0 ? String(number + 1) : undefined,
            layout,
          };
          const custom = renderItem?.(item, context);
          const inner = custom ?? (
            <>
              {layout === 'tiles' ? item.icon ?? <DotIcon /> : null}
              {layout === 'tiles' ? item.title : <><b>{item.title}</b>{item.detail && <span className="ak-soft">{item.detail}</span>}</>}
              {context.shortcut && <kbd className="ak-key-num" aria-hidden="true">{context.shortcut}</kbd>}
            </>
          );
          const className = `${layout === 'tiles' ? 'ak-tile' : 'ak-row'}${context.active ? ' is-active' : ''}`;
          const common = {
            id: `ak-item-${item.id}`,
            className,
            onMouseEnter: () => menu.setActive(index),
          };
          return item.href && !item.onSelect ? (
            <Link
              key={item.id}
              {...common}
              href={item.href}
              aria-current={context.current ? 'page' : undefined}
              aria-keyshortcuts={context.shortcut}
              onClick={() => menu.close()}
            >
              {inner}
            </Link>
          ) : (
            <button key={item.id} {...common} type="button" onClick={() => menu.select(item)}>
              {inner}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * A round button in the header with a popover under it: account,
 * notifications, settings, or anything an app needs. `name` keeps one popover
 * open at a time, with the menu.
 */
export function HeaderButton({
  name,
  label,
  icon,
  badge,
  variant = 'icon',
  align = 'start',
  children,
}: {
  name: string;
  label: string;
  icon: ReactNode;
  badge?: number;
  variant?: 'icon' | 'profile';
  align?: 'start' | 'end';
  children?: ReactNode;
}) {
  const { menu } = useHeader();
  const open = menu.panel === name;
  return (
    <div className="ak-anchor">
      <button
        className={variant === 'profile' ? 'ak-profile-btn' : 'ak-icon-btn'}
        type="button"
        aria-label={badge ? `${badge} ${label}` : label}
        aria-expanded={open}
        onClick={() => menu.toggle(name)}
      >
        {icon}
        {!!badge && <span className="ak-badge">{badge}</span>}
      </button>
      {open && children && (
        <div className={align === 'end' ? 'ak-popover ak-end' : 'ak-popover'} role="dialog" aria-label={label}>
          {children}
        </div>
      )}
    </div>
  );
}

/** The `?` overlay listing the shortcuts. */
export function ShortcutsHelp() {
  const { menu } = useHeader();
  if (!menu.help) return null;
  const mod = menu.mod;
  return (
    <div className="ak-help-layer" onMouseDown={() => menu.setHelp(false)}>
      <div
        ref={menu.refs.help}
        className="ak-help"
        role="dialog"
        aria-modal="true"
        aria-label="Keyboard shortcuts"
        tabIndex={-1}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <h2>Keyboard shortcuts</h2>
        <ul className="ak-help-list">
          <li><span>Open or close the menu</span><span className="ak-help-keys"><kbd>{mod}M</kbd></span></li>
          <li><span>Open the menu on search</span><span className="ak-help-keys"><kbd>/</kbd><kbd>{mod}S</kbd></span></li>
          <li><span>Open a numbered tile</span><span className="ak-help-keys"><kbd>1–9</kbd></span></li>
          <li><span>Move through the menu</span><span className="ak-help-keys"><kbd>↑</kbd><kbd>↓</kbd></span></li>
          <li><span>Open the highlighted item</span><span className="ak-help-keys"><kbd>Enter</kbd></span></li>
          <li><span>Close</span><span className="ak-help-keys"><kbd>Esc</kbd></span></li>
          <li><span>Show these shortcuts</span><span className="ak-help-keys"><kbd>?</kbd></span></li>
        </ul>
      </div>
    </div>
  );
}

export function Chevron({ open }: { open: boolean }) {
  return (
    <svg className={open ? 'ak-chev ak-open' : 'ak-chev'} viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

export function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <circle cx="11" cy="11" r="6" />
      <path d="M16 16l4 4" />
    </svg>
  );
}

export function PersonIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <circle cx="12" cy="8" r="3" />
      <path d="M5 19c1.4-3 3.8-4.5 7-4.5S17.6 16 19 19" />
    </svg>
  );
}

export function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M6 16V10a6 6 0 1 1 12 0v6l1.5 2h-15L6 16Z" />
      <path d="M10 19a2 2 0 0 0 4 0" />
    </svg>
  );
}

export function GearIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3.5v2.2M12 18.3v2.2M3.5 12h2.2M18.3 12h2.2M5.8 5.8l1.6 1.6M16.6 16.6l1.6 1.6M18.2 5.8l-1.6 1.6M7.4 16.6l-1.6 1.6" />
    </svg>
  );
}

export function PlusIcon() {
  return (
    <svg className="ak-favicon" viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M8 3.5v9M3.5 8h9" />
    </svg>
  );
}

function DotIcon() {
  return (
    <svg className="ak-favicon" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
      <circle cx="8" cy="8" r="3" fill="currentColor" />
    </svg>
  );
}
