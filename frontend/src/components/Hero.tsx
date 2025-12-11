import Heroimg from "../assets/hero/hero-img.jpg";

export default function Hero() {
  return (
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
  );
}
