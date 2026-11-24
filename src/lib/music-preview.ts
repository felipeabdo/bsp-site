export type MusicPreviewOptions = {
  voice: string;
  soundSlots: unknown[];
  composition: unknown;
  bpm: number;
  patternOverride?: number[];
  onStep?: (step: number) => void;
};

export async function startMusicPreview(
  options: MusicPreviewOptions
): Promise<() => void> {
  console.warn("Preview de áudio temporariamente desativado.");
  options.onStep?.(-1);
  return () => {
    options.onStep?.(-1);
  };
}
