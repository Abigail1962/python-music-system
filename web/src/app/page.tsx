"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { audioEngine } from "@/lib/audioEngine";
import { parsePythonSong, Note } from "@/lib/songParser";
import songsDataRaw from "@/data/songs.json";

const songsData = songsDataRaw as Record<string, { category: string; notes: Note[] }>;

const INSTRUMENTS = [
  { id: "acoustic_grand_piano", name: "Grand Piano" },
  { id: "acoustic_guitar_nylon", name: "Nylon Guitar" },
  { id: "violin", name: "Violin" },
  { id: "flute", name: "Flute" },
  { id: "church_organ", name: "Church Organ" },
  { id: "music_box", name: "Music Box" },
  { id: "trumpet", name: "Trumpet" },
  { id: "soprano_sax", name: "Soprano Sax" },
];

type PlaybackMode = "sequential" | "shuffle" | "loop";

export default function Home() {
  const [currentSong, setCurrentSong] = useState<Note[]>([]);
  const [songName, setSongName] = useState("None");
  const [instrument, setInstrument] = useState(INSTRUMENTS[0].id);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(100);
  const [transpose, setTranspose] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [playbackMode, setPlaybackMode] = useState<PlaybackMode>("sequential");
  
  const playbackTimeoutRef = useRef<NodeJS.Timeout[]>([]);

  const categories = ["All", "Mandarin Hits", "Instrumental"];
  
  const filteredSongs = useMemo(() => {
    if (activeCategory === "All") return Object.keys(songsData);
    return Object.keys(songsData).filter(name => songsData[name].category === activeCategory);
  }, [activeCategory]);

  const handlePlay = () => {
    if (isPlaying) {
      stopPlayback();
      return;
    }

    if (currentSong.length === 0) return;

    setIsPlaying(true);
    const speedFactor = 100 / speed;
    
    currentSong.forEach((note) => {
      const timeout = setTimeout(() => {
        audioEngine.playNote(note.pitch + transpose, 0, note.duration * speedFactor);
      }, note.time * 1000 * speedFactor);
      playbackTimeoutRef.current.push(timeout);
    });

    const totalDuration = Math.max(...currentSong.map(n => n.time + n.duration));
    const endTimeout = setTimeout(() => {
      handleSongEnded();
    }, totalDuration * 1000 * speedFactor + 100);
    playbackTimeoutRef.current.push(endTimeout);
  };

  const stopPlayback = () => {
    playbackTimeoutRef.current.forEach(clearTimeout);
    playbackTimeoutRef.current = [];
    audioEngine.stopAll();
    setIsPlaying(false);
  };

  const handleSongEnded = () => {
    setIsPlaying(false);
    if (playbackMode === "loop") {
      handlePlay();
    } else {
      playNext();
    }
  };

  const playNext = () => {
    let nextName = "";
    if (playbackMode === "shuffle") {
      nextName = filteredSongs[Math.floor(Math.random() * filteredSongs.length)];
    } else {
      const currentIndex = filteredSongs.indexOf(songName.replace(/\s+/g, "_"));
      const nextIndex = (currentIndex + 1) % filteredSongs.length;
      nextName = filteredSongs[nextIndex];
    }
    if (nextName) loadSong(nextName, true);
  };

  const loadSong = (name: string, autoPlay: boolean = false) => {
    stopPlayback();
    const song = songsData[name];
    if (song) {
      setCurrentSong(song.notes);
      setSongName(name.replace(/_/g, " "));
      if (autoPlay) {
        // Short delay to ensure state updates if needed
        setTimeout(() => {
          // Note: handlePlay depends on currentSong which is being set. 
          // For autoPlay, we might need to pass the notes directly or use a ref.
          // But since currentSong is state, let's use a temporary play function or just trigger it.
          setIsPlaying(true);
          const speedFactor = 100 / speed;
          song.notes.forEach((note) => {
            const timeout = setTimeout(() => {
              audioEngine.playNote(note.pitch + transpose, 0, note.duration * speedFactor);
            }, note.time * 1000 * speedFactor);
            playbackTimeoutRef.current.push(timeout);
          });
          const totalDuration = Math.max(...song.notes.map(n => n.time + n.duration));
          const endTimeout = setTimeout(() => {
            handleSongEnded();
          }, totalDuration * 1000 * speedFactor + 100);
          playbackTimeoutRef.current.push(endTimeout);
        }, 50);
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    const notes = parsePythonSong(text);
    setCurrentSong(notes);
    setSongName(file.name);
    stopPlayback();
  };

  const handleRepeat = () => {
    if (currentSong.length === 0) return;
    const duration = Math.max(...currentSong.map(n => n.time + n.duration));
    const repeated = currentSong.map(n => ({ ...n, time: n.time + duration }));
    setCurrentSong([...currentSong, ...repeated]);
  };

  const handleRandomize = () => {
    if (currentSong.length === 0) return;
    const pitches = currentSong.map(n => n.pitch);
    for (let i = pitches.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pitches[i], pitches[j]] = [pitches[j], pitches[i]];
    }
    const randomized = currentSong.map((n, i) => ({ ...n, pitch: pitches[i] }));
    setCurrentSong(randomized);
  };

  const handleExport = async () => {
    if (currentSong.length === 0) return;
    setIsExporting(true);
    try {
      const blob = await audioEngine.exportToWav(currentSong, speed);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${songName.replace(/\s+/g, "_")}.wav`;
      a.click();
    } catch (e) {
      console.error("Export failed", e);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 p-4 sticky top-0 z-10 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold flex items-center gap-2">
            🎵 Music System Pro
          </h1>
          <div className="flex gap-4">
            <label className="btn btn-secondary cursor-pointer">
              Import .txt
              <input type="file" accept=".txt" onChange={handleFileUpload} className="hidden" />
            </label>
            <button 
              onClick={handleExport}
              disabled={isExporting || currentSong.length === 0}
              className="btn btn-primary disabled:opacity-50"
            >
              {isExporting ? "Exporting..." : "Export WAV"}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar */}
        <aside className="space-y-6">
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-slate-400 uppercase text-xs tracking-wider">Library</h2>
            </div>
            
            {/* Category Filter */}
            <div className="flex gap-1 mb-4 overflow-x-auto custom-scrollbar pb-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1 rounded-full text-[10px] font-bold whitespace-nowrap transition-all ${
                    activeCategory === cat 
                      ? "bg-blue-600 text-white" 
                      : "bg-slate-700 text-slate-400 hover:bg-slate-600"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="space-y-1 max-h-[400px] overflow-y-auto custom-scrollbar">
              {filteredSongs.map((name) => (
                <button
                  key={name}
                  onClick={() => loadSong(name)}
                  className={`w-full text-left px-3 py-2 rounded-md transition-all text-sm ${
                    songName === name.replace(/_/g, " ")
                      ? "bg-blue-600/20 text-blue-400" 
                      : "hover:bg-slate-700/50 text-slate-400 hover:text-white"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span>{name.replace(/_/g, " ")}</span>
                    <span className="text-[9px] opacity-40">{songsData[name].category === "Mandarin Hits" ? "🇨🇳" : "🎻"}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="card">
            <h2 className="font-bold mb-4 text-slate-400 uppercase text-xs tracking-wider">Instrument</h2>
            <div className="grid grid-cols-1 gap-1">
              {INSTRUMENTS.map((inst) => (
                <button
                  key={inst.id}
                  onClick={() => {
                    setInstrument(inst.id);
                    audioEngine.setInstrument(inst.id);
                  }}
                  className={`text-left px-3 py-2 rounded-md transition-all text-sm ${
                    instrument === inst.id
                      ? "bg-blue-600/20 text-blue-400 border border-blue-600/30"
                      : "hover:bg-slate-700/50 text-slate-400 hover:text-white"
                  }`}
                >
                  {inst.name}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Player Main Area */}
        <section className="md:col-span-3 space-y-6">
          <div className="card text-center p-12 flex flex-col items-center">
            <div className="mb-8">
              <p className="text-slate-500 text-sm uppercase tracking-widest mb-1">
                {songName !== "None" ? songsData[songName.replace(/\s+/g, "_")]?.category : "No Song Loaded"}
              </p>
              <h2 className="text-4xl font-bold text-white">{songName}</h2>
            </div>

            <div className="flex items-center gap-8 mb-8">
              {/* Playback Mode Controls */}
              <button 
                onClick={() => setPlaybackMode(m => m === "loop" ? "sequential" : "loop")}
                className={`text-xl transition-all ${playbackMode === "loop" ? "text-blue-400 scale-125" : "text-slate-600 hover:text-slate-400"}`}
                title="Single Loop"
              >
                🔂
              </button>

              <button 
                onClick={handlePlay}
                className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${
                  isPlaying 
                    ? "bg-red-500 hover:bg-red-400" 
                    : "bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/20"
                }`}
              >
                {isPlaying ? (
                  <div className="w-8 h-8 bg-white rounded-sm"></div>
                ) : (
                  <div className="w-0 h-0 border-t-[15px] border-t-transparent border-l-[25px] border-l-white border-b-[15px] border-b-transparent ml-2"></div>
                )}
              </button>

              <button 
                onClick={() => setPlaybackMode(m => m === "shuffle" ? "sequential" : "shuffle")}
                className={`text-xl transition-all ${playbackMode === "shuffle" ? "text-blue-400 scale-125" : "text-slate-600 hover:text-slate-400"}`}
                title="Shuffle Play"
              >
                🔀
              </button>
            </div>
            
            <div className="mt-4 flex gap-4">
              <div className="text-center px-6 border-r border-slate-700">
                <p className="text-slate-500 text-xs uppercase">Notes</p>
                <p className="text-xl font-bold">{currentSong.length}</p>
              </div>
              <div className="text-center px-6 border-r border-slate-700">
                <p className="text-slate-500 text-xs uppercase">Mode</p>
                <p className="text-sm font-bold capitalize">{playbackMode}</p>
              </div>
              <div className="text-center px-6">
                <p className="text-slate-500 text-xs uppercase">Speed</p>
                <p className="text-xl font-bold">{speed}%</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card space-y-6">
              <h3 className="font-bold text-slate-400 uppercase text-xs">Playback Controls</h3>
              <div>
                <div className="flex justify-between mb-2 text-sm">
                  <span>Speed</span>
                  <span>{speed}%</span>
                </div>
                <input 
                  type="range" min="25" max="400" value={speed} 
                  onChange={(e) => setSpeed(parseInt(e.target.value))}
                  className="w-full accent-blue-600"
                />
              </div>
              <div>
                <div className="flex justify-between mb-2 text-sm">
                  <span>Transpose</span>
                  <span>{transpose} st</span>
                </div>
                <input 
                  type="range" min="-24" max="24" value={transpose} 
                  onChange={(e) => setTranspose(parseInt(e.target.value))}
                  className="w-full accent-blue-600"
                />
              </div>
            </div>

            <div className="card space-y-4">
              <h3 className="font-bold text-slate-400 uppercase text-xs">Modifiers</h3>
              <button 
                onClick={handleRepeat}
                className="w-full btn btn-secondary flex items-center justify-center gap-2"
              >
                <span>🔁</span> Repeat Music
              </button>
              <button 
                onClick={handleRandomize}
                className="w-full btn btn-secondary flex items-center justify-center gap-2"
              >
                <span>🎲</span> Randomize Pitch
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="p-12 text-center text-slate-500 text-sm border-t border-slate-800">
        <p>© 2026 Music System Pro Web</p>
      </footer>
    </div>
  );
}
