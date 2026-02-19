/** @vitest-environment jsdom */

import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const {
  searchParamGetMock,
  routerPushMock,
  routerRefreshMock,
  signInWithPasswordMock,
} = vi.hoisted(() => ({
  searchParamGetMock: vi.fn(),
  routerPushMock: vi.fn(),
  routerRefreshMock: vi.fn(),
  signInWithPasswordMock: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: routerPushMock,
    refresh: routerRefreshMock,
  }),
  useSearchParams: () => ({
    get: searchParamGetMock,
  }),
}))

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      signInWithPassword: signInWithPasswordMock,
    },
  }),
}))

import LoginPage from './page'

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

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    searchParamGetMock.mockReturnValue('/stories')
    signInWithPasswordMock.mockResolvedValue({ error: null })
  })

  afterEach(() => {
    cleanup()
  })

  it('submits credentials and redirects to safe redirect target', async () => {
    const user = userEvent.setup()
    render(<LoginPage />)

    await user.type(getEmailInput(), 'alice@example.com')
    await user.type(getPasswordInput(), 'secret-123')
    await user.click(screen.getByRole('button', { name: '登录' }))

    expect(signInWithPasswordMock).toHaveBeenCalledWith({
      email: 'alice@example.com',
      password: 'secret-123',
    })
    expect(routerPushMock).toHaveBeenCalledWith('/stories')
    expect(routerRefreshMock).toHaveBeenCalledOnce()
  })

  it('falls back to /dashboard when redirect param is unsafe', async () => {
    searchParamGetMock.mockReturnValue('https://evil.example')

    const user = userEvent.setup()
    render(<LoginPage />)

    await user.type(getEmailInput(), 'alice@example.com')
    await user.type(getPasswordInput(), 'secret-123')
    await user.click(screen.getByRole('button', { name: '登录' }))

    expect(routerPushMock).toHaveBeenCalledWith('/dashboard')
  })

  it('renders auth error message when sign-in fails', async () => {
    signInWithPasswordMock.mockResolvedValue({
      error: { message: 'Invalid login credentials' },
    })

    const user = userEvent.setup()
    render(<LoginPage />)

    await user.type(getEmailInput(), 'alice@example.com')
    await user.type(getPasswordInput(), 'wrong-password')
    await user.click(screen.getByRole('button', { name: '登录' }))

    expect(screen.getByText('Invalid login credentials')).toBeInTheDocument()
    expect(routerPushMock).not.toHaveBeenCalled()
  })
})
