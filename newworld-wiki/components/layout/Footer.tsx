import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t py-6 sm:py-8">
      <div className="container mx-auto px-4 flex flex-col items-center gap-4 text-center text-muted-foreground">
        <nav className="flex flex-wrap items-center justify-center gap-4 text-sm">
          <Link href="/about" className="hover:text-primary">
            关于
          </Link>
          <Link href="/contact" className="hover:text-primary">
            联系
          </Link>
        </nav>
        <p className="text-xs">
          &copy; {new Date().getFullYear()} Newworld Wiki. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
