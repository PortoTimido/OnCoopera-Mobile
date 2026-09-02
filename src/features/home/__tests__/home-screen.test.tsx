import { render, screen } from "@testing-library/react-native";

import { HomeScreen } from "@/features/home/screens/HomeScreen";

describe("home screen", () => {
  it("renders the mocked home content and disabled navigation shell", () => {
    render(<HomeScreen />);

    expect(screen.getByTestId("home-screen")).toBeTruthy();
    expect(screen.getByText("Maria Silva")).toBeTruthy();
    expect(screen.getAllByText("Diario")).toHaveLength(2);
    expect(screen.getByText("Apoio")).toBeTruthy();
    expect(screen.getByText("Artigos")).toBeTruthy();
    expect(screen.getByText("Como voce esta hoje?")).toBeTruthy();
    expect(screen.getByText("Dr. Rafael Souza")).toBeTruthy();
    expect(screen.getByText("Gerar relatorio medico")).toBeTruthy();
    expect(screen.getByTestId("home-nav-inicio").props.accessibilityState).toEqual({
      disabled: false,
      selected: true,
    });
    expect(screen.getByTestId("home-nav-diario").props.accessibilityState).toEqual({
      disabled: true,
      selected: undefined,
    });
  });
});
