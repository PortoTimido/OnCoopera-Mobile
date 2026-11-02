export const homeMock = {
  shortcuts: [
    { id: "diary", label: "Diário", tone: "gold" },
    { id: "support", label: "Apoio", tone: "blue" },
    { id: "articles", label: "Artigos", tone: "lavender" },
    { id: "report", label: "Relatório", tone: "green" },
  ],
} as const;

export type HomeShortcut = (typeof homeMock.shortcuts)[number];
