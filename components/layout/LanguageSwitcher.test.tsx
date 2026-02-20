/** @vitest-environment jsdom */

import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { replaceMock, refreshMock, usePathnameMock, useSearchParamsMock, useLocaleMock } = vi.hoisted(() => ({
  replaceMock: vi.fn(),
  refreshMock: vi.fn(),
  usePathnameMock: vi.fn(),
  useSearchParamsMock: vi.fn(),
  useLocaleMock: vi.fn(),
}))

vi.mock('next-intl', () => ({
  useLocale: useLocaleMock,
  useTranslations: () => {
    const messages: Record<string, string> = {
      buttonAria: 'Select language',
      'options.en': 'English',
      'options.zh-CN': 'Chinese',
    }

    return (key: string) => messages[key] ?? key
  },
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: replaceMock, refresh: refreshMock }),
  usePathname: usePathnameMock,
  useSearchParams: useSearchParamsMock,
}))

import { LanguageSwitcher } from './LanguageSwitcher'

describe('LanguageSwitcher', () => {
  beforeEach(() => {
    window.localStorage.clear()
    replaceMock.mockReset()
    refreshMock.mockReset()
    usePathnameMock.mockReturnValue('/zh-CN/regions')
    useSearchParamsMock.mockReturnValue(new URLSearchParams('q=lore'))
    useLocaleMock.mockReturnValue('zh-CN')
  })

  afterEach(() => {
    cleanup()
  })

  it('switches locale while keeping path and query', async () => {
    const user = userEvent.setup()
    render(<LanguageSwitcher />)

    const toggle = await screen.findByRole('button', { name: 'Select language' })
    await user.click(toggle)

    const menu = screen.getByRole('menu', { hidden: true })
    expect(menu).toHaveAttribute('aria-hidden', 'false')

    const englishOption = screen.getByRole('menuitemradio', { name: 'English' })
    await user.click(englishOption)

    await waitFor(() => {
      expect(window.localStorage.getItem('worldwiki-locale')).toBe('en')
      expect(replaceMock).toHaveBeenCalledWith('/en/regions?q=lore')
      expect(refreshMock).toHaveBeenCalled()
      expect(menu).toHaveAttribute('aria-hidden', 'true')
    })
  })

  it('closes dropdown when clicking outside', async () => {
    const user = userEvent.setup()

    render(
      <div>
        <LanguageSwitcher />
        <button type="button">outside</button>
      </div>
    )

    const toggle = await screen.findByRole('button', { name: 'Select language' })
    await user.click(toggle)
    expect(screen.getByRole('menu', { hidden: true })).toHaveAttribute('aria-hidden', 'false')

    await user.click(screen.getByRole('button', { name: 'outside' }))
    await waitFor(() => {
      expect(screen.getByRole('menu', { hidden: true })).toHaveAttribute('aria-hidden', 'true')
    })
  })

  it('uses locale from pathname when intl locale is stale', async () => {
    const user = userEvent.setup()
    usePathnameMock.mockReturnValue('/en/regions')
    useLocaleMock.mockReturnValue('zh-CN')

    render(<LanguageSwitcher />)

    const toggle = await screen.findByRole('button', { name: 'Select language' })
    await user.click(toggle)

    expect(screen.getByRole('menuitemradio', { name: 'English' })).toHaveAttribute(
      'aria-checked',
      'true'
    )
    expect(screen.getByRole('menuitemradio', { name: 'Chinese' })).toHaveAttribute(
      'aria-checked',
      'false'
    )
  })
})
