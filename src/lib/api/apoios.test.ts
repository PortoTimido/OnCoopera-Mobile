import { buildApoiosQuery } from "@/lib/api/apoios";

describe("buildApoiosQuery", () => {
  it("serializes support filters, reference coordinates and pagination", () => {
    expect(buildApoiosQuery({ cidade: " São Paulo ", latitude: -23.55, longitude: -46.63, page: 2, pageSize: 10, tipoApoio: "CLINICA" })).toBe(
      "cidade=S%C3%A3o+Paulo&latitude=-23.55&longitude=-46.63&tipoApoio=CLINICA&page=2&pageSize=10",
    );
  });

  it("uses pagination defaults", () => {
    expect(buildApoiosQuery()).toBe("page=1&pageSize=20");
  });
});
