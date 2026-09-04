import { changePassword, changeTemporaryPassword, login, updatePatientProfile } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";

function mockResponse(status: number, body?: unknown) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    text: async () => (body === undefined ? "" : JSON.stringify(body)),
  } as Response);
}

describe("auth api", () => {
  beforeEach(() => {
    process.env.EXPO_PUBLIC_API_URL = "http://localhost:3000/api";
    globalThis.fetch = jest.fn();
  });

  afterEach(() => {
    delete process.env.EXPO_PUBLIC_API_URL;
  });

  it("posts login credentials and returns the authenticated session", async () => {
    const payload = {
      accessToken: "token",
      usuario: {
        dataNascimento: "1990-01-01",
        email: "paciente@oncoopera.com",
        id: "user-id",
        login: "paciente",
        nome: "Paciente",
        perfisAdministrativos: [],
        status: "ATIVO",
        telefone: "11999999999",
        tipo: "PACIENTE",
        trocaSenhaObrigatoria: false,
        ultimoAcesso: null,
      },
    };

    (globalThis.fetch as jest.Mock).mockResolvedValueOnce(await mockResponse(200, payload));

    await expect(login({ identificador: "paciente", senha: "SenhaForte123!" })).resolves.toEqual(payload);

    const [url, options] = (globalThis.fetch as jest.Mock).mock.calls[0];
    expect(url).toBe("http://localhost:3000/api/auth/login");
    expect(options.method).toBe("POST");
    expect(options.credentials).toBe("include");
    expect(JSON.parse(options.body)).toEqual({ identificador: "paciente", senha: "SenhaForte123!" });
    expect((options.headers as Headers).get("Content-Type")).toBe("application/json");
  });

  it.each([400, 401, 409])("surfaces login error status %s", async (status) => {
    (globalThis.fetch as jest.Mock).mockResolvedValueOnce(
      await mockResponse(status, { message: "Falha de autenticacao." }),
    );

    await expect(login({ identificador: "paciente", senha: "errada" })).rejects.toMatchObject({
      message: "Falha de autenticacao.",
      status,
    } satisfies Partial<ApiError>);
  });

  it("handles temporary password 204 without parsing a response body", async () => {
    (globalThis.fetch as jest.Mock).mockResolvedValueOnce(await mockResponse(204));

    await expect(
      changeTemporaryPassword({
        identificador: "paciente",
        novaSenha: "SenhaForte123!",
        senhaTemporaria: "temporaria",
      }),
    ).resolves.toBeUndefined();
  });

  it.each([400, 401])("surfaces temporary password error status %s", async (status) => {
    (globalThis.fetch as jest.Mock).mockResolvedValueOnce(
      await mockResponse(status, { message: "Senha temporaria invalida." }),
    );

    await expect(
      changeTemporaryPassword({
        identificador: "paciente",
        novaSenha: "SenhaForte123!",
        senhaTemporaria: "temporaria",
      }),
    ).rejects.toMatchObject({ message: "Senha temporaria invalida.", status } satisfies Partial<ApiError>);
  });

  it("patches the authenticated patient's profile with a bearer token", async () => {
    const payload = {
      endereco: null,
      usuario: {
        dataNascimento: "1990-01-01",
        email: "paciente@oncoopera.com",
        id: "user-id",
        login: "paciente",
        nome: "Novo Nome",
        perfisAdministrativos: [],
        status: "ATIVO",
        telefone: "11999999999",
        tipo: "PACIENTE",
        trocaSenhaObrigatoria: false,
        ultimoAcesso: null,
      },
    };

    (globalThis.fetch as jest.Mock).mockResolvedValueOnce(await mockResponse(200, payload));

    await expect(updatePatientProfile({ nome: "Novo Nome" }, "access-token")).resolves.toEqual(payload);

    const [url, options] = (globalThis.fetch as jest.Mock).mock.calls[0];
    expect(url).toBe("http://localhost:3000/api/mobile/pacientes/me");
    expect(options.method).toBe("PATCH");
    expect(JSON.parse(options.body)).toEqual({ nome: "Novo Nome" });
    expect((options.headers as Headers).get("Authorization")).toBe("Bearer access-token");
  });

  it("posts the current and new password with a bearer token", async () => {
    (globalThis.fetch as jest.Mock).mockResolvedValueOnce(await mockResponse(204));

    await expect(
      changePassword({ novaSenha: "SenhaNova!1234", senhaAtual: "SenhaAtual!123" }, "access-token"),
    ).resolves.toBeUndefined();

    const [url, options] = (globalThis.fetch as jest.Mock).mock.calls[0];
    expect(url).toBe("http://localhost:3000/api/auth/change-password");
    expect(options.method).toBe("POST");
    expect(JSON.parse(options.body)).toEqual({ novaSenha: "SenhaNova!1234", senhaAtual: "SenhaAtual!123" });
    expect((options.headers as Headers).get("Authorization")).toBe("Bearer access-token");
  });

  it.each([400, 401])("surfaces change password error status %s", async (status) => {
    (globalThis.fetch as jest.Mock).mockResolvedValueOnce(
      await mockResponse(status, { message: "Senha atual incorreta." }),
    );

    await expect(
      changePassword({ novaSenha: "SenhaNova!1234", senhaAtual: "errada" }, "access-token"),
    ).rejects.toMatchObject({ message: "Senha atual incorreta.", status } satisfies Partial<ApiError>);
  });
});
