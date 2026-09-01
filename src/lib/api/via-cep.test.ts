import { getAddressByCep, ViaCepError } from "@/lib/api/via-cep";

describe("getAddressByCep", () => {
  beforeEach(() => {
    globalThis.fetch = jest.fn();
  });

  it("rejects invalid CEP before calling ViaCEP", async () => {
    await expect(getAddressByCep("123")).rejects.toBeInstanceOf(ViaCepError);
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("fetches and returns an address from ViaCEP", async () => {
    const address = {
      bairro: "Se",
      cep: "01001-000",
      complemento: "lado impar",
      localidade: "Sao Paulo",
      logradouro: "Praca da Se",
      uf: "SP",
    };

    (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => address,
      ok: true,
      status: 200,
    });

    await expect(getAddressByCep("01001-000")).resolves.toEqual(address);
    expect(globalThis.fetch).toHaveBeenCalledWith("https://viacep.com.br/ws/01001000/json/", {
      signal: undefined,
    });
  });

  it("rejects unknown CEP responses", async () => {
    (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({ erro: true }),
      ok: true,
      status: 200,
    });

    await expect(getAddressByCep("00000000")).rejects.toMatchObject({
      message: "CEP nao encontrado.",
    });
  });
});
