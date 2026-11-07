const express = require('express');
const router = express.Router();
const db = require('../db');

/**
 * Robust YouTube ID extraction supporting:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://www.youtube.com/live/VIDEO_ID
 * - https://www.youtube.com/shorts/VIDEO_ID
 * - Raw 11-char ID
 */
function extractYouTubeId(url) {
  if (!url || typeof url !== 'string') return null;
  const str = url.trim();

  // If directly an 11-character alphanumeric/hyphen/underscore string
  if (/^[a-zA-Z0-9_-]{11}$/.test(str)) {
    return str;
  }

  // Regex matching various YouTube URL formats
  const regExp = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|live\/|shorts\/))([a-zA-Z0-9_-]{11})/;
  const match = str.match(regExp);
  return match ? match[1] : null;
}

// GET all music tracks
router.get('/', (req, res) => {
  try {
    const tracks = db.getTracks();
    res.json(tracks);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load music tracks' });
  }
});

// GET single music track
router.get('/:id', (req, res) => {
  const track = db.getTrackById(req.params.id);
  if (!track) {
    return res.status(404).json({ error: 'Track not found' });
  }
  res.json(track);
});

// POST add a new YouTube music track
router.post('/', (req, res) => {
  const { title, url, category } = req.body;

  if (!url || !url.trim()) {
    return res.status(400).json({ error: 'YouTube link or Video ID is required.' });
  }

  const youtubeId = extractYouTubeId(url);
  if (!youtubeId) {
    return res.status(400).json({
      error: 'Invalid YouTube link. Please paste a valid YouTube URL (e.g. https://www.youtube.com/watch?v=... or https://youtu.be/...) or video ID.'
    });
  }

  const trackTitle = (title && title.trim()) ? title.trim() : `YouTube Track (${youtubeId})`;

  try {
    const created = db.addTrack({
      title: trackTitle,
      url: url.trim(),
      youtubeId,
      category: (category && category.trim()) ? category.trim() : 'Study & Focus'
    });
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save track: ' + err.message });
  }
});

// PUT update a music track
router.put('/:id', (req, res) => {
  const { title, url, category } = req.body;
  const updates = {};

  if (title !== undefined) updates.title = title.trim();
  if (category !== undefined) updates.category = category.trim();

  if (url !== undefined) {
    const youtubeId = extractYouTubeId(url);
    if (!youtubeId) {
      return res.status(400).json({ error: 'Invalid YouTube URL or ID.' });
    }
    updates.url = url.trim();
    updates.youtubeId = youtubeId;
  }

  const updated = db.updateTrack(req.params.id, updates);
  if (!updated) {
    return res.status(404).json({ error: 'Track not found' });
  }

  res.json(updated);
});

// DELETE a music track
router.delete('/:id', (req, res) => {
  const success = db.deleteTrack(req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'Track not found' });
  }
  res.json({ success: true, message: 'Track deleted successfully' });
});

module.exports = router;
