"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Coffee, Star } from "lucide-react"
import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-background">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 h-72 w-72 rounded-full bg-primary blur-3xl" />
        <div className="absolute bottom-20 right-10 h-96 w-96 rounded-full bg-secondary blur-3xl" />
      </div>

      <div className="relative mx-auto flex max-w-7xl flex-col items-center px-4 pt-24 sm:px-6 lg:flex-row lg:px-8 lg:pt-32">
        {/* Content */}
        <div className="flex-1 text-center lg:text-left">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2">
            <Coffee className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Milano Kafe - Zaamin, Jizzakh</span>
          </div>

          <h1 className="mb-6 font-serif text-4xl font-bold leading-tight text-foreground sm:text-5xl lg:text-6xl xl:text-7xl">
            <span className="text-balance">Har bir tomchi</span>
            <br />
            <span className="text-primary">muhabbat</span> bilan
          </h1>

          <p className="mx-auto mb-8 max-w-xl text-lg text-muted-foreground lg:mx-0">
            Milano Kafe - Jizzakh viloyatidagi eng mashhur premium kofe va restoran. Eng sifatli kofe donalaridan tayyorlangan ichimliklar. Chinor ostida juda qulay orin.
          </p>

          <div className="flex flex-col items-center gap-4 sm:flex-row lg:justify-start">
            <Link href="/menu">
              <Button size="lg" className="gap-2 text-base">
                Menuni ko'rish
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/about">
              <Button size="lg" variant="outline" className="text-base bg-transparent">
                Biz haqimizda
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-8 lg:justify-start">
            <div>
              <div className="text-3xl font-bold text-foreground">15+</div>
              <div className="text-sm text-muted-foreground">Kofe turlari</div>
            </div>
            <div className="h-10 w-px bg-border" />
            <div>
              <div className="text-3xl font-bold text-foreground">5000+</div>
              <div className="text-sm text-muted-foreground">Mijozlar</div>
            </div>
            <div className="h-10 w-px bg-border" />
            <div className="flex items-center gap-1">
              <div className="text-3xl font-bold text-foreground">4.9</div>
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              <div className="text-sm text-muted-foreground">(2.5k)</div>
            </div>
          </div>
        </div>

        {/* Hero Image */}
        <div className="mt-12 flex-1 lg:mt-0">
          <div className="relative mx-auto aspect-square max-w-lg">
            {/* Floating elements */}
            <div className="absolute -top-4 -left-4 z-10 rounded-2xl bg-card p-4 shadow-xl" suppressHydrationWarning>
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Coffee className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-semibold">Yangi keldi!</div>
                  <div className="text-xs text-muted-foreground">Matcha Qahva</div>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-4 -right-4 z-10 rounded-2xl bg-card p-4 shadow-xl" suppressHydrationWarning>
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-8 w-8 rounded-full border-2 border-card bg-muted" />
                  ))}
                </div>
                <div>
                  <div className="text-sm font-semibold">50+ kishi</div>
                  <div className="text-xs text-muted-foreground">hozir buyurtma qilmoqda</div>
                </div>
              </div>
            </div>

            {/* Main Image */}
            <div className="relative h-full w-full overflow-hidden rounded-3xl bg-gradient-to-br from-primary/20 to-secondary/20">
              <Image src="/premium-coffee-cup-latte-art-warm-lighting.jpg" alt="Milano Kafe kofe" fill className="object-cover" priority />
            </div>
          </div>
        </div>
      </div>

      {/* Wave decoration */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path
            d="M0 120L48 110C96 100 192 80 288 70C384 60 480 60 576 65C672 70 768 80 864 85C960 90 1056 90 1152 85C1248 80 1344 70 1392 65L1440 60V120H1392C1344 120 1248 120 1152 120C1056 120 960 120 864 120C768 120 672 120 576 120C480 120 384 120 288 120C192 120 96 120 48 120H0Z"
            fill="currentColor"
            className="text-muted/30"
          />
        </svg>
      </div>
    </section>
  )
}
