import Link from 'next/link'

export function Footer() {
  return (
    <footer className="relative border-t border-border/50 py-6 sm:py-8">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      <div className="container mx-auto px-4 flex flex-col items-center gap-4 text-center text-muted-foreground">
        <nav className="flex flex-wrap items-center justify-center gap-4 text-sm">
          <Link href="/about" className="transition-colors hover:text-primary">
            关于
          </Link>
          <Link href="/contact" className="transition-colors hover:text-primary">
            联系
          </Link>
        </nav>
        <p className="text-xs">
          &copy; {new Date().getFullYear()} WorldWiki. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
