import { formatBrasiliaDateTime, getBrasiliaGreeting } from "@/features/home/home-date-time";
import { getHomeUserInitials, getHomeUserShortName } from "@/features/home/hooks/use-home-user";

describe("home date time", () => {
  it("formats the current date using Brasilia timezone", () => {
    expect(formatBrasiliaDateTime(new Date("2026-09-03T17:05:00.000Z"))).toBe("QUINTA, 3 DE SETEMBRO");
  });

  it("chooses the greeting from Brasilia hour ranges", () => {
    expect(getBrasiliaGreeting(new Date("2026-09-03T05:59:00.000Z"))).toEqual({
      emoji: "\ud83c\udf19",
      label: "Boa noite",
    });
    expect(getBrasiliaGreeting(new Date("2026-09-03T06:00:00.000Z"))).toEqual({
      emoji: "\u2600\ufe0f",
      label: "Bom dia",
    });
    expect(getBrasiliaGreeting(new Date("2026-09-03T15:00:00.000Z"))).toEqual({
      emoji: "\ud83c\udf24\ufe0f",
      label: "Boa tarde",
    });
    expect(getBrasiliaGreeting(new Date("2026-09-03T21:00:00.000Z"))).toEqual({
      emoji: "\ud83c\udf19",
      label: "Boa noite",
    });
  });

  it("derives initials from the displayed user name", () => {
    expect(getHomeUserInitials("Ana Costa")).toBe("AC");
    expect(getHomeUserInitials("Paciente")).toBe("PA");
  });

  it("derives the short name from the full user name", () => {
    expect(getHomeUserShortName("João Pedro Silva")).toBe("João");
    expect(getHomeUserShortName("Paciente")).toBe("Paciente");
  });
});
