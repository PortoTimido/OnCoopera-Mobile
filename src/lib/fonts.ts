import {
  Fraunces_700Bold,
  useFonts as useFraunces,
} from "@expo-google-fonts/fraunces";
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  useFonts as usePlusJakartaSans,
} from "@expo-google-fonts/plus-jakarta-sans";

export function useOnCooperaFonts() {
  const [frauncesLoaded, frauncesError] = useFraunces({
    "Fraunces-Bold": Fraunces_700Bold,
  });
  const [jakartaLoaded, jakartaError] = usePlusJakartaSans({
    "PlusJakartaSans-Regular": PlusJakartaSans_400Regular,
    "PlusJakartaSans-Medium": PlusJakartaSans_500Medium,
    "PlusJakartaSans-SemiBold": PlusJakartaSans_600SemiBold,
    "PlusJakartaSans-Bold": PlusJakartaSans_700Bold,
  });

  return {
    loaded: frauncesLoaded && jakartaLoaded,
    error: frauncesError ?? jakartaError,
  };
}
