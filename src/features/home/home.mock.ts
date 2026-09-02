export const homeMock = {
  appointment: {
    day: "14 Marco",
    doctor: "Dr. Rafael Souza",
    label: "PROXIMA CONSULTA",
    time: "10:30",
  },
  dateLabel: "QUARTA, 15 DE JULHO",
  patient: {
    initials: "PP",
    name: "Maria Silva",
  },
  prompt: {
    body: "Registrar seus sintomas ajuda sua equipe medica a cuidar melhor de voce.",
    cta: "Registrar agora",
    title: "Como voce esta hoje?",
  },
  reportCta: "Gerar relatorio medico",
  shortcuts: [
    { id: "diary", label: "Diario", tone: "gold" },
    { id: "support", label: "Apoio", tone: "blue" },
    { id: "articles", label: "Artigos", tone: "lavender" },
  ],
} as const;

export type HomeShortcut = (typeof homeMock.shortcuts)[number];
