import Link from "next/link"
import { CheckCircle, Home, ShoppingBag } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export const metadata = {
  title: "Buyurtma tasdiqlandi | Milano Kafe",
}

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>
}) {
  const { id } = await searchParams

  return (
    <div className="min-h-screen dark:bg-slate-950">
      <Header />
      <main className="flex min-h-[60vh] items-center justify-center pb-16 pt-24">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="mb-2 font-serif text-2xl font-bold text-foreground">Buyurtma qabul qilindi!</h1>
            <p className="mb-4 text-muted-foreground">
              Buyurtmangiz muvaffaqiyatli qabul qilindi. Tez orada siz bilan bog'lanamiz.
            </p>
            {id && (
              <p className="mb-6 rounded-lg bg-muted p-3 font-mono text-sm">
                Buyurtma raqami: #{id.slice(0, 8).toUpperCase()}
              </p>
            )}
            <div className="flex flex-col gap-2 sm:flex-row">
              <Link href="/" className="flex-1">
                <Button variant="outline" className="w-full gap-2 bg-transparent">
                  <Home className="h-4 w-4" />
                  Bosh sahifa
                </Button>
              </Link>
              <Link href="/profile" className="flex-1">
                <Button className="w-full gap-2">
                  <ShoppingBag className="h-4 w-4" />
                  Buyurtmalarim
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  )
}
