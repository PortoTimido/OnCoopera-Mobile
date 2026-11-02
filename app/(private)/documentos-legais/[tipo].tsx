import { useLocalSearchParams } from "expo-router";

import { LegalDocumentScreen } from "@/features/documentos-legais/screens/LegalDocumentScreen";
import type { LegalDocumentType } from "@/lib/api/documentos-legais";

const legalDocumentTypes: LegalDocumentType[] = ["TERMOS_USO", "POLITICA_PRIVACIDADE"];

export default function LegalDocumentRoute() {
  const { tipo } = useLocalSearchParams<{ tipo?: string }>();
  const type = legalDocumentTypes.includes(tipo as LegalDocumentType) ? (tipo as LegalDocumentType) : "TERMOS_USO";
  return <LegalDocumentScreen type={type} />;
}
