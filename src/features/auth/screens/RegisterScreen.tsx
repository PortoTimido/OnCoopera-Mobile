import { FormMessage } from "@/components/ui";
import { AuthCard, AuthHeader, AuthShell, RegisterStepIndicator, RegisterStepOneForm, RegisterStepTwoForm } from "@/features/auth/components";
import { useRegister } from "@/features/auth/hooks/use-register";

export function RegisterScreen() {
  const register = useRegister();

  return (
    <AuthShell contentClassName="py-5" testID="cadastro-screen">
      <AuthHeader
        subtitle={
          register.step === 1 ? "Crie sua conta para organizar seus cuidados." : "Agora informe seu endereco."
        }
        title="Cadastro"
      />

      <RegisterStepIndicator step={register.step} />

      <AuthCard className="gap-4">
        <FormMessage message={register.success} tone="success" />
        <FormMessage message={register.message} tone={register.message?.startsWith("Cadastro validado") ? "warning" : "error"} />

        {register.step === 1 ? (
          <RegisterStepOneForm
            errors={register.errors}
            goToNextStep={register.goToNextStep}
            setFieldError={register.setFieldError}
            updateField={register.updateField}
            values={register.values}
          />
        ) : (
          <RegisterStepTwoForm
            cepLookupLoading={register.cepLookupLoading}
            cepLookupMessage={register.cepLookupMessage}
            errors={register.errors}
            goToPreviousStep={register.goToPreviousStep}
            handleSubmit={register.handleSubmit}
            loading={register.loading}
            updateField={register.updateField}
            values={register.values}
          />
        )}
      </AuthCard>
    </AuthShell>
  );
}
