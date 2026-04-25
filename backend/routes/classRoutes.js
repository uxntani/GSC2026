const express = require('express');
const router = express.Router();
const Class = require('../models/Class');
const protect = require('../middleware/protect');

router.use(protect);

router.post('/add', async (req, res) => {
  try {
    const newClass = new Class({ ...req.body, userId: req.user._id });
    await newClass.save();
    res.json({ message: 'Class added' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const classes = await Class.find({ userId: req.user._id });
    res.json(classes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/delete-all', async (req, res) => {
  try {
    await Class.deleteMany({ userId: req.user._id });
    res.json({ message: 'All classes deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Class.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.json({ message: 'Class deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;