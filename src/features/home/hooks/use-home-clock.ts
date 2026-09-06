import { useEffect, useMemo, useState } from "react";

import { formatBrasiliaDateTime, getBrasiliaGreeting } from "@/features/home/home-date-time";

export function useHomeClock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60_000);

    return () => clearInterval(interval);
  }, []);

  return useMemo(
    () => ({
      dateTimeLabel: formatBrasiliaDateTime(now),
      greeting: getBrasiliaGreeting(now),
    }),
    [now],
  );
}
