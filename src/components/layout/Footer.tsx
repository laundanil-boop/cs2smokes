import Link from 'next/link'
import { Send } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-cs2-light bg-cs2-darker">
      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
            <h3 className="font-semibold mb-4">Информация</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-cs2-accent transition-colors">
                  О проекте
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
                <Link href="/contact" className="text-muted-foreground hover:text-cs2-accent transition-colors">
                  Контакты
                </Link>
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
