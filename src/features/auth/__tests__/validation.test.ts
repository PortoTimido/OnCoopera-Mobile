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
    expect(isPasswordPolicyValid("senha1!")).toBe(false);
    expect(isPasswordPolicyValid("SENHA1!")).toBe(false);
    expect(isPasswordPolicyValid("Senha!!")).toBe(false);
    expect(isPasswordPolicyValid("Senha12")).toBe(false);
    expect(isPasswordPolicyValid("Se1!")).toBe(false);
    expect(isPasswordPolicyValid("Senha1!")).toBe(true);
    expect(passwordRules("Senha1!")).toEqual([
      {
        id: "length",
        label: "Minimo 6 caracteres",
        valid: true,
      },
      {
        id: "uppercase",
        label: "Uma letra maiuscula",
        valid: true,
      },
      {
        id: "lowercase",
        label: "Uma letra minuscula",
        valid: true,
      },
      {
        id: "number",
        label: "Um numero",
        valid: true,
      },
      {
        id: "symbol",
        label: "Um simbolo",
        valid: true,
      },
    ]);
  });

  it("uses the password policy message across reset validation", () => {
    const errors = validateResetPassword({
      confirmarSenha: "senha",
      novaSenha: "senha",
    });

    expect(errors.novaSenha).toBe(
      "A senha deve ter no minimo 6 caracteres, uma letra maiuscula, uma minuscula, um numero e um simbolo.",
    );
  });

  it("requires matching reset passwords", () => {
    const errors = validateResetPassword({
      confirmarSenha: "Senha2!",
      novaSenha: "Senha1!",
    });

    expect(errors.confirmarSenha).toBe("As senhas nao conferem.");
  });

  it("requires temporary password credentials", () => {
    const errors = validateTemporaryPassword({
      confirmarSenha: "Senha1!",
      identificador: "",
      novaSenha: "Senha1!",
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
      confirmarSenha: "Senha1!",
      dataNascimento: "",
      email: "invalido",
      estado: "SP",
      logradouro: "",
      nome: "",
      numero: "",
      senha: "Senha1!",
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
      confirmarSenha: "Senha1!",
      dataNascimento: "1990-01-01",
      email: "paciente@oncoopera.com",
      estado: "SP",
      logradouro: "Praca da Se",
      nome: "Maria",
      numero: "1",
      senha: "Senha1!",
      telefone: "11999999999",
    });

    expect(errors.nome).toBe("Informe nome e sobrenome para gerar o login.");
  });
});
