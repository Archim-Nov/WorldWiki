import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: '请输入邮箱' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // 存储到 Supabase（需要先创建 subscribers 表）
    const { error } = await supabase
      .from('subscribers')
      .insert({ email })

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: '该邮箱已订阅' },
          { status: 400 }
        )
      }
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: '订阅失败，请稍后重试' },
      { status: 500 }
    )
  }
}
