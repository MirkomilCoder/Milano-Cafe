import Image from "next/image"
import { Award, Coffee, Heart, Users } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"

export const metadata = {
  title: "Biz haqimizda | Milano Kafe - Zomin, Jizzakh",
  description: "Milano Kafe - Zaamin tumanidagi premium kofe va restoran. Bizning hikoyamiz, jamoamiz va sifatimiz haqida.",
}

const stats = [
  { icon: Coffee, label: "Kofe turlari", value: "15+" },
  { icon: Users, label: "Kundalik mijozlar", value: "500+" },
  { icon: Award, label: "Yillik tajriba", value: "5+" },
  { icon: Heart, label: "Mamnun mijozlar", value: "10,000+" },
]

const team = [
  {
    name: "Aziz Karimov",
    role: "Asoschi & Bosh barista",
    image: "/professional-barista-man-portrait.jpg",
  },
  {
    name: "Nilufar Raximova",
    role: "Bosh oshpaz",
    image: "/professional-chef-woman-portrait.jpg",
  },
  {
    name: "Sardor Aliyev",
    role: "Menejment",
    image: "/professional-manager-man-portrait.jpg",
  },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen dark:bg-slate-950">
      <Header />
      <main className="pb-16 pt-24 lg:pt-28">
        {/* Hero */}
        <section className="relative overflow-hidden bg-primary py-16 lg:py-24">
          <div className="absolute inset-0 opacity-10">
            <Image src="/coffee-beans-pattern.png" alt="" fill className="object-cover" />
          </div>
          <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
            <h1 className="mb-4 font-serif text-4xl font-bold text-primary-foreground lg:text-5xl">
              Milano Kafe - Bizning hikoyamiz
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-primary-foreground/80">
              Zaamin tumanida 2019-yildan beri eng sifatli kofe va mazali taomlar bilan xizmat ko'rsatib kelmoqdamiz.
            </p>
          </div>
        </section>

        {/* Story */}
        <section className="py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div className="relative aspect-square overflow-hidden rounded-2xl">
                <Image src="/cozy-cafe-interior-warm-lighting.jpg" alt="Kafe ichki ko'rinishi" fill className="object-cover" />
              </div>
              <div>
                <h2 className="mb-6 font-serif text-3xl font-bold text-foreground lg:text-4xl">
                  Milano Kafe - Muhabbat bilan tayyorlangan
                </h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    Milano Kafe 2019-yilda Jizzakh viloyati, Zaamin tumanida ochildi. Bizning maqsadimiz — har bir mijozga eng
                    sifatli kofe va unutilmas tajriba taqdim etish. Chinor ostida joylashgan bu joy kafe sevuvchilar uchun ajoyib qaytish nuqtasi bo'lib qoldi.
                  </p>
                  <p>
                    Biz dunyoning eng yaxshi kofe donalarini tanlash bilan boshlaymiz. Braziliya, Kolumbiya va
                    Efiopiyadan keltirilgan donalarimiz maxsus usulda qovuriladi. Har bir chashka Milano kafesi sifat va zarafni ifoda etadi.
                  </p>
                  <p>
                    Bizning baristalarimiz o'z ishining ustasi — ular har bir chashka kofenga o'z mahoratini qo'shadi.
                    Zaamin tumanida biz nafaqat eng mazali kofe, balki haqiqiy restoran tajribasini taqdim etamiz.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="bg-muted/50 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat) => (
                <Card key={stat.label} className="text-center">
                  <CardContent className="pt-6">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                      <stat.icon className="h-7 w-7 text-primary" />
                    </div>
                    <div className="font-serif text-3xl font-bold text-foreground">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
              <h2 className="mb-4 font-serif text-3xl font-bold text-foreground">Bizning jamoa</h2>
              <p className="mx-auto max-w-2xl text-muted-foreground">
                Professional va mehribon jamoamiz siz uchun eng yaxshi xizmatni taqdim etishga tayyor.
              </p>
            </div>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {team.map((member) => (
                <Card key={member.name} className="overflow-hidden">
                  <div className="relative aspect-square">
                    <Image src={member.image || "/placeholder.svg"} alt={member.name} fill className="object-cover" />
                  </div>
                  <CardContent className="p-4 text-center">
                    <h3 className="font-serif text-lg font-semibold text-foreground">{member.name}</h3>
                    <p className="text-sm text-muted-foreground">{member.role}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="bg-primary py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
              <h2 className="mb-4 font-serif text-3xl font-bold text-primary-foreground">Bizning qadriyatlarimiz</h2>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-foreground/10">
                  <Coffee className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="mb-2 font-serif text-xl font-semibold text-primary-foreground">Sifat</h3>
                <p className="text-primary-foreground/80">Eng yuqori sifatli ingredientlar va professional tayyorlov</p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-foreground/10">
                  <Heart className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="mb-2 font-serif text-xl font-semibold text-primary-foreground">Mehribonlik</h3>
                <p className="text-primary-foreground/80">Har bir mijozga alohida e'tibor va samimiy xizmat</p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-foreground/10">
                  <Award className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="mb-2 font-serif text-xl font-semibold text-primary-foreground">Tajriba</h3>
                <p className="text-primary-foreground/80">5 yildan ortiq tajriba va doimiy rivojlanish</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
