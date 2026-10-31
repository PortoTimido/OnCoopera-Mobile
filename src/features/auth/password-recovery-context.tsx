import { createContext, type ReactNode, use, useCallback, useMemo, useState } from "react";

type PasswordRecoveryContextValue = {
  clearRecovery: () => void;
  email: string | null;
  resetToken: string | null;
  startRecovery: (email: string) => void;
  storeResetToken: (resetToken: string) => void;
};

const PasswordRecoveryContext = createContext<PasswordRecoveryContextValue | null>(null);

export function PasswordRecoveryProvider({ children }: { children: ReactNode }) {
  const [email, setEmail] = useState<string | null>(null);
  const [resetToken, setResetToken] = useState<string | null>(null);

  const clearRecovery = useCallback(() => {
    setEmail(null);
    setResetToken(null);
  }, []);

  const startRecovery = useCallback((nextEmail: string) => {
    setEmail(nextEmail);
    setResetToken(null);
  }, []);

  const storeResetToken = useCallback((nextResetToken: string) => {
    setResetToken(nextResetToken);
  }, []);

  const value = useMemo(
    () => ({ clearRecovery, email, resetToken, startRecovery, storeResetToken }),
    [clearRecovery, email, resetToken, startRecovery, storeResetToken],
  );

  return <PasswordRecoveryContext value={value}>{children}</PasswordRecoveryContext>;
}

export function usePasswordRecovery() {
  const context = use(PasswordRecoveryContext);

  if (!context) {
    throw new Error("usePasswordRecovery deve ser usado dentro de PasswordRecoveryProvider.");
  }

  return context;
}
