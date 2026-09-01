export type PasswordRule = {
  id: "length";
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
    errors.novaSenha = "A senha deve ter no minimo 6 caracteres.";
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

export function validateRegister(values: RegisterFormValues) {
  const errors: FieldErrors<RegisterFormValues> = {};
  const requiredFields: Array<keyof RegisterFormValues> = [
    "bairro",
    "cep",
    "cidade",
    "dataNascimento",
    "email",
    "estado",
    "logradouro",
    "nome",
    "numero",
    "senha",
    "telefone",
  ];

  for (const field of requiredFields) {
    if (!values[field].trim()) {
      errors[field] = REQUIRED_MESSAGE;
    }
  }

  if (values.email.trim() && !isValidEmail(values.email)) {
    errors.email = "Informe um e-mail valido.";
  }

  if (values.nome.trim() && getNameParts(values.nome).length < 2) {
    errors.nome = "Informe nome e sobrenome para gerar o login.";
  }

  if (values.cep.trim() && normalizeDigits(values.cep).length !== 8) {
    errors.cep = "Informe um CEP com 8 digitos.";
  }

  if (values.estado.trim() && values.estado.trim().length !== 2) {
    errors.estado = "Use a sigla do estado com 2 letras.";
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
