/** @vitest-environment jsdom */

import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const {
  searchParamGetMock,
  routerPushMock,
  signUpMock,
} = vi.hoisted(() => ({
  searchParamGetMock: vi.fn(),
  routerPushMock: vi.fn(),
  signUpMock: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: routerPushMock,
  }),
  useSearchParams: () => ({
    get: searchParamGetMock,
  }),
}))

vi.mock('next-intl', () => ({
  useLocale: () => 'zh-CN',
  useTranslations: () => {
    const messages: Record<string, string> = {
      title: '×¢²á',
      email: 'ÓÊÏä',
      password: 'ÃÜÂë',
      submit: '×¢²á',
      loading: '×¢²áÖÐ...',
      loginPrompt: 'ÒÑÓÐÕËºÅ£¿',
      loginLink: 'µÇÂ¼',
    }

    return (key: string) => messages[key] ?? key
  },
}))

vi.mock('@/components/i18n/LocalizedLink', () => ({
  LocalizedLink: ({ href, children, ...props }: { href: unknown; children: React.ReactNode; [key: string]: unknown }) => (
    <a href={typeof href === 'string' ? href : '/mock'} {...props}>{children}</a>
  ),
}))

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      signUp: signUpMock,
    },
  }),
}))

import RegisterPage from './page'

function getEmailInput() {
  const input = document.querySelector('input[type="email"]')
  if (!(input instanceof HTMLInputElement)) {
    throw new Error('email input not found')
  }
  return input
}

function getPasswordInput() {
  const input = document.querySelector('input[type="password"]')
  if (!(input instanceof HTMLInputElement)) {
    throw new Error('password input not found')
  }
  return input
}

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    searchParamGetMock.mockReturnValue('/zh-CN/stories')
    signUpMock.mockResolvedValue({ error: null })
  })

  afterEach(() => {
    cleanup()
  })

  it('submits credentials and redirects to localized login page', async () => {
    const user = userEvent.setup()
    render(<RegisterPage />)

    await user.type(getEmailInput(), 'alice@example.com')
    await user.type(getPasswordInput(), 'secret-123')
    await user.click(screen.getByRole('button', { name: '×¢²á' }))

    expect(signUpMock).toHaveBeenCalledWith({
      email: 'alice@example.com',
      password: 'secret-123',
    })
    expect(routerPushMock).toHaveBeenCalledWith(
      '/zh-CN/login?registered=true&redirect=%2Fzh-CN%2Fstories'
    )
  })

  it('falls back to localized /dashboard when redirect param is unsafe', async () => {
    searchParamGetMock.mockReturnValue('javascript:alert(1)')

    const user = userEvent.setup()
    render(<RegisterPage />)

    await user.type(getEmailInput(), 'alice@example.com')
    await user.type(getPasswordInput(), 'secret-123')
    await user.click(screen.getByRole('button', { name: '×¢²á' }))

    expect(routerPushMock).toHaveBeenCalledWith(
      '/zh-CN/login?registered=true&redirect=%2Fzh-CN%2Fdashboard'
    )
  })

  it('renders auth error message when sign-up fails', async () => {
    signUpMock.mockResolvedValue({
      error: { message: 'User already registered' },
    })

    const user = userEvent.setup()
    render(<RegisterPage />)

    await user.type(getEmailInput(), 'alice@example.com')
    await user.type(getPasswordInput(), 'secret-123')
    await user.click(screen.getByRole('button', { name: '×¢²á' }))

    expect(screen.getByText('User already registered')).toBeInTheDocument()
    expect(routerPushMock).not.toHaveBeenCalled()
  })
})
