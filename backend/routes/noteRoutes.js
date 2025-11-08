const express = require('express');
const router = express.Router();
const Note = require('../models/Note');
const Item = require('../models/Item');

// @route   POST /api/notes
// @desc    Create a new sticky note
// @access  Public
router.post('/notes', async (req, res) => {
  try {
    const { text, color, position, size, attachedLinks } = req.body;

    // Allow empty notes - users can add text later
    // No validation needed for text

    // Get highest zIndex to place new note on top
    const highestNote = await Note.findOne().sort({ zIndex: -1 });
    const newZIndex = highestNote ? highestNote.zIndex + 1 : 1;

    const note = new Note({
      text: text || '', // Default to empty string
      color: color || '#fef08a',
      position: position || { x: 100, y: 100 },
      size: size || { width: 250, height: 250 },
      attachedLinks: attachedLinks || [],
      zIndex: newZIndex
    });

    await note.save();

    // Populate attached links if any
    await note.populate('attachedLinks');

    res.status(201).json(note);
  } catch (error) {
    console.error('Error creating note:', error);
    res.status(500).json({ error: 'Failed to create note', details: error.message });
  }
});

// @route   GET /api/notes
// @desc    Get all notes
// @access  Public
router.get('/notes', async (req, res) => {
  try {
    const notes = await Note.find()
      .populate('attachedLinks')
      .sort({ zIndex: 1 }); // Lower zIndex first (bottom to top)

    res.json(notes);
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({ error: 'Failed to fetch notes', details: error.message });
  }
});

// @route   GET /api/notes/:id
// @desc    Get single note by ID
// @access  Public
router.get('/notes/:id', async (req, res) => {
  try {
    const note = await Note.findById(req.params.id).populate('attachedLinks');

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    res.json(note);
  } catch (error) {
    console.error('Error fetching note:', error);
    res.status(500).json({ error: 'Failed to fetch note', details: error.message });
  }
});

// @route   PUT /api/notes/:id
// @desc    Update a note
// @access  Public
router.put('/notes/:id', async (req, res) => {
  try {
    const { text, color, position, size, attachedLinks, zIndex, isPinned } = req.body;

    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    // Update fields
    if (text !== undefined) note.text = text;
    if (color !== undefined) note.color = color;
    if (position !== undefined) note.position = position;
    if (size !== undefined) note.size = size;
    if (attachedLinks !== undefined) note.attachedLinks = attachedLinks;
    if (zIndex !== undefined) note.zIndex = zIndex;
    if (isPinned !== undefined) note.isPinned = isPinned;

    note.updatedAt = Date.now();

    await note.save();
    await note.populate('attachedLinks');

    res.json(note);
  } catch (error) {
    console.error('Error updating note:', error);
    res.status(500).json({ error: 'Failed to update note', details: error.message });
  }
});

// @route   PUT /api/notes/:id/position
// @desc    Update note position (optimized for drag operations)
// @access  Public
router.put('/notes/:id/position', async (req, res) => {
  try {
    const { x, y } = req.body;

    if (x === undefined || y === undefined) {
      return res.status(400).json({ error: 'Position x and y are required' });
    }

    const note = await Note.findByIdAndUpdate(
      req.params.id,
      {
        position: { x, y },
        updatedAt: Date.now()
      },
      { new: true }
    );

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    res.json(note);
  } catch (error) {
    console.error('Error updating note position:', error);
    res.status(500).json({ error: 'Failed to update position', details: error.message });
  }
});

// @route   PUT /api/notes/:id/bring-to-front
// @desc    Bring note to front (increase zIndex)
// @access  Public
router.put('/notes/:id/bring-to-front', async (req, res) => {
  try {
    const highestNote = await Note.findOne().sort({ zIndex: -1 });
    const newZIndex = highestNote ? highestNote.zIndex + 1 : 1;

    const note = await Note.findByIdAndUpdate(
      req.params.id,
      { zIndex: newZIndex },
      { new: true }
    ).populate('attachedLinks');

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    res.json(note);
  } catch (error) {
    console.error('Error bringing note to front:', error);
    res.status(500).json({ error: 'Failed to update zIndex', details: error.message });
  }
});

// @route   DELETE /api/notes/:id
// @desc    Delete a note
// @access  Public
router.delete('/notes/:id', async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    await note.deleteOne();

    res.json({ message: 'Note deleted successfully', id: req.params.id });
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).json({ error: 'Failed to delete note', details: error.message });
  }
});

// @route   DELETE /api/notes
// @desc    Delete all notes
// @access  Public
router.delete('/notes', async (req, res) => {
  try {
    const result = await Note.deleteMany({});
    res.json({ message: 'All notes deleted successfully', count: result.deletedCount });
  } catch (error) {
    console.error('Error deleting all notes:', error);
    res.status(500).json({ error: 'Failed to delete notes', details: error.message });
  }
});

module.exports = router;
