import Link from 'next/link'

const navItems = [
  { href: '/countries', label: '国家' },
  { href: '/regions', label: '区域' },
  { href: '/creatures', label: '生物' },
  { href: '/champions', label: '英雄' },
  { href: '/stories', label: '故事' },
  { href: '/studio', label: 'Studio' },
]

export function Header() {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-3 sm:py-0 sm:h-16 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <Link href="/" className="font-semibold text-lg sm:text-xl">
          Newworld Wiki
        </Link>
        <nav className="flex flex-wrap items-center gap-3 sm:gap-5 text-sm">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-primary">
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
