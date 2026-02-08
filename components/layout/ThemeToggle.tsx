'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState, useRef } from 'react'
import { Sun, Moon, Monitor } from 'lucide-react'

const options = [
  { value: 'light', label: '亮色', Icon: Sun },
  { value: 'dark', label: '暗色', Icon: Moon },
  { value: 'system', label: '系统', Icon: Monitor },
] as const

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (!open) return
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [open])

  if (!mounted) {
    return <span className="inline-block w-8 h-8" />
  }

  const current = options.find((o) => o.value === theme) ?? options[2]
  const CurrentIcon = current.Icon

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center justify-center w-8 h-8 rounded-full text-muted-foreground transition-colors hover:text-primary"
        aria-label="切换主题"
      >
        <CurrentIcon size={16} strokeWidth={1.8} />
      </button>

      {open && (
        <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 min-w-[120px] rounded-lg border border-border bg-popover p-1 shadow-lg">
          {options.map(({ value, label, Icon }) => (
            <button
              key={value}
              onClick={() => { setTheme(value); setOpen(false) }}
              className={`flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors ${
                theme === value
                  ? 'text-primary bg-accent'
                  : 'text-popover-foreground hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              <Icon size={14} strokeWidth={1.8} />
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
