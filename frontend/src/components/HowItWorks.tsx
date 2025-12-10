import React from "react";

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-white">
      <div className="max-w-7xl mx-auto px-6 py-20 lg:py-28">
        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-800">Como Funciona</h2>
          <p className="mt-4 text-gray-600 max-w-2xl mx-auto">Em apenas três passos simples, você pode fazer parte da revolução da economia circular</p>
        </div>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-10 items-start">
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-white shadow-lg flex items-center justify-center">
              <div className="w-12 h-12 rounded-full border-2 border-gray-100 flex items-center justify-center text-gray-600">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                  <rect x="3" y="7" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  <path d="M8 7V6a2 2 0 012-2h4a2 2 0 012 2v1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="13" r="2.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                </svg>
              </div>
            </div>
            <h3 className="mt-6 text-lg font-semibold text-gray-800">Anuncie</h3>
            <p className="mt-3 text-gray-600 max-w-xs">Tire uma foto e publique seu item de forma simples e rápida.</p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-white shadow-lg flex items-center justify-center">
              <div className="w-12 h-12 rounded-full border-2 border-gray-100 flex items-center justify-center text-gray-600">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  <path d="M17 9h.01" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            <h3 className="mt-6 text-lg font-semibold text-gray-800">Conecte-se</h3>
            <p className="mt-3 text-gray-600 max-w-xs">Converse com compradores ou doadores de forma direta e segura.</p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-white shadow-lg flex items-center justify-center">
              <div className="w-12 h-12 rounded-full border-2 border-gray-100 flex items-center justify-center text-gray-600">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                  <path d="M21 12a9 9 0 11-9-9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  <path d="M21 3v4h-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            <h3 className="mt-6 text-lg font-semibold text-gray-800">Reutilize</h3>
            <p className="mt-3 text-gray-600 max-w-xs">Dê um novo propósito a cada objeto e contribua para um mundo melhor.</p>
          </div>
        </div>

        <div className="mt-12 flex justify-center">
          <a href="#começar" className="px-6 py-3 bg-white border rounded-full shadow-md hover:shadow-lg transition font-medium">Começar Agora</a>
        </div>
      </div>
    </section>
  );
}
