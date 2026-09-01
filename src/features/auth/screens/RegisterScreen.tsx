import { CalendarDays, Home, Mail, MapPin, Phone, UserRound } from "lucide-react-native";
import { useEffect, useState } from "react";
import { View } from "react-native-css/components";

import { FormMessage } from "@/components/ui";
import {
  AuthButton,
  AuthCard,
  AuthHeader,
  AuthLink,
  AuthShell,
  AuthTextField,
  PasswordChecklist,
  PasswordField,
} from "@/features/auth/components";
import { getSubmitErrorMessage } from "@/features/auth/screens/screen-helpers";
import {
  buildPatientLogin,
  hasFieldErrors,
  normalizeDigits,
  type FieldErrors,
  type RegisterFormValues,
  validateRegister,
} from "@/features/auth/validation";
import { createPatient } from "@/lib/api/auth";
import { getAddressByCep } from "@/lib/api/via-cep";
import { getPendingGeocodingCoordinates } from "@/lib/geocoding/geocode-address";

const initialValues: RegisterFormValues = {
  bairro: "",
  cep: "",
  cidade: "",
  complemento: "",
  confirmarSenha: "",
  dataNascimento: "",
  email: "",
  estado: "",
  logradouro: "",
  nome: "",
  numero: "",
  senha: "",
  telefone: "",
};

export function RegisterScreen() {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<FieldErrors<RegisterFormValues>>({});
  const [loading, setLoading] = useState(false);
  const [cepLookupLoading, setCepLookupLoading] = useState(false);
  const [cepLookupMessage, setCepLookupMessage] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function updateField(field: keyof RegisterFormValues, value: string) {
    const nextValue =
      field === "estado" ? value.toUpperCase().slice(0, 2) : field === "cep" ? normalizeDigits(value).slice(0, 8) : value;

    setValues((current) => ({ ...current, [field]: nextValue }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  useEffect(() => {
    const cep = normalizeDigits(values.cep);

    if (cep.length !== 8) {
      setCepLookupLoading(false);
      setCepLookupMessage(null);
      return;
    }

    const controller = new AbortController();
    let ignore = false;
    const timeout = setTimeout(async () => {
      setCepLookupLoading(true);
      setCepLookupMessage(null);

      try {
        const address = await getAddressByCep(cep, { signal: controller.signal });

        if (ignore) {
          return;
        }

        setValues((current) => {
          if (normalizeDigits(current.cep) !== cep) {
            return current;
          }

          return {
            ...current,
            bairro: address.bairro || current.bairro,
            cidade: address.localidade || current.cidade,
            complemento: current.complemento || address.complemento || "",
            estado: address.uf || current.estado,
            logradouro: address.logradouro || current.logradouro,
          };
        });
        setErrors((current) => ({
          ...current,
          bairro: undefined,
          cep: undefined,
          cidade: undefined,
          estado: undefined,
          logradouro: undefined,
        }));
        setCepLookupMessage("Endereco preenchido automaticamente pelo ViaCEP.");
      } catch (error) {
        if (ignore || (error instanceof Error && error.name === "AbortError")) {
          return;
        }

        setErrors((current) => ({
          ...current,
          cep: getSubmitErrorMessage(error, "Nao foi possivel buscar o CEP."),
        }));
      } finally {
        if (!ignore) {
          setCepLookupLoading(false);
        }
      }
    }, 450);

    return () => {
      ignore = true;
      controller.abort();
      clearTimeout(timeout);
    };
  }, [values.cep]);

  async function handleSubmit() {
    const nextErrors = validateRegister(values);
    setErrors(nextErrors);
    setMessage(null);
    setSuccess(null);

    if (hasFieldErrors(nextErrors)) {
      return;
    }

    setLoading(true);

    try {
      const coordinates = getPendingGeocodingCoordinates();

      await createPatient({
        dataNascimento: values.dataNascimento.trim(),
        email: values.email.trim(),
        endereco: {
          bairro: values.bairro.trim(),
          cep: normalizeDigits(values.cep),
          cidade: values.cidade.trim(),
          complemento: values.complemento.trim() || null,
          estado: values.estado.trim(),
          latitude: coordinates.latitude,
          logradouro: values.logradouro.trim(),
          longitude: coordinates.longitude,
          numero: values.numero.trim(),
        },
        login: buildPatientLogin(values.nome),
        nome: values.nome.trim(),
        senha: values.senha,
        telefone: normalizeDigits(values.telefone),
      });

      setSuccess("Cadastro enviado com sucesso. Agora voce ja pode entrar.");
    } catch (error) {
      setMessage(getSubmitErrorMessage(error, "Nao foi possivel concluir o cadastro."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell contentClassName="py-5" testID="cadastro-screen">
      <AuthHeader subtitle="Crie sua conta para organizar seus cuidados." title="Cadastro" />

      <AuthCard className="gap-4">
        <FormMessage message={success} tone="success" />
        <FormMessage message={message} tone={message?.startsWith("Cadastro validado") ? "warning" : "error"} />

        <AuthTextField
          autoCapitalize="words"
          error={errors.nome}
          icon={UserRound}
          label="Nome completo"
          onChangeText={(value) => updateField("nome", value)}
          placeholder="Seu nome"
          value={values.nome}
        />

        <AuthTextField
          error={errors.email}
          icon={Mail}
          keyboardType="email-address"
          label="E-mail"
          onChangeText={(value) => updateField("email", value)}
          placeholder="seu@email.com"
          value={values.email}
        />

        <View className="gap-4 sm:flex-row">
          <AuthTextField
            containerClassName="flex-1"
            error={errors.telefone}
            icon={Phone}
            keyboardType="phone-pad"
            label="Telefone"
            onChangeText={(value) => updateField("telefone", value)}
            placeholder="(00) 00000-0000"
            value={values.telefone}
          />
          <AuthTextField
            containerClassName="flex-1"
            error={errors.dataNascimento}
            icon={CalendarDays}
            label="Nascimento"
            onChangeText={(value) => updateField("dataNascimento", value)}
            placeholder="AAAA-MM-DD"
            value={values.dataNascimento}
          />
        </View>

        <PasswordField
          error={errors.senha}
          label="Senha"
          onChangeText={(value) => updateField("senha", value)}
          placeholder="Crie uma senha"
          value={values.senha}
        />
        <PasswordChecklist password={values.senha} />
        <PasswordField
          error={errors.confirmarSenha}
          label="Confirmar senha"
          onChangeText={(value) => updateField("confirmarSenha", value)}
          placeholder="Repita sua senha"
          value={values.confirmarSenha}
        />

        <View className="h-px bg-auth-line" />

        <AuthTextField
          error={errors.cep}
          icon={MapPin}
          keyboardType="number-pad"
          label="CEP"
          helperText={
            cepLookupLoading
              ? "Buscando endereco pelo ViaCEP..."
              : cepLookupMessage ?? "Digite 8 digitos para preencher o endereco."
          }
          maxLength={8}
          onChangeText={(value) => updateField("cep", value)}
          placeholder="00000000"
          value={values.cep}
        />

        <AuthTextField
          autoCapitalize="words"
          error={errors.logradouro}
          icon={Home}
          label="Endereco"
          onChangeText={(value) => updateField("logradouro", value)}
          placeholder="Rua, avenida..."
          value={values.logradouro}
        />

        <View className="gap-4 sm:flex-row">
          <AuthTextField
            containerClassName="flex-1"
            error={errors.numero}
            keyboardType="number-pad"
            label="Numero"
            onChangeText={(value) => updateField("numero", value)}
            placeholder="123"
            value={values.numero}
          />
          <AuthTextField
            containerClassName="flex-1"
            label="Complemento"
            onChangeText={(value) => updateField("complemento", value)}
            placeholder="Apto, bloco"
            value={values.complemento}
          />
        </View>

        <AuthTextField
          autoCapitalize="words"
          error={errors.bairro}
          label="Bairro"
          onChangeText={(value) => updateField("bairro", value)}
          placeholder="Seu bairro"
          value={values.bairro}
        />

        <View className="gap-4 sm:flex-row">
          <AuthTextField
            autoCapitalize="words"
            containerClassName="flex-[2]"
            error={errors.cidade}
            label="Cidade"
            onChangeText={(value) => updateField("cidade", value)}
            placeholder="Sua cidade"
            value={values.cidade}
          />
          <AuthTextField
            containerClassName="flex-1"
            error={errors.estado}
            label="UF"
            maxLength={2}
            onChangeText={(value) => updateField("estado", value)}
            placeholder="SP"
            value={values.estado}
          />
        </View>

        <AuthButton loading={loading} onPress={handleSubmit} testID="cadastro-submit" title="Criar conta" />

        <View className="items-center">
          <AuthLink href="/login" label="Ja tenho uma conta" />
        </View>
      </AuthCard>
    </AuthShell>
  );
}
