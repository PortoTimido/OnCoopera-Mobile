import { buildApoiosQuery } from "@/lib/api/apoios";

describe("buildApoiosQuery", () => {
  it("serializes only meaningful support filters and pagination", () => {
    expect(buildApoiosQuery({ cidade: " São Paulo ", page: 2, pageSize: 10, tipoApoio: "CLINICA" })).toBe(
      "cidade=S%C3%A3o+Paulo&tipoApoio=CLINICA&page=2&pageSize=10",
    );
  });

  it("uses pagination defaults", () => {
    expect(buildApoiosQuery()).toBe("page=1&pageSize=20");
  });
});
