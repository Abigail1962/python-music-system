# Music System Pro

Music System Pro is a web-based music player and editor built from an earlier Python music system.

The project supports loading simple text-based music files, playing note sequences in the browser, changing instruments, adjusting speed and pitch, and exporting songs as WAV files.

This project started as a small Python-based music player and was later rewritten as a web application to explore browser audio programming with TypeScript and React.

---

## Demo

![Music System Pro Demo](./assets/demo.webp)

---

## Features

- Play built-in songs from a small music library
- Filter songs by category
- Import custom `.txt` music files
- Parse text-based note data into timed note sequences
- Change instruments using sampled soundfont files
- Adjust playback speed
- Transpose pitch up or down
- Randomize song pitches
- Export the current song as a `.wav` file
- Stop and restart playback in the browser

---

## Tech Stack

- Next.js
- TypeScript
- React
- Tailwind CSS
- Web Audio API
- Python

---

## Project Structure

```text
python-music-system/
├── music_system.py        # Original Python turtle-based music interface
├── music.py               # Python audio helper module
├── songs/                 # Original text-based song files
├── soundfont/             # Instrument sound samples
├── assets/                # Demo image
└── web/                   # Next.js web version
    ├── src/app/page.tsx
    ├── src/lib/audioEngine.ts
    ├── src/lib/songParser.ts
    ├── src/lib/aiComposer.ts
    └── src/data/songs.json
```

---

## How It Works

The original Python version stores songs as text files. Each line represents one note:

```text
start_time pitch duration
```

Example:

```text
0.0 60 0.5
0.5 64 0.5
1.0 67 1.0
```

The web version reads this format, parses each line into note objects, and plays them using the Web Audio API.

Each parsed note has the following structure:

```ts
{
  time: number;
  pitch: number;
  duration: number;
}
```

The audio engine maps MIDI-style pitch numbers to soundfont `.wav` samples, schedules playback in the browser, and supports exporting the rendered result as a WAV file.

---

## Main Components

### `songParser.ts`

Parses text-based song files into structured note data.

### `audioEngine.ts`

Handles browser audio playback, instrument sample loading, note scheduling, playback control, and WAV export.

### `page.tsx`

Contains the main React UI for song selection, playback controls, instrument selection, file import, transposition, speed adjustment, and export.

### `music_system.py`

The original Python version using `turtle` for the interface and a custom music module for playback.

---

## Getting Started

### Run the web version

```bash
cd web
npm install
npm run dev
```

Then open:

```text
http://localhost:3000
```

### Run the Python version

```bash
python music_system.py
```

---

## What I Learned

Through this project, I practiced:

- Converting an existing Python project into a web application
- Using TypeScript to represent music note data clearly
- Parsing text files and validating numeric input
- Scheduling audio playback with the Web Audio API
- Loading and reusing sound samples in the browser
- Exporting audio by converting rendered buffers into WAV files
- Building interactive controls with React state

---

## Future Improvements

- Improve mobile layout
- Add a visual piano roll or waveform display
- Add better error handling for imported files
- Support saving edited songs
- Add more instruments and song categories
- Improve playback timing and loading performance

---

## Notes

This is a personal learning project. The original version was written in Python, and the newer web version was built to explore TypeScript, React, and browser-based audio playback.
