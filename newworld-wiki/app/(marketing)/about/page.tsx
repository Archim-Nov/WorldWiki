export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <section className="max-w-3xl">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
          About
        </p>
        <h1 className="text-3xl font-semibold mt-4">关于这座博物馆宇宙</h1>
        <p className="text-muted-foreground mt-4">
          这里不是一个营销网站，而是一座可被探索的游戏宇宙。我们用画廊
          与故事线连接世界，让角色、区域、生物与叙事形成网状关系。
        </p>
      </section>

      <section className="mt-10 grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border bg-card p-6">
          <h2 className="text-lg font-semibold">探索方式</h2>
          <p className="text-muted-foreground mt-3">
            通过视觉入口进入五大展区，沿着相关内容与内链自由漫游。
          </p>
        </div>
        <div className="rounded-2xl border bg-card p-6">
          <h2 className="text-lg font-semibold">内容结构</h2>
          <p className="text-muted-foreground mt-3">
            国家、区域、生物、英雄与故事相互引用，强调连接而非层级。
          </p>
        </div>
      </section>
    </div>
  )
}
