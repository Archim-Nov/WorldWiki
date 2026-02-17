import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { UserNav } from './UserNav'
import { ScrollHeader } from './ScrollHeader'
import { ThemeToggle } from './ThemeToggle'

const navItems = [
  { href: '/countries', label: '国家' },
  { href: '/regions', label: '区域' },
  { href: '/creatures', label: '生物' },
  { href: '/champions', label: '英雄' },
  { href: '/magics', label: '魔法' },
  { href: '/stories', label: '故事' },
]

export function Header() {
  return (
    <ScrollHeader>
      <div className="container mx-auto px-4 py-3 sm:py-0 sm:h-16 flex flex-col gap-3 sm:grid sm:grid-cols-[minmax(0,1fr)_minmax(18rem,32rem)_minmax(0,1fr)] sm:items-center sm:gap-4">
        <Link href="/" className="font-semibold text-lg sm:text-xl tracking-wide sm:justify-self-start" style={{ fontFamily: 'var(--font-cinzel), serif' }}>
          WorldWiki
        </Link>

        <form
          action="/search"
          method="get"
          className="relative w-full sm:w-full sm:justify-self-center"
        >
          <input
            name="q"
            type="search"
            placeholder="搜索"
            aria-label="搜索"
            enterKeyHint="search"
            className="h-12 w-full rounded-2xl border border-border/35 bg-background/10 pl-5 pr-11 text-base text-foreground/90 placeholder:text-muted-foreground/70 outline-none transition focus:border-primary/55 focus:ring-2 focus:ring-primary/20"
          />
          <button
            type="submit"
            aria-label="提交搜索"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/65 transition hover:text-foreground"
          >
            <ChevronRight size={16} aria-hidden="true" />
          </button>
        </form>

        <nav className="flex flex-wrap items-center gap-3 sm:gap-5 text-sm sm:justify-self-end sm:justify-end">
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
