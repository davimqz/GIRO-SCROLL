interface HowItWorksProps {
  onGetStarted: () => void;
}

export function HowItWorks({ onGetStarted }: HowItWorksProps) {
  const steps = [
    {
      id: 1,
      title: 'Anuncie',
      description: 'Tire uma foto e publique seu item de forma simples e rápida.',
      icon: (
        <svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      id: 2,
      title: 'Conecte-se',
      description: 'Converse com compradores ou doadores de forma direta e segura.',
      icon: (
        <svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
    },
    {
      id: 3,
      title: 'Reutilize',
      description: 'Dê um novo propósito a cada objeto e contribua para um mundo melhor.',
      icon: (
        <svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
    },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#f8f8f8' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
            Como Funciona
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Em apenas três passos simples, você pode fazer parte da revolução da economia circular
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {steps.map((step) => (
            <div key={step.id} className="flex flex-col items-center text-center space-y-6">
              {/* Icon Circle */}
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center shadow-md"
                style={{ backgroundColor: '#f0f0f0' }}
              >
                {step.icon}
              </div>

              {/* Title */}
              <h3 className="text-2xl font-bold text-gray-900">
                {step.title}
              </h3>

              {/* Description */}
              <p className="text-gray-600 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <div className="flex justify-center">
          <button
            onClick={onGetStarted}
            className="text-gray-900 font-bold py-3 px-8 rounded-full border-2 border-gray-900 transition hover:bg-gray-900 hover:text-white"
          >
            Começar Agora
          </button>
        </div>
      </div>
    </section>
  );
}
