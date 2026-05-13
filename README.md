# Python Music System

A GUI-based music system built with Python's `turtle` and `wave` modules. This project allows users to load music files, play them with different instruments, transpose pitches, adjust speeds, and apply special effects.

## Features

- **Load Music**: Load music from tab-separated text files.
- **Play Music**: Synthesize and play music using sampled instruments.
- **Change Instrument**: Switch between various instruments (Grand Piano, Flute, Violin, etc.).
- **Transpose**: Shift the pitch of the entire song.
- **Adjust Speed**: Speed up or slow down the playback.
- **Special Effects**:
  - **Repeat**: Repeat the song multiple times.
  - **Randomize**: Randomize the notes of the current song for a unique sound.

## Prerequisites

- Python 3.x
- macOS (uses `afplay` for playback) or Windows (uses `winsound`).

## How to Run

1. Clone this repository.
2. Ensure you have the `songs` and `soundfont` directories in the same folder as `music_system.py`.
3. Run the application:
   ```bash
   python3 music_system.py
   ```

## File Structure

- `music_system.py`: Main application logic and GUI.
- `music.py`: Core music synthesis and playback module.
- `songs/`: Directory containing music files (`.txt`).
- `soundfont/`: Directory containing sampled instrument soundbanks (`.zip`).

## Credits

This project was developed as part of the COMP1021 course.
