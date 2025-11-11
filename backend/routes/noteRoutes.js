const express = require('express');
const router = express.Router();
const Note = require('../models/Note');
const Item = require('../models/Item');
const authMiddleware = require('../middleware/authMiddleware');

// All routes protected with auth
router.use(authMiddleware);

// @route   POST /api/notes
// @desc    Create a new sticky note
router.post('/notes', async (req, res) => {
  try {
    const { text, color, position, size, attachedLinks } = req.body;

    // Get highest zIndex for this user
    const highestNote = await Note.findOne({ userId: req.user.userId }).sort({ zIndex: -1 });
    const newZIndex = highestNote ? highestNote.zIndex + 1 : 1;

    const note = new Note({
      userId: req.user.userId,
      text: text || '',
      color: color || '#fef08a',
      position: position || { x: 100, y: 100 },
      size: size || { width: 250, height: 250 },
      attachedLinks: attachedLinks || [],
      zIndex: newZIndex
    });

    await note.save();

    // Populate attached links if any
    await note.populate('attachedLinks');

    res.status(201).json({
      success: true,
      data: note
    });
  } catch (error) {
    console.error('Error creating note:', error);
    res.status(500).json({ error: 'Failed to create note', details: error.message });
  }
});

// @route   GET /api/notes
// @desc    Get all notes for current user
router.get('/notes', async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.user.userId })
      .populate('attachedLinks')
      .sort({ zIndex: 1 });

    res.json({
      success: true,
      data: notes
    });
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({ error: 'Failed to fetch notes', details: error.message });
  }
});

// @route   GET /api/notes/:id
// @desc    Get single note by ID
router.get('/notes/:id', async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.user.userId }).populate('attachedLinks');

    if (!note) {
      return res.status(404).json({
        success: false,
        error: 'Note not found'
      });
    }

    res.json({
      success: true,
      data: note
    });
  } catch (error) {
    console.error('Error fetching note:', error);
    res.status(500).json({ error: 'Failed to fetch note', details: error.message });
  }
});

// @route   PUT /api/notes/:id
// @desc    Update a note
router.put('/notes/:id', async (req, res) => {
  try {
    const { text, color, position, size, attachedLinks, zIndex, isPinned } = req.body;

    const note = await Note.findOne({ _id: req.params.id, userId: req.user.userId });

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

    res.json({
      success: true,
      data: note
    });
  } catch (error) {
    console.error('Error updating note:', error);
    res.status(500).json({ error: 'Failed to update note', details: error.message });
  }
});

// @route   PUT /api/notes/:id/position
// @desc    Update note position
router.put('/notes/:id/position', async (req, res) => {
  try {
    const { x, y } = req.body;

    if (x === undefined || y === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Position x and y are required'
      });
    }

    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      {
        position: { x, y },
        updatedAt: Date.now()
      },
      { new: true }
    );

    if (!note) {
      return res.status(404).json({
        success: false,
        error: 'Note not found'
      });
    }

    res.json({
      success: true,
      data: note
    });
  } catch (error) {
    console.error('Error updating note position:', error);
    res.status(500).json({ error: 'Failed to update position', details: error.message });
  }
});

// @route   PUT /api/notes/:id/bring-to-front
// @desc    Bring note to front
router.put('/notes/:id/bring-to-front', async (req, res) => {
  try {
    const highestNote = await Note.findOne({ userId: req.user.userId }).sort({ zIndex: -1 });
    const newZIndex = highestNote ? highestNote.zIndex + 1 : 1;

    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      { zIndex: newZIndex },
      { new: true }
    ).populate('attachedLinks');

    if (!note) {
      return res.status(404).json({
        success: false,
        error: 'Note not found'
      });
    }

    res.json({
      success: true,
      data: note
    });
  } catch (error) {
    console.error('Error bringing note to front:', error);
    res.status(500).json({ error: 'Failed to update zIndex', details: error.message });
  }
});

// @route   DELETE /api/notes/:id
// @desc    Delete a note
router.delete('/notes/:id', async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.user.userId });

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    await note.deleteOne();

    res.json({
      success: true,
      message: 'Note deleted successfully',
      id: req.params.id
    });
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).json({ error: 'Failed to delete note', details: error.message });
  }
});

// @route   DELETE /api/notes
// @desc    Delete all notes for current user
router.delete('/notes', async (req, res) => {
  try {
    const result = await Note.deleteMany({ userId: req.user.userId });
    res.json({
      success: true,
      message: 'All notes deleted successfully',
      count: result.deletedCount
    });
  } catch (error) {
    console.error('Error deleting all notes:', error);
    res.status(500).json({ error: 'Failed to delete notes', details: error.message });
  }
});

module.exports = router;
