import React, { useState } from 'react';
import { useMusic, extractYouTubeId } from '../../context/MusicContext';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Headphones,
  Music,
  ListMusic,
  ChevronDown,
  ChevronUp,
  X,
  ExternalLink,
  Tv,
  Eye,
  EyeOff,
  Sparkles,
  Link as LinkIcon
} from 'lucide-react';

export default function MusicPlayer() {
  const {
    tracks,
    currentTrack,
    isPlaying,
    isPlayerVisible,
    isExpanded,
    showVideo,
    playTrack,
    togglePlay,
    nextTrack,
    prevTrack,
    playCustomUrl,
    setIsPlayerVisible,
    setIsExpanded,
    setShowVideo
  } = useMusic();

  const [customInput, setCustomInput] = useState('');
  const [customError, setCustomError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  if (!isPlayerVisible) {
    return null;
  }

  // Categories for filter
  const categories = ['All', ...new Set(tracks.map((t) => t.category).filter(Boolean))];
  const filteredTracks = selectedCategory === 'All'
    ? tracks
    : tracks.filter((t) => t.category === selectedCategory);

  const handlePlayCustom = (e) => {
    e.preventDefault();
    setCustomError('');
    if (!customInput.trim()) return;
    const ok = playCustomUrl(customInput.trim());
    if (ok) {
      setCustomInput('');
    } else {
      setCustomError('Please enter a valid YouTube link or video ID');
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm sm:max-w-md w-full pointer-events-auto transition-all duration-300">
      {/* Background YouTube Iframe (Kept active for audio stream) */}
      {currentTrack?.youtubeId && isPlaying && (
        <div className={showVideo && isExpanded ? 'mb-3 overflow-hidden rounded-xl shadow-lg border border-slate-700 bg-black aspect-video w-full' : 'w-0 h-0 opacity-0 overflow-hidden absolute -top-[9999px]'}>
          <iframe
            key={currentTrack.youtubeId}
            title={currentTrack.title || 'YouTube Music Player'}
            src={`https://www.youtube.com/embed/${currentTrack.youtubeId}?autoplay=1&enablejsapi=1`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full border-0"
          />
        </div>
      )}

      {/* Main Player Container */}
      <div className="bg-slate-900/95 backdrop-blur-md text-white rounded-2xl shadow-2xl border border-slate-700/60 overflow-hidden">
        {/* COMPACT PILL / BAR MODE */}
        {!isExpanded ? (
          <div className="p-3 flex items-center justify-between gap-3">
            {/* Track Info & Visualizer */}
            <div
              onClick={() => setIsExpanded(true)}
              className="flex items-center space-x-3 min-w-0 cursor-pointer flex-1 group"
              title="Click to view playlist & controls"
            >
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center flex-shrink-0 shadow-md">
                {isPlaying ? (
                  <div className="flex items-end space-x-0.5 h-4">
                    <span className="w-1 bg-white rounded-full animate-bounce [animation-delay:-0.3s] h-3"></span>
                    <span className="w-1 bg-white rounded-full animate-bounce [animation-delay:-0.15s] h-4"></span>
                    <span className="w-1 bg-white rounded-full animate-bounce [animation-delay:-0.45s] h-2"></span>
                  </div>
                ) : (
                  <Headphones className="w-5 h-5 text-white" />
                )}
              </div>

              <div className="min-w-0">
                <div className="flex items-center space-x-2">
                  <p className="text-xs font-semibold text-white truncate group-hover:text-brand-300 transition-colors">
                    {currentTrack?.title || 'No track selected'}
                  </p>
                </div>
                <p className="text-[10px] text-slate-400 truncate">
                  {currentTrack?.category || 'Study Soundtrack'} {isPlaying ? '• Playing' : '• Paused'}
                </p>
              </div>
            </div>

            {/* Quick Action Controls */}
            <div className="flex items-center space-x-1.5 flex-shrink-0">
              <button
                onClick={togglePlay}
                title={isPlaying ? 'Pause' : 'Play'}
                className="w-9 h-9 rounded-full bg-brand-600 hover:bg-brand-500 text-white flex items-center justify-center transition-transform active:scale-95 shadow-md shadow-brand-600/30"
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
              </button>

              <button
                onClick={nextTrack}
                title="Next Track"
                className="p-2 text-slate-400 hover:text-white rounded-lg transition-colors hover:bg-slate-800"
              >
                <SkipForward className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsExpanded(true)}
                title="Open Playlist"
                className="p-2 text-slate-400 hover:text-brand-400 rounded-lg transition-colors hover:bg-slate-800"
              >
                <ListMusic className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsPlayerVisible(false)}
                title="Hide Player"
                className="p-2 text-slate-400 hover:text-rose-400 rounded-lg transition-colors hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* EXPANDED FULL PLAYLIST MODE */
          <div className="p-4 flex flex-col max-h-[82vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-lg bg-brand-500/20 text-brand-400 flex items-center justify-center">
                  <Music className="w-3.5 h-3.5" />
                </div>
                <span className="font-bold text-sm text-slate-100">Study & Focus Music</span>
                <span className="text-[10px] font-semibold bg-brand-900/50 text-brand-300 border border-brand-700/50 px-2 py-0.5 rounded-full">
                  YouTube
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setIsExpanded(false)}
                  title="Minimize"
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsPlayerVisible(false)}
                  title="Close"
                  className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Currently Playing Card */}
            <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700/60 mb-3">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-brand-400">
                  {isPlaying ? 'Now Playing' : 'Selected Track'}
                </span>
                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => setShowVideo(!showVideo)}
                    title={showVideo ? 'Hide Video Screen' : 'Show Video Screen'}
                    className={`flex items-center space-x-1 px-2 py-0.5 rounded-md text-[11px] font-medium border transition-colors ${
                      showVideo
                        ? 'bg-brand-500/20 border-brand-500/50 text-brand-300'
                        : 'bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {showVideo ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    <span>{showVideo ? 'Audio Only' : 'Video Screen'}</span>
                  </button>

                  {currentTrack?.youtubeId && (
                    <a
                      href={`https://www.youtube.com/watch?v=${currentTrack.youtubeId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 text-slate-400 hover:text-red-400 transition-colors"
                      title="Open on YouTube"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>

              <h4 className="text-sm font-bold text-white line-clamp-1 mb-1">
                {currentTrack?.title || 'Select a track to start playing'}
              </h4>
              <p className="text-xs text-slate-400 mb-3">
                {currentTrack?.category || 'Focus Soundtrack'}
              </p>

              {/* Player Controls */}
              <div className="flex items-center justify-center space-x-4 pt-1">
                <button
                  onClick={prevTrack}
                  title="Previous Track"
                  className="p-2 text-slate-300 hover:text-white rounded-full hover:bg-slate-700/60 transition-colors"
                >
                  <SkipBack className="w-4 h-4" />
                </button>

                <button
                  onClick={togglePlay}
                  title={isPlaying ? 'Pause' : 'Play'}
                  className="w-11 h-11 rounded-full bg-brand-600 hover:bg-brand-500 text-white flex items-center justify-center transition-all transform active:scale-95 shadow-lg shadow-brand-600/30"
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 fill-white" />
                  ) : (
                    <Play className="w-5 h-5 fill-white ml-0.5" />
                  )}
                </button>

                <button
                  onClick={nextTrack}
                  title="Next Track"
                  className="p-2 text-slate-300 hover:text-white rounded-full hover:bg-slate-700/60 transition-colors"
                >
                  <SkipForward className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Custom YouTube Link Input */}
            <form onSubmit={handlePlayCustom} className="mb-3">
              <div className="flex items-center space-x-1.5">
                <div className="relative flex-1">
                  <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    placeholder="Paste YouTube link to play..."
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-brand-600 hover:bg-brand-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex-shrink-0"
                >
                  Play
                </button>
              </div>
              {customError && (
                <p className="text-[11px] text-rose-400 mt-1 pl-1">{customError}</p>
              )}
            </form>

            {/* Playlist Header & Categories */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                <ListMusic className="w-3.5 h-3.5 text-brand-400" />
                <span>Playlist ({tracks.length})</span>
              </span>
            </div>

            {categories.length > 2 && (
              <div className="flex overflow-x-auto space-x-1.5 pb-2 mb-2 scrollbar-none">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap transition-colors ${
                      selectedCategory === cat
                        ? 'bg-brand-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}

            {/* Track List */}
            <div className="overflow-y-auto space-y-1.5 pr-1 max-h-56 scrollbar-thin scrollbar-thumb-slate-700">
              {filteredTracks.map((track) => {
                const isCurrent = currentTrack?.id === track.id;
                return (
                  <div
                    key={track.id}
                    onClick={() => playTrack(track)}
                    className={`group flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                      isCurrent
                        ? 'bg-brand-950/60 border border-brand-500/40 text-brand-200'
                        : 'bg-slate-800/40 hover:bg-slate-800 border border-transparent text-slate-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                      {/* Thumbnail or Play State */}
                      <div className="relative w-8 h-8 rounded-md bg-slate-700 overflow-hidden flex-shrink-0 flex items-center justify-center">
                        {track.youtubeId ? (
                          <img
                            src={`https://img.youtube.com/vi/${track.youtubeId}/default.jpg`}
                            alt=""
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        ) : null}
                        <div className={`absolute inset-0 flex items-center justify-center ${
                          isCurrent && isPlaying ? 'bg-black/50' : 'bg-black/20 group-hover:bg-black/40'
                        }`}>
                          {isCurrent && isPlaying ? (
                            <span className="w-2 h-2 rounded-full bg-brand-400 animate-ping"></span>
                          ) : (
                            <Play className="w-3 h-3 text-white fill-white opacity-80 group-hover:opacity-100" />
                          )}
                        </div>
                      </div>

                      <div className="min-w-0">
                        <p className={`text-xs font-semibold truncate ${
                          isCurrent ? 'text-brand-300' : 'text-slate-200 group-hover:text-white'
                        }`}>
                          {track.title}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">
                          {track.category}
                        </p>
                      </div>
                    </div>

                    {isCurrent && (
                      <span className="text-[10px] font-bold text-brand-400 flex items-center space-x-1 ml-2">
                        <span>{isPlaying ? 'Active' : 'Paused'}</span>
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
