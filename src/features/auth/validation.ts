export type PasswordRule = {
  id: "length" | "uppercase" | "lowercase" | "number" | "symbol";
  label: string;
  valid: boolean;
};

export type LoginFormValues = {
  identificador: string;
  senha: string;
};

export type RegisterFormValues = {
  bairro: string;
  cep: string;
  cidade: string;
  complemento: string;
  confirmarSenha: string;
  dataNascimento: string;
  email: string;
  estado: string;
  logradouro: string;
  nome: string;
  numero: string;
  senha: string;
  telefone: string;
};

export type RegisterStepOneValues = Pick<
  RegisterFormValues,
  "confirmarSenha" | "dataNascimento" | "email" | "nome" | "senha" | "telefone"
>;

export type RegisterStepTwoValues = Pick<
  RegisterFormValues,
  "bairro" | "cep" | "cidade" | "complemento" | "estado" | "logradouro" | "numero"
>;

export type TemporaryPasswordFormValues = {
  confirmarSenha: string;
  identificador: string;
  novaSenha: string;
  senhaTemporaria: string;
};

export type ResetPasswordFormValues = {
  confirmarSenha: string;
  novaSenha: string;
};

export type FieldErrors<TValues> = Partial<Record<keyof TValues, string>>;

const REQUIRED_MESSAGE = "Campo obrigatorio.";
const PASSWORD_POLICY_MESSAGE =
  "A senha deve ter no minimo 6 caracteres, uma letra maiuscula, uma minuscula, um numero e um simbolo.";

export function normalizeDigits(value: string) {
  return value.replace(/\D/g, "");
}

export function hasFieldErrors<TValues>(errors: FieldErrors<TValues>) {
  return Object.values(errors).some(Boolean);
}

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function passwordRules(password: string): PasswordRule[] {
  return [
    { id: "length", label: "Minimo 6 caracteres", valid: password.length >= 6 },
    { id: "uppercase", label: "Uma letra maiuscula", valid: /[A-Z]/.test(password) },
    { id: "lowercase", label: "Uma letra minuscula", valid: /[a-z]/.test(password) },
    { id: "number", label: "Um numero", valid: /\d/.test(password) },
    { id: "symbol", label: "Um simbolo", valid: /[^A-Za-z0-9\s]/.test(password) },
  ];
}

export function isPasswordPolicyValid(password: string) {
  return passwordRules(password).every((rule) => rule.valid);
}

export function validateLogin(values: LoginFormValues) {
  const errors: FieldErrors<LoginFormValues> = {};

  if (!values.identificador.trim()) {
    errors.identificador = REQUIRED_MESSAGE;
  }

  if (!values.senha) {
    errors.senha = REQUIRED_MESSAGE;
  }

  return errors;
}

export function validateEmailRequest(email: string) {
  if (!email.trim()) {
    return REQUIRED_MESSAGE;
  }

  if (!isValidEmail(email)) {
    return "Informe um e-mail valido.";
  }

  return undefined;
}

export function validateResetPassword(values: ResetPasswordFormValues) {
  const errors: FieldErrors<ResetPasswordFormValues> = {};

  if (!values.novaSenha) {
    errors.novaSenha = REQUIRED_MESSAGE;
  } else if (!isPasswordPolicyValid(values.novaSenha)) {
    errors.novaSenha = PASSWORD_POLICY_MESSAGE;
  }

  if (!values.confirmarSenha) {
    errors.confirmarSenha = REQUIRED_MESSAGE;
  } else if (values.confirmarSenha !== values.novaSenha) {
    errors.confirmarSenha = "As senhas nao conferem.";
  }

  return errors;
}

export function validateTemporaryPassword(values: TemporaryPasswordFormValues) {
  const errors = validateResetPassword({
    confirmarSenha: values.confirmarSenha,
    novaSenha: values.novaSenha,
  }) as FieldErrors<TemporaryPasswordFormValues>;

  if (!values.identificador.trim()) {
    errors.identificador = REQUIRED_MESSAGE;
  }

  if (!values.senhaTemporaria) {
    errors.senhaTemporaria = REQUIRED_MESSAGE;
  }

  return errors;
}

export function validateRegisterStepOne(values: RegisterStepOneValues) {
  const errors: FieldErrors<RegisterStepOneValues> = {};

  if (!values.nome.trim()) {
    errors.nome = REQUIRED_MESSAGE;
  } else if (getNameParts(values.nome).length < 2) {
    errors.nome = "Informe nome e sobrenome para gerar o login.";
  }

  const emailError = validateEmailRequest(values.email);

  if (emailError) {
    errors.email = emailError;
  }

  if (!values.telefone.trim()) {
    errors.telefone = REQUIRED_MESSAGE;
  } else if (![10, 11].includes(normalizeDigits(values.telefone).length)) {
    errors.telefone = "Informe um telefone valido com DDD.";
  }

  if (!values.dataNascimento.trim()) {
    errors.dataNascimento = REQUIRED_MESSAGE;
  } else if (Number.isNaN(new Date(values.dataNascimento).getTime())) {
    errors.dataNascimento = "Informe uma data de nascimento valida.";
  } else if (new Date(values.dataNascimento).getTime() > Date.now()) {
    errors.dataNascimento = "A data de nascimento nao pode ser no futuro.";
  }

  const passwordErrors = validateResetPassword({
    confirmarSenha: values.confirmarSenha,
    novaSenha: values.senha,
  });

  if (passwordErrors.novaSenha) {
    errors.senha = passwordErrors.novaSenha;
  }

  if (passwordErrors.confirmarSenha) {
    errors.confirmarSenha = passwordErrors.confirmarSenha;
  }

  return errors;
}

export function validateRegisterStepTwo(values: RegisterStepTwoValues) {
  const errors: FieldErrors<RegisterStepTwoValues> = {};
  const requiredFields: Array<keyof RegisterStepTwoValues> = [
    "cep",
    "estado",
    "cidade",
    "bairro",
    "logradouro",
    "numero",
  ];

  for (const field of requiredFields) {
    if (!values[field].trim()) {
      errors[field] = REQUIRED_MESSAGE;
    }
  }

  if (values.cep.trim() && normalizeDigits(values.cep).length !== 8) {
    errors.cep = "Informe um CEP com 8 digitos.";
  }

  if (values.estado.trim() && values.estado.trim().length !== 2) {
    errors.estado = "Use a sigla do estado com 2 letras.";
  }

  return errors;
}

export function validateRegister(values: RegisterFormValues) {
  return {
    ...validateRegisterStepOne(values),
    ...validateRegisterStepTwo(values),
  } as FieldErrors<RegisterFormValues>;
}

function getNameParts(name: string) {
  return name.trim().split(/\s+/).filter(Boolean);
}

function normalizeLoginToken(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

export function buildPatientLogin(name: string) {
  const parts = getNameParts(name);
  const firstName = parts[0] ?? "";
  const lastName = parts.length > 1 ? parts[parts.length - 1] : "";

  return [firstName, lastName].map(normalizeLoginToken).filter(Boolean).join(".");
}
