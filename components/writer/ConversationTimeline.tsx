'use client'

import { useEffect, useRef, type KeyboardEvent, type ReactNode } from 'react'
import { useTranslations } from 'next-intl'
import type { WriterMessage } from '@/types/writer'

type ConversationTimelineProps = {
  messages: WriterMessage[]
  value: string
  disabled?: boolean
  composerToolbar?: ReactNode
  onChange: (value: string) => void
  onSend: () => Promise<void>
}

export function ConversationTimeline({ messages, value, disabled, composerToolbar, onChange, onSend }: ConversationTimelineProps) {
  const t = useTranslations('Writer.ConversationTimeline')
  const bottomRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages])

  function getRoleLabel(role: WriterMessage['role']) {
    switch (role) {
      case 'assistant':
        return t('roles.assistant')
      case 'user':
        return t('roles.user')
      default:
        return t('roles.system')
    }
  }

  async function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      if (!disabled && value.trim()) {
        await onSend()
      }
    }
  }

  return (
    <div className='flex min-h-0 flex-1 flex-col bg-[radial-gradient(circle_at_1px_1px,rgba(15,23,42,0.06)_1px,transparent_0)] [background-size:18px_18px]'>
      <div className='flex-1 overflow-y-auto px-6 py-6'>
        <div className='mx-auto flex w-full max-w-4xl flex-col gap-6'>
          {messages.length === 0 ? (
            <div className='rounded-[28px] border border-dashed border-border bg-background/90 px-6 py-12 text-center shadow-sm'>
              <div className='text-lg font-semibold'>{t('emptyTitle')}</div>
              <p className='mx-auto mt-3 max-w-2xl text-sm leading-7 text-muted-foreground'>{t('emptyDescription')}</p>
            </div>
          ) : (
            messages.map((message) => {
              const isUser = message.role === 'user'

              return (
                <div key={message.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                  <div className={`w-full max-w-[88%] ${isUser ? 'items-end' : 'items-start'}`}>
                    <div className={`mb-2 text-xs ${isUser ? 'text-right text-muted-foreground' : 'text-left text-muted-foreground'}`}>
                      {getRoleLabel(message.role)}
                    </div>
                    <div
                      className={[
                        'rounded-[24px] px-5 py-4 text-sm leading-7 shadow-sm',
                        isUser
                          ? 'ml-auto bg-slate-950 text-white dark:bg-slate-100 dark:text-slate-950'
                          : 'border border-border bg-background/95 text-foreground',
                      ].join(' ')}
                    >
                      <div className='whitespace-pre-wrap'>{message.content}</div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      <div className='border-t border-border bg-background/95 px-6 py-4 backdrop-blur'>
        <div className='mx-auto w-full max-w-4xl'>
          <div className='rounded-[24px] border border-border bg-background px-4 py-3 shadow-sm'>
            {composerToolbar ? <div className='mb-3'>{composerToolbar}</div> : null}
            <textarea
              value={value}
              onChange={(event) => onChange(event.target.value)}
              onKeyDown={handleKeyDown}
              className='min-h-24 w-full resize-none border-0 bg-transparent py-2 text-sm leading-7 outline-none'
              placeholder={t('placeholder')}
            />
            <div className='flex items-center justify-between gap-3 pt-2'>
              <div className='text-xs text-muted-foreground'>{t('footerNote')}</div>
              <button
                type='button'
                onClick={() => onSend()}
                disabled={disabled || !value.trim()}
                className='rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60'
              >
                {t('send')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
