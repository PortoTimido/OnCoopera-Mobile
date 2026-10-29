import { fireEvent, render, screen } from "@testing-library/react-native";

import { FormMessage } from "@/components/ui";
import { AuthButton, PasswordField } from "@/features/auth/components";

describe("auth components", () => {
  it("toggles password visibility", async () => {
    await render(<PasswordField label="Senha" testID="password-input" value="SenhaForte123!" />);

    expect(screen.getByTestId("password-input").props.secureTextEntry).toBe(true);

    await fireEvent.press(screen.getByTestId("password-input-visibility-toggle"));

    expect(screen.getByTestId("password-input").props.secureTextEntry).toBe(false);
  });

  it("marks auth button as disabled and busy while loading", async () => {
    const onPress = jest.fn();

    await render(<AuthButton loading onPress={onPress} testID="submit-button" title="Entrar" />);

    expect(screen.getByTestId("submit-button").props.accessibilityState).toEqual({
      busy: true,
      disabled: true,
    });
    await fireEvent.press(screen.getByTestId("submit-button"));
    expect(onPress).not.toHaveBeenCalled();
  });

  it("renders form messages only when a message is present", async () => {
    const { rerender } = await render(<FormMessage message={null} />);

    expect(screen.queryByRole("alert")).toBeNull();

    await rerender(<FormMessage message="Algo aconteceu." tone="warning" />);

    expect(screen.getByRole("alert")).toBeTruthy();
    expect(screen.getByText("Algo aconteceu.")).toBeTruthy();
  });
});
