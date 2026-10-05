import { render, screen } from "@testing-library/react-native";

import { ArtigoCalloutCard } from "@/features/artigos/components";

describe("ArtigoCalloutCard", () => {
  it.each([
    ["dica", "Dica", "Prefira alimentos leves."],
    ["pergunta", "Pergunte ao seu médico", "Este consumo é seguro?"],
  ] as const)("renders the %s callout with its content", (variant, title, content) => {
    render(<ArtigoCalloutCard paragraphs={[content]} type="callout" variant={variant} />);

    expect(screen.getByTestId(`artigo-callout-${variant}`)).toBeTruthy();
    expect(screen.getByLabelText(title)).toBeTruthy();
    expect(screen.getByText(content)).toBeTruthy();
  });
});
