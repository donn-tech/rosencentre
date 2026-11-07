import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const MusicContext = createContext(null);

export function extractYouTubeId(url) {
  if (!url || typeof url !== 'string') return null;
  const str = url.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(str)) {
    return str;
  }
  const regExp = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|live\/|shorts\/))([a-zA-Z0-9_-]{11})/;
  const match = str.match(regExp);
  return match ? match[1] : null;
}

export function MusicProvider({ children }) {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayerVisible, setIsPlayerVisible] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const fetchTracks = useCallback(async () => {
    try {
      const res = await fetch('/api/music');
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : [];
        setTracks(list);
        if (list.length > 0) {
          setCurrentTrack((prev) => prev || list[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load music tracks:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTracks();
  }, [fetchTracks]);

  const playTrack = (track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
    setIsPlayerVisible(true);
  };

  const togglePlay = () => {
    if (!currentTrack && tracks.length > 0) {
      setCurrentTrack(tracks[0]);
      setIsPlaying(true);
    } else {
      setIsPlaying((prev) => !prev);
    }
  };

  const nextTrack = () => {
    if (!tracks.length) return;
    const currentIndex = tracks.findIndex((t) => t.id === currentTrack?.id);
    const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % tracks.length : 0;
    setCurrentTrack(tracks[nextIndex]);
    setIsPlaying(true);
  };

  const prevTrack = () => {
    if (!tracks.length) return;
    const currentIndex = tracks.findIndex((t) => t.id === currentTrack?.id);
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : tracks.length - 1;
    setCurrentTrack(tracks[prevIndex]);
    setIsPlaying(true);
  };

  const playCustomUrl = (url, customTitle) => {
    const id = extractYouTubeId(url);
    if (!id) return false;
    const customTrack = {
      id: 'custom-' + Date.now(),
      title: customTitle || `YouTube (${id})`,
      url,
      youtubeId: id,
      category: 'Custom Link',
      isCustom: true
    };
    setCurrentTrack(customTrack);
    setIsPlaying(true);
    setIsPlayerVisible(true);
    return true;
  };

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  return (
    <MusicContext.Provider
      value={{
        tracks,
        loading,
        currentTrack,
        isPlaying,
        isPlayerVisible,
        isExpanded,
        showVideo,
        isMuted,
        playTrack,
        togglePlay,
        nextTrack,
        prevTrack,
        playCustomUrl,
        refreshTracks: fetchTracks,
        toggleMute,
        setIsPlayerVisible,
        setIsExpanded,
        setShowVideo,
        setCurrentTrack,
        setIsPlaying
      }}
    >
      {children}
    </MusicContext.Provider>
  );
}

export function useMusic() {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
}
