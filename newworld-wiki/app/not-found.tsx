import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <h2 className="text-4xl font-bold">404</h2>
      <p className="text-muted-foreground">页面不存在</p>
      <Link
        href="/"
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
      >
        返回首页
      </Link>
    </div>
  )
}
