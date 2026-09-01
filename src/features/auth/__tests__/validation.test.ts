import {
  buildPatientLogin,
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
    expect(isPasswordPolicyValid("12345")).toBe(false);
    expect(passwordRules("123456")).toEqual([
      {
        id: "length",
        label: "Minimo 6 caracteres",
        valid: true,
      },
    ]);
  });

  it("requires matching reset passwords", () => {
    const errors = validateResetPassword({
      confirmarSenha: "654321",
      novaSenha: "123456",
    });

    expect(errors.confirmarSenha).toBe("As senhas nao conferem.");
  });

  it("requires temporary password credentials", () => {
    const errors = validateTemporaryPassword({
      confirmarSenha: "123456",
      identificador: "",
      novaSenha: "123456",
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
      confirmarSenha: "123456",
      dataNascimento: "",
      email: "invalido",
      estado: "SP",
      logradouro: "",
      nome: "",
      numero: "",
      senha: "123456",
      telefone: "",
    });

    expect(errors.nome).toBe("Campo obrigatorio.");
    expect(errors.email).toBe("Informe um e-mail valido.");
    expect(errors.cep).toBe("Informe um CEP com 8 digitos.");
  });

  it("generates patient login from first name and last surname", () => {
    expect(buildPatientLogin("Maria Clara da Silva")).toBe("maria.silva");
    expect(buildPatientLogin("Joao")).toBe("joao");
  });

  it("requires name and surname for register login generation", () => {
    const errors = validateRegister({
      bairro: "Centro",
      cep: "01001000",
      cidade: "Sao Paulo",
      complemento: "",
      confirmarSenha: "123456",
      dataNascimento: "1990-01-01",
      email: "paciente@oncoopera.com",
      estado: "SP",
      logradouro: "Praca da Se",
      nome: "Maria",
      numero: "1",
      senha: "123456",
      telefone: "11999999999",
    });

    expect(errors.nome).toBe("Informe nome e sobrenome para gerar o login.");
  });
});
