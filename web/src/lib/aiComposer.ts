type Note = { time: number; pitch: number; duration: number };

export class AIComposer {
  private transitionMatrix: Map<number, Map<number, number>> = new Map();

  train(songs: Record<string, Note[]>) {
    Object.values(songs).forEach(notes => {
      for (let i = 0; i < notes.length - 1; i++) {
        const current = notes[i].pitch;
        const next = notes[i+1].pitch;
        
        if (!this.transitionMatrix.has(current)) {
          this.transitionMatrix.set(current, new Map());
        }
        const transitions = this.transitionMatrix.get(current)!;
        transitions.set(next, (transitions.get(next) || 0) + 1);
      }
    });
  }

  generate(length: number = 32): Note[] {
    const notes: Note[] = [];
    const pitches = Array.from(this.transitionMatrix.keys());
    if (pitches.length === 0) return [];

    let currentPitch = pitches[Math.floor(Math.random() * pitches.length)];
    let currentTime = 0;

    for (let i = 0; i < length; i++) {
      notes.push({
        time: currentTime,
        pitch: currentPitch,
        duration: 0.5
      });

      currentTime += 0.5;
      
      const transitions = this.transitionMatrix.get(currentPitch);
      if (transitions && transitions.size > 0) {
        currentPitch = this.getNextPitch(transitions);
      } else {
        currentPitch = pitches[Math.floor(Math.random() * pitches.length)];
      }
    }

    return notes;
  }

  private getNextPitch(transitions: Map<number, number>): number {
    const entries = Array.from(transitions.entries());
    const total = entries.reduce((sum, [_, count]) => sum + count, 0);
    let rand = Math.random() * total;
    
    for (const [pitch, count] of entries) {
      rand -= count;
      if (rand <= 0) return pitch;
    }
    return entries[0][0];
  }
}

export const aiComposer = new AIComposer();
