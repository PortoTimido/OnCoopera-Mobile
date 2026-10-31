import { resolveProtectedVoiceNoteSource } from "@/features/diario-sintomas/use-protected-voice-note-source";
import { File } from "expo-file-system";

const mockDelete = jest.fn();

jest.mock("expo-file-system", () => ({
  File: Object.assign(
    jest.fn(() => ({
      delete: mockDelete,
      uri: "file:///cache/temporary-note.m4a",
    })),
    { downloadFileAsync: jest.fn() },
  ),
  Paths: { cache: "file:///cache" },
}));

const mockDownloadFileAsync = jest.mocked(File.downloadFileAsync);

describe("protected voice note source", () => {
  const source = {
    headers: { Authorization: "Bearer token" },
    uri: "https://api.example.com/v1/mobile/diario-sintomas/registro-1/nota-voz",
  };
  const originalCreateObjectURL = URL.createObjectURL;
  const originalRevokeObjectURL = URL.revokeObjectURL;

  beforeEach(() => {
    mockDelete.mockReset();
    mockDownloadFileAsync.mockReset();
    (mockDownloadFileAsync as jest.Mock).mockResolvedValue({
      delete: mockDelete,
      uri: "file:///cache/downloaded-note.m4a",
    });
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

  it("downloads protected native audio with authorization to a local M4A file", async () => {
    const result = await resolveProtectedVoiceNoteSource(source, "ios");

    expect(File).toHaveBeenCalledWith(
      "file:///cache",
      expect.stringMatching(/^diario-nota-voz-.*\.m4a$/),
    );
    expect(mockDownloadFileAsync).toHaveBeenCalledWith(
      source.uri,
      expect.objectContaining({ uri: "file:///cache/temporary-note.m4a" }),
      { headers: source.headers },
    );
    expect(result.source).toBe("file:///cache/downloaded-note.m4a");
    result.revoke?.();
    expect(mockDelete).toHaveBeenCalledTimes(1);
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("uses the same protected local-download flow on Android", async () => {
    await resolveProtectedVoiceNoteSource(source, "android");

    expect(mockDownloadFileAsync).toHaveBeenCalledWith(
      source.uri,
      expect.anything(),
      { headers: source.headers },
    );
  });

  it("removes a partial native download when it fails", async () => {
    mockDownloadFileAsync.mockRejectedValueOnce(new Error("HTTP 401"));

    await expect(
      resolveProtectedVoiceNoteSource(source, "ios"),
    ).rejects.toThrow("HTTP 401");
    expect(mockDelete).toHaveBeenCalledTimes(1);
  });

  it("keeps an already local source unchanged", async () => {
    const localSource = "file:///cache/recording.m4a";

    await expect(
      resolveProtectedVoiceNoteSource(localSource, "ios"),
    ).resolves.toEqual({ source: localSource });
    expect(mockDownloadFileAsync).not.toHaveBeenCalled();
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
