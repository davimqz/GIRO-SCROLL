interface HeroSectionProps {
  onGetStarted: () => void;
}

export function HeroSection({ onGetStarted }: HeroSectionProps) {
  const heroImg = '/hero-img.jpg';
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#FBF7F1' }}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
                Cada objeto tem uma nova história pra contar.
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Compre, venda e troque de forma consciente. Juntos, fazemos a economia circular girar — dando novas vidas aos objetos e reduzindo desperdício.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex items-center gap-4">
              <button
                onClick={onGetStarted}
                className="text-white font-bold py-3 px-8 rounded-full transition shadow-md hover:opacity-90 flex items-center gap-2"
                style={{ backgroundColor: '#3FA18F' }}
              >
                Começar Agora
                <span>→</span>
              </button>
              <button className="text-gray-700 font-medium hover:text-gray-900 transition">
                Saiba mais
              </button>
            </div>
          </div>

          {/* Right Image */}
          <div className="flex justify-center md:justify-end">
            <img
              src={heroImg}
              alt="The Circular Economy"
              className="w-full max-w-md h-auto object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
