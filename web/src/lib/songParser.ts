export type Note = {
  time: number;
  pitch: number;
  duration: number;
};

export function parsePythonSong(content: string): Note[] {
  const lines = content.split('\n');
  const notes: Note[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Split by tabs or spaces
    const parts = trimmed.split(/\s+/);
    if (parts.length >= 3) {
      const time = parseFloat(parts[0]);
      const pitch = parseInt(parts[1], 10);
      const duration = parseFloat(parts[2]);

      if (!isNaN(time) && !isNaN(pitch) && !isNaN(duration)) {
        notes.push({ time, pitch, duration });
      }
    }
  }

  return notes.sort((a, b) => a.time - b.time);
}
