const express = require('express');
const router = express.Router();

const Teacher = require('../models/Teacher');
const Room = require('../models/Room');
const Class = require('../models/Class');
const protect = require('../middleware/protect');

router.use(protect);

const allocateResources = require('../allocationEngine');

router.get('/', async (req, res) => {
    try {
        const teachers = await Teacher.find({ userId: req.user._id });
        const rooms = await Room.find({ userId: req.user._id });
        const classes = await Class.find({ userId: req.user._id });

        const result = allocateResources(classes, teachers, rooms);

        res.json(result);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;