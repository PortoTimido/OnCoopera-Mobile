import * as Location from "expo-location";
import { useCallback, useEffect, useRef, useState } from "react";

import { getPatientProfile } from "@/lib/api/auth";
import { type Apoio, type ApoioTipo, listApoios } from "@/lib/api/apoios";
import { ApiError } from "@/lib/api/client";
import { getAccessToken } from "@/lib/auth/session";

const PAGE_SIZE = 10;
const DEBUG_PREFIX = "[RadarApoio]";
type Coordinates = { latitude: number; longitude: number };
type ActiveQuery = { city: string; coordinates?: Coordinates; selectedType: ApoioTipo | "todos"; version: number };

function debug(event: string, data?: unknown) {
  if (__DEV__) console.debug(DEBUG_PREFIX, event, data ?? "");
}

function isValidCoordinates(value?: Coordinates): value is Coordinates {
  return Boolean(value && Number.isFinite(value.latitude) && Number.isFinite(value.longitude));
}

async function getForegroundPermission() {
  const current = await Location.getForegroundPermissionsAsync();
  return current.status === "granted" ? current : Location.requestForegroundPermissionsAsync();
}

async function resolveReferenceCoordinates(city: string, profileCoordinates?: Coordinates): Promise<Coordinates | undefined> {
  try {
    const permission = await getForegroundPermission();
    debug("location-permission", { status: permission.status });
    if (permission.status === "granted") {
      const currentLocation = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      if (isValidCoordinates(currentLocation.coords)) {
        const coordinates = { latitude: currentLocation.coords.latitude, longitude: currentLocation.coords.longitude };
        debug("location-source", { source: "gps", coordinates });
        return coordinates;
      }
    }
  } catch {
    // Continue with the city and profile fallbacks.
  }

  if (city) {
    try {
      const [geocodedCity] = await Location.geocodeAsync(city);
      if (isValidCoordinates(geocodedCity)) {
        const coordinates = { latitude: geocodedCity.latitude, longitude: geocodedCity.longitude };
        debug("location-source", { source: "city", coordinates });
        return coordinates;
      }
    } catch {
      // The saved profile address is the final fallback.
    }
  }

  if (isValidCoordinates(profileCoordinates)) debug("location-source", { source: "profile", coordinates: profileCoordinates });
  return isValidCoordinates(profileCoordinates) ? profileCoordinates : undefined;
}

export function useRadarApoio() {
  const [city, setCity] = useState("");
  const [submittedCity, setSubmittedCity] = useState("");
  const [selectedType, setSelectedType] = useState<ApoioTipo | "todos">("todos");
  const [apoios, setApoios] = useState<Apoio[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const profileCoordinates = useRef<Coordinates | undefined>(undefined);
  const activeQuery = useRef<ActiveQuery | undefined>(undefined);
  const requestVersion = useRef(0);
  const isLoadingMoreRef = useRef(false);

  useEffect(() => {
    let mounted = true;
    async function loadInitialLocation() {
      try {
        const accessToken = await getAccessToken();
        if (!accessToken) return;
        const profile = await getPatientProfile(accessToken);
        if (!mounted) return;
        const savedCoordinates = profile.endereco ? { latitude: profile.endereco.latitude, longitude: profile.endereco.longitude } : undefined;
        profileCoordinates.current = isValidCoordinates(savedCoordinates) ? savedCoordinates : undefined;
      } catch {
        // The search can still use device location when the profile cannot be read.
      } finally {
        if (mounted) setIsProfileLoading(false);
      }
    }
    void loadInitialLocation();
    return () => { mounted = false; };
  }, []);

  const loadInitialPage = useCallback(async () => {
    const version = requestVersion.current + 1;
    requestVersion.current = version;
    isLoadingMoreRef.current = false;
    activeQuery.current = undefined;
    setApoios([]);
    setPage(1);
    setTotalPages(0);
    setError(null);
    setIsLoadingMore(false);
    setIsLoading(true);
    try {
      const coordinates = await resolveReferenceCoordinates(submittedCity, profileCoordinates.current);
      if (requestVersion.current !== version) return;
      if (!coordinates) {
        debug("search-aborted", { reason: "missing-coordinates", city: submittedCity });
        setError("Informe uma cidade válida ou permita o acesso à localização para encontrar apoios em até 10 km.");
        return;
      }
      const params = {
        cidade: submittedCity || undefined,
        latitude: coordinates?.latitude,
        longitude: coordinates?.longitude,
        page: 1,
        pageSize: PAGE_SIZE,
        tipoApoio: selectedType === "todos" ? undefined : selectedType,
      };
      debug("request", params);
      const response = await listApoios(params);
      if (requestVersion.current !== version) return;
      activeQuery.current = { city: submittedCity, coordinates, selectedType, version };
      debug("response", { count: response.data.length, page: response.page, total: response.total, totalPages: response.totalPages });
      setApoios(response.data);
      setPage(response.page);
      setTotalPages(response.totalPages);
    } catch (caughtError) {
      debug("request-error", caughtError instanceof ApiError ? { status: caughtError.status, message: caughtError.message, body: caughtError.body } : caughtError);
      if (requestVersion.current === version) setError("Não foi possível carregar os apoios. Tente novamente.");
    } finally {
      if (requestVersion.current === version) setIsLoading(false);
    }
  }, [submittedCity, selectedType]);

  useEffect(() => {
    if (!isProfileLoading) void loadInitialPage();
  }, [isProfileLoading, loadInitialPage]);

  const retry = useCallback(() => void loadInitialPage(), [loadInitialPage]);
  const loadMore = useCallback(async () => {
    const query = activeQuery.current;
    if (!query || query.version !== requestVersion.current || isLoadingMoreRef.current || page >= totalPages) return;
    isLoadingMoreRef.current = true;
    setIsLoadingMore(true);
    setError(null);
    try {
      const response = await listApoios({
        cidade: query.city || undefined,
        latitude: query.coordinates?.latitude,
        longitude: query.coordinates?.longitude,
        page: page + 1,
        pageSize: PAGE_SIZE,
        tipoApoio: query.selectedType === "todos" ? undefined : query.selectedType,
      });
      if (query.version !== requestVersion.current) return;
      setApoios((current) => [...current, ...response.data]);
      setPage(response.page);
      setTotalPages(response.totalPages);
    } catch {
      if (query.version === requestVersion.current) setError("Não foi possível carregar os apoios. Tente novamente.");
    } finally {
      isLoadingMoreRef.current = false;
      if (query.version === requestVersion.current) setIsLoadingMore(false);
    }
  }, [page, totalPages]);

  const submitCity = useCallback(() => setSubmittedCity(city.trim()), [city]);

  return { apoios, city, error, hasMore: page < totalPages, isLoading: isProfileLoading || isLoading, isLoadingMore, loadMore, referenceCoordinates: activeQuery.current?.coordinates, retry, selectedType, setCity, setSelectedType, submitCity };
}
