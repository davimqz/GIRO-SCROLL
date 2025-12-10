import React from "react";
import Heroimg from "../assets/hero/hero-img.jpg";

export default function Hero() {
  return (
    <>
      <section className="bg-[#fbf7f1]">
        <div className="max-w-7xl mx-auto px-6 py-20 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="lg:pr-8">
              <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight">Cada objeto tem uma nova história pra contar.</h1>
              <p className="mt-6 text-lg text-gray-700 max-w-xl">Compre, venda e troque de forma consciente. Juntos, fazemos a economia circular girar — dando novas vidas aos objetos e reduzindo desperdício.</p>

              <div className="mt-8 flex items-center gap-4">
                <a
                  href="#começar"
                  className="inline-flex items-center px-6 py-3 bg-[#45BCA0] text-white rounded-full shadow-md hover:bg-[#3FA18F] transition font-medium"
                >
                  Começar Agora
                  <span className="ml-3">→</span>
                </a>

                <a href="#sobre" className="text-gray-700 hover:underline">Saiba mais</a>
              </div>
            </div>

            <div className="flex justify-center lg:justify-end">
              <div className="w-full max-w-sm lg:max-w-md">
                <img src={Heroimg} alt="Ilustração Giro" className="w-full h-auto object-contain" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works section */}
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
    </>
  );
}
