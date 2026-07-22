import { Audio } from 'expo-av';

export type AudioRecorderCallback = (uri: string, durationMs: number) => void;

class AudioService {
  private recording: Audio.Recording | null = null;
  private sound: Audio.Sound | null = null;
  private _isRecording = false;
  private segmentTimer: ReturnType<typeof setInterval> | null = null;
  private onSegmentReady: AudioRecorderCallback | null = null;
  private segmentCount = 0;

  async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      return status === 'granted';
    } catch {
      return false;
    }
  }

  async prepareAudioMode(): Promise<void> {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });
  }

  async startRecording(
    onSegment?: AudioRecorderCallback,
    segmentIntervalMs = 5000,
  ): Promise<boolean> {
    if (this._isRecording) return false;

    try {
      await this.prepareAudioMode();
      this.onSegmentReady = onSegment || null;

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
        null, // onRecordingStatusUpdate
        100,  // progressUpdateInterval
      );
      this.recording = recording;
      this._isRecording = true;

      // Segments périodiques
      this.segmentCount = 0;
      if (this.onSegmentReady) {
        this.segmentTimer = setInterval(async () => {
          await this.flushSegment();
        }, segmentIntervalMs);
      }

      return true;
    } catch (error) {
      console.error('Failed to start recording:', error);
      this._isRecording = false;
      return false;
    }
  }

  private async flushSegment(): Promise<void> {
    if (!this.recording || !this._isRecording) return;

    try {
      const status = await this.recording.getStatusAsync();
      if (!status.isRecording) return;

      const uri = this.recording.getURI();
      if (!uri) return;

      this.segmentCount++;
      const durationMs = status.durationMillis || 0;

      this.onSegmentReady?.(uri, durationMs);
    } catch (error) {
      console.error('Segment flush error:', error);
    }
  }

  async stopRecording(): Promise<string | null> {
    if (!this.recording || !this._isRecording) return null;

    try {
      if (this.segmentTimer) {
        clearInterval(this.segmentTimer);
        this.segmentTimer = null;
      }

      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI();
      this._isRecording = false;
      this.recording = null;
      return uri;
    } catch (error) {
      console.error('Failed to stop recording:', error);
      this._isRecording = false;
      return null;
    }
  }

  async playSound(uri: string): Promise<void> {
    try {
      await this.stopPlayback();

      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true, volume: 1.0 },
      );
      this.sound = sound;
    } catch (error) {
      console.error('Failed to play sound:', error);
    }
  }

  async stopPlayback(): Promise<void> {
    if (this.sound) {
      try {
        await this.sound.stopAsync();
        await this.sound.unloadAsync();
      } catch {
        // Ignore cleanup errors
      }
      this.sound = null;
    }
  }

  get isCurrentlyRecording(): boolean {
    return this._isRecording;
  }

  async cleanup(): Promise<void> {
    await this.stopRecording();
    await this.stopPlayback();
  }
}

export const audioService = new AudioService();
