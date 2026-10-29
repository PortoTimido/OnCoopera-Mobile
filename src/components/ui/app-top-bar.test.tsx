import { render, screen } from "@testing-library/react-native";

import { AppTopBar } from "./app-top-bar";

describe("AppTopBar", () => {
  it("renders the supplied user context and settings action", async () => {
    await render(<AppTopBar dateTimeLabel="QUARTA, 15 DE JULHO" initials="PC" title="Diário" />);

    expect(screen.getByText("Diário")).toBeTruthy();
    expect(screen.getByText("QUARTA, 15 DE JULHO")).toBeTruthy();
    expect(screen.getByText("PC")).toBeTruthy();
    expect(screen.getByLabelText("Configurações")).toBeTruthy();
  });
});
