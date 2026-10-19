import type { AudioPlayer, AudioStatus } from "expo-audio";

type VoiceNotePlayer = Pick<AudioPlayer, "pause" | "play" | "seekTo">;
type VoiceNoteStatus = Pick<AudioStatus, "currentTime" | "duration" | "playing">;

export async function toggleVoiceNotePlayback(player: VoiceNotePlayer, status: VoiceNoteStatus) {
  if (status.playing) {
    player.pause();
    return;
  }

  if (status.duration > 0 && status.currentTime >= status.duration) {
    try {
      await player.seekTo(0);
    } catch {
      // Let the native player attempt to resume even when seeking is unavailable.
    }
  }

  player.play();
}
