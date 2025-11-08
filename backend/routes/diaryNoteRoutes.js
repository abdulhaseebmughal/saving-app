const express = require('express');
const router = express.Router();
const DiaryNote = require('../models/DiaryNote');

// Get all diary notes
router.get('/diary-notes', async (req, res) => {
  try {
    const notes = await DiaryNote.find().sort({ isPinned: -1, createdAt: -1 });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new diary note
router.post('/diary-notes', async (req, res) => {
  try {
    const note = new DiaryNote(req.body);
    await note.save();
    res.json(note);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update diary note
router.put('/diary-notes/:id', async (req, res) => {
  try {
    const note = await DiaryNote.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );
    res.json(note);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete diary note
router.delete('/diary-notes/:id', async (req, res) => {
  try {
    await DiaryNote.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
