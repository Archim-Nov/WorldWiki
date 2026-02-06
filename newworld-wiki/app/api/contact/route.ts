import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { name, email, message } = await request.json()

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: '请填写所有字段' },
        { status: 400 }
      )
    }

    // TODO: 配置 Resend 后启用邮件发送
    // const resend = new Resend(process.env.RESEND_API_KEY)
    // await resend.emails.send({
    //   from: 'noreply@yourdomain.com',
    //   to: 'your@email.com',
    //   subject: `来自 ${name} 的联系表单`,
    //   text: `姓名: ${name}\n邮箱: ${email}\n消息: ${message}`,
    // })

    console.log('联系表单提交:', { name, email, message })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: '提交失败，请稍后重试' },
      { status: 500 }
    )
  }
}
