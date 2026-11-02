import { getLegalDocument } from "@/lib/api/documentos-legais";

function mockResponse(status: number, body?: unknown) {
  return Promise.resolve({ ok: status >= 200 && status < 300, status, text: async () => JSON.stringify(body) } as Response);
}

describe("legal documents api", () => {
  beforeEach(() => {
    process.env.EXPO_PUBLIC_API_URL = "http://localhost:3000/api";
    globalThis.fetch = jest.fn();
  });

  afterEach(() => delete process.env.EXPO_PUBLIC_API_URL);

  it("loads a legal document by its backend type", async () => {
    const document = { id: "document-id", tipo: "TERMOS_USO", versao: "1.0", conteudo: "<p>Termos</p>", atualizadoEm: "2026-11-02T00:00:00.000Z" };
    (globalThis.fetch as jest.Mock).mockResolvedValueOnce(await mockResponse(200, document));

    await expect(getLegalDocument("TERMOS_USO")).resolves.toEqual(document);
    expect((globalThis.fetch as jest.Mock).mock.calls[0][0]).toBe("http://localhost:3000/api/mobile/documentos-legais/TERMOS_USO");
  });
});
