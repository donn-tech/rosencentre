import React, { useState } from 'react';
import { useMusic, extractYouTubeId } from '../../context/MusicContext';
import {
  Music,
  Plus,
  Play,
  Pause,
  Trash2,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Radio,
  Eye,
  Tag,
  Clock,
  Headphones
} from 'lucide-react';

export default function MusicTab() {
  const { tracks, currentTrack, isPlaying, playTrack, togglePlay, refreshTracks } = useMusic();

  // Add Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState('Lofi Focus');
  const [customCategory, setCustomCategory] = useState('');
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Live YouTube ID preview in modal
  const previewYoutubeId = extractYouTubeId(url);

  const categoryPresets = [
    'Lofi Focus',
    'Classical Piano',
    'Coffee Shop',
    'Electronic & Synth',
    'Deep Ambient',
    'Nature & Calm',
    'Custom'
  ];

  const handleAddTrack = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!url.trim()) {
      setError('Please enter a YouTube video URL or Video ID');
      return;
    }

    const yId = extractYouTubeId(url.trim());
    if (!yId) {
      setError('Invalid YouTube link. Please paste a valid YouTube URL (e.g. https://www.youtube.com/watch?v=... or https://youtu.be/...)');
      return;
    }

    const effectiveCategory = category === 'Custom' ? (customCategory.trim() || 'General') : category;
    const effectiveTitle = title.trim() || `YouTube Music (${yId})`;

    setAdding(true);
    try {
      const res = await fetch('/api/music', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: effectiveTitle,
          url: url.trim(),
          category: effectiveCategory
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to add track');
      }

      setSuccess('Track added to playlist successfully!');
      setTitle('');
      setUrl('');
      setCategory('Lofi Focus');
      setCustomCategory('');
      await refreshTracks();

      setTimeout(() => {
        setShowAddModal(false);
        setSuccess(null);
      }, 1200);
    } catch (err) {
      setError(err.message);
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteTrack = async (trackId, trackTitle) => {
    if (!window.confirm(`Are you sure you want to remove "${trackTitle}" from the playlist?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/music/${trackId}`, {
        method: 'DELETE'
      });
      if (!res.ok) {
        throw new Error('Failed to delete track');
      }
      await refreshTracks();
    } catch (err) {
      alert('Error deleting track: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl border border-indigo-900/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Headphones className="w-4 h-4" />
              <span>Background Audio & Ambience</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              YouTube Music Library
            </h1>
            <p className="mt-1 text-slate-300 text-sm max-w-2xl">
              Curate relaxing background music and focus streams available to all team members while taking quizzes and reviewing certifications.
            </p>
          </div>

          <button
            onClick={() => {
              setError(null);
              setSuccess(null);
              setShowAddModal(true);
            }}
            className="flex items-center justify-center space-x-2 bg-brand-600 hover:bg-brand-500 text-white font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-brand-600/30 transition-all hover:scale-105 active:scale-95 flex-shrink-0"
          >
            <Plus className="w-5 h-5" />
            <span>Add YouTube Link</span>
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-slate-800">
          <div>
            <p className="text-xs text-slate-400 font-medium">Total Tracks</p>
            <p className="text-xl font-bold text-white mt-0.5">{tracks.length}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Soundtrack Categories</p>
            <p className="text-xl font-bold text-indigo-400 mt-0.5">
              {new Set(tracks.map((t) => t.category)).size}
            </p>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <p className="text-xs text-slate-400 font-medium">Active Player Status</p>
            <p className="text-xl font-bold text-emerald-400 mt-0.5 flex items-center space-x-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${isPlaying ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`}></span>
              <span>{isPlaying ? 'Playing' : 'Ready'}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Track Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tracks.map((track) => {
          const isThisTrackPlaying = isPlaying && currentTrack?.id === track.id;

          return (
            <div
              key={track.id}
              className={`bg-white rounded-xl border p-4 transition-all shadow-sm flex flex-col justify-between ${
                isThisTrackPlaying
                  ? 'border-brand-500 ring-2 ring-brand-500/20 shadow-md bg-brand-50/20'
                  : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
              }`}
            >
              <div className="flex space-x-4">
                {/* Video Thumbnail */}
                <div className="relative w-28 h-20 rounded-lg overflow-hidden bg-slate-900 flex-shrink-0 shadow">
                  {track.youtubeId ? (
                    <img
                      src={`https://img.youtube.com/vi/${track.youtubeId}/mqdefault.jpg`}
                      alt={track.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <button
                      onClick={() => {
                        if (isThisTrackPlaying) {
                          togglePlay();
                        } else {
                          playTrack(track);
                        }
                      }}
                      className="w-8 h-8 rounded-full bg-brand-600/90 hover:bg-brand-600 text-white flex items-center justify-center transition-transform hover:scale-110 shadow"
                    >
                      {isThisTrackPlaying ? (
                        <Pause className="w-4 h-4 fill-white" />
                      ) : (
                        <Play className="w-4 h-4 fill-white ml-0.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Track Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-1">
                    <span className="inline-block px-2 py-0.5 text-[10px] font-bold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase tracking-wider">
                      {track.category || 'General'}
                    </span>
                    {isThisTrackPlaying && (
                      <span className="flex items-center space-x-1 text-[11px] font-bold text-emerald-600">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                        <span>Now Playing</span>
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm mt-1 line-clamp-2" title={track.title}>
                    {track.title}
                  </h3>

                  <p className="text-xs text-slate-500 font-mono mt-1 truncate">
                    ID: {track.youtubeId}
                  </p>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <a
                  href={track.url || `https://www.youtube.com/watch?v=${track.youtubeId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 text-slate-500 hover:text-red-600 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open YouTube</span>
                </a>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      if (isThisTrackPlaying) {
                        togglePlay();
                      } else {
                        playTrack(track);
                      }
                    }}
                    className={`px-3 py-1.5 rounded-lg font-semibold flex items-center space-x-1.5 transition-colors ${
                      isThisTrackPlaying
                        ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                        : 'bg-brand-50 text-brand-700 hover:bg-brand-100'
                    }`}
                  >
                    {isThisTrackPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    <span>{isThisTrackPlaying ? 'Pause' : 'Play'}</span>
                  </button>

                  <button
                    onClick={() => handleDeleteTrack(track.id, track.title)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Remove Track"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {tracks.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200 p-8">
          <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
            <Music className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 text-lg">No music tracks yet</h3>
          <p className="text-slate-500 text-sm mt-1 max-w-md mx-auto">
            Add YouTube focus streams, lofi beats, or relaxing instrumental audio so members can listen while completing quizzes.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-4 inline-flex items-center space-x-2 bg-brand-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-brand-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Your First Track</span>
          </button>
        </div>
      )}

      {/* Add Track Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center">
                  <Music className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">Add YouTube Music Track</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddTrack} className="p-6 space-y-4">
              {error && (
                <div className="flex items-center space-x-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="flex items-center space-x-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>{success}</span>
                </div>
              )}

              {/* YouTube Link Field */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  YouTube Link or Video ID <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="e.g. https://www.youtube.com/watch?v=jfKfPfyJRdk or youtu.be/..."
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Supports full YouTube URLs, short youtu.be links, live streams, or 11-digit video IDs.
                </p>
              </div>

              {/* Live Preview If Valid */}
              {previewYoutubeId && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center space-x-3">
                  <img
                    src={`https://img.youtube.com/vi/${previewYoutubeId}/mqdefault.jpg`}
                    alt="Preview"
                    className="w-20 h-14 object-cover rounded-lg shadow-sm"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  <div className="text-xs">
                    <p className="font-semibold text-emerald-600 flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Valid YouTube Video Detected</span>
                    </p>
                    <p className="text-slate-500 font-mono mt-0.5">ID: {previewYoutubeId}</p>
                  </div>
                </div>
              )}

              {/* Track Title */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Track Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Lofi Hip Hop Study Stream"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Music Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm bg-white"
                >
                  {categoryPresets.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>

                {category === 'Custom' && (
                  <input
                    type="text"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="Enter custom category name"
                    className="mt-2 w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                  />
                )}
              </div>

              {/* Modal Buttons */}
              <div className="pt-4 flex items-center justify-end space-x-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adding}
                  className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm shadow-md shadow-brand-600/30 transition-all disabled:opacity-50"
                >
                  {adding ? 'Saving...' : 'Add Track to Playlist'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
