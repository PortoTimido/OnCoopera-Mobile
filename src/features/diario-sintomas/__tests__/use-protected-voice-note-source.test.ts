import { resolveProtectedVoiceNoteSource } from "@/features/diario-sintomas/use-protected-voice-note-source";

describe("protected voice note source", () => {
  const source = {
    headers: { Authorization: "Bearer token" },
    uri: "https://api.example.com/v1/mobile/diario-sintomas/registro-1/nota-voz",
  };
  const originalCreateObjectURL = URL.createObjectURL;
  const originalRevokeObjectURL = URL.revokeObjectURL;

  beforeEach(() => {
    globalThis.fetch = jest.fn();
    URL.createObjectURL = jest.fn(() => "blob:nota-de-voz");
    URL.revokeObjectURL = jest.fn();
  });

  afterEach(() => {
    URL.createObjectURL = originalCreateObjectURL;
    URL.revokeObjectURL = originalRevokeObjectURL;
    jest.restoreAllMocks();
  });

  it("downloads protected web audio with its authorization header", async () => {
    const blob = new Blob(["audio"], { type: "audio/mp4" });
    jest
      .mocked(globalThis.fetch)
      .mockResolvedValue(new Response(blob, { status: 200 }));

    const result = await resolveProtectedVoiceNoteSource(source, "web");

    expect(globalThis.fetch).toHaveBeenCalledWith(source.uri, {
      headers: source.headers,
    });
    expect(URL.createObjectURL).toHaveBeenCalledWith(expect.any(Blob));
    expect(result.source).toBe("blob:nota-de-voz");
    result.revoke?.();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:nota-de-voz");
  });

  it("keeps the authenticated remote source on native platforms", async () => {
    const result = await resolveProtectedVoiceNoteSource(source, "ios");

    expect(result.source).toBe(source);
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("reports an HTTP failure instead of handing an error response to the player", async () => {
    jest
      .mocked(globalThis.fetch)
      .mockResolvedValue(new Response(null, { status: 401 }));

    await expect(
      resolveProtectedVoiceNoteSource(source, "web"),
    ).rejects.toThrow("Não foi possível carregar a nota de voz (401).");
  });
});
