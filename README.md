# Python Music System Pro

A professional, interactive audio synthesis system built with Python. This project demonstrates intermediate software engineering concepts including digital signal processing (DSP), persistent data management, and event-driven GUI design.

## Key Features

- **Interactive Audio Synthesis**: Real-time synthesis of music using sampled instruments.
- **Dynamic DSP Effects**:
  - **Transposition**: Frequency shifting while maintaining temporal structure.
  - **Temporal Scaling**: Dynamic adjustment of playback speed.
  - **Algorithmic Composition**: Pitch randomization and sequence repetition.
- **Advanced File Export**: Save synthesized audio directly to high-quality `.wav` files.
- **Persistent Session Management**: Tracks user activity and session history in a structured `history.json` format.
- **Professional Logging System**: Comprehensive system logs for debugging and monitoring application state.

## Engineering Highlights

- **Modular Design**: Clean separation between the core synthesis engine (`music.py`) and the GUI layer (`music_system.py`).
- **Data Persistence**: Implementation of JSON-based history tracking to demonstrate knowledge of data serialization.
- **Resource Management**: Optimized handling of binary soundbanks and temporary audio buffers.
- **Robustness**: Enhanced input validation and error handling across all modules.

## Prerequisites

- Python 3.x
- macOS (uses `afplay`) or Windows (uses `winsound`).

## How to Run

1. Clone this repository.
2. Ensure `songs/` and `soundfont/` directories are present.
3. Run the application:
   ```bash
   python3 music_system.py
   ```

## File Structure

- `music_system.py`: Main application controller and GUI.
- `music.py`: Audio synthesis engine.
- `history.json`: Persistent activity logs.
- `system.log`: Runtime system logs.
- `songs/`: Source music data.
- `soundfont/`: Zipped instrument samples.

---
*Developed as a showcase of Python software engineering skills.*
