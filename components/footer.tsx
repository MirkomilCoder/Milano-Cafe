import Link from "next/link"
import { Instagram, Send, MapPin, Phone, Mail, Clock } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-gradient-to-b from-slate-900 to-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="h-11 w-11 flex items-center justify-center">
                <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="h-11 w-11">
                  <defs>
                    <linearGradient id="coffeegradient3" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style={{stopColor:"#d4a574",stopOpacity:1}} />
                      <stop offset="50%" style={{stopColor:"#c19a6b",stopOpacity:1}} />
                      <stop offset="100%" style={{stopColor:"#8b6f47",stopOpacity:1}} />
                    </linearGradient>
                  </defs>
                  <circle cx="100" cy="100" r="98" fill="url(#coffeegradient3)" stroke="#6F4E37" strokeWidth="2"/>
                  <path d="M 60 50 L 55 130 Q 55 145 70 145 L 130 145 Q 145 145 145 130 L 140 50 Q 140 40 130 40 L 70 40 Q 60 40 60 50 Z" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinejoin="round"/>
                  <ellipse cx="100" cy="120" rx="40" ry="12" fill="#4A2511" opacity="0.9"/>
                  <path d="M 62 100 Q 65 115 100 125 Q 135 115 138 100" fill="#6F3D1D" opacity="0.7"/>
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-lg font-bold text-amber-300">MILANO</span>
                <span className="text-xs font-light text-amber-200">KAFE</span>
              </div>
            </Link>
            <p className="text-sm text-slate-300">
              Milano Kafe - Zaamin tumanidagi eng mashhur premium kofe restoran. Har bir chashka muhabbat bilan tayyorlanadi. Jizzakh viloyatida sifatning belgisi.
            </p>
            <div className="flex gap-3">
              <a
                href="https://www.instagram.com/milano_zomin/"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-amber-600/20 p-2 transition-colors hover:bg-amber-600/40"
              >
                <Instagram className="h-5 w-5 text-amber-300" />
              </a>
              <a
                href="https://t.me/kafe_milano"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-amber-600/20 p-2 transition-colors hover:bg-amber-600/40"
              >
                <Send className="h-5 w-5 text-amber-300" />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="mb-4 font-serif text-lg font-semibold text-amber-300">Navigatsiya</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sm text-slate-300 hover:text-amber-300 transition-colors">
                  Bosh sahifa
                </Link>
              </li>
              <li>
                <Link href="/menu" className="text-sm text-slate-300 hover:text-amber-300 transition-colors">
                  Menu
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-sm text-slate-300 hover:text-amber-300 transition-colors">
                  Kategoriyalar
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-sm text-slate-300 hover:text-amber-300 transition-colors">
                  Biz haqimizda
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-slate-300 hover:text-amber-300 transition-colors">
                  Aloqa
                </Link>
              </li>
            </ul>
          </div>

          {/* Aloqa */}
          <div>
            <h3 className="mb-4 font-serif text-lg font-semibold text-amber-300">Aloqa</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
                <span className="text-sm text-slate-300">Jizzakh viloyati, Zomin tumani, Chinor ostida (Landmark)</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 shrink-0 text-amber-400" />
                <span className="text-sm text-slate-300">+998 77 183 99 99</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 shrink-0 text-amber-400" />
                <span className="text-sm text-slate-300">info@milanokafe.uz</span>
              </li>
            </ul>
          </div>

          {/* Ish vaqti */}
          <div>
            <h3 className="mb-4 font-serif text-lg font-semibold text-amber-300">Ish vaqti</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <Clock className="h-5 w-5 shrink-0 text-amber-400" />
                <div className="text-sm">
                  <p className="text-white">Dushanba - Juma</p>
                  <p className="text-slate-400">08:00 - 22:00</p>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <Clock className="h-5 w-5 shrink-0 text-amber-400" />
                <div className="text-sm">
                  <p className="text-white">Shanba - Yakshanba</p>
                  <p className="text-slate-400">09:00 - 23:00</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-slate-700 pt-8">
          <p className="text-center text-sm text-slate-400">
            &copy; {new Date().getFullYear()} MILANO Kafe. Barcha huquqlar himoyalangan.
          </p>
        </div>
      </div>
    </footer>
  )
}
