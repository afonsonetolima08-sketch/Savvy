import { useApp } from "@/context/AppContext";
import { getTranslations, Translations } from "@/utils/i18n";

export function useT(): Translations {
  const { profile } = useApp();
  return getTranslations(profile.language || "pt");
}
