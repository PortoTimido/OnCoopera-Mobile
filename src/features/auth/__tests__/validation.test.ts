import {
  hasFieldErrors,
  isPasswordPolicyValid,
  passwordRules,
  validateEmailRequest,
  validateLogin,
  validateRegister,
  validateResetPassword,
  validateTemporaryPassword,
} from "@/features/auth/validation";

describe("auth validation", () => {
  it("marks login fields as required", () => {
    const errors = validateLogin({ identificador: "", senha: "" });

    expect(errors.identificador).toBe("Campo obrigatorio.");
    expect(errors.senha).toBe("Campo obrigatorio.");
    expect(hasFieldErrors(errors)).toBe(true);
  });

  it("validates email requests", () => {
    expect(validateEmailRequest("")).toBe("Campo obrigatorio.");
    expect(validateEmailRequest("email-invalido")).toBe("Informe um e-mail valido.");
    expect(validateEmailRequest("paciente@oncoopera.com")).toBeUndefined();
  });

  it("enforces password policy rules", () => {
    expect(isPasswordPolicyValid("curta")).toBe(false);
    expect(passwordRules("SenhaForte123!").every((rule) => rule.valid)).toBe(true);
  });

  it("requires matching reset passwords", () => {
    const errors = validateResetPassword({
      confirmarSenha: "OutraSenha123!",
      novaSenha: "SenhaForte123!",
    });

    expect(errors.confirmarSenha).toBe("As senhas nao conferem.");
  });

  it("requires temporary password credentials", () => {
    const errors = validateTemporaryPassword({
      confirmarSenha: "SenhaForte123!",
      identificador: "",
      novaSenha: "SenhaForte123!",
      senhaTemporaria: "",
    });

    expect(errors.identificador).toBe("Campo obrigatorio.");
    expect(errors.senhaTemporaria).toBe("Campo obrigatorio.");
  });

  it("validates register address and credential fields", () => {
    const errors = validateRegister({
      bairro: "",
      cep: "123",
      cidade: "",
      complemento: "",
      confirmarSenha: "SenhaForte123!",
      dataNascimento: "",
      email: "invalido",
      estado: "SP",
      login: "",
      logradouro: "",
      nome: "",
      numero: "",
      senha: "SenhaForte123!",
      telefone: "",
    });

    expect(errors.nome).toBe("Campo obrigatorio.");
    expect(errors.email).toBe("Informe um e-mail valido.");
    expect(errors.cep).toBe("Informe um CEP com 8 digitos.");
  });
});
