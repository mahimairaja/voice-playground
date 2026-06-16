import { LocalAudioTrack, type Room, Track } from 'livekit-client';

/**
 * Synthetic road-noise injector for stress-testing voice agents.
 *
 * Generates brown-noise road rumble (brown noise through a low-pass), routes it
 * to the speakers so the operator hears it, and mixes it into a republished
 * microphone track so the agent (and any audio analysis it runs, e.g. Tyto)
 * hears the degraded line. The mic always flows through its own gain node, so
 * mute keeps working without unpublishing the mixed track.
 *
 * Lifecycle: 'start' once on the first slider interaction (a user gesture, so
 * the AudioContext is allowed to run), 'setLevel' as the slider moves, 'stop'
 * on disconnect. It is opt-in: nothing happens until 'start' is called, so the
 * default demo flow is untouched.
 */
export class RoadNoiseEngine {
  private ctx: AudioContext | null = null;
  private noiseGain: GainNode | null = null;
  private micGain: GainNode | null = null;
  private noise: AudioBufferSourceNode | null = null;
  private published: LocalAudioTrack | null = null;
  private micStream: MediaStream | null = null;
  private room: Room | null = null;

  get active(): boolean {
    return this.ctx !== null;
  }

  async start(room: Room): Promise<void> {
    if (this.ctx) return;
    const ctx = new AudioContext();

    // Brown noise: integrate white noise, then low-pass for road rumble.
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < data.length; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.5;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 500;

    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0;
    noise.connect(lowpass).connect(noiseGain);
    noiseGain.connect(ctx.destination); // monitor to the operator's speakers

    // Mic path: its own gain node so mute can zero it without teardown.
    const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const micSource = ctx.createMediaStreamSource(micStream);
    const micGain = ctx.createGain();
    micGain.gain.value = 1;
    micSource.connect(micGain);

    const mixDest = ctx.createMediaStreamDestination();
    micGain.connect(mixDest);
    noiseGain.connect(mixDest);

    noise.start();

    // Replace the default mic publication with the mixed (voice + noise) track.
    await room.localParticipant.setMicrophoneEnabled(false);
    const track = new LocalAudioTrack(mixDest.stream.getAudioTracks()[0]);
    await room.localParticipant.publishTrack(track, { source: Track.Source.Microphone });

    this.ctx = ctx;
    this.noiseGain = noiseGain;
    this.micGain = micGain;
    this.noise = noise;
    this.published = track;
    this.micStream = micStream;
    this.room = room;
  }

  /** Slider 0..1. Scaled down so full slider is heavy traffic, not a roar. */
  setLevel(level: number): void {
    if (this.noiseGain) {
      this.noiseGain.gain.value = Math.max(0, Math.min(1, level)) * 0.6;
    }
  }

  setMicMuted(muted: boolean): void {
    if (this.micGain) this.micGain.gain.value = muted ? 0 : 1;
  }

  async stop(): Promise<void> {
    try {
      this.noise?.stop();
    } catch {
      /* already stopped */
    }
    if (this.published && this.room) {
      try {
        await this.room.localParticipant.unpublishTrack(this.published, true);
      } catch {
        /* ignore unpublish failures during teardown */
      }
    }
    this.micStream?.getTracks().forEach((t) => t.stop());
    if (this.ctx) {
      try {
        await this.ctx.close();
      } catch {
        /* ignore close failures */
      }
    }
    this.ctx = null;
    this.noiseGain = null;
    this.micGain = null;
    this.noise = null;
    this.published = null;
    this.micStream = null;
    this.room = null;
  }
}
