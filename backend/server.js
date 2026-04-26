require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');


const app = express();
app.use(cors());
app.use(express.json());

const path = require('path');
app.use(express.static(path.join(__dirname, '../frontend')));

// Health check
app.get('/', (req, res) => res.send('Server Running'));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected 🥳🥳🥳'))
  .catch(err => console.error(err));

// Routes
app.use('/auth', require('./routes/authRoutes'));
app.use('/teachers', require('./routes/teacherRoutes'));
app.use('/rooms', require('./routes/roomRoutes'));
app.use('/classes', require('./routes/classRoutes'));
app.use('/allocate', require('./routes/allocationRoutes'));

app.listen(3000, () => console.log('Server running on https://classroom-5cu3.onrender.com'));