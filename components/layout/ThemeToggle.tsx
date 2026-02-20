'use client'

import { useTheme } from 'next-themes'
import { useTranslations } from 'next-intl'
import { useEffect, useRef, useState } from 'react'
import { Sun, Moon, Monitor } from 'lucide-react'

const options = [
  { value: 'light', Icon: Sun },
  { value: 'dark', Icon: Moon },
  { value: 'system', Icon: Monitor },
] as const

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const t = useTranslations('ThemeToggle')
  const [mounted, setMounted] = useState(false)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(frame)
  }, [])

  useEffect(() => {
    if (!open) return

    const onClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [open])

  if (!mounted) {
    return <span className="inline-block w-8 h-8" />
  }

  const current = options.find((option) => option.value === theme) ?? options[2]
  const CurrentIcon = current.Icon

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center justify-center w-8 h-8 rounded-full text-muted-foreground transition-colors hover:text-primary"
        aria-label={t('buttonAria')}
      >
        <CurrentIcon size={16} strokeWidth={1.8} />
      </button>

      {open && (
        <div className="absolute left-1/2 top-[calc(100%+1.15rem)] z-50 w-44 -translate-x-1/2 origin-top isolate overflow-visible rounded-xl border border-border/45 bg-background/80 p-1.5 shadow-[0_18px_28px_-20px_rgba(0,0,0,0.6)] backdrop-blur-xl backdrop-saturate-150">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-l border-t border-border/45 bg-background/80"
          />
          {options.map(({ value, Icon }) => (
            <button
              key={value}
              onClick={() => {
                setTheme(value)
                setOpen(false)
              }}
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition duration-150 ${
                theme === value
                  ? 'bg-accent text-accent-foreground'
                  : 'text-popover-foreground hover:bg-accent/70 hover:text-accent-foreground'
              }`}
            >
              <Icon size={14} strokeWidth={1.8} />
              {t(`options.${value}`)}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
