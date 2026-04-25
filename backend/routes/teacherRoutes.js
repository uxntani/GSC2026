const express = require('express');
const router = express.Router();
const Teacher = require('../models/Teacher');
const protect = require('../middleware/protect');

router.use(protect);

// ➕ Add Teacher
router.post('/add', async (req, res) => {
    try {
        const teacher = new Teacher({ ...req.body, userId: req.user._id });
        await teacher.save();
        res.json({ message: "Teacher added ✅" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 📥 Get All Teachers
router.get('/', async (req, res) => {
    const teachers = await Teacher.find({ userId: req.user._id });
    res.json(teachers);
});

// 🗑️ Delete All Teachers
router.delete('/delete-all', async (req, res) => {
    await Teacher.deleteMany({ userId: req.user._id });
    res.json({ message: "All teachers deleted ✅" });
});


router.delete('/:id', async (req, res) => {
    try {
        await Teacher.findByIdAndDelete(req.params.id);
        res.json({ message: "Teacher deleted ✅" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
module.exports = router;

