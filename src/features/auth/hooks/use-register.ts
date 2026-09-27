import { useRouter } from "expo-router";
import { useEffect, useState } from "react";

import { getSubmitErrorMessage } from "@/features/auth/screens/screen-helpers";
import {
  buildPatientLogin,
  hasFieldErrors,
  normalizeDigits,
  validateRegisterStepOne,
  validateRegisterStepTwo,
  type FieldErrors,
  type RegisterFormValues,
} from "@/features/auth/validation";
import { createPatient, login } from "@/lib/api/auth";
import { getAddressByCep } from "@/lib/api/via-cep";
import { saveAuthSession } from "@/lib/auth/session";
import { getPendingGeocodingCoordinates } from "@/lib/geocoding/geocode-address";

export type RegisterStep = 1 | 2;

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

export function useRegister() {
  const router = useRouter();
  const [step, setStep] = useState<RegisterStep>(1);
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<FieldErrors<RegisterFormValues>>({});
  const [loading, setLoading] = useState(false);
  const [cepLookupLoading, setCepLookupLoading] = useState(false);
  const [cepLookupMessage, setCepLookupMessage] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function updateField(field: keyof RegisterFormValues, value: string) {
    const nextValue =
      field === "estado"
        ? value.toUpperCase().slice(0, 2)
        : field === "cep"
          ? normalizeDigits(value).slice(0, 8)
          : field === "telefone"
            ? normalizeDigits(value).slice(0, 11)
            : value;

    setValues((current) => ({ ...current, [field]: nextValue }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function setFieldError(field: keyof RegisterFormValues, error: string | undefined) {
    setErrors((current) => ({ ...current, [field]: error }));
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

  function goToNextStep() {
    const stepOneErrors = validateRegisterStepOne(values);
    setErrors(stepOneErrors);

    if (hasFieldErrors(stepOneErrors)) {
      return;
    }

    setStep(2);
  }

  function goToPreviousStep() {
    setErrors({});
    setStep(1);
  }

  async function handleSubmit() {
    const stepOneErrors = validateRegisterStepOne(values);
    const stepTwoErrors = validateRegisterStepTwo(values);
    setMessage(null);
    setSuccess(null);

    if (hasFieldErrors(stepOneErrors)) {
      setErrors(stepOneErrors);
      setStep(1);
      return;
    }

    setErrors(stepTwoErrors);

    if (hasFieldErrors(stepTwoErrors)) {
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

      try {
        const session = await login({ identificador: values.email.trim(), senha: values.senha });

        await saveAuthSession(session, true);
        router.replace("/inicio");
        return;
      } catch {
        setSuccess("Cadastro enviado com sucesso. Entre com seu e-mail e senha.");
      }
    } catch (error) {
      setMessage(getSubmitErrorMessage(error, "Nao foi possivel concluir o cadastro."));
    } finally {
      setLoading(false);
    }
  }

  return {
    cepLookupLoading,
    cepLookupMessage,
    errors,
    goToNextStep,
    goToPreviousStep,
    handleSubmit,
    loading,
    message,
    setFieldError,
    step,
    success,
    updateField,
    values,
  };
}
