const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const protect = require('../middleware/protect');

router.use(protect);

// ➕ Add Room
router.post('/add', async (req, res) => {
  try {
    const room = new Room({ ...req.body, userId: req.user._id });
    await room.save();
    res.json({ message: 'Room added' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const rooms = await Room.find({ userId: req.user._id });
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/delete-all', async (req, res) => {
  try {
    await Room.deleteMany({ userId: req.user._id });
    res.json({ message: 'All rooms deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Room.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.json({ message: 'Room deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;