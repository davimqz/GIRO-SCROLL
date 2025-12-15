export function Footer() {
  return (
    <footer className="text-gray-400" style={{ backgroundColor: '#0f1419' }}>
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Giro Section */}
          <div className="space-y-4">
            <h3 className="text-white font-bold text-lg">Giro</h3>
            <p className="text-sm leading-relaxed text-gray-400">
              Promovendo a economia circular: reduzir, reutilizar e regenerar recursos através de soluções digitais.
            </p>
            {/* Social Icons */}
            <div className="flex space-x-4 pt-2">
              <a
                href="https://x.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.657l-5.223-6.82-5.974 6.82h-3.31l7.732-8.835L2.88 2.25h6.822l4.822 6.381 5.92-6.381zM17.11 19.741h1.829L5.875 4.125H3.99l13.12 15.616z" />
                </svg>
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.6.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v 3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Plataforma Section */}
          <div className="space-y-4">
            <h3 className="text-white font-bold text-lg">Plataforma</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#como-funciona" className="text-gray-400 hover:text-white transition">
                  Como funciona
                </a>
              </li>
              <li>
                <a href="#casos-uso" className="text-gray-400 hover:text-white transition">
                  Casos de uso
                </a>
              </li>
              <li>
                <a href="#parceiros" className="text-gray-400 hover:text-white transition">
                  Parceiros
                </a>
              </li>
            </ul>
          </div>

          {/* Recursos Section */}
          <div className="space-y-4">
            <h3 className="text-white font-bold text-lg">Recursos</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#guia" className="text-gray-400 hover:text-white transition">
                  Guia de Economia Circular
                </a>
              </li>
              <li>
                <a href="#relatorios" className="text-gray-400 hover:text-white transition">
                  Relatórios de Impacto
                </a>
              </li>
              <li>
                <a href="#blog" className="text-gray-400 hover:text-white transition">
                  Blog
                </a>
              </li>
            </ul>
          </div>

          {/* Legal Section */}
          <div className="space-y-4">
            <h3 className="text-white font-bold text-lg">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#privacidade" className="text-gray-400 hover:text-white transition">
                  Política de Privacidade
                </a>
              </li>
              <li>
                <a href="#termos" className="text-gray-400 hover:text-white transition">
                  Termos de Uso
                </a>
              </li>
              <li>
                <a href="#contato" className="text-gray-400 hover:text-white transition">
                  Contato
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 my-12"></div>

        {/* Copyright */}
        <div className="text-center text-sm text-gray-500">
          <p>© 2025 Giro. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
