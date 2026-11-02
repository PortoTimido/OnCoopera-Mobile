import { useWindowDimensions } from "react-native";

import { ArtigoHtml } from "@/features/artigos/components";

type LegalDocumentContentProps = {
  html: string;
};

export function LegalDocumentContent({ html }: LegalDocumentContentProps) {
  const { width } = useWindowDimensions();
  const contentWidth = Math.max(1, Math.min(width, 430) - 48);

  return <ArtigoHtml contentWidth={contentWidth} html={html} />;
}
