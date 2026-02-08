import Link from 'next/link'
import { UserNav } from './UserNav'
import { ScrollHeader } from './ScrollHeader'
import { ThemeToggle } from './ThemeToggle'

const navItems = [
  { href: '/countries', label: '国家' },
  { href: '/regions', label: '区域' },
  { href: '/creatures', label: '生物' },
  { href: '/champions', label: '英雄' },
  { href: '/stories', label: '故事' },
]

export function Header() {
  return (
    <ScrollHeader>
      <div className="container mx-auto px-4 py-3 sm:py-0 sm:h-16 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <Link href="/" className="font-semibold text-lg sm:text-xl tracking-wide" style={{ fontFamily: 'var(--font-cinzel), serif' }}>
          WorldWiki
        </Link>
        <nav className="flex flex-wrap items-center gap-3 sm:gap-5 text-sm">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="nav-link text-muted-foreground transition-colors hover:text-primary">
              {item.label}
            </Link>
          ))}
          <UserNav />
          <ThemeToggle />
        </nav>
      </div>
    </ScrollHeader>
  )
}
