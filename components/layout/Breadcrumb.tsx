import Link from 'next/link';

type BreadcrumbItem = { label: string; href?: string };

export default function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return <nav className="breadcrumb-line ui-breadcrumb" aria-label="Breadcrumb">
    <Link href="/dashboard" aria-label="Home"><i className="bi bi-house" /></Link>
    {items.map((item, index) => <span key={`${item.label}-${index}`}>
      <span aria-hidden="true">/</span>{item.href ? <Link href={item.href}>{item.label}</Link> : <span aria-current="page">{item.label}</span>}
    </span>)}
  </nav>;
}