import { redactVoiceNoteDiagnostic } from "@/features/diario-sintomas/voice-note-diagnostics";

describe("voice note diagnostics", () => {
  it("removes URLs and credentials from a native playback error", () => {
    expect(
      redactVoiceNoteDiagnostic(
        "AVPlayer failed at http://192.168.1.5:3000/api/nota-voz?signature=secret with Bearer secret-token",
      ),
    ).toBe("AVPlayer failed at [url] with Bearer [redacted]");
  });
});
