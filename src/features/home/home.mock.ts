export const homeMock = {
  prompt: {
    body: "Registrar seus sintomas ajuda sua equipe médica a cuidar melhor de você.",
    cta: "Registrar agora",
    title: "Como você está hoje?",
  },
  reportCta: "Gerar relatório médico",
  shortcuts: [
    { id: "diary", label: "Diário", tone: "gold" },
    { id: "support", label: "Apoio", tone: "blue" },
    { id: "articles", label: "Artigos", tone: "lavender" },
  ],
} as const;

export type HomeShortcut = (typeof homeMock.shortcuts)[number];
