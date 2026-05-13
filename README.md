# Music System Pro: Python to Web Transformation

A professional-grade interactive music synthesizer and composition engine. This project demonstrates the full lifecycle of software evolution—from a core logic implementation in Python to a modern, high-performance Web application.

## 📺 Project Demo
![Music System Pro Demo](./assets/demo.webp)

## 🚀 Key Technical Highlights

### 1. Cross-Platform Engine Migration
Successfully migrated a procedural Python music synthesis logic to a modern **Next.js & TypeScript** environment. This involved decoupling the core audio data structures from the original GUI (Turtle) and re-implementing them using the **Web Audio API**.

### 2. Low-Level Audio Engineering (WAV Export)
One of the project's most sophisticated features is the manual implementation of a **WAV file encoder**.
*   **The Challenge**: Browsers provide raw PCM data as 32-bit floats, which are not directly playable as files.
*   **The Solution**: Developed a custom `bufferToWav` utility that manually constructs a **RIFF Waveform Audio File Format** header.
*   **Engineering Detail**:
    *   Implemented binary data manipulation using `ArrayBuffer` and `DataView`.
    *   Handled sample rate conversion and 16-bit signed integer quantization.
    *   Applied volume limiting and clipping prevention (`Math.max(-1, Math.min(1, ...))`) to ensure professional audio quality.

### 3. Fast Non-Real-Time Rendering
Implemented audio exportation using **`OfflineAudioContext`**. Unlike standard recording, this allows the system to render complex compositions into a buffer at hardware-maximum speeds without being limited by the actual duration of the song, significantly improving user experience.

### 4. Custom DSL Parser
Built a robust parser in TypeScript to bridge the gap between the original Python `.txt` score format (tab-separated) and the Web's JSON-based note structure, ensuring full backward compatibility with legacy assets.

## 🛠 Tech Stack
*   **Frontend**: Next.js 15, TypeScript, Tailwind CSS
*   **Audio Engine**: Web Audio API (AnalyserNode, OfflineAudioContext)
*   **Legacy Core**: Python 3.x
*   **Deployment**: Vercel ready

## 📈 Job-Ready Portfolio Points
*   **Data Structures**: Efficient handling of large arrays of timed note events.
*   **Binary Processing**: Direct manipulation of binary file headers and buffers.
*   **Modern Web**: Deep understanding of browser internals and performance-focused React hooks.

---
© 2026 Advanced Audio Synthesis Lab
