import { formatCepBR, formatDateBR, formatPhoneBR } from "@/features/auth/masks";

describe("auth masks", () => {
  it("formats a mobile phone number progressively", () => {
    expect(formatPhoneBR("11")).toBe("(11");
    expect(formatPhoneBR("1199999")).toBe("(11) 9999-9");
    expect(formatPhoneBR("11999999999")).toBe("(11) 99999-9999");
  });

  it("formats a landline phone number", () => {
    expect(formatPhoneBR("1122223333")).toBe("(11) 2222-3333");
  });

  it("formats a CEP with the standard dash", () => {
    expect(formatCepBR("01001000")).toBe("01001-000");
    expect(formatCepBR("0100")).toBe("0100");
  });

  it("formats an ISO date into the Brazilian format", () => {
    expect(formatDateBR("1990-05-20")).toBe("20/05/1990");
    expect(formatDateBR("")).toBe("");
  });
});
