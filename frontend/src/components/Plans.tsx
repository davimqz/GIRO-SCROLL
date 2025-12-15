interface PlansProps {
  onSelectPlan?: (planId: number) => void;
}

export function Plans({ onSelectPlan }: PlansProps) {
  const plans = [
    {
      id: 1,
      name: 'Plano 01',
      price: '$6,99',
      description: 'Comece sua jornada com benefícios essenciais',
      benefits: [
        'Recebimento de um selo de soulbound token (SBTL) Scroll',
        'Prioridade no chat de atendimento ao cliente',
        'Ajude o projeto a continuar',
      ],
    },
    {
      id: 2,
      name: 'Plano 02',
      price: '$19,99',
      description: 'Desbloqueie toda a experiência premium',
      benefits: [
        'Recebimento de um selo de soulbound token (SBTL) Scroll',
        'Prioridade no chat de atendimento ao cliente',
        'Acesso exclusivo a comunidade do Instagram',
        'Trocas ilimitadas na plataforma',
        'Ajude o projeto a continuar',
      ],
    },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#FBF7F1' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
            Planos
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Escolha o plano perfeito para sua jornada na economia circular
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="rounded-2xl p-8 shadow-2xl transition transform hover:scale-105 flex flex-col"
              style={{
                backgroundColor: '#3FA18F',
                borderColor: '#3FA18F',
              }}
            >
              {/* Plan Name */}
              <h3 className="text-2xl font-bold mb-2 text-white">
                {plan.name}
              </h3>

              {/* Description */}
              <p className="text-sm mb-6 text-gray-100">
                {plan.description}
              </p>

              {/* Price */}
              <div className="mb-8">
                <span className="text-4xl font-bold text-white">
                  {plan.price}
                </span>
                <span className="text-sm ml-2 text-gray-100">
                  /mês
                </span>
              </div>

              {/* Benefits List */}
              <div className="mb-8 space-y-4 flex-1">
                {plan.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 mt-0.5 flex-shrink-0 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-sm text-white">
                      {benefit}
                    </span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <button
                onClick={() => onSelectPlan?.(plan.id)}
                className="w-full py-3 px-4 rounded-lg font-semibold transition bg-white text-gray-900 hover:bg-gray-100"
              >
                Escolher Plano
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
