import Link from 'next/link'
import { Send } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-cs2-light bg-cs2-darker">
      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cs2-accent">
                <span className="text-white font-bold text-lg">CS</span>
              </div>
              <span className="text-xl font-bold text-gradient">
                CS2Smokes
              </span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Лучшая коллекция гранатных лайнапов для Counter-Strike 2.
              Улучши свою игру с нашими подробными видео.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://t.me/cs2smokes1"
                className="text-muted-foreground hover:text-cs2-accent transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Send className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Карты</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/maps/mirage" className="text-muted-foreground hover:text-cs2-accent transition-colors">
                  Mirage
                </Link>
              </li>
              <li>
                <Link href="/maps/dust2" className="text-muted-foreground hover:text-cs2-accent transition-colors">
                  Dust II
                </Link>
              </li>
              <li>
                <Link href="/maps/inferno" className="text-muted-foreground hover:text-cs2-accent transition-colors">
                  Inferno
                </Link>
              </li>
              <li>
                <Link href="/maps/nuke" className="text-muted-foreground hover:text-cs2-accent transition-colors">
                  Nuke
                </Link>
              </li>
              <li>
                <Link href="/maps/overpass" className="text-muted-foreground hover:text-cs2-accent transition-colors">
                  Overpass
                </Link>
              </li>
              <li>
                <Link href="/maps/ancient" className="text-muted-foreground hover:text-cs2-accent transition-colors">
                  Ancient
                </Link>
              </li>
              <li>
                <Link href="/maps/anubis" className="text-muted-foreground hover:text-cs2-accent transition-colors">
                  Anubis
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Типы гранат</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/search?grenadeType=SMOKE" className="text-muted-foreground hover:text-cs2-accent transition-colors">
                  Smoke Grenades
                </Link>
              </li>
              <li>
                <Link href="/search?grenadeType=MOLOTOV" className="text-muted-foreground hover:text-cs2-accent transition-colors">
                  Molotovs
                </Link>
              </li>
              <li>
                <Link href="/search?grenadeType=FLASH" className="text-muted-foreground hover:text-cs2-accent transition-colors">
                  Flashbangs
                </Link>
              </li>
              <li>
                <Link href="/search?grenadeType=HE" className="text-muted-foreground hover:text-cs2-accent transition-colors">
                  HE Grenades
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Информация</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-cs2-accent transition-colors">
                  О проекте
                </Link>
              </li>
              <li>
                <Link href="/guides" className="text-muted-foreground hover:text-cs2-accent transition-colors">
                  Гайды
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-cs2-accent transition-colors">
                  Политика конфиденциальности
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-cs2-accent transition-colors">
                  Условия использования
                </Link>
              </li>
              <li>
                <a href="mailto:cs2smokes@mail.ru" className="text-muted-foreground hover:text-cs2-accent transition-colors">
                  Контакты
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-cs2-light text-center text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()} CS2Smokes. Not affiliated with Valve Corporation.
            Counter-Strike is a registered trademark of Valve Corporation.
          </p>
        </div>
      </div>
    </footer>
  )
}
