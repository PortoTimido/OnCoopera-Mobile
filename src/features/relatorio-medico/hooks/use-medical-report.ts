import { useCallback, useEffect, useMemo, useState } from "react";

import { getMe } from "@/lib/api/auth";
import { listRegistrosDiarios, type RegistroDiario } from "@/lib/api/diario-sintomas";
import { getAccessToken } from "@/lib/auth/session";

import { filterRecordsForPeriod, getSymptomMetrics, type ReportPeriodDays } from "../report-formatters";

const LOAD_ERROR = "Não foi possível carregar os dados para o relatório. Tente novamente.";

export function useMedicalReport(days: ReportPeriodDays) {
  const [patientName, setPatientName] = useState<string | null>(null);
  const [records, setRecords] = useState<RegistroDiario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = await getAccessToken();

      if (!token) {
        throw new Error("Sessão não encontrada.");
      }

      const [user, result] = await Promise.all([getMe(token), listRegistrosDiarios({ page: 1, pageSize: 100 }, token)]);
      const name = user.nome.trim();

      if (!name) {
        throw new Error("Nome do paciente não encontrado.");
      }

      setPatientName(name);
      setRecords(result.data);
    } catch {
      setPatientName(null);
      setRecords([]);
      setError(LOAD_ERROR);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const periodRecords = useMemo(() => filterRecordsForPeriod(records, days), [days, records]);
  const metrics = useMemo(() => getSymptomMetrics(periodRecords, days), [days, periodRecords]);

  return { error, isLoading, metrics, patientName, periodRecords, reload };
}
