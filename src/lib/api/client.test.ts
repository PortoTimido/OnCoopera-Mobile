import { apiRequest, buildApiUrl, getApiBaseUrl, getLocalApiBaseUrlFromHostUri } from "@/lib/api/client";

describe("api client", () => {
  beforeEach(() => {
    delete process.env.EXPO_PUBLIC_API_URL;
    globalThis.fetch = jest.fn();
  });

  afterEach(() => {
    delete process.env.EXPO_PUBLIC_API_URL;
  });

  it("builds a LAN API URL from the Expo host on native devices", () => {
    expect(getLocalApiBaseUrlFromHostUri("192.168.15.23:8081", "ios")).toBe("http://192.168.15.23:3000/api");
  });

  it("keeps localhost for web requests", () => {
    expect(getLocalApiBaseUrlFromHostUri("192.168.15.23:8081", "web")).toBe("http://localhost:3000/api");
  });

  it("uses EXPO_PUBLIC_API_URL when it is defined", () => {
    process.env.EXPO_PUBLIC_API_URL = "http://10.0.0.5:3000/api";

    expect(getApiBaseUrl()).toBe("http://10.0.0.5:3000/api");
    expect(buildApiUrl("/mobile/pacientes")).toBe("http://10.0.0.5:3000/api/mobile/pacientes");
  });

  it("wraps network failures with a user-facing API error", async () => {
    (globalThis.fetch as jest.Mock).mockRejectedValueOnce(new TypeError("Network request failed"));

    await expect(apiRequest("/mobile/pacientes", { method: "POST" })).rejects.toMatchObject({
      body: {
        error: "NETWORK_ERROR",
        message: "Network request failed",
      },
      message:
        "Nao foi possivel conectar a API. Verifique se o backend esta rodando e se o celular esta na mesma rede do computador.",
      status: 0,
    });
  });
});
