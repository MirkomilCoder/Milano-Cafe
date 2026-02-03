import Link from "next/link"
import { Instagram, Send, MapPin, Phone, Mail, Clock } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-gradient-to-b from-green-900 to-green-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="h-11 w-11 flex items-center justify-center">
                <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="h-11 w-11">
                  <defs>
                    <linearGradient id="greengreen" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style={{stopColor:"#16a34a",stopOpacity:1}} />
                      <stop offset="50%" style={{stopColor:"#22c55e",stopOpacity:1}} />
                      <stop offset="100%" style={{stopColor:"#15803d",stopOpacity:1}} />
                    </linearGradient>
                  </defs>
                  <circle cx="100" cy="100" r="98" fill="url(#greengreen)" stroke="#15803d" strokeWidth="2"/>
                  <ellipse cx="60" cy="60" rx="24" ry="32" fill="#4ade80" opacity="0.7" transform="rotate(-35 60 60)"/>
                  <ellipse cx="140" cy="65" rx="26" ry="35" fill="#16a34a" opacity="0.8" transform="rotate(35 140 65)"/>
                  <circle cx="100" cy="105" r="35" fill="#fbbf24" opacity="0.95"/>
                  <text x="100" y="120" fontFamily="Arial" fontSize="50" fontWeight="bold" fill="#15803d" textAnchor="middle">M</text>
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-lg font-bold text-yellow-300">MILANO</span>
                <span className="text-xs font-light text-green-200">KAFE</span>
              </div>
            </Link>
            <p className="text-sm text-green-100">
              Milano Kafe - Zaamin tumanidagi eng mashhur premium kofe restoran. Har bir chashka muhabbat bilan tayyorlanadi. Jizzakh viloyatida sifatning belgisi.
            </p>
            <div className="flex gap-3">
              <a
                href="https://www.instagram.com/milano_zomin/"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-yellow-500/20 p-2 transition-colors hover:bg-yellow-500/40"
              >
                <Instagram className="h-5 w-5 text-yellow-300" />
              </a>
              <a
                href="https://t.me/kafe_milano"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-yellow-500/20 p-2 transition-colors hover:bg-yellow-500/40"
              >
                <Send className="h-5 w-5 text-yellow-300" />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="mb-4 font-serif text-lg font-semibold text-yellow-300">Navigatsiya</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sm text-green-100 hover:text-yellow-300 transition-colors">
                  Bosh sahifa
                </Link>
              </li>
              <li>
                <Link href="/menu" className="text-sm text-green-100 hover:text-yellow-300 transition-colors">
                  Menu
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-sm text-green-100 hover:text-yellow-300 transition-colors">
                  Kategoriyalar
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-sm text-green-100 hover:text-yellow-300 transition-colors">
                  Biz haqimizda
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-green-100 hover:text-yellow-300 transition-colors">
                  Aloqa
                </Link>
              </li>
            </ul>
          </div>

          {/* Aloqa */}
          <div>
            <h3 className="mb-4 font-serif text-lg font-semibold text-yellow-300">Aloqa</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-yellow-400" />
                <span className="text-sm text-green-100">Jizzakh viloyati, Zomin tumani, Chinor ostida (Landmark)</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 shrink-0 text-yellow-400" />
                <span className="text-sm text-green-100">+998 77 183 99 99</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 shrink-0 text-yellow-400" />
                <span className="text-sm text-green-100">info@milanokafe.uz</span>
              </li>
            </ul>
          </div>

          {/* Ish vaqti */}
          <div>
            <h3 className="mb-4 font-serif text-lg font-semibold text-yellow-300">Ish vaqti</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <Clock className="h-5 w-5 shrink-0 text-yellow-400" />
                <div className="text-sm">
                  <p className="text-white">Dushanba - Juma</p>
                  <p className="text-green-200">08:00 - 22:00</p>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <Clock className="h-5 w-5 shrink-0 text-yellow-400" />
                <div className="text-sm">
                  <p className="text-white">Shanba - Yakshanba</p>
                  <p className="text-green-200">09:00 - 23:00</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-green-700 pt-8">
          <p className="text-center text-sm text-green-300">
            &copy; {new Date().getFullYear()} MILANO Kafe. Barcha huquqlar himoyalangan.
          </p>
        </div>
      </div>
    </footer>
  )
}
