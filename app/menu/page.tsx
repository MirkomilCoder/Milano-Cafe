import { Suspense } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { MenuContent } from "./menu-content"
import { Skeleton } from "@/components/ui/skeleton"

export const metadata = {
  title: "Menu | Milano Kafe - Zaamin, Jizzakh",
  description: "Milano Kafe menyusi - sifatli kofe, taomlari va ichimliklar. Zaamin tumanida eng yaxshi tanlama.",
}

function MenuSkeleton() {
  return (
    <div className="grid gap-6 grid-cols-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="space-y-4">
          <Skeleton className="aspect-square rounded-xl" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  )
}

export default function MenuPage() {
  return (
    <div className="min-h-screen dark:bg-slate-950">
      <Header />
      <main className="pb-16 pt-24 lg:pt-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <h1 className="mb-4 font-serif text-4xl font-bold text-foreground">Milano Kafe - Bizning Menu</h1>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Milano Kafe ning eng mazali taomlar va ichimliklar menyusi. Barchasi yangi va eng sifatli ingredientlardan
              tayyorlanadi. Zaamin tumanidagi eng mashhur restoran menyusi.
            </p>
          </div>
          <Suspense fallback={<MenuSkeleton />}>
            <MenuContent />
          </Suspense>
        </div>
      </main>
      <Footer />
    </div>
  )
}
