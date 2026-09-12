'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { getRoutePath } from '@/lib/site-path';

const menus = [
  {
    title: 'Lunar & Calendar',
    icon: 'bi-calendar3',
    items: [
      ['Amavasya', '/amavasya'],
      ['Purnima', '/purnima'],
    ],
  },
  {
    title: 'Bhadra',
    icon: 'bi-exclamation-triangle',
    items: [
      ['Bhadra Kaal', '/bhadra-kaal'],
    ],
  },
  {
    title: 'Planetary Analysis',
    icon: 'bi-stars',
    items: [
      ['Mangal Gochar', '/mangal-gochar'],
      ['Panchak', '/panchak'],
      ['Pushya Nakshatra', '/pushya-nakshatra'],
      ['Shukra Gochar', '/shukra-gochar'],
      ['Sun-Jupiter Tracking', '/sun-jupiter-tracking'],
      ['Jupiter Venus Tracking', '/jupiter-venus-tracking'],
      ['Grah Past Records', '/grah-past-records'],
      ['Reversal Time', '/reversal-time'],
      ['Rashi Nakshatra', '/rashi-nakshatra'],
    ],
  },
  {
    title: 'Market Analysis',
    icon: 'bi-graph-up-arrow',
    items: [
      ['Degree Calculator', '/degree-calculator'],
      ['Stock Gann Pressure', '/stock-gann-pressure-calc'],
      ['📊 Stocks Times', '/stocks-times'],
      ['Planet-Stock Mapping', '/planet-stock-mapping'],
    ],
  },
];

function sectionForPath(pathname) {
  return menus.find((section) => section.items.some(([, href]) => href === pathname))?.title || null;
}

export default function Sidebar() {
  const pathname = getRoutePath(usePathname());
  const [open, setOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState(() => Object.fromEntries(menus.map((section) => [section.title, false])));

  const activeSection = sectionForPath(pathname);

  useEffect(() => {
    const toggle = () => setOpen((current) => !current);
    window.addEventListener('astro:toggle-sidebar', toggle);
    return () => window.removeEventListener('astro:toggle-sidebar', toggle);
  }, []);

  useEffect(() => {
    if (!activeSection) return;
    setExpandedSections((current) => ({ ...current, [activeSection]: true }));
  }, [activeSection]);

  if (pathname === '/login') return null;
  
  return (
    <aside className={`sidebar ${open ? 'is-open' : ''}`}>
      <nav aria-label="Main navigation" className="py-2 sidebar-menu is-expanded">
        <Link href="/dashboard" className={`sidebar-link ${pathname === '/dashboard' ? 'active' : ''}`} onClick={() => setOpen(false)} aria-current={pathname === '/dashboard' ? 'page' : undefined}><i className="bi bi-grid-1x2-fill" /> Dashboard</Link>

        {menus.map((section) => (
          <div key={section.title}>
            <button className="sidebar-section-toggle" type="button" onClick={() => setExpandedSections((current) => ({ ...current, [section.title]: !current[section.title] }))} aria-expanded={expandedSections[section.title]}>
              <span><i className={`bi ${section.icon}`} /> {section.title}</span><i className={`bi bi-chevron-${expandedSections[section.title] ? 'up' : 'down'}`} />
            </button>
            <div className={`sidebar-section-items ${expandedSections[section.title] ? 'is-expanded' : 'is-collapsed'}`}>
              {section.items.map(([label, href]) => (
                <Link href={href} className={`sidebar-link ${pathname === href ? 'active' : ''}`} key={href} onClick={() => setOpen(false)} aria-current={pathname === href ? 'page' : undefined}>{label}</Link>
              ))}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
