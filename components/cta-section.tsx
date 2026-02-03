import Link from "next/link"
import { ArrowRight, Coffee, Clock, Truck } from "lucide-react"
import { Button } from "@/components/ui/button"

export function CTASection() {
  return (
    <section className="bg-primary py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
          <div>
            <h2 className="mb-6 font-serif text-3xl font-bold text-primary-foreground sm:text-4xl lg:text-5xl">
              Buyurtma berish juda oson!
            </h2>
            <p className="mb-8 text-lg text-primary-foreground/80">
              Bir necha bosqichda sevimli taomlaringizni buyurtma qiling va biz sizga tezkor yetkazib beramiz yoki olib
              ketishingiz mumkin.
            </p>
            <Link href="/menu">
              <Button size="lg" variant="secondary" className="gap-2 text-base">
                Hozir buyurtma bering
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-primary-foreground/10 p-6 text-center backdrop-blur-sm">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary-foreground/20">
                <Coffee className="h-7 w-7 text-primary-foreground" />
              </div>
              <h3 className="mb-2 font-serif text-lg font-semibold text-primary-foreground">Tanlang</h3>
              <p className="text-sm text-primary-foreground/70">Menu dan sevimli taomingizni tanlang</p>
            </div>

            <div className="rounded-2xl bg-primary-foreground/10 p-6 text-center backdrop-blur-sm">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary-foreground/20">
                <Clock className="h-7 w-7 text-primary-foreground" />
              </div>
              <h3 className="mb-2 font-serif text-lg font-semibold text-primary-foreground">Buyurtma</h3>
              <p className="text-sm text-primary-foreground/70">Buyurtmangizni tasdiqlang va to'lang</p>
            </div>

            <div className="rounded-2xl bg-primary-foreground/10 p-6 text-center backdrop-blur-sm">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary-foreground/20">
                <Truck className="h-7 w-7 text-primary-foreground" />
              </div>
              <h3 className="mb-2 font-serif text-lg font-semibold text-primary-foreground">Oling</h3>
              <p className="text-sm text-primary-foreground/70">Yetkazib beramiz yoki olib keting</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
