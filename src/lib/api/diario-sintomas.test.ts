import { File } from "expo-file-system";

import {
  createVoiceNoteFile,
  saveRegistroDiarioHoje,
} from "@/lib/api/diario-sintomas";

jest.mock("expo-file-system", () => ({
  File: jest
    .fn()
    .mockImplementation((uri: string) =>
      Object.assign(new Blob(["audio"], { type: "audio/mp4" }), {
        bytes: jest.fn(),
        uri,
      }),
    ),
}));

describe("createVoiceNoteFile", () => {
  it("uses the actual recorder extension and its matching MIME type", () => {
    expect(
      createVoiceNoteFile("file:///cache/recording.webm?temporary=true"),
    ).toEqual({
      name: "nota-voz.webm",
      type: "audio/webm",
      uri: "file:///cache/recording.webm?temporary=true",
    });
  });

  it("falls back to the native recorder's M4A format for unknown extensions", () => {
    expect(createVoiceNoteFile("file:///cache/recording")).toMatchObject({
      name: "nota-voz.m4a",
      type: "audio/mp4",
    });
  });

  it("adds a native Expo File to FormData instead of React Native's legacy URI object", async () => {
    globalThis.fetch = jest
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ id: "registro-1" }), { status: 200 }),
      );

    await saveRegistroDiarioHoje(
      {
        humor: "BEM",
        notaVoz: {
          name: "nota-voz.m4a",
          size: 123,
          type: "audio/mp4",
          uri: "file:///cache/recording.m4a",
        },
        sintomas: [{ intensidade: 5, tipo: "DOR" }],
      },
      "token",
    );

    expect(File).toHaveBeenCalledWith("file:///cache/recording.m4a");
    const [, request] = (globalThis.fetch as jest.Mock).mock.calls[0] as [
      string,
      RequestInit,
    ];
    const formPart = (request.body as FormData).getAll("notaVoz")[0];
    expect(formPart).toBeInstanceOf(Blob);
    expect((formPart as Blob).type).toBe("audio/mp4");
  });

});
