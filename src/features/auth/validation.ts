export type PasswordRule = {
  id: "length" | "lowercase" | "uppercase" | "number" | "symbol";
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
  login: string;
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

function utf8ByteLength(value: string) {
  return Array.from(value).reduce((total, char) => {
    const codePoint = char.codePointAt(0) ?? 0;

    if (codePoint <= 0x7f) {
      return total + 1;
    }

    if (codePoint <= 0x7ff) {
      return total + 2;
    }

    if (codePoint <= 0xffff) {
      return total + 3;
    }

    return total + 4;
  }, 0);
}

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
  const byteLength = utf8ByteLength(password);

  return [
    { id: "length", label: "12 a 72 caracteres", valid: byteLength >= 12 && byteLength <= 72 },
    { id: "lowercase", label: "Uma letra minuscula", valid: /[a-z]/.test(password) },
    { id: "uppercase", label: "Uma letra maiuscula", valid: /[A-Z]/.test(password) },
    { id: "number", label: "Um numero", valid: /\d/.test(password) },
    { id: "symbol", label: "Um simbolo", valid: /[^A-Za-z0-9]/.test(password) },
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
    errors.novaSenha = "A senha ainda nao atende a politica de seguranca.";
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
    "login",
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
