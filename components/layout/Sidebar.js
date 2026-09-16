'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { getRoutePath } from '@/lib/site-path';
import { getActiveNavigationSection, navigation } from '@/components/layout/navigation';

function isActivePath(pathname, href) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Sidebar() {
  const pathname = getRoutePath(usePathname());
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const activeSection = getActiveNavigationSection(pathname);
  const [expandedSections, setExpandedSections] = useState(() => Object.fromEntries(navigation.map((section) => [section.title, true])));

  useEffect(() => {
    const toggle = () => setOpen((current) => !current);
    window.addEventListener('astro:toggle-sidebar', toggle);
    return () => window.removeEventListener('astro:toggle-sidebar', toggle);
  }, []);

  useEffect(() => {
    if (activeSection) setExpandedSections((current) => ({ ...current, [activeSection]: true }));
    setOpen(false);
  }, [activeSection]);

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', closeOnEscape);
    document.body.classList.toggle('sidebar-open', open);
    window.dispatchEvent(new CustomEvent('astro:sidebar-state', { detail: { open } }));
    return () => {
      document.removeEventListener('keydown', closeOnEscape);
      document.body.classList.remove('sidebar-open');
    };
  }, [open]);

  const activeItems = useMemo(() => navigation.flatMap((section) => section.items).filter((item) => isActivePath(pathname, item.href)), [pathname]);

  return <>
    {open && <button className="sidebar-backdrop" type="button" onClick={() => setOpen(false)} aria-label="Close navigation" />}
    <aside id="main-sidebar" className={`sidebar ${open ? 'is-open' : ''} ${collapsed ? 'is-collapsed' : ''}`} aria-label="Application sidebar">
      <div className="sidebar-brand-row">
        <Link href="/dashboard" className="sidebar-brand" aria-label="Astro Market Analytics dashboard" title={collapsed ? 'Dashboard' : undefined}>
          <span className="brand-star">✦</span><span className="sidebar-brand-copy"><strong>ASTRO</strong><small>MARKET ANALYTICS</small></span>
        </Link>
        <button type="button" className="sidebar-collapse-button" onClick={() => setCollapsed((value) => !value)} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}><i className={`bi bi-chevron-${collapsed ? 'right' : 'left'}`} /></button>
      </div>
      <nav aria-label="Main navigation" className="sidebar-navigation">
        {navigation.map((section) => {
          const sectionActive = section.items.some((item) => activeItems.includes(item));
          const isExpanded = expandedSections[section.title];
          return <div className="sidebar-navigation-group" key={section.title}>
            <button className={`sidebar-section-toggle ${sectionActive ? 'is-active' : ''}`} type="button" onClick={() => setExpandedSections((current) => ({ ...current, [section.title]: !current[section.title] }))} aria-expanded={isExpanded} title={collapsed ? section.title : undefined}>
              <span><i className={`bi ${section.icon}`} aria-hidden="true" /><span className="sidebar-label">{section.title}</span></span><i className={`bi bi-chevron-${isExpanded ? 'up' : 'down'} sidebar-section-chevron`} aria-hidden="true" />
            </button>
            <div className={`sidebar-section-items ${isExpanded ? 'is-expanded' : 'is-collapsed'}`}>
              {section.items.map((item) => { const active = isActivePath(pathname, item.href); return <Link href={item.href} className={`sidebar-link ${active ? 'active' : ''}`} key={item.href} onClick={() => setOpen(false)} aria-current={active ? 'page' : undefined} title={collapsed ? item.label : undefined}><i className={`bi ${item.icon}`} aria-hidden="true" /><span className="sidebar-label">{item.label}</span></Link>; })}
            </div>
          </div>;
        })}
      </nav>
      <div className="sidebar-bottom"><i className="bi bi-shield-check" aria-hidden="true" /><span className="sidebar-label">Research console</span></div>
    </aside>
  </>;
}