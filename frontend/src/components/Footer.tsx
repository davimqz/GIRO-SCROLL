export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 rounded-t-lg shadow-inner mt-12">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <h3 className="text-white text-lg font-semibold">Giro</h3>
            <p className="mt-3 text-sm text-gray-400">Promovendo a economia circular: reduzir, reutilizar e regenerar recursos através de soluções digitais.</p>

            <div className="mt-6 flex items-center space-x-4">
              <a href="#" aria-label="Twitter" className="text-gray-400 hover:text-white">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                  <path d="M22 5.92c-.64.28-1.32.46-2.04.54.73-.44 1.28-1.12 1.54-1.94-.69.4-1.46.7-2.28.86C18.9 4.4 17.94 4 16.86 4c-1.66 0-3 1.34-3 3 0 .24.03.48.08.7C10.3 7.6 7.08 6.1 5 3.5c-.27.46-.43 1-.43 1.58 0 1.1.56 2.06 1.41 2.62-.52-.02-1.02-.16-1.45-.4v.04c0 1.53 1.09 2.8 2.53 3.09-.26.07-.54.11-.82.11-.2 0-.4-.02-.6-.06.4 1.26 1.56 2.18 2.93 2.21C8.1 16.3 6.54 17 4.86 17c-.32 0-.64-.02-.95-.06 1.77 1.14 3.87 1.8 6.13 1.8 7.36 0 11.38-6.1 11.38-11.38v-.52c.78-.56 1.46-1.26 2-2.06-.72.32-1.5.54-2.3.64z" fill="currentColor"/>
                </svg>
              </a>

              <a href="#" aria-label="GitHub" className="text-gray-400 hover:text-white">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                  <path d="M12 .5C5.73.5.88 5.36.88 11.63c0 4.78 3.09 8.83 7.37 10.26.54.10.74-.23.74-.52 0-.26-.01-1-.02-1.95-3 .65-3.64-1.45-3.64-1.45-.49-1.24-1.2-1.57-1.2-1.57-.98-.67.07-.66.07-.66 1.08.08 1.64 1.12 1.64 1.12.96 1.64 2.51 1.17 3.12.9.10-.7.38-1.17.69-1.44-2.4-.27-4.93-1.2-4.93-5.34 0-1.18.42-2.15 1.11-2.91-.11-.27-.48-1.37.11-2.85 0 0 .9-.29 2.95 1.11a10.2 10.2 0 012.69-.36c.91 0 1.83.12 2.69.36 2.04-1.4 2.95-1.11 2.95-1.11.59 1.48.22 2.58.11 2.85.69.76 1.11 1.73 1.11 2.91 0 4.15-2.54 5.06-4.96 5.33.39.34.74 1.02.74 2.06 0 1.49-.01 2.69-.01 3.05 0 .29.19.63.75.52 4.28-1.44 7.37-5.48 7.37-10.27C23.12 5.36 18.27.5 12 .5z" fill="currentColor"/>
                </svg>
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold">Plataforma</h4>
            <ul className="mt-4 space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white">Como funciona</a></li>
              <li><a href="#" className="hover:text-white">Casos de uso</a></li>
              <li><a href="#" className="hover:text-white">Parceiros</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold">Recursos</h4>
            <ul className="mt-4 space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white">Guia de Economia Circular</a></li>
              <li><a href="#" className="hover:text-white">Relatórios de Impacto</a></li>
              <li><a href="#" className="hover:text-white">Blog</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold">Legal</h4>
            <ul className="mt-4 space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white">Política de Privacidade</a></li>
              <li><a href="#" className="hover:text-white">Termos de Uso</a></li>
              <li><a href="#" className="hover:text-white">Contato</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-sm text-gray-400">
          <p>© {year} Giro. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
