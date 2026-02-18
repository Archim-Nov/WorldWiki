import { Footer, Header, PageTransition } from "@/components/layout";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 overflow-visible">
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
    </div>
  );
}
