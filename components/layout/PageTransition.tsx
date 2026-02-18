'use client'

import type { ReactNode } from 'react'
import { usePathname } from 'next/navigation'

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  return (
    <div
      key={pathname}
      className="page-enter"
      data-testid="page-transition"
      data-route-key={pathname}
    >
      {children}
    </div>
  )
}
