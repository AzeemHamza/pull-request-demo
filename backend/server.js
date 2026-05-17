const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongo:27017/mydatabase';

app.use(cors());
app.use(express.json());

// Simple model
const Item = mongoose.model('Item', new mongoose.Schema({ name: String }));

// Routes
app.get('/api/items', async (req, res) => {
  const items = await Item.find();
  res.json(items);
});

app.post('/api/items', async (req, res) => {
  const newItem = new Item({ name: req.body.name });
  await newItem.save();
  res.json(newItem);
});

app.get('/api/health', (req, res) => res.send('Backend is running'));

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Backend server on port ${PORT}`));
  })
  .catch(err => console.error(err));