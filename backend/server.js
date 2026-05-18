require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const createError = require('http-errors');
const authRoutes = require('./routes/auth');
const itemRoutes = require('./routes/items');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongo:27017/mydatabase';

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.get('/api/health', (req, res) => res.send('Backend is running'));

// 404 handler
app.use((req, res, next) => next(createError(404, 'Not found')));

// Global error handler
app.use((err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Backend on port ${PORT}`));
  })
  .catch(err => console.error(err));