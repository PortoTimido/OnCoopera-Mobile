import { toggleVoiceNotePlayback } from "@/features/diario-sintomas/voice-note-playback";

describe("voice note playback", () => {
  it("pauses an audio that is already playing", async () => {
    const player = { pause: jest.fn(), play: jest.fn(), seekTo: jest.fn() };

    await toggleVoiceNotePlayback(player, { currentTime: 2, duration: 10, playing: true });

    expect(player.pause).toHaveBeenCalledTimes(1);
    expect(player.play).not.toHaveBeenCalled();
    expect(player.seekTo).not.toHaveBeenCalled();
  });

  it("restarts a completed audio before playing it again", async () => {
    const player = { pause: jest.fn(), play: jest.fn(), seekTo: jest.fn(async () => undefined) };

    await toggleVoiceNotePlayback(player, { currentTime: 10, duration: 10, playing: false });

    expect(player.seekTo).toHaveBeenCalledWith(0);
    expect(player.play).toHaveBeenCalledTimes(1);
    expect(player.seekTo.mock.invocationCallOrder[0]).toBeLessThan(player.play.mock.invocationCallOrder[0]);
  });

  it("plays an audio that has not reached its end", async () => {
    const player = { pause: jest.fn(), play: jest.fn(), seekTo: jest.fn() };

    await toggleVoiceNotePlayback(player, { currentTime: 3, duration: 10, playing: false });

    expect(player.play).toHaveBeenCalledTimes(1);
    expect(player.seekTo).not.toHaveBeenCalled();
  });
});
