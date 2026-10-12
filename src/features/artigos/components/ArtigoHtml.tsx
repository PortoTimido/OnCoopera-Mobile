import Constants from "expo-constants";
import RenderHTML from "@native-html/render";
import { useMemo } from "react";

import { nativePropColors } from "@/lib/design/native-prop-colors";

type ArtigoHtmlProps = {
  color?: string;
  contentWidth: number;
  html: string;
};

const systemFonts = [...(Constants.systemFonts ?? []), "Fraunces-Bold", "PlusJakartaSans-Regular", "PlusJakartaSans-Bold"];
const ignoredDomTags = ["base", "embed", "form", "iframe", "object", "script", "style"];

export function ArtigoHtml({ color = nativePropColors.authInk, contentWidth, html }: ArtigoHtmlProps) {
  const baseStyle = useMemo(
    () => ({ color, fontFamily: "PlusJakartaSans-Regular", fontSize: 15, lineHeight: 24 }),
    [color],
  );
  const tagsStyles = useMemo(
    () => ({
      a: { color: nativePropColors.brandPrimary, textDecorationLine: "underline" as const },
      h1: { color, fontFamily: "Fraunces-Bold", fontSize: 28, lineHeight: 34, marginBottom: 12, marginTop: 16 },
      h2: { color, fontFamily: "Fraunces-Bold", fontSize: 24, lineHeight: 30, marginBottom: 10, marginTop: 16 },
      h3: { color, fontFamily: "PlusJakartaSans-Bold", fontSize: 20, lineHeight: 27, marginBottom: 8, marginTop: 12 },
      img: { borderRadius: 20, marginBottom: 12, marginTop: 4 },
      li: { marginBottom: 6 },
      ol: { marginBottom: 12, marginTop: 0 },
      p: { color, marginBottom: 12, marginTop: 0 },
      ul: { marginBottom: 12, marginTop: 0 },
    }),
    [color],
  );

  return (
    <RenderHTML
      baseStyle={baseStyle}
      contentWidth={Math.max(1, contentWidth)}
      enableCSSInlineProcessing={false}
      ignoredDomTags={ignoredDomTags}
      source={{ html }}
      systemFonts={systemFonts}
      tagsStyles={tagsStyles}
    />
  );
}
